import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { FriendshipStatus, type PrismaClient } from "../../../../generated/prisma";
import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

/**
 * Look up the (canonical, unordered) friendship between two users.
 * Used to enforce "no duplicate friendship pair" in app code as well as the
 * raw-SQL unique index.
 */
async function findFriendshipBetween(
  db: PrismaClient,
  a: string,
  b: string,
) {
  return db.friendship.findFirst({
    where: {
      OR: [
        { requesterId: a, receiverId: b },
        { requesterId: b, receiverId: a },
      ],
    },
  });
}

export const friendsRouter = createTRPCRouter({
  // List friends + counts of pending requests (for badge UI)
  list: protectedProcedure.query(async ({ ctx }) => {
    const me = ctx.session.user.id;
    const accepted = await ctx.db.friendship.findMany({
      where: {
        status: FriendshipStatus.accepted,
        OR: [{ requesterId: me }, { receiverId: me }],
      },
      include: {
        requester: {
          select: { id: true, username: true, displayName: true, avatarUrl: true, avatarColor: true, grade: true },
        },
        receiver: {
          select: { id: true, username: true, displayName: true, avatarUrl: true, avatarColor: true, grade: true },
        },
      },
      orderBy: { acceptedAt: "desc" },
    });
    return accepted.map((f) => ({
      friendshipId: f.id,
      friend: f.requesterId === me ? f.receiver : f.requester,
      since: f.acceptedAt,
    }));
  }),

  incomingRequests: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.friendship.findMany({
      where: {
        receiverId: ctx.session.user.id,
        status: FriendshipStatus.pending,
      },
      include: {
        requester: {
          select: { id: true, username: true, displayName: true, avatarUrl: true, avatarColor: true, grade: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }),

  outgoingRequests: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.friendship.findMany({
      where: {
        requesterId: ctx.session.user.id,
        status: FriendshipStatus.pending,
      },
      include: {
        receiver: {
          select: { id: true, username: true, displayName: true, avatarUrl: true, avatarColor: true, grade: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }),

  // Look up a user by their friend code (the share-with-friends code)
  lookupByFriendCode: protectedProcedure
    .input(z.object({ code: z.string().min(8).max(20) }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { friendCode: input.code.toUpperCase() },
        select: { id: true, username: true, displayName: true, avatarUrl: true, avatarColor: true, grade: true },
      });
      if (!user || user.id === ctx.session.user.id) return null;
      return user;
    }),

  // Username search (prefix-match, capped). For autocomplete in friend-add UI.
  searchUsers: protectedProcedure
    .input(z.object({ query: z.string().min(2).max(20) }))
    .query(async ({ ctx, input }) => {
      const me = ctx.session.user.id;
      return ctx.db.user.findMany({
        where: {
          username: { startsWith: input.query.toLowerCase() },
          NOT: { id: me },
        },
        select: { id: true, username: true, displayName: true, avatarUrl: true, avatarColor: true, grade: true },
        take: 10,
      });
    }),

  sendRequest: protectedProcedure
    .input(z.object({ targetUserId: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const me = ctx.session.user.id;
      if (input.targetUserId === me) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot friend yourself." });
      }
      const target = await ctx.db.user.findUnique({
        where: { id: input.targetUserId },
        select: { id: true },
      });
      if (!target) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found." });
      }
      const existing = await findFriendshipBetween(ctx.db, me, target.id);
      if (existing) {
        if (existing.status === FriendshipStatus.accepted) {
          throw new TRPCError({ code: "CONFLICT", message: "Already friends." });
        }
        if (existing.status === FriendshipStatus.pending) {
          throw new TRPCError({ code: "CONFLICT", message: "Request already pending." });
        }
        // status === rejected → reuse the row, flip back to pending
        return ctx.db.friendship.update({
          where: { id: existing.id },
          data: {
            requesterId: me,
            receiverId: target.id,
            status: FriendshipStatus.pending,
          },
        });
      }
      return ctx.db.friendship.create({
        data: {
          requesterId: me,
          receiverId: target.id,
          status: FriendshipStatus.pending,
        },
      });
    }),

  respondRequest: protectedProcedure
    .input(
      z.object({
        friendshipId: z.string().cuid(),
        accept: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const friendship = await ctx.db.friendship.findUnique({
        where: { id: input.friendshipId },
      });
      if (friendship?.receiverId !== ctx.session.user.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      if (friendship.status !== FriendshipStatus.pending) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Request is not pending.",
        });
      }
      return ctx.db.friendship.update({
        where: { id: friendship.id },
        data: {
          status: input.accept
            ? FriendshipStatus.accepted
            : FriendshipStatus.rejected,
          acceptedAt: input.accept ? new Date() : null,
        },
      });
    }),

  // Cancel an outgoing pending request you sent
  cancelRequest: protectedProcedure
    .input(z.object({ friendshipId: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const friendship = await ctx.db.friendship.findUnique({
        where: { id: input.friendshipId },
      });
      if (
        friendship?.requesterId !== ctx.session.user.id ||
        friendship.status !== FriendshipStatus.pending
      ) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      await ctx.db.friendship.delete({ where: { id: friendship.id } });
      return { ok: true };
    }),

  // Hard-delete an accepted friendship (per Q19 lock).
  unfriend: protectedProcedure
    .input(z.object({ friendUserId: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const me = ctx.session.user.id;
      const friendship = await findFriendshipBetween(ctx.db, me, input.friendUserId);
      if (friendship?.status !== FriendshipStatus.accepted) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      await ctx.db.friendship.delete({ where: { id: friendship.id } });
      return { ok: true };
    }),
});
