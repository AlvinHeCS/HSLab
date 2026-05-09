import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  Grade,
  MathSubtopic,
  MathTopic,
  Prisma,
  QuestionDifficulty,
  QuestionStatus,
  QuestionType,
} from "../../../../generated/prisma";
import {
  isSubtopicValidForTopic,
  isTopicValidForGrade,
} from "~/server/taxonomy";
import {
  adminProcedure,
  createTRPCRouter,
} from "~/server/api/trpc";

// TipTap JSON docs flow through unmodified — the editor produces them and the
// renderer consumes them. Server only stores/retrieves.
const tiptapDoc = z.unknown();

const partInputSchema = z.object({
  orderIndex: z.number().int().min(0),
  isStandalone: z.boolean().default(false),
  questionType: z.nativeEnum(QuestionType),
  promptDoc: tiptapDoc,
  explanationDoc: tiptapDoc.nullable().optional(),
  correctAnswer: z.string().min(1),
  // MCQ only — array of {label, doc[, isCorrect]} (isCorrect derivable from correctAnswer)
  choices: tiptapDoc.nullable().optional(),
  toleranceOverride: z.number().positive().nullable().optional(),
});

function assertHierarchy(
  grade: Grade,
  topic: MathTopic,
  subtopic: MathSubtopic,
) {
  if (!isTopicValidForGrade(grade, topic)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Topic ${topic} is not valid for grade ${grade}.`,
    });
  }
  if (!isSubtopicValidForTopic(topic, subtopic)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Subtopic ${subtopic} is not valid for topic ${topic}.`,
    });
  }
}

function assertPartsValid(
  parts: z.infer<typeof partInputSchema>[],
) {
  if (parts.length === 0) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "At least one part required." });
  }
  const indices = new Set<number>();
  for (const p of parts) {
    if (indices.has(p.orderIndex)) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `Duplicate orderIndex ${p.orderIndex}.`,
      });
    }
    indices.add(p.orderIndex);

    if (p.questionType === QuestionType.mcq) {
      if (!p.choices) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `MCQ part (orderIndex=${p.orderIndex}) requires choices.`,
        });
      }
    }
  }
}

export const questionsRouter = createTRPCRouter({
  create: adminProcedure
    .input(
      z.object({
        grade: z.nativeEnum(Grade),
        topic: z.nativeEnum(MathTopic),
        subtopic: z.nativeEnum(MathSubtopic),
        difficulty: z.nativeEnum(QuestionDifficulty),
        stimulusDoc: tiptapDoc.nullable().optional(),
        parts: z.array(partInputSchema).min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      assertHierarchy(input.grade, input.topic, input.subtopic);
      assertPartsValid(input.parts);

      return ctx.db.question.create({
        data: {
          grade: input.grade,
          topic: input.topic,
          subtopic: input.subtopic,
          difficulty: input.difficulty,
          status: QuestionStatus.draft,
          isActive: true,
          stimulusDoc: input.stimulusDoc as Prisma.InputJsonValue | undefined,
          createdById: ctx.session.user.id,
          parts: {
            create: input.parts.map((p) => ({
              orderIndex: p.orderIndex,
              isStandalone: p.isStandalone,
              questionType: p.questionType,
              promptDoc: p.promptDoc as Prisma.InputJsonValue,
              explanationDoc: p.explanationDoc as Prisma.InputJsonValue | undefined,
              correctAnswer: p.correctAnswer,
              choices: p.choices as Prisma.InputJsonValue | undefined,
              toleranceOverride: p.toleranceOverride ?? null,
            })),
          },
        },
        include: { parts: true },
      });
    }),

  list: adminProcedure
    .input(
      z
        .object({
          status: z.nativeEnum(QuestionStatus).optional(),
          grade: z.nativeEnum(Grade).optional(),
          topic: z.nativeEnum(MathTopic).optional(),
          subtopic: z.nativeEnum(MathSubtopic).optional(),
          difficulty: z.nativeEnum(QuestionDifficulty).optional(),
          isActive: z.boolean().optional(),
          take: z.number().int().min(1).max(100).default(50),
          cursor: z.string().cuid().optional(),
        })
        .default({ take: 50 }),
    )
    .query(async ({ ctx, input }) => {
      const items = await ctx.db.question.findMany({
        where: {
          ...(input.status ? { status: input.status } : {}),
          ...(input.grade ? { grade: input.grade } : {}),
          ...(input.topic ? { topic: input.topic } : {}),
          ...(input.subtopic ? { subtopic: input.subtopic } : {}),
          ...(input.difficulty ? { difficulty: input.difficulty } : {}),
          ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
        },
        take: input.take + 1,
        ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
        orderBy: { createdAt: "desc" },
        include: {
          parts: { orderBy: { orderIndex: "asc" } },
          createdBy: { select: { id: true, displayName: true, username: true } },
        },
      });
      const nextCursor =
        items.length > input.take ? items.pop()!.id : undefined;
      return { items, nextCursor };
    }),

  get: adminProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const q = await ctx.db.question.findUnique({
        where: { id: input.id },
        include: {
          parts: { orderBy: { orderIndex: "asc" } },
          createdBy: { select: { id: true, displayName: true, username: true } },
        },
      });
      if (!q) throw new TRPCError({ code: "NOT_FOUND" });
      return q;
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        grade: z.nativeEnum(Grade).optional(),
        topic: z.nativeEnum(MathTopic).optional(),
        subtopic: z.nativeEnum(MathSubtopic).optional(),
        difficulty: z.nativeEnum(QuestionDifficulty).optional(),
        stimulusDoc: tiptapDoc.nullable().optional(),
        parts: z.array(partInputSchema).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.question.findUnique({
        where: { id: input.id },
      });
      if (!existing) throw new TRPCError({ code: "NOT_FOUND" });

      const grade = input.grade ?? existing.grade;
      const topic = input.topic ?? existing.topic;
      const subtopic = input.subtopic ?? existing.subtopic;
      assertHierarchy(grade, topic, subtopic);

      if (input.parts) assertPartsValid(input.parts);

      return ctx.db.$transaction(async (tx) => {
        const updated = await tx.question.update({
          where: { id: input.id },
          data: {
            grade,
            topic,
            subtopic,
            difficulty: input.difficulty ?? existing.difficulty,
            stimulusDoc:
              input.stimulusDoc === undefined
                ? undefined
                : input.stimulusDoc === null
                  ? Prisma.DbNull
                  : (input.stimulusDoc as Prisma.InputJsonValue),
          },
        });
        if (input.parts) {
          await tx.questionPart.deleteMany({ where: { questionId: input.id } });
          await tx.questionPart.createMany({
            data: input.parts.map((p) => ({
              questionId: input.id,
              orderIndex: p.orderIndex,
              isStandalone: p.isStandalone,
              questionType: p.questionType,
              promptDoc: p.promptDoc as Prisma.InputJsonValue,
              explanationDoc:
                p.explanationDoc == null
                  ? Prisma.DbNull
                  : (p.explanationDoc as Prisma.InputJsonValue),
              correctAnswer: p.correctAnswer,
              choices:
                p.choices == null
                  ? Prisma.DbNull
                  : (p.choices as Prisma.InputJsonValue),
              toleranceOverride: p.toleranceOverride ?? null,
            })),
          });
        }
        return updated;
      });
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const q = await ctx.db.question.findUnique({
        where: { id: input.id },
        select: { status: true },
      });
      if (!q) throw new TRPCError({ code: "NOT_FOUND" });
      if (q.status === QuestionStatus.published) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot delete a published question. Retire it instead (sets isActive=false).",
        });
      }
      await ctx.db.question.delete({ where: { id: input.id } });
      return { ok: true };
    }),

  setStatus: adminProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        status: z.nativeEnum(QuestionStatus),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.question.update({
        where: { id: input.id },
        data: { status: input.status },
        select: { id: true, status: true },
      });
    }),

  // Soft-hide a published question without deleting; preserves response history.
  setActive: adminProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        isActive: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.question.update({
        where: { id: input.id },
        data: { isActive: input.isActive },
        select: { id: true, isActive: true },
      });
    }),
});
