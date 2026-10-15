import Image from "next/image";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { button, card, input } from "~/app/_components/ui";
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
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-5 px-4">
      <div className="flex flex-col items-center gap-2 text-center">
        <Image
          src={bears}
          alt=""
          width={96}
          height={96}
          className="rounded-3xl"
          priority
        />
        <h1 className="text-3xl font-extrabold tracking-tight">Bubbyverse</h1>
      </div>

      <form action={unlock} className={`${card} flex flex-col gap-3`}>
        <input type="hidden" name="next" value={safeNextPath(next)} />
        <label className="flex flex-col gap-1">
          <span className="text-sm font-semibold">Passphrase</span>
          <input
            name="passphrase"
            type="password"
            autoComplete="current-password"
            required
            autoFocus
            className={input}
          />
        </label>
        {wrong && <p className="text-sm text-red-700">Not quite, try again.</p>}
        <button type="submit" className={button}>
          Let me in 💕
        </button>
      </form>
    </main>
  );
}
