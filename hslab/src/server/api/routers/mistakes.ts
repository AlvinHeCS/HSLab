import { z } from "zod";

import {
  Grade,
  MathSubtopic,
  MathTopic,
  QuestionStatus,
} from "../../../../generated/prisma";
import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

/**
 * "Mistakes" are derived state — there's no `mistake_logs` table.
 * Definition: a question_part where the user's MOST RECENT response was wrong.
 * Implemented as DISTINCT ON (questionPartId) ORDER BY answeredAt DESC,
 * filtered to isCorrect=false.
 *
 * A mistake "clears" automatically the next time the user gets the same part
 * right (in any drill/test/battle context) — no explicit endpoint needed.
 */

type LatestWrongRow = {
  questionPartId: string;
  selectedAnswer: string;
  answeredAt: Date;
};

export const mistakesRouter = createTRPCRouter({
  count: protectedProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*)::bigint AS count
      FROM (
        SELECT DISTINCT ON ("questionPartId") "isCorrect"
        FROM "QuestionResponse"
        WHERE "userId" = ${ctx.session.user.id}
        ORDER BY "questionPartId", "answeredAt" DESC
      ) latest
      WHERE latest."isCorrect" = false
    `;
    return Number(rows[0]?.count ?? 0n);
  }),

  list: protectedProcedure
    .input(
      z
        .object({
          grade: z.nativeEnum(Grade).optional(),
          topic: z.nativeEnum(MathTopic).optional(),
          subtopic: z.nativeEnum(MathSubtopic).optional(),
          take: z.number().int().min(1).max(100).default(50),
          offset: z.number().int().min(0).default(0),
        })
        .default({ take: 50, offset: 0 }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      // 1. Latest-wrong response per part for this user.
      const latestWrong = await ctx.db.$queryRaw<LatestWrongRow[]>`
        SELECT "questionPartId", "selectedAnswer", "answeredAt"
        FROM (
          SELECT DISTINCT ON ("questionPartId")
            "questionPartId", "selectedAnswer", "answeredAt", "isCorrect"
          FROM "QuestionResponse"
          WHERE "userId" = ${userId}
          ORDER BY "questionPartId", "answeredAt" DESC
        ) latest
        WHERE latest."isCorrect" = false
        ORDER BY "answeredAt" DESC
      `;

      if (latestWrong.length === 0) return { items: [], totalShown: 0 };

      // 2. Filter the candidate part IDs by question metadata + still-active.
      const filtered = await ctx.db.questionPart.findMany({
        where: {
          id: { in: latestWrong.map((r) => r.questionPartId) },
          question: {
            status: QuestionStatus.published,
            isActive: true,
            ...(input.grade ? { grade: input.grade } : {}),
            ...(input.topic ? { topic: input.topic } : {}),
            ...(input.subtopic ? { subtopic: input.subtopic } : {}),
          },
        },
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
      const partsById = new Map(filtered.map((p) => [p.id, p]));

      // Re-order by answeredAt DESC + page.
      const orderedAndPaged = latestWrong
        .filter((r) => partsById.has(r.questionPartId))
        .slice(input.offset, input.offset + input.take)
        .map((r) => ({
          part: partsById.get(r.questionPartId)!,
          lastSelectedAnswer: r.selectedAnswer,
          lastAnsweredAt: r.answeredAt,
        }));

      return {
        items: orderedAndPaged,
        totalShown: latestWrong.filter((r) => partsById.has(r.questionPartId)).length,
      };
    }),
});
