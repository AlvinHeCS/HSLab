-- Manual SQL constraints that Prisma cannot express.
-- Run AFTER `prisma migrate dev` has created the base tables.
-- Idempotent (uses IF NOT EXISTS where possible).

-- 1. friendships: prevent duplicate friendship rows for the same pair regardless of direction.
--    Without this, both (Alice→Bob, pending) and (Bob→Alice, pending) could exist.
CREATE UNIQUE INDEX IF NOT EXISTS friendships_pair_uniq
  ON "Friendship" (LEAST("requesterId", "receiverId"), GREATEST("requesterId", "receiverId"));

-- 2. question_responses: every response must belong to exactly one session container.
--    Either a drill, a test, or a battle — never zero, never more than one.
ALTER TABLE "QuestionResponse"
  DROP CONSTRAINT IF EXISTS question_response_exactly_one_session;
ALTER TABLE "QuestionResponse"
  ADD CONSTRAINT question_response_exactly_one_session CHECK (
    (CASE WHEN "drillSessionId"  IS NOT NULL THEN 1 ELSE 0 END) +
    (CASE WHEN "testSessionId"   IS NOT NULL THEN 1 ELSE 0 END) +
    (CASE WHEN "battleMatchId"   IS NOT NULL THEN 1 ELSE 0 END) = 1
  );
