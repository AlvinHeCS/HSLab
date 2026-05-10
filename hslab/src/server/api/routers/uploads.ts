import { randomUUID } from "node:crypto";

import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { adminProcedure, createTRPCRouter } from "~/server/api/trpc";
import {
  QUESTION_IMAGES_BUCKET,
  publicQuestionImageUrl,
  supabaseAdmin,
} from "~/server/supabase";

const ALLOWED_MIME = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
} as const;

type AllowedMime = keyof typeof ALLOWED_MIME;

export const uploadsRouter = createTRPCRouter({
  // Mints a short-lived signed upload URL for a single image. Client PUTs the
  // file bytes to `signedUrl`, then inserts a TipTap image node with `publicUrl`
  // as `src`. Bucket reads are public, so no signing is needed for rendering.
  createQuestionImageUploadUrl: adminProcedure
    .input(
      z.object({
        contentType: z.enum(
          Object.keys(ALLOWED_MIME) as [AllowedMime, ...AllowedMime[]],
        ),
        sizeBytes: z
          .number()
          .int()
          .positive()
          .max(10 * 1024 * 1024, "Image must be 10 MB or smaller."),
      }),
    )
    .mutation(async ({ input }) => {
      const ext = ALLOWED_MIME[input.contentType];
      const path = `${randomUUID()}.${ext}`;

      const { data, error } = await supabaseAdmin()
        .storage.from(QUESTION_IMAGES_BUCKET)
        .createSignedUploadUrl(path);

      if (error || !data) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to mint upload URL: ${error?.message ?? "unknown"}`,
        });
      }

      return {
        signedUrl: data.signedUrl,
        path,
        publicUrl: publicQuestionImageUrl(path),
        contentType: input.contentType,
      };
    }),
});
