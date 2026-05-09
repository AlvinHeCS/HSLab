import {
  type QuestionPart,
  QuestionType,
} from "../../../generated/prisma";

const DEFAULT_RELATIVE_TOL = 0.005; // ±0.5%
const DEFAULT_ABSOLUTE_TOL = 0.001;

/**
 * Parse a numeric answer string. Accepts:
 *   "0.5", ".5", "1/2", "+0.5", "-1.25", "1.0e-3"
 * Strips whitespace. Returns null if unparseable.
 */
export function parseNumericAnswer(raw: string): number | null {
  const s = raw.trim();
  if (!s) return null;
  if (s.includes("/")) {
    const [num, den] = s.split("/").map((x) => x.trim());
    if (num === undefined || den === undefined) return null;
    const n = Number(num);
    const d = Number(den);
    if (!Number.isFinite(n) || !Number.isFinite(d) || d === 0) return null;
    return n / d;
  }
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

/**
 * Numeric equivalence with tolerance.
 * Tolerance = max(absoluteTol, relativeTol * |expected|).
 * If overrideTolerance is provided, it's used as the absolute tolerance.
 */
export function numericMatches(
  expected: number,
  actual: number,
  overrideTolerance: number | null,
): boolean {
  const absTol = overrideTolerance ?? DEFAULT_ABSOLUTE_TOL;
  const relTol = overrideTolerance == null ? DEFAULT_RELATIVE_TOL : 0;
  const tolerance = Math.max(absTol, relTol * Math.abs(expected));
  return Math.abs(expected - actual) <= tolerance;
}

/**
 * Grade a single submitted answer against a QuestionPart's correct_answer.
 * Pure — does not touch the DB. Server-of-truth for is_correct on response rows.
 */
export function gradeAnswer(
  part: Pick<QuestionPart, "questionType" | "correctAnswer" | "toleranceOverride">,
  selectedAnswer: string,
): boolean {
  switch (part.questionType) {
    case QuestionType.mcq:
      return (
        part.correctAnswer.trim().toUpperCase() ===
        selectedAnswer.trim().toUpperCase()
      );
    case QuestionType.short_text:
      return (
        part.correctAnswer.trim().toLowerCase() ===
        selectedAnswer.trim().toLowerCase()
      );
    case QuestionType.numeric: {
      const expected = parseNumericAnswer(part.correctAnswer);
      const actual = parseNumericAnswer(selectedAnswer);
      if (expected == null || actual == null) return false;
      return numericMatches(expected, actual, part.toleranceOverride);
    }
  }
}
