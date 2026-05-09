import Link from "next/link";

import { auth } from "~/server/auth";

export default async function Home() {
  const session = await auth();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] p-8 text-white">
      <div className="flex flex-col items-center gap-6 text-center">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
          HS<span className="text-[hsl(280,100%,70%)]">Lab</span>
        </h1>
        <p className="text-xl">HSC Math practice — drills, tests, battles.</p>
        {session?.user ? (
          <p>Signed in as {session.user.email}</p>
        ) : (
          <Link
            href="/api/auth/signin"
            className="rounded-full bg-white/10 px-8 py-3 font-semibold transition hover:bg-white/20"
          >
            Sign in
          </Link>
        )}
      </div>
    </main>
  );
}
