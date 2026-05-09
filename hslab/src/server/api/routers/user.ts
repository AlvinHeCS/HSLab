import { TRPCError } from "@trpc/server";
import { hash } from "bcryptjs";
import { z } from "zod";

import {
  generateUniqueFriendCode,
  generateUniqueUsername,
  pickAvatarColor,
} from "~/server/auth/helpers";
import { Grade } from "../../../../generated/prisma";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

const usernameSchema = z
  .string()
  .min(3)
  .max(20)
  .regex(/^[a-z0-9_]+$/, "lowercase letters, digits, and underscore only");

export const userRouter = createTRPCRouter({
  signup: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(8).max(100),
        displayName: z.string().min(1).max(60),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.user.findUnique({
        where: { email: input.email },
        select: { id: true },
      });
      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "An account with this email already exists.",
        });
      }
      const passwordHash = await hash(input.password, 12);
      const username = await generateUniqueUsername(input.displayName);
      const friendCode = await generateUniqueFriendCode();
      const user = await ctx.db.user.create({
        data: {
          email: input.email,
          passwordHash,
          displayName: input.displayName,
          username,
          avatarColor: pickAvatarColor(),
          friendCode,
        },
        select: { id: true, email: true, username: true },
      });
      return user;
    }),

  me: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        id: true,
        email: true,
        displayName: true,
        username: true,
        avatarUrl: true,
        avatarColor: true,
        friendCode: true,
        role: true,
        grade: true,
        createdAt: true,
      },
    });
    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND", message: "User not found." });
    }
    return user;
  }),

  onboard: protectedProcedure
    .input(
      z.object({
        grade: z.nativeEnum(Grade),
        username: usernameSchema.optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.username) {
        const taken = await ctx.db.user.findFirst({
          where: { username: input.username, NOT: { id: ctx.session.user.id } },
          select: { id: true },
        });
        if (taken) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Username already taken.",
          });
        }
      }
      return ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: {
          grade: input.grade,
          ...(input.username ? { username: input.username } : {}),
        },
        select: { id: true, grade: true, username: true },
      });
    }),

  updateProfile: protectedProcedure
    .input(
      z.object({
        displayName: z.string().min(1).max(60).optional(),
        grade: z.nativeEnum(Grade).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: input,
        select: { id: true, displayName: true, grade: true },
      });
    }),

  changePassword: protectedProcedure
    .input(
      z.object({
        currentPassword: z.string(),
        newPassword: z.string().min(8).max(100),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { compare } = await import("bcryptjs");
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { passwordHash: true },
      });
      if (!user?.passwordHash) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This account uses social sign-in and has no password.",
        });
      }
      const ok = await compare(input.currentPassword, user.passwordHash);
      if (!ok) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Current password is incorrect.",
        });
      }
      const newHash = await hash(input.newPassword, 12);
      await ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: { passwordHash: newHash },
      });
      return { ok: true };
    }),
});
