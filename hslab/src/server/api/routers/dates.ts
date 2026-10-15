import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { SPECIAL_DATES } from "~/lib/special-dates";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

const isoDay = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .transform((day) => new Date(`${day}T00:00:00Z`));

const details = z.object({
  title: z.string().trim().min(1).max(120),
  day: isoDay,
  occasionId: z
    .enum(SPECIAL_DATES.map((d) => d.id) as [string, ...string[]])
    .nullable(),
  notes: z.string().trim().max(2000).nullable(),
});

const hearts = z.number().int().min(1).max(5).nullable();

export const datesRouter = createTRPCRouter({
  list: publicProcedure.query(({ ctx }) =>
    ctx.db.datePlan.findMany({
      orderBy: { day: "desc" },
      include: {
        stops: { orderBy: { order: "asc" }, include: { place: true } },
      },
    }),
  ),

  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) =>
      ctx.db.datePlan.findUnique({
        where: { id: input.id },
        include: {
          stops: { orderBy: { order: "asc" }, include: { place: true } },
        },
      }),
    ),

  /** Optionally starts the date at a place, e.g. "plan a date here" from the wishlist. */
  create: publicProcedure
    .input(details.extend({ placeId: z.string().optional() }))
    .mutation(({ ctx, input }) => {
      const { placeId, ...data } = input;
      return ctx.db.datePlan.create({
        data: {
          ...data,
          stops: placeId ? { create: { placeId, order: 0 } } : undefined,
        },
      });
    }),

  update: publicProcedure
    .input(details.extend({ id: z.string() }))
    .mutation(({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.datePlan.update({ where: { id }, data });
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) =>
      ctx.db.datePlan.delete({ where: { id: input.id } }),
    ),

  addStop: publicProcedure
    .input(z.object({ planId: z.string(), placeId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const last = await ctx.db.dateStop.findFirst({
        where: { planId: input.planId },
        orderBy: { order: "desc" },
      });
      return ctx.db.dateStop.create({
        data: { ...input, order: (last?.order ?? -1) + 1 },
      });
    }),

  updateStop: publicProcedure
    .input(
      z.object({
        id: z.string(),
        time: z
          .string()
          .regex(/^\d{2}:\d{2}$/)
          .nullable()
          .optional(),
        notes: z.string().trim().max(1000).nullable().optional(),
        ratingAlvin: hearts.optional(),
        ratingVivian: hearts.optional(),
      }),
    )
    .mutation(({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.dateStop.update({ where: { id }, data });
    }),

  /** Swaps a stop with its neighbour. */
  moveStop: publicProcedure
    .input(z.object({ id: z.string(), direction: z.enum(["up", "down"]) }))
    .mutation(async ({ ctx, input }) => {
      const stop = await ctx.db.dateStop.findUnique({
        where: { id: input.id },
      });
      if (!stop) throw new TRPCError({ code: "NOT_FOUND" });
      const neighbour = await ctx.db.dateStop.findFirst({
        where: {
          planId: stop.planId,
          order:
            input.direction === "up" ? { lt: stop.order } : { gt: stop.order },
        },
        orderBy: { order: input.direction === "up" ? "desc" : "asc" },
      });
      if (!neighbour) return;
      await ctx.db.$transaction([
        ctx.db.dateStop.update({
          where: { id: stop.id },
          data: { order: neighbour.order },
        }),
        ctx.db.dateStop.update({
          where: { id: neighbour.id },
          data: { order: stop.order },
        }),
      ]);
    }),

  removeStop: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) =>
      ctx.db.dateStop.delete({ where: { id: input.id } }),
    ),
});
