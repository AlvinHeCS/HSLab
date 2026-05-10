import { battlesRouter } from "~/server/api/routers/battles";
import { drillsRouter } from "~/server/api/routers/drills";
import { friendsRouter } from "~/server/api/routers/friends";
import { mistakesRouter } from "~/server/api/routers/mistakes";
import { questionsRouter } from "~/server/api/routers/questions";
import { reportsRouter } from "~/server/api/routers/reports";
import { savedRouter } from "~/server/api/routers/saved";
import { testsRouter } from "~/server/api/routers/tests";
import { uploadsRouter } from "~/server/api/routers/uploads";
import { userRouter } from "~/server/api/routers/user";
import {
  createCallerFactory,
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";

/**
 * Primary router. Feature routers are added in dependency order.
 */
export const appRouter = createTRPCRouter({
  health: publicProcedure.query(() => ({ ok: true })),
  user: userRouter,
  friends: friendsRouter,
  questions: questionsRouter,
  drills: drillsRouter,
  tests: testsRouter,
  battles: battlesRouter,
  mistakes: mistakesRouter,
  saved: savedRouter,
  reports: reportsRouter,
  uploads: uploadsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 */
export const createCaller = createCallerFactory(appRouter);
