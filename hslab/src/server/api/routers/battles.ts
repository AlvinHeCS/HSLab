import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  BattleInviteStatus,
  BattleStatus,
  FriendshipStatus,
  Grade,
  MathTopic,
  type PrismaClient,
} from "../../../../generated/prisma";
import { gradeAnswer } from "~/server/lib/grading";
import { selectQuestionPartIds } from "~/server/lib/question-selection";
import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

const PER_QUESTION_SECONDS = 60;
const INVITE_TTL_SECONDS = 5 * 60;

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

async function areFriends(
  db: PrismaClient,
  a: string,
  b: string,
): Promise<boolean> {
  const f = await db.friendship.findFirst({
    where: {
      status: FriendshipStatus.accepted,
      OR: [
        { requesterId: a, receiverId: b },
        { requesterId: b, receiverId: a },
      ],
    },
    select: { id: true },
  });
  return !!f;
}

/** Returns true if a player's *current* per-question timer has expired. */
function questionExpired(startedAt: Date | null): boolean {
  if (!startedAt) return false;
  return Date.now() - startedAt.getTime() > PER_QUESTION_SECONDS * 1000;
}

/**
 * Advance a player past their current expired question (if any), counting as
 * wrong. Returns the *new* (currentIndex, currentStartedAt) for the player.
 *
 * Inline on every poll/submit so we don't need a cron job for timeouts.
 */
async function processExpiredQuestionsForPlayer(
  db: PrismaClient,
  match: {
    id: string;
    questionPartIds: string[];
    questionCount: number;
  },
  player: "player1" | "player2",
  currentQIndex: number | null,
  currentQStartedAt: Date | null,
  playerId: string,
): Promise<{ newIndex: number | null; newStartedAt: Date | null; advanced: boolean }> {
  if (currentQIndex == null || currentQStartedAt == null) {
    return { newIndex: currentQIndex, newStartedAt: currentQStartedAt, advanced: false };
  }
  if (currentQIndex >= match.questionCount) {
    return { newIndex: currentQIndex, newStartedAt: currentQStartedAt, advanced: false };
  }
  if (!questionExpired(currentQStartedAt)) {
    return { newIndex: currentQIndex, newStartedAt: currentQStartedAt, advanced: false };
  }
  // Record an empty wrong response for the timed-out part.
  const partId = match.questionPartIds[currentQIndex];
  if (partId) {
    await db.questionResponse.create({
      data: {
        userId: playerId,
        questionPartId: partId,
        selectedAnswer: "",
        isCorrect: false,
        timeSeconds: PER_QUESTION_SECONDS,
        battleMatchId: match.id,
      },
    });
  }
  const nextIndex = currentQIndex + 1;
  const finished = nextIndex >= match.questionCount;
  const updateData =
    player === "player1"
      ? {
          player1CurrentQIndex: nextIndex,
          player1CurrentQStartedAt: finished ? null : new Date(),
        }
      : {
          player2CurrentQIndex: nextIndex,
          player2CurrentQStartedAt: finished ? null : new Date(),
        };
  await db.battleMatch.update({ where: { id: match.id }, data: updateData });
  return {
    newIndex: nextIndex,
    newStartedAt: finished ? null : new Date(),
    advanced: true,
  };
}

/** Mark match completed if both players have finished. */
async function maybeFinalizeMatch(
  db: PrismaClient,
  matchId: string,
) {
  const m = await db.battleMatch.findUnique({ where: { id: matchId } });
  if (!m || m.status === BattleStatus.completed) return m;
  const p1Done = (m.player1CurrentQIndex ?? 0) >= m.questionCount;
  const p2Done = (m.player2CurrentQIndex ?? 0) >= m.questionCount;
  if (p1Done && p2Done) {
    return db.battleMatch.update({
      where: { id: matchId },
      data: { status: BattleStatus.completed, completedAt: new Date() },
    });
  }
  return m;
}

// ─────────────────────────────────────────────────────────────────────────────
// Router
// ─────────────────────────────────────────────────────────────────────────────

export const battlesRouter = createTRPCRouter({
  // ── Invites ──────────────────────────────────────────────────────────────
  sendInvite: protectedProcedure
    .input(
      z.object({
        inviteeId: z.string().cuid(),
        grade: z.nativeEnum(Grade),
        topic: z.nativeEnum(MathTopic).nullable(), // null = random within grade
        questionCount: z.union([z.literal(5), z.literal(10), z.literal(20)]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const me = ctx.session.user.id;
      if (input.inviteeId === me) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot battle yourself." });
      }
      const friends = await areFriends(ctx.db, me, input.inviteeId);
      if (!friends) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only battle accepted friends.",
        });
      }
      // No pending invite already between this pair from me.
      const existing = await ctx.db.battleInvite.findFirst({
        where: {
          inviterId: me,
          inviteeId: input.inviteeId,
          status: BattleInviteStatus.pending,
        },
      });
      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "You already have a pending invite to this friend.",
        });
      }
      return ctx.db.battleInvite.create({
        data: {
          inviterId: me,
          inviteeId: input.inviteeId,
          grade: input.grade,
          topic: input.topic,
          questionCount: input.questionCount,
          expiresAt: new Date(Date.now() + INVITE_TTL_SECONDS * 1000),
        },
      });
    }),

  listInvites: protectedProcedure.query(async ({ ctx }) => {
    const me = ctx.session.user.id;
    // Sweep expired invites inline.
    await ctx.db.battleInvite.updateMany({
      where: {
        status: BattleInviteStatus.pending,
        expiresAt: { lt: new Date() },
      },
      data: { status: BattleInviteStatus.expired },
    });
    const incoming = await ctx.db.battleInvite.findMany({
      where: { inviteeId: me, status: BattleInviteStatus.pending },
      include: {
        inviter: {
          select: { id: true, displayName: true, username: true, avatarUrl: true, avatarColor: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    const outgoing = await ctx.db.battleInvite.findMany({
      where: { inviterId: me, status: BattleInviteStatus.pending },
      include: {
        invitee: {
          select: { id: true, displayName: true, username: true, avatarUrl: true, avatarColor: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return { incoming, outgoing };
  }),

  cancelInvite: protectedProcedure
    .input(z.object({ inviteId: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const inv = await ctx.db.battleInvite.findUnique({
        where: { id: input.inviteId },
      });
      if (
        inv?.inviterId !== ctx.session.user.id ||
        inv.status !== BattleInviteStatus.pending
      ) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      await ctx.db.battleInvite.delete({ where: { id: inv.id } });
      return { ok: true };
    }),

  respondInvite: protectedProcedure
    .input(z.object({ inviteId: z.string().cuid(), accept: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const inv = await ctx.db.battleInvite.findUnique({
        where: { id: input.inviteId },
      });
      if (inv?.inviteeId !== ctx.session.user.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      if (inv.status !== BattleInviteStatus.pending) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invite is not pending.",
        });
      }
      if (inv.expiresAt < new Date()) {
        await ctx.db.battleInvite.update({
          where: { id: inv.id },
          data: { status: BattleInviteStatus.expired },
        });
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invite expired." });
      }

      if (!input.accept) {
        return ctx.db.battleInvite.update({
          where: { id: inv.id },
          data: { status: BattleInviteStatus.declined },
        });
      }

      // Accept → resolve question parts and create the match.
      const partIds = await selectQuestionPartIds(ctx.db, {
        grade: inv.grade,
        topic: inv.topic,
        difficulty: null,
        count: inv.questionCount,
        standaloneOnly: true, // battles use standalone parts only (Q6 lock)
      });
      if (partIds.length < inv.questionCount) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: `Not enough published standalone questions for ${inv.grade}${inv.topic ? `/${inv.topic}` : ""}.`,
        });
      }

      const startedAt = new Date();
      const match = await ctx.db.battleMatch.create({
        data: {
          player1Id: inv.inviterId,
          player2Id: inv.inviteeId,
          grade: inv.grade,
          topic: inv.topic,
          questionCount: inv.questionCount,
          questionPartIds: partIds,
          status: BattleStatus.active,
          player1CurrentQIndex: 0,
          player1CurrentQStartedAt: startedAt,
          player2CurrentQIndex: 0,
          player2CurrentQStartedAt: startedAt,
        },
      });

      await ctx.db.battleInvite.update({
        where: { id: inv.id },
        data: { status: BattleInviteStatus.accepted, matchId: match.id },
      });

      return match;
    }),

  // ── Match polling + play ─────────────────────────────────────────────────
  active: protectedProcedure.query(async ({ ctx }) => {
    const me = ctx.session.user.id;
    return ctx.db.battleMatch.findFirst({
      where: {
        status: { in: [BattleStatus.waiting, BattleStatus.active] },
        OR: [{ player1Id: me }, { player2Id: me }],
      },
      orderBy: { createdAt: "desc" },
    });
  }),

  pollMatch: protectedProcedure
    .input(z.object({ matchId: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const me = ctx.session.user.id;
      let match = await ctx.db.battleMatch.findUnique({
        where: { id: input.matchId },
      });
      if (!match || (match.player1Id !== me && match.player2Id !== me)) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      if (match.status === BattleStatus.completed) return { match, currentPart: null };

      // Process expired questions for both players (inline timeout enforcement).
      await processExpiredQuestionsForPlayer(
        ctx.db,
        match,
        "player1",
        match.player1CurrentQIndex,
        match.player1CurrentQStartedAt,
        match.player1Id,
      );
      await processExpiredQuestionsForPlayer(
        ctx.db,
        match,
        "player2",
        match.player2CurrentQIndex,
        match.player2CurrentQStartedAt,
        match.player2Id,
      );
      match = (await maybeFinalizeMatch(ctx.db, match.id))!;
      match = (await ctx.db.battleMatch.findUnique({ where: { id: match.id } }))!;

      // Return the current part for *this* player (if any).
      const myIndex =
        me === match.player1Id ? match.player1CurrentQIndex : match.player2CurrentQIndex;
      let currentPart = null;
      if (myIndex != null && myIndex < match.questionCount) {
        const partId = match.questionPartIds[myIndex];
        if (partId) {
          currentPart = await ctx.db.questionPart.findUnique({
            where: { id: partId },
            select: {
              id: true,
              orderIndex: true,
              questionType: true,
              promptDoc: true,
              choices: true,
              question: {
                select: {
                  id: true,
                  grade: true,
                  topic: true,
                  subtopic: true,
                  stimulusDoc: true,
                },
              },
            },
          });
        }
      }
      return { match, currentPart };
    }),

  submitAnswer: protectedProcedure
    .input(
      z.object({
        matchId: z.string().cuid(),
        questionPartId: z.string().cuid(),
        selectedAnswer: z.string().max(500),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const me = ctx.session.user.id;
      const match = await ctx.db.battleMatch.findUnique({
        where: { id: input.matchId },
      });
      if (!match || (match.player1Id !== me && match.player2Id !== me)) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      if (match.status !== BattleStatus.active) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Match not active." });
      }
      const isP1 = me === match.player1Id;
      const myIndex = isP1 ? match.player1CurrentQIndex : match.player2CurrentQIndex;
      const myStartedAt = isP1
        ? match.player1CurrentQStartedAt
        : match.player2CurrentQStartedAt;

      if (myIndex == null || myIndex >= match.questionCount) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "You've already finished." });
      }
      if (match.questionPartIds[myIndex] !== input.questionPartId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Submitted question doesn't match your current question.",
        });
      }

      // Time-up check.
      let isCorrect = false;
      let timeSeconds = PER_QUESTION_SECONDS;
      if (myStartedAt && questionExpired(myStartedAt)) {
        isCorrect = false;
        timeSeconds = PER_QUESTION_SECONDS;
      } else {
        const part = await ctx.db.questionPart.findUnique({
          where: { id: input.questionPartId },
          select: {
            questionType: true,
            correctAnswer: true,
            toleranceOverride: true,
          },
        });
        if (!part) throw new TRPCError({ code: "NOT_FOUND" });
        isCorrect = gradeAnswer(part, input.selectedAnswer);
        timeSeconds = myStartedAt
          ? Math.min(
              PER_QUESTION_SECONDS,
              Math.floor((Date.now() - myStartedAt.getTime()) / 1000),
            )
          : PER_QUESTION_SECONDS;
      }

      const nextIndex = myIndex + 1;
      const finished = nextIndex >= match.questionCount;
      const newStartedAt = finished ? null : new Date();
      const scoreInc = isCorrect ? 1 : 0;

      await ctx.db.$transaction([
        ctx.db.questionResponse.create({
          data: {
            userId: me,
            questionPartId: input.questionPartId,
            selectedAnswer: input.selectedAnswer,
            isCorrect,
            timeSeconds,
            battleMatchId: match.id,
          },
        }),
        ctx.db.battleMatch.update({
          where: { id: match.id },
          data: isP1
            ? {
                player1Score: { increment: scoreInc },
                player1CurrentQIndex: nextIndex,
                player1CurrentQStartedAt: newStartedAt,
              }
            : {
                player2Score: { increment: scoreInc },
                player2CurrentQIndex: nextIndex,
                player2CurrentQStartedAt: newStartedAt,
              },
        }),
      ]);

      const updatedMatch = await maybeFinalizeMatch(ctx.db, match.id);
      return { isCorrect, match: updatedMatch };
    }),

  /** Forfeit (closing the tab / quitting). */
  forfeit: protectedProcedure
    .input(z.object({ matchId: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const match = await ctx.db.battleMatch.findUnique({
        where: { id: input.matchId },
      });
      const me = ctx.session.user.id;
      if (!match || (match.player1Id !== me && match.player2Id !== me)) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      if (match.status === BattleStatus.completed) return match;
      return ctx.db.battleMatch.update({
        where: { id: match.id },
        data: {
          status: BattleStatus.abandoned,
          completedAt: new Date(),
        },
      });
    }),

  recent: protectedProcedure
    .input(z.object({ take: z.number().int().min(1).max(50).default(10) }))
    .query(async ({ ctx, input }) => {
      const me = ctx.session.user.id;
      return ctx.db.battleMatch.findMany({
        where: {
          status: { in: [BattleStatus.completed, BattleStatus.abandoned] },
          OR: [{ player1Id: me }, { player2Id: me }],
        },
        orderBy: { completedAt: "desc" },
        take: input.take,
        include: {
          player1: { select: { id: true, displayName: true, username: true, avatarUrl: true, avatarColor: true } },
          player2: { select: { id: true, displayName: true, username: true, avatarUrl: true, avatarColor: true } },
        },
      });
    }),
});
