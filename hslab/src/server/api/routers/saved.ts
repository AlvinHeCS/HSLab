import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  Grade,
  MathTopic,
  QuestionStatus,
} from "../../../../generated/prisma";
import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

export const savedRouter = createTRPCRouter({
  save: protectedProcedure
    .input(z.object({ questionId: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const question = await ctx.db.question.findUnique({
        where: { id: input.questionId },
        select: { id: true },
      });
      if (!question) throw new TRPCError({ code: "NOT_FOUND" });
      try {
        return await ctx.db.savedQuestion.create({
          data: {
            userId: ctx.session.user.id,
            questionId: input.questionId,
          },
        });
      } catch {
        // Unique violation = already saved; treat as idempotent.
        return ctx.db.savedQuestion.findUnique({
          where: {
            userId_questionId: {
              userId: ctx.session.user.id,
              questionId: input.questionId,
            },
          },
        });
      }
    }),

  unsave: protectedProcedure
    .input(z.object({ questionId: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.savedQuestion.deleteMany({
        where: {
          userId: ctx.session.user.id,
          questionId: input.questionId,
        },
      });
      return { ok: true };
    }),

  isSaved: protectedProcedure
    .input(z.object({ questionId: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const row = await ctx.db.savedQuestion.findUnique({
        where: {
          userId_questionId: {
            userId: ctx.session.user.id,
            questionId: input.questionId,
          },
        },
        select: { id: true },
      });
      return !!row;
    }),

  list: protectedProcedure
    .input(
      z
        .object({
          grade: z.nativeEnum(Grade).optional(),
          topic: z.nativeEnum(MathTopic).optional(),
          take: z.number().int().min(1).max(100).default(50),
          offset: z.number().int().min(0).default(0),
        })
        .default({ take: 50, offset: 0 }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.savedQuestion.findMany({
        where: {
          userId: ctx.session.user.id,
          question: {
            status: QuestionStatus.published,
            isActive: true,
            ...(input.grade ? { grade: input.grade } : {}),
            ...(input.topic ? { topic: input.topic } : {}),
          },
        },
        orderBy: { savedAt: "desc" },
        take: input.take,
        skip: input.offset,
        include: {
          question: {
            include: {
              parts: { orderBy: { orderIndex: "asc" } },
            },
          },
        },
      });
    }),
});
