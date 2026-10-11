import Image from "next/image";

import { Calendar } from "~/app/_components/calendar";
import { Celebration, Confetti } from "~/app/_components/celebration";
import { Countdown } from "~/app/_components/countdown";
import bears from "~/app/icon.png";
import {
  type DayKey,
  formatDay,
  formatDaysUntil,
  type Occurrence,
  startOfDayIn,
  todayIn,
  upcoming,
} from "~/lib/special-dates";

// "Today" changes daily, so never serve a page prerendered at build time.
export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ today?: string }>;
}) {
  const today = previewDay((await searchParams).today) ?? todayIn();
  const dates = upcoming(today);
  const celebrating = dates.filter((d) => d.daysUntil === 0);
  const next = dates.find((d) => d.daysUntil > 0)!;
  const anniversary = dates.find((d) => d.id === "anniversary")!;

  return (
    <main className="min-h-screen bg-[#f9e2e1] px-4 py-10 text-[#5b4636]">
      {celebrating.length > 0 && <Confetti />}
      <div className="mx-auto flex max-w-md flex-col gap-5">
        <header className="flex flex-col items-center gap-2 text-center">
          <Image
            src={bears}
            alt=""
            width={120}
            height={120}
            className="rounded-3xl"
            priority
          />
          <h1 className="text-4xl font-extrabold tracking-tight">Bubbyverse</h1>
          <p className="opacity-80">Alvin &amp; Vivian</p>
        </header>

        {celebrating.map((occasion) => (
          <Celebration key={occasion.id} occasion={occasion} />
        ))}

        <section className="rounded-3xl bg-white/80 p-5 shadow-sm">
          <p className="text-xs font-semibold tracking-wide uppercase opacity-60">
            Next special date
          </p>
          <p className="mt-1 text-xl font-bold">
            {next.emoji} {next.title}
            {next.age !== undefined && ` (turns ${next.age})`}
          </p>
          <p className="opacity-80">
            {formatDaysUntil(next.daysUntil)} · {formatDay(next.date)}
          </p>
        </section>

        <section className="rounded-3xl bg-white/80 p-5 text-center shadow-sm">
          <h2 className="mb-3 text-lg font-bold">
            💞 Countdown to our anniversary
          </h2>
          {anniversary.daysUntil === 0 ? (
            <p className="text-2xl font-bold">It&apos;s today! 💞</p>
          ) : (
            <Countdown
              target={startOfDayIn(anniversary.date)}
              serverNow={Date.now()}
            />
          )}
          <p className="mt-3 text-sm opacity-70">
            {formatDay(anniversary.date)}
          </p>
        </section>

        <ComingUp dates={dates} />

        <Calendar today={today} />
      </div>
    </main>
  );
}

function ComingUp({ dates }: { dates: Occurrence[] }) {
  return (
    <section className="rounded-3xl bg-white/80 p-5 shadow-sm">
      <h2 className="mb-3 text-lg font-bold">Coming up</h2>
      <ul className="divide-y divide-[#f9e2e1]">
        {dates.map((d) => (
          <li key={d.id} className="flex items-center gap-3 py-2">
            <span className="text-2xl">{d.emoji}</span>
            <div className="flex-1">
              <p className="font-semibold">
                {d.title}
                {d.age !== undefined && ` (turns ${d.age})`}
              </p>
              <p className="text-sm opacity-70">{formatDay(d.date)}</p>
            </div>
            <span className="text-sm font-semibold whitespace-nowrap">
              {formatDaysUntil(d.daysUntil)}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Dev-only `?today=YYYY-MM-DD` override, for previewing a celebration day. */
function previewDay(value: string | undefined): DayKey | undefined {
  if (process.env.NODE_ENV !== "development" || !value) return undefined;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return undefined;
  return { year, month, day };
}
