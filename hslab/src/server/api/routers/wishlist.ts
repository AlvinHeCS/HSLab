import { z } from "zod";

import { Person } from "../../../../generated/prisma";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const wishlistRouter = createTRPCRouter({
  list: publicProcedure.query(({ ctx }) =>
    ctx.db.wishlistItem.findMany({
      orderBy: { createdAt: "desc" },
      include: { place: { include: { _count: { select: { stops: true } } } } },
    }),
  ),

  add: publicProcedure
    .input(
      z.object({
        placeId: z.string(),
        addedBy: z.nativeEnum(Person),
        reason: z.string().trim().max(500).optional(),
      }),
    )
    .mutation(({ ctx, input }) => {
      const { placeId, ...details } = input;
      return ctx.db.wishlistItem.upsert({
        where: { placeId },
        create: input,
        update: details,
      });
    }),

  remove: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) =>
      ctx.db.wishlistItem.delete({ where: { id: input.id } }),
    ),
});
