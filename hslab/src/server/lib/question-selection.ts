import {
  type Grade,
  type MathSubtopic,
  type MathTopic,
  type PrismaClient,
  type QuestionDifficulty,
  QuestionStatus,
} from "../../../generated/prisma";

export type SelectionOpts = {
  grade: Grade;
  topic?: MathTopic | null;
  subtopic?: MathSubtopic | null;
  difficulty?: QuestionDifficulty | null;
  count: number;
  /** Battles and "quick drill" mode set this true. */
  standaloneOnly: boolean;
  /** Optional part IDs to exclude (e.g. already-served in current session). */
  excludePartIds?: string[];
};

/**
 * Pick random QuestionPart IDs matching the given filters from the published,
 * active question pool.
 *
 * Uses Postgres `ORDER BY random() LIMIT n`. Cheap up to ~100k parts; if the
 * pool grows much larger we should switch to TABLESAMPLE.
 */
export async function selectQuestionPartIds(
  db: PrismaClient,
  opts: SelectionOpts,
): Promise<string[]> {
  const rows = await db.questionPart.findMany({
    where: {
      ...(opts.standaloneOnly ? { isStandalone: true } : {}),
      ...(opts.excludePartIds && opts.excludePartIds.length > 0
        ? { id: { notIn: opts.excludePartIds } }
        : {}),
      question: {
        status: QuestionStatus.published,
        isActive: true,
        grade: opts.grade,
        ...(opts.topic ? { topic: opts.topic } : {}),
        ...(opts.subtopic ? { subtopic: opts.subtopic } : {}),
        ...(opts.difficulty ? { difficulty: opts.difficulty } : {}),
      },
    },
    select: { id: true },
  });
  // In-memory shuffle. Acceptable until pool > 100k parts.
  for (let i = rows.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rows[i], rows[j]] = [rows[j]!, rows[i]!];
  }
  return rows.slice(0, opts.count).map((r) => r.id);
}
