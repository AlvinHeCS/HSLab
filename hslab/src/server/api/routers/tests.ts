import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  Grade,
  type PrismaClient,
  TestEndedReason,
} from "../../../../generated/prisma";
import { gradeAnswer } from "~/server/lib/grading";
import {
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** True if the session's wall-clock timer has expired. */
function isExpired(startedAt: Date, timeLimitSeconds: number): boolean {
  return Date.now() - startedAt.getTime() > timeLimitSeconds * 1000;
}

/** Auto-close a session whose timer expired without explicit submit. */
async function closeIfExpired(
  db: PrismaClient,
  sessionId: string,
) {
  const sess = await db.testSession.findUnique({
    where: { id: sessionId },
    include: { blueprint: { select: { timeLimitSeconds: true } } },
  });
  if (!sess || sess.endedAt) return sess;
  if (isExpired(sess.startedAt, sess.blueprint.timeLimitSeconds)) {
    return finalizeTestSession(db, sessionId, TestEndedReason.time_expired);
  }
  return sess;
}

/** Sum correct count from responses + flag session ended. */
async function finalizeTestSession(
  db: PrismaClient,
  sessionId: string,
  reason: TestEndedReason,
) {
  const totalCorrect = await db.questionResponse.count({
    where: { testSessionId: sessionId, isCorrect: true },
  });
  return db.testSession.update({
    where: { id: sessionId },
    data: {
      endedAt: new Date(),
      endedReason: reason,
      totalCorrect,
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Router
// ─────────────────────────────────────────────────────────────────────────────

export const testsRouter = createTRPCRouter({
  // ── Admin: blueprint CRUD ────────────────────────────────────────────────
  adminCreateBlueprint: adminProcedure
    .input(
      z.object({
        name: z.string().min(1).max(120),
        description: z.string().max(500).optional(),
        grade: z.nativeEnum(Grade),
        timeLimitSeconds: z.number().int().min(60).max(60 * 60 * 4),
        questionPartIds: z.array(z.string().cuid()).min(1).max(200),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Validate that all questionPartIds exist and belong to published questions.
      const parts = await ctx.db.questionPart.findMany({
        where: { id: { in: input.questionPartIds } },
        select: { id: true, question: { select: { status: true, isActive: true } } },
      });
      if (parts.length !== input.questionPartIds.length) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "One or more question parts not found.",
        });
      }
      return ctx.db.testBlueprint.create({
        data: {
          name: input.name,
          description: input.description,
          grade: input.grade,
          timeLimitSeconds: input.timeLimitSeconds,
          questionPartIds: input.questionPartIds,
          createdById: ctx.session.user.id,
        },
      });
    }),

  adminListBlueprints: adminProcedure
    .input(
      z
        .object({
          grade: z.nativeEnum(Grade).optional(),
          isActive: z.boolean().optional(),
          take: z.number().int().min(1).max(100).default(50),
        })
        .default({ take: 50 }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.testBlueprint.findMany({
        where: {
          ...(input.grade ? { grade: input.grade } : {}),
          ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
        },
        orderBy: { createdAt: "desc" },
        take: input.take,
      });
    }),

  adminPublishBlueprint: adminProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.testBlueprint.update({
        where: { id: input.id },
        data: { publishedAt: new Date() },
      });
    }),

  adminSetActiveBlueprint: adminProcedure
    .input(z.object({ id: z.string().cuid(), isActive: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.testBlueprint.update({
        where: { id: input.id },
        data: { isActive: input.isActive },
      });
    }),

  // ── Student: discovery ───────────────────────────────────────────────────
  listAvailable: protectedProcedure
    .input(
      z
        .object({
          grade: z.nativeEnum(Grade).optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.testBlueprint.findMany({
        where: {
          isActive: true,
          publishedAt: { not: null },
          ...(input?.grade ? { grade: input.grade } : {}),
        },
        orderBy: { publishedAt: "desc" },
        select: {
          id: true,
          name: true,
          description: true,
          grade: true,
          timeLimitSeconds: true,
          publishedAt: true,
        },
      });
    }),

  // ── Student: lifecycle ───────────────────────────────────────────────────
  active: protectedProcedure.query(async ({ ctx }) => {
    const sess = await ctx.db.testSession.findFirst({
      where: { userId: ctx.session.user.id, endedAt: null },
      orderBy: { startedAt: "desc" },
      include: { blueprint: { select: { timeLimitSeconds: true, name: true } } },
    });
    if (!sess) return null;
    if (isExpired(sess.startedAt, sess.blueprint.timeLimitSeconds)) {
      return closeIfExpired(ctx.db, sess.id);
    }
    return sess;
  }),

  start: protectedProcedure
    .input(z.object({ blueprintId: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const existingOpen = await ctx.db.testSession.findFirst({
        where: { userId: ctx.session.user.id, endedAt: null },
        select: { id: true },
      });
      if (existingOpen) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "You already have an open test session. Submit or forfeit it first.",
        });
      }
      const blueprint = await ctx.db.testBlueprint.findUnique({
        where: { id: input.blueprintId },
      });
      if (!blueprint || !blueprint.isActive || !blueprint.publishedAt) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      return ctx.db.testSession.create({
        data: {
          userId: ctx.session.user.id,
          blueprintId: blueprint.id,
          // Freeze the question list at start time — blueprint changes won't affect this session.
          questionPartIds: blueprint.questionPartIds,
        },
      });
    }),

  // Render-friendly payload of all questions+parts for the in-progress test.
  // No correctAnswer / explanationDoc — those are end-only.
  questions: protectedProcedure
    .input(z.object({ sessionId: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const sess = await ctx.db.testSession.findUnique({
        where: { id: input.sessionId },
        include: { blueprint: { select: { timeLimitSeconds: true } } },
      });
      if (sess?.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      const parts = await ctx.db.questionPart.findMany({
        where: { id: { in: sess.questionPartIds } },
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
              difficulty: true,
              stimulusDoc: true,
            },
          },
        },
      });
      // Re-order to match the frozen array on the session.
      const byId = new Map(parts.map((p) => [p.id, p]));
      const ordered = sess.questionPartIds.map((id) => byId.get(id)).filter(Boolean);
      return {
        session: sess,
        timeRemainingSeconds: Math.max(
          0,
          sess.blueprint.timeLimitSeconds -
            Math.floor((Date.now() - sess.startedAt.getTime()) / 1000),
        ),
        items: ordered,
      };
    }),

  /** Stores the answer; does NOT reveal correctness (end-only review). */
  submitAnswer: protectedProcedure
    .input(
      z.object({
        sessionId: z.string().cuid(),
        questionPartId: z.string().cuid(),
        selectedAnswer: z.string().max(500),
        timeSeconds: z.number().int().min(0).max(7200),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const sess = await ctx.db.testSession.findUnique({
        where: { id: input.sessionId },
        include: { blueprint: { select: { timeLimitSeconds: true } } },
      });
      if (sess?.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      if (sess.endedAt) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Session ended." });
      }
      if (isExpired(sess.startedAt, sess.blueprint.timeLimitSeconds)) {
        await finalizeTestSession(ctx.db, sess.id, TestEndedReason.time_expired);
        throw new TRPCError({ code: "BAD_REQUEST", message: "Time expired." });
      }
      if (!sess.questionPartIds.includes(input.questionPartId)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Question is not part of this test.",
        });
      }
      const part = await ctx.db.questionPart.findUnique({
        where: { id: input.questionPartId },
        select: {
          questionType: true,
          correctAnswer: true,
          toleranceOverride: true,
        },
      });
      if (!part) throw new TRPCError({ code: "NOT_FOUND" });
      const isCorrect = gradeAnswer(part, input.selectedAnswer);

      // Upsert: replace previous response for this part in this session if any
      // (student may revise an answer before final submit).
      const existing = await ctx.db.questionResponse.findFirst({
        where: { testSessionId: sess.id, questionPartId: input.questionPartId },
        select: { id: true },
      });
      if (existing) {
        await ctx.db.questionResponse.update({
          where: { id: existing.id },
          data: {
            selectedAnswer: input.selectedAnswer,
            isCorrect,
            timeSeconds: input.timeSeconds,
            answeredAt: new Date(),
          },
        });
      } else {
        await ctx.db.questionResponse.create({
          data: {
            userId: ctx.session.user.id,
            questionPartId: input.questionPartId,
            selectedAnswer: input.selectedAnswer,
            isCorrect,
            timeSeconds: input.timeSeconds,
            testSessionId: sess.id,
          },
        });
      }
      return { ok: true };
    }),

  submit: protectedProcedure
    .input(z.object({ sessionId: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const sess = await ctx.db.testSession.findUnique({
        where: { id: input.sessionId },
      });
      if (sess?.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      if (sess.endedAt) return sess;
      return finalizeTestSession(ctx.db, sess.id, TestEndedReason.submitted);
    }),

  forfeit: protectedProcedure
    .input(z.object({ sessionId: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const sess = await ctx.db.testSession.findUnique({
        where: { id: input.sessionId },
      });
      if (sess?.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      if (sess.endedAt) return sess;
      return finalizeTestSession(ctx.db, sess.id, TestEndedReason.forfeit);
    }),

  /** Full review (correct answers + explanations + per-question response). */
  results: protectedProcedure
    .input(z.object({ sessionId: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const sess = await ctx.db.testSession.findUnique({
        where: { id: input.sessionId },
        include: { blueprint: { select: { name: true, timeLimitSeconds: true } } },
      });
      if (sess?.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      if (!sess.endedAt) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Session not ended yet.",
        });
      }
      const parts = await ctx.db.questionPart.findMany({
        where: { id: { in: sess.questionPartIds } },
        include: {
          question: {
            select: {
              id: true,
              grade: true,
              topic: true,
              subtopic: true,
              difficulty: true,
              stimulusDoc: true,
            },
          },
        },
      });
      const responses = await ctx.db.questionResponse.findMany({
        where: { testSessionId: sess.id },
      });
      const responsesByPart = new Map(
        responses.map((r) => [r.questionPartId, r]),
      );
      const partsById = new Map(parts.map((p) => [p.id, p]));
      const items = sess.questionPartIds.map((pid) => ({
        part: partsById.get(pid)!,
        response: responsesByPart.get(pid) ?? null,
      }));
      return { session: sess, items };
    }),
});
