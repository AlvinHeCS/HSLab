-- CreateEnum
CREATE TYPE "Role" AS ENUM ('student', 'admin');

-- CreateEnum
CREATE TYPE "Grade" AS ENUM ('Y7', 'Y8', 'Y9', 'Y10', 'Y11_STANDARD', 'Y11_ADVANCED', 'Y11_EXT1', 'Y12_STANDARD2', 'Y12_ADVANCED', 'Y12_EXT1', 'Y12_EXT2');

-- CreateEnum
CREATE TYPE "MathTopic" AS ENUM ('Y7_NUMBER', 'Y7_ALGEBRA', 'Y7_MEASUREMENT_SPACE', 'Y7_STATS_PROBABILITY', 'Y8_NUMBER', 'Y8_ALGEBRA', 'Y8_MEASUREMENT_SPACE', 'Y8_STATS_PROBABILITY', 'Y9_NUMBER_ALGEBRA', 'Y9_MEASUREMENT_SPACE', 'Y9_STATS_PROBABILITY', 'Y10_NUMBER_ALGEBRA', 'Y10_FUNCTIONS_POLYNOMIALS', 'Y10_MEASUREMENT_SPACE', 'Y10_STATS_PROBABILITY', 'Y11_STD_ALGEBRA', 'Y11_STD_MEASUREMENT', 'Y11_STD_FINANCIAL_MATH', 'Y11_STD_STATISTICAL_ANALYSIS', 'Y11_ADV_FUNCTIONS', 'Y11_ADV_TRIG_FUNCTIONS', 'Y11_ADV_CALCULUS', 'Y11_ADV_EXP_LOG_FUNCTIONS', 'Y11_ADV_STATISTICAL_ANALYSIS', 'Y11_E1_FUNCTIONS', 'Y11_E1_TRIG_FUNCTIONS', 'Y11_E1_CALCULUS', 'Y11_E1_COMBINATORICS', 'Y12_STD2_ALGEBRA', 'Y12_STD2_MEASUREMENT', 'Y12_STD2_FINANCIAL_MATH', 'Y12_STD2_STATISTICAL_ANALYSIS', 'Y12_STD2_NETWORKS', 'Y12_ADV_FUNCTIONS', 'Y12_ADV_TRIG_FUNCTIONS', 'Y12_ADV_CALCULUS', 'Y12_ADV_FINANCIAL_MATH', 'Y12_ADV_STATISTICAL_ANALYSIS', 'Y12_E1_PROOF', 'Y12_E1_VECTORS', 'Y12_E1_TRIG_FUNCTIONS', 'Y12_E1_CALCULUS', 'Y12_E1_STATISTICAL_ANALYSIS', 'Y12_E2_PROOF', 'Y12_E2_VECTORS', 'Y12_E2_COMPLEX_NUMBERS', 'Y12_E2_CALCULUS', 'Y12_E2_MECHANICS');

-- CreateEnum
CREATE TYPE "MathSubtopic" AS ENUM ('Y7_NUMBER_COMPUTATION_INTEGERS', 'Y7_NUMBER_FRACTIONS_DECIMALS_PERCENTAGES', 'Y7_NUMBER_INDICES', 'Y7_ALGEBRA_TECHNIQUES', 'Y7_ALGEBRA_EQUATIONS', 'Y7_MEASUREMENT_SPACE_LENGTH_AREA_VOLUME', 'Y7_MEASUREMENT_SPACE_TIME', 'Y7_MEASUREMENT_SPACE_ANGLE_RELATIONSHIPS', 'Y7_STATS_PROBABILITY_DATA_COLLECTION', 'Y7_STATS_PROBABILITY_PROBABILITY', 'Y8_NUMBER_RATIOS_RATES', 'Y8_NUMBER_FINANCIAL_MATH', 'Y8_ALGEBRA_TECHNIQUES', 'Y8_ALGEBRA_EQUATIONS', 'Y8_ALGEBRA_LINEAR_RELATIONSHIPS', 'Y8_MEASUREMENT_SPACE_PYTHAGORAS', 'Y8_MEASUREMENT_SPACE_GEOMETRICAL_FIGURES', 'Y8_MEASUREMENT_SPACE_LENGTH_AREA_VOLUME', 'Y8_STATS_PROBABILITY_SINGLE_VAR_DATA', 'Y8_STATS_PROBABILITY_PROBABILITY', 'Y9_NUMBER_ALGEBRA_INDICES', 'Y9_NUMBER_ALGEBRA_TECHNIQUES', 'Y9_NUMBER_ALGEBRA_LINEAR_RELATIONSHIPS', 'Y9_NUMBER_ALGEBRA_EQUATIONS', 'Y9_NUMBER_ALGEBRA_FINANCIAL_MATH', 'Y9_MEASUREMENT_SPACE_SURFACE_AREA_VOLUME', 'Y9_MEASUREMENT_SPACE_TRIGONOMETRY', 'Y9_MEASUREMENT_SPACE_GEOMETRICAL_FIGURES', 'Y9_STATS_PROBABILITY_SINGLE_VAR_DATA', 'Y9_STATS_PROBABILITY_PROBABILITY', 'Y10_NUMBER_ALGEBRA_TECHNIQUES', 'Y10_NUMBER_ALGEBRA_EQUATIONS', 'Y10_NUMBER_ALGEBRA_LINEAR_RELATIONSHIPS', 'Y10_NUMBER_ALGEBRA_NON_LINEAR', 'Y10_NUMBER_ALGEBRA_LOGARITHMS', 'Y10_FUNCTIONS_POLYNOMIALS_FUNCTIONS_GRAPHS', 'Y10_FUNCTIONS_POLYNOMIALS_POLYNOMIALS', 'Y10_MEASUREMENT_SPACE_SURFACE_AREA_VOLUME', 'Y10_MEASUREMENT_SPACE_TRIGONOMETRY', 'Y10_MEASUREMENT_SPACE_CIRCLE_GEOMETRY', 'Y10_STATS_PROBABILITY_BIVARIATE', 'Y10_STATS_PROBABILITY_SINGLE_VAR', 'Y10_STATS_PROBABILITY_PROBABILITY', 'Y11_STD_ALGEBRA_FORMULAE_EQUATIONS', 'Y11_STD_ALGEBRA_LINEAR_RELATIONSHIPS', 'Y11_STD_MEASUREMENT_APPLICATIONS', 'Y11_STD_MEASUREMENT_TIME', 'Y11_STD_FINANCIAL_MATH_MONEY_MATTERS', 'Y11_STD_STATISTICAL_ANALYSIS_DATA_ANALYSIS', 'Y11_STD_STATISTICAL_ANALYSIS_RELATIVE_FREQUENCY', 'Y11_ADV_FUNCTIONS_WORKING_WITH', 'Y11_ADV_FUNCTIONS_QUADRATIC_RELATIONSHIPS', 'Y11_ADV_FUNCTIONS_INVERSE', 'Y11_ADV_FUNCTIONS_POLYNOMIALS', 'Y11_ADV_TRIG_FUNCTIONS_TRIG_AND_ANGLES', 'Y11_ADV_TRIG_FUNCTIONS_FUNCTIONS_AND_IDENTITIES', 'Y11_ADV_CALCULUS_INTRO_DIFFERENTIATION', 'Y11_ADV_EXP_LOG_FUNCTIONS_LOGS_AND_EXPONENTIALS', 'Y11_ADV_EXP_LOG_FUNCTIONS_LOG_LAWS_EQUATIONS', 'Y11_ADV_STATISTICAL_ANALYSIS_PROBABILITY_VENN', 'Y11_ADV_STATISTICAL_ANALYSIS_DISCRETE_PROBABILITY', 'Y11_E1_FUNCTIONS_FURTHER_WORK', 'Y11_E1_FUNCTIONS_POLYNOMIALS', 'Y11_E1_FUNCTIONS_INVERSE', 'Y11_E1_TRIG_FUNCTIONS_INVERSE_TRIG', 'Y11_E1_TRIG_FUNCTIONS_FURTHER_IDENTITIES', 'Y11_E1_CALCULUS_RATES_OF_CHANGE', 'Y11_E1_COMBINATORICS_WORKING_WITH', 'Y11_E1_COMBINATORICS_BINOMIAL_EXPANSION', 'Y12_STD2_ALGEBRA_TYPES_OF_RELATIONSHIPS', 'Y12_STD2_ALGEBRA_SIMULTANEOUS_LINEAR', 'Y12_STD2_MEASUREMENT_NON_RIGHT_ANGLED_TRIG', 'Y12_STD2_MEASUREMENT_RATES_RATIOS', 'Y12_STD2_FINANCIAL_MATH_INVESTMENTS_LOANS', 'Y12_STD2_FINANCIAL_MATH_ANNUITIES', 'Y12_STD2_STATISTICAL_ANALYSIS_BIVARIATE_DATA', 'Y12_STD2_STATISTICAL_ANALYSIS_NORMAL_DISTRIBUTION', 'Y12_STD2_NETWORKS_NETWORK_CONCEPTS', 'Y12_STD2_NETWORKS_CRITICAL_PATH', 'Y12_ADV_FUNCTIONS_GRAPHING_TECHNIQUES', 'Y12_ADV_TRIG_FUNCTIONS_GRAPHS', 'Y12_ADV_CALCULUS_DIFFERENTIAL', 'Y12_ADV_CALCULUS_SECOND_DERIVATIVE', 'Y12_ADV_CALCULUS_INTEGRAL', 'Y12_ADV_FINANCIAL_MATH_MODELLING', 'Y12_ADV_STATISTICAL_ANALYSIS_DESCRIPTIVE_BIVARIATE', 'Y12_ADV_STATISTICAL_ANALYSIS_RANDOM_VARIABLES', 'Y12_ADV_STATISTICAL_ANALYSIS_NORMAL_DISTRIBUTION', 'Y12_E1_PROOF_INDUCTION', 'Y12_E1_VECTORS_INTRO', 'Y12_E1_TRIG_FUNCTIONS_EQUATIONS', 'Y12_E1_CALCULUS_FURTHER_SKILLS', 'Y12_E1_CALCULUS_APPLICATIONS', 'Y12_E1_CALCULUS_DIFFERENTIAL_EQUATIONS', 'Y12_E1_STATISTICAL_ANALYSIS_BINOMIAL_DISTRIBUTION', 'Y12_E2_PROOF_NATURE_OF_PROOF', 'Y12_E2_PROOF_FURTHER_INDUCTION', 'Y12_E2_VECTORS_FURTHER_WORK', 'Y12_E2_COMPLEX_NUMBERS_INTRO', 'Y12_E2_COMPLEX_NUMBERS_USING', 'Y12_E2_CALCULUS_FURTHER_INTEGRATION', 'Y12_E2_MECHANICS_APPLICATIONS');

-- CreateEnum
CREATE TYPE "QuestionDifficulty" AS ENUM ('easy', 'medium', 'hard');

-- CreateEnum
CREATE TYPE "QuestionStatus" AS ENUM ('draft', 'review', 'published');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('mcq', 'numeric', 'short_text');

-- CreateEnum
CREATE TYPE "FriendshipStatus" AS ENUM ('pending', 'accepted', 'rejected');

-- CreateEnum
CREATE TYPE "BattleStatus" AS ENUM ('waiting', 'active', 'completed', 'abandoned');

-- CreateEnum
CREATE TYPE "BattleInviteStatus" AS ENUM ('pending', 'accepted', 'declined', 'expired');

-- CreateEnum
CREATE TYPE "DrillSessionMode" AS ENUM ('topic_drill', 'mistake_review');

-- CreateEnum
CREATE TYPE "DrillEndedReason" AS ENUM ('explicit', 'idle_timeout');

-- CreateEnum
CREATE TYPE "TestEndedReason" AS ENUM ('submitted', 'time_expired', 'forfeit');

-- CreateEnum
CREATE TYPE "ReportCategory" AS ENUM ('wrong_answer', 'typo', 'image_broken', 'ambiguous', 'off_topic', 'other');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('open', 'resolved', 'dismissed');

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "refresh_token_expires_in" INTEGER,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "passwordHash" TEXT,
    "displayName" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "avatarColor" TEXT NOT NULL,
    "friendCode" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'student',
    "grade" "Grade",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Friendship" (
    "id" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "status" "FriendshipStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Friendship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "grade" "Grade" NOT NULL,
    "topic" "MathTopic" NOT NULL,
    "subtopic" "MathSubtopic" NOT NULL,
    "difficulty" "QuestionDifficulty" NOT NULL,
    "status" "QuestionStatus" NOT NULL DEFAULT 'draft',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "stimulusDoc" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionPart" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "isStandalone" BOOLEAN NOT NULL DEFAULT false,
    "questionType" "QuestionType" NOT NULL,
    "promptDoc" JSONB NOT NULL,
    "explanationDoc" JSONB,
    "correctAnswer" TEXT NOT NULL,
    "choices" JSONB,
    "toleranceOverride" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuestionPart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DrillSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mode" "DrillSessionMode" NOT NULL DEFAULT 'topic_drill',
    "grade" "Grade",
    "topic" "MathTopic",
    "subtopic" "MathSubtopic",
    "difficulty" "QuestionDifficulty",
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastHeartbeatAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "endedReason" "DrillEndedReason",
    "totalQuestions" INTEGER NOT NULL DEFAULT 0,
    "correctCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "DrillSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestBlueprint" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "grade" "Grade" NOT NULL,
    "timeLimitSeconds" INTEGER NOT NULL,
    "questionPartIds" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "TestBlueprint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "blueprintId" TEXT NOT NULL,
    "questionPartIds" TEXT[],
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "endedReason" "TestEndedReason",
    "totalCorrect" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "TestSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BattleInvite" (
    "id" TEXT NOT NULL,
    "inviterId" TEXT NOT NULL,
    "inviteeId" TEXT NOT NULL,
    "grade" "Grade" NOT NULL,
    "topic" "MathTopic",
    "questionCount" INTEGER NOT NULL,
    "status" "BattleInviteStatus" NOT NULL DEFAULT 'pending',
    "matchId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BattleInvite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BattleMatch" (
    "id" TEXT NOT NULL,
    "player1Id" TEXT NOT NULL,
    "player2Id" TEXT NOT NULL,
    "grade" "Grade" NOT NULL,
    "topic" "MathTopic",
    "questionCount" INTEGER NOT NULL,
    "questionPartIds" TEXT[],
    "status" "BattleStatus" NOT NULL DEFAULT 'waiting',
    "player1Score" INTEGER NOT NULL DEFAULT 0,
    "player2Score" INTEGER NOT NULL DEFAULT 0,
    "player1CurrentQIndex" INTEGER,
    "player1CurrentQStartedAt" TIMESTAMP(3),
    "player2CurrentQIndex" INTEGER,
    "player2CurrentQStartedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "BattleMatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionResponse" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questionPartId" TEXT NOT NULL,
    "selectedAnswer" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "timeSeconds" INTEGER NOT NULL,
    "answeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "drillSessionId" TEXT,
    "testSessionId" TEXT,
    "battleMatchId" TEXT,

    CONSTRAINT "QuestionResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedQuestion" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "savedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionReport" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "category" "ReportCategory" NOT NULL,
    "text" TEXT,
    "status" "ReportStatus" NOT NULL DEFAULT 'open',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "resolvedById" TEXT,

    CONSTRAINT "QuestionReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportComment" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReportComment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_friendCode_key" ON "User"("friendCode");

-- CreateIndex
CREATE INDEX "User_username_idx" ON "User"("username");

-- CreateIndex
CREATE INDEX "User_friendCode_idx" ON "User"("friendCode");

-- CreateIndex
CREATE INDEX "Friendship_requesterId_status_idx" ON "Friendship"("requesterId", "status");

-- CreateIndex
CREATE INDEX "Friendship_receiverId_status_idx" ON "Friendship"("receiverId", "status");

-- CreateIndex
CREATE INDEX "Question_status_isActive_grade_topic_subtopic_difficulty_idx" ON "Question"("status", "isActive", "grade", "topic", "subtopic", "difficulty");

-- CreateIndex
CREATE INDEX "Question_status_isActive_grade_difficulty_idx" ON "Question"("status", "isActive", "grade", "difficulty");

-- CreateIndex
CREATE INDEX "QuestionPart_questionId_idx" ON "QuestionPart"("questionId");

-- CreateIndex
CREATE INDEX "QuestionPart_isStandalone_idx" ON "QuestionPart"("isStandalone");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionPart_questionId_orderIndex_key" ON "QuestionPart"("questionId", "orderIndex");

-- CreateIndex
CREATE INDEX "DrillSession_userId_endedAt_idx" ON "DrillSession"("userId", "endedAt");

-- CreateIndex
CREATE INDEX "DrillSession_endedAt_lastHeartbeatAt_idx" ON "DrillSession"("endedAt", "lastHeartbeatAt");

-- CreateIndex
CREATE INDEX "TestBlueprint_grade_isActive_idx" ON "TestBlueprint"("grade", "isActive");

-- CreateIndex
CREATE INDEX "TestSession_userId_endedAt_idx" ON "TestSession"("userId", "endedAt");

-- CreateIndex
CREATE INDEX "TestSession_blueprintId_idx" ON "TestSession"("blueprintId");

-- CreateIndex
CREATE UNIQUE INDEX "BattleInvite_matchId_key" ON "BattleInvite"("matchId");

-- CreateIndex
CREATE INDEX "BattleInvite_inviteeId_status_idx" ON "BattleInvite"("inviteeId", "status");

-- CreateIndex
CREATE INDEX "BattleInvite_inviterId_status_idx" ON "BattleInvite"("inviterId", "status");

-- CreateIndex
CREATE INDEX "BattleMatch_player1Id_idx" ON "BattleMatch"("player1Id");

-- CreateIndex
CREATE INDEX "BattleMatch_player2Id_idx" ON "BattleMatch"("player2Id");

-- CreateIndex
CREATE INDEX "BattleMatch_status_idx" ON "BattleMatch"("status");

-- CreateIndex
CREATE INDEX "QuestionResponse_userId_questionPartId_answeredAt_idx" ON "QuestionResponse"("userId", "questionPartId", "answeredAt" DESC);

-- CreateIndex
CREATE INDEX "QuestionResponse_userId_isCorrect_answeredAt_idx" ON "QuestionResponse"("userId", "isCorrect", "answeredAt");

-- CreateIndex
CREATE INDEX "QuestionResponse_drillSessionId_idx" ON "QuestionResponse"("drillSessionId");

-- CreateIndex
CREATE INDEX "QuestionResponse_testSessionId_idx" ON "QuestionResponse"("testSessionId");

-- CreateIndex
CREATE INDEX "QuestionResponse_battleMatchId_idx" ON "QuestionResponse"("battleMatchId");

-- CreateIndex
CREATE INDEX "SavedQuestion_userId_savedAt_idx" ON "SavedQuestion"("userId", "savedAt");

-- CreateIndex
CREATE UNIQUE INDEX "SavedQuestion_userId_questionId_key" ON "SavedQuestion"("userId", "questionId");

-- CreateIndex
CREATE INDEX "QuestionReport_status_createdAt_idx" ON "QuestionReport"("status", "createdAt");

-- CreateIndex
CREATE INDEX "QuestionReport_questionId_idx" ON "QuestionReport"("questionId");

-- CreateIndex
CREATE INDEX "QuestionReport_userId_idx" ON "QuestionReport"("userId");

-- CreateIndex
CREATE INDEX "ReportComment_reportId_idx" ON "ReportComment"("reportId");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionPart" ADD CONSTRAINT "QuestionPart_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DrillSession" ADD CONSTRAINT "DrillSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestBlueprint" ADD CONSTRAINT "TestBlueprint_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestSession" ADD CONSTRAINT "TestSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestSession" ADD CONSTRAINT "TestSession_blueprintId_fkey" FOREIGN KEY ("blueprintId") REFERENCES "TestBlueprint"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BattleInvite" ADD CONSTRAINT "BattleInvite_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BattleInvite" ADD CONSTRAINT "BattleInvite_inviteeId_fkey" FOREIGN KEY ("inviteeId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BattleInvite" ADD CONSTRAINT "BattleInvite_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "BattleMatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BattleMatch" ADD CONSTRAINT "BattleMatch_player1Id_fkey" FOREIGN KEY ("player1Id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BattleMatch" ADD CONSTRAINT "BattleMatch_player2Id_fkey" FOREIGN KEY ("player2Id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionResponse" ADD CONSTRAINT "QuestionResponse_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionResponse" ADD CONSTRAINT "QuestionResponse_questionPartId_fkey" FOREIGN KEY ("questionPartId") REFERENCES "QuestionPart"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionResponse" ADD CONSTRAINT "QuestionResponse_drillSessionId_fkey" FOREIGN KEY ("drillSessionId") REFERENCES "DrillSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionResponse" ADD CONSTRAINT "QuestionResponse_testSessionId_fkey" FOREIGN KEY ("testSessionId") REFERENCES "TestSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionResponse" ADD CONSTRAINT "QuestionResponse_battleMatchId_fkey" FOREIGN KEY ("battleMatchId") REFERENCES "BattleMatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedQuestion" ADD CONSTRAINT "SavedQuestion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedQuestion" ADD CONSTRAINT "SavedQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionReport" ADD CONSTRAINT "QuestionReport_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionReport" ADD CONSTRAINT "QuestionReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionReport" ADD CONSTRAINT "QuestionReport_resolvedById_fkey" FOREIGN KEY ("resolvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportComment" ADD CONSTRAINT "ReportComment_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "QuestionReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportComment" ADD CONSTRAINT "ReportComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
