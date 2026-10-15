import { datesRouter } from "~/server/api/routers/dates";
import { placeRouter } from "~/server/api/routers/place";
import { postRouter } from "~/server/api/routers/post";
import { wishlistRouter } from "~/server/api/routers/wishlist";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  place: placeRouter,
  dates: datesRouter,
  wishlist: wishlistRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
