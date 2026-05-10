import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { env } from "~/env";

export const QUESTION_IMAGES_BUCKET = "question-images";

let cached: SupabaseClient | null = null;

export function supabaseAdmin(): SupabaseClient {
  if (cached) return cached;
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "Supabase env not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (Vercel→Supabase integration provides these in deployed envs).",
    );
  }
  cached = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}

export function publicQuestionImageUrl(path: string): string {
  const base = env.SUPABASE_URL ?? env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) throw new Error("SUPABASE_URL not configured");
  return `${base}/storage/v1/object/public/${QUESTION_IMAGES_BUCKET}/${path}`;
}
