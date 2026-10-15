import Image from "next/image";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { button, card, input, pageTitle } from "~/app/_components/ui";
import bears from "~/app/icon.png";
import { env } from "~/env";
import { LOCK_COOKIE, lockToken, safeNextPath } from "~/server/site-lock";

const ONE_YEAR_SECONDS = 365 * 24 * 60 * 60;

async function unlock(formData: FormData) {
  "use server";
  const next = safeNextPath(formData.get("next"));

  if (formData.get("passphrase") !== env.SITE_PASSPHRASE) {
    redirect(`/unlock?wrong=1&next=${encodeURIComponent(next)}`);
  }

  (await cookies()).set(LOCK_COOKIE, await lockToken(env.SITE_PASSPHRASE), {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ONE_YEAR_SECONDS,
  });
  redirect(next);
}

export default async function UnlockPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; wrong?: string }>;
}) {
  const { next, wrong } = await searchParams;

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 px-5">
      <div className="flex flex-col items-center gap-3 text-center">
        <Image
          src={bears}
          alt=""
          width={96}
          height={96}
          className="border-ink bg-blush size-24 -rotate-6 rounded-[28px] border-[3px]"
          priority
        />
        <div>
          <h1 className={pageTitle}>Bubbyverse</h1>
          <p className="mt-1 text-sm font-bold opacity-70">
            Alvin &amp; Vivian
          </p>
        </div>
      </div>

      <form action={unlock} className={`${card} flex flex-col gap-3`}>
        <input type="hidden" name="next" value={safeNextPath(next)} />
        <label className="flex flex-col gap-1">
          <span className="font-display text-sm font-semibold">Passphrase</span>
          <input
            name="passphrase"
            type="password"
            autoComplete="current-password"
            required
            autoFocus
            className={input}
          />
        </label>
        {wrong && (
          <p className="text-sm font-bold text-red-700">
            Not quite, try again.
          </p>
        )}
        <button type="submit" className={button}>
          Let me in 💕
        </button>
      </form>
    </main>
  );
}
