import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  ReportCategory,
  ReportStatus,
} from "../../../../generated/prisma";
import {
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

export const reportsRouter = createTRPCRouter({
  // ── User: create + view own ──────────────────────────────────────────────
  create: protectedProcedure
    .input(
      z.object({
        questionId: z.string().cuid(),
        category: z.nativeEnum(ReportCategory),
        text: z.string().max(1000).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const question = await ctx.db.question.findUnique({
        where: { id: input.questionId },
        select: { id: true },
      });
      if (!question) throw new TRPCError({ code: "NOT_FOUND" });
      return ctx.db.questionReport.create({
        data: {
          questionId: input.questionId,
          userId: ctx.session.user.id,
          category: input.category,
          text: input.text,
        },
      });
    }),

  myReports: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.questionReport.findMany({
      where: { userId: ctx.session.user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  }),

  // ── Admin: triage queue ──────────────────────────────────────────────────
  adminList: adminProcedure
    .input(
      z
        .object({
          status: z.nativeEnum(ReportStatus).optional(),
          take: z.number().int().min(1).max(100).default(50),
          cursor: z.string().cuid().optional(),
        })
        .default({ take: 50 }),
    )
    .query(async ({ ctx, input }) => {
      const items = await ctx.db.questionReport.findMany({
        where: input.status ? { status: input.status } : undefined,
        orderBy: { createdAt: "desc" },
        take: input.take + 1,
        ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
        include: {
          user: { select: { id: true, displayName: true, username: true } },
          question: {
            select: {
              id: true,
              grade: true,
              topic: true,
              subtopic: true,
              difficulty: true,
              status: true,
              isActive: true,
            },
          },
        },
      });
      const nextCursor =
        items.length > input.take ? items.pop()!.id : undefined;
      return { items, nextCursor };
    }),

  adminGet: adminProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const report = await ctx.db.questionReport.findUnique({
        where: { id: input.id },
        include: {
          user: { select: { id: true, displayName: true, username: true } },
          question: {
            include: { parts: { orderBy: { orderIndex: "asc" } } },
          },
          comments: {
            orderBy: { createdAt: "asc" },
            include: {
              user: { select: { id: true, displayName: true, username: true } },
            },
          },
          resolvedBy: { select: { id: true, displayName: true } },
        },
      });
      if (!report) throw new TRPCError({ code: "NOT_FOUND" });
      return report;
    }),

  adminAddComment: adminProcedure
    .input(
      z.object({
        reportId: z.string().cuid(),
        comment: z.string().min(1).max(2000),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const report = await ctx.db.questionReport.findUnique({
        where: { id: input.reportId },
        select: { id: true },
      });
      if (!report) throw new TRPCError({ code: "NOT_FOUND" });
      return ctx.db.reportComment.create({
        data: {
          reportId: input.reportId,
          userId: ctx.session.user.id,
          comment: input.comment,
        },
      });
    }),

  adminResolve: adminProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.questionReport.update({
        where: { id: input.id },
        data: {
          status: ReportStatus.resolved,
          resolvedAt: new Date(),
          resolvedById: ctx.session.user.id,
        },
      });
    }),

  adminDismiss: adminProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.questionReport.update({
        where: { id: input.id },
        data: {
          status: ReportStatus.dismissed,
          resolvedAt: new Date(),
          resolvedById: ctx.session.user.id,
        },
      });
    }),
});
