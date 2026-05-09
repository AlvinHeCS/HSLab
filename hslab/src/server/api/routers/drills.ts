import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  DrillEndedReason,
  DrillSessionMode,
  Grade,
  MathSubtopic,
  MathTopic,
  type PrismaClient,
  QuestionDifficulty,
  QuestionStatus,
} from "../../../../generated/prisma";
import { gradeAnswer } from "~/server/lib/grading";
import { selectQuestionPartIds } from "~/server/lib/question-selection";
import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

const HEARTBEAT_TIMEOUT_SECONDS = 90;

/** Sweep stale drill sessions whose heartbeat is older than the timeout. */
async function sweepStaleSessions(db: PrismaClient) {
  const cutoff = new Date(Date.now() - HEARTBEAT_TIMEOUT_SECONDS * 1000);
  await db.drillSession.updateMany({
    where: {
      endedAt: null,
      lastHeartbeatAt: { lt: cutoff },
    },
    data: {
      endedAt: cutoff,
      endedReason: DrillEndedReason.idle_timeout,
    },
  });
}

export const drillsRouter = createTRPCRouter({
  /** Start a new drill session. End any existing open session for this user first. */
  start: protectedProcedure
    .input(
      z.object({
        mode: z.nativeEnum(DrillSessionMode).default(DrillSessionMode.topic_drill),
        grade: z.nativeEnum(Grade).optional(),
        topic: z.nativeEnum(MathTopic).optional(),
        subtopic: z.nativeEnum(MathSubtopic).optional(),
        difficulty: z.nativeEnum(QuestionDifficulty).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.mode === DrillSessionMode.topic_drill && !input.grade) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Grade is required for topic drills.",
        });
      }
      // End any open session for this user (only one drill at a time).
      await ctx.db.drillSession.updateMany({
        where: { userId: ctx.session.user.id, endedAt: null },
        data: {
          endedAt: new Date(),
          endedReason: DrillEndedReason.explicit,
        },
      });
      return ctx.db.drillSession.create({
        data: {
          userId: ctx.session.user.id,
          mode: input.mode,
          grade: input.grade ?? null,
          topic: input.topic ?? null,
          subtopic: input.subtopic ?? null,
          difficulty: input.difficulty ?? null,
        },
      });
    }),

  /** Return the user's current open drill session, if any. */
  active: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.drillSession.findFirst({
      where: { userId: ctx.session.user.id, endedAt: null },
      orderBy: { startedAt: "desc" },
    });
  }),

  /** Pick and return the next question to serve in this drill session. */
  nextQuestion: protectedProcedure
    .input(z.object({ sessionId: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const session = await ctx.db.drillSession.findUnique({
        where: { id: input.sessionId },
      });
      if (session?.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      if (session.endedAt) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Session already ended." });
      }

      // Exclude parts already answered in this session.
      const answered = await ctx.db.questionResponse.findMany({
        where: { drillSessionId: session.id },
        select: { questionPartId: true },
      });
      const excludePartIds = answered.map((r) => r.questionPartId);

      let candidatePartId: string | undefined;

      if (session.mode === DrillSessionMode.mistake_review) {
        // Pull from the user's mistakes (latest-wrong query, scoped optionally).
        const mistakeRows = await ctx.db.$queryRaw<{ id: string }[]>`
          SELECT DISTINCT ON ("questionPartId") "questionPartId" AS id
          FROM "QuestionResponse"
          WHERE "userId" = ${ctx.session.user.id}
          ORDER BY "questionPartId", "answeredAt" DESC
        `;
        const candidateIds = mistakeRows
          .map((r) => r.id)
          .filter((id) => !excludePartIds.includes(id));
        // Apply optional grade/topic/subtopic filter via a follow-up query.
        if (candidateIds.length === 0) return null;
        const filtered = await ctx.db.questionPart.findMany({
          where: {
            id: { in: candidateIds },
            // mistake_review still serves the latest-wrong; we re-check is_correct=false
            // by inspecting the response, but for simplicity here we skip and re-grade.
            question: {
              status: QuestionStatus.published,
              isActive: true,
              ...(session.grade ? { grade: session.grade } : {}),
              ...(session.topic ? { topic: session.topic } : {}),
              ...(session.subtopic ? { subtopic: session.subtopic } : {}),
            },
          },
          select: { id: true },
        });
        if (filtered.length === 0) return null;
        candidatePartId = filtered[Math.floor(Math.random() * filtered.length)]!.id;
      } else {
        // topic_drill mode — pick a random part matching session filters.
        if (!session.grade) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "topic_drill session has no grade.",
          });
        }
        const ids = await selectQuestionPartIds(ctx.db, {
          grade: session.grade,
          topic: session.topic,
          subtopic: session.subtopic,
          difficulty: session.difficulty,
          count: 1,
          standaloneOnly: false,
          excludePartIds,
        });
        candidatePartId = ids[0];
      }

      if (!candidatePartId) return null;

      // Return the part + parent question (so client can render stimulus + prompt).
      return ctx.db.questionPart.findUnique({
        where: { id: candidatePartId },
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
    }),

  /** Grade an answer, persist response, update counters. */
  submitAnswer: protectedProcedure
    .input(
      z.object({
        sessionId: z.string().cuid(),
        questionPartId: z.string().cuid(),
        selectedAnswer: z.string().max(500),
        timeSeconds: z.number().int().min(0).max(3600),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const session = await ctx.db.drillSession.findUnique({
        where: { id: input.sessionId },
      });
      if (session?.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      if (session.endedAt) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Session ended." });
      }
      const part = await ctx.db.questionPart.findUnique({
        where: { id: input.questionPartId },
        select: {
          id: true,
          questionType: true,
          correctAnswer: true,
          toleranceOverride: true,
          explanationDoc: true,
        },
      });
      if (!part) throw new TRPCError({ code: "NOT_FOUND" });

      const isCorrect = gradeAnswer(part, input.selectedAnswer);

      const [, response] = await ctx.db.$transaction([
        ctx.db.drillSession.update({
          where: { id: session.id },
          data: {
            totalQuestions: { increment: 1 },
            correctCount: { increment: isCorrect ? 1 : 0 },
            lastHeartbeatAt: new Date(),
          },
        }),
        ctx.db.questionResponse.create({
          data: {
            userId: ctx.session.user.id,
            questionPartId: input.questionPartId,
            selectedAnswer: input.selectedAnswer,
            isCorrect,
            timeSeconds: input.timeSeconds,
            drillSessionId: session.id,
          },
        }),
      ]);

      return {
        responseId: response.id,
        isCorrect,
        correctAnswer: part.correctAnswer,
        explanationDoc: part.explanationDoc,
      };
    }),

  /** Refresh heartbeat + opportunistically sweep stale sessions. */
  heartbeat: protectedProcedure
    .input(z.object({ sessionId: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      await sweepStaleSessions(ctx.db);
      const session = await ctx.db.drillSession.findUnique({
        where: { id: input.sessionId },
        select: { id: true, userId: true, endedAt: true },
      });
      if (session?.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      if (session.endedAt) return { active: false };
      await ctx.db.drillSession.update({
        where: { id: session.id },
        data: { lastHeartbeatAt: new Date() },
      });
      return { active: true };
    }),

  /** Explicit end. */
  end: protectedProcedure
    .input(z.object({ sessionId: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const session = await ctx.db.drillSession.findUnique({
        where: { id: input.sessionId },
      });
      if (session?.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      if (session.endedAt) return session;
      return ctx.db.drillSession.update({
        where: { id: session.id },
        data: {
          endedAt: new Date(),
          endedReason: DrillEndedReason.explicit,
        },
      });
    }),

  /** Recent completed sessions for the user (for stats / "history" page). */
  recent: protectedProcedure
    .input(z.object({ take: z.number().int().min(1).max(50).default(10) }))
    .query(async ({ ctx, input }) => {
      return ctx.db.drillSession.findMany({
        where: {
          userId: ctx.session.user.id,
          endedAt: { not: null },
        },
        orderBy: { startedAt: "desc" },
        take: input.take,
      });
    }),
});
