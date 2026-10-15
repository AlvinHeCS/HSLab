import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { searchSydney } from "~/server/lib/photon";

export const placeRouter = createTRPCRouter({
  search: publicProcedure
    .input(z.object({ query: z.string().trim().min(2).max(100) }))
    .query(({ input }) => searchSydney(input.query)),

  /** Saves a search result (or a name typed by hand) so dates and the wishlist can point at it. */
  save: publicProcedure
    .input(
      z.discriminatedUnion("source", [
        z.object({
          source: z.literal("osm"),
          sourceId: z.string().min(1),
          name: z.string().min(1),
          category: z.string().nullable(),
          address: z.string().nullable(),
          suburb: z.string().nullable(),
          lat: z.number(),
          lng: z.number(),
        }),
        z.object({
          source: z.literal("manual"),
          name: z.string().trim().min(1).max(200),
        }),
      ]),
    )
    .mutation(({ ctx, input }) => {
      if (input.source === "manual") {
        return ctx.db.place.create({
          data: {
            source: "manual",
            sourceId: crypto.randomUUID(),
            name: input.name,
          },
        });
      }
      const { source, sourceId, ...details } = input;
      return ctx.db.place.upsert({
        where: { source_sourceId: { source, sourceId } },
        create: input,
        update: details,
      });
    }),

  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) =>
      ctx.db.place.findUnique({
        where: { id: input.id },
        include: {
          wishlist: true,
          stops: {
            include: { plan: true },
            orderBy: { plan: { day: "desc" } },
          },
        },
      }),
    ),

  setWebsite: publicProcedure
    .input(
      z.object({
        id: z.string(),
        website: z.union([
          z
            .string()
            .url()
            .max(500)
            .refine((url) => /^https?:\/\//i.test(url), "Must be a web link"),
          z.literal(""),
        ]),
      }),
    )
    .mutation(({ ctx, input }) =>
      ctx.db.place.update({
        where: { id: input.id },
        data: { website: input.website || null },
      }),
    ),
});
