import Image from "next/image";

import { Calendar } from "~/app/_components/calendar";
import { Celebration, Confetti } from "~/app/_components/celebration";
import { ComingUp, type ComingUpItem } from "~/app/_components/coming-up";
import { Countdown } from "~/app/_components/countdown";
import { card, darkCard, emojiTile, eyebrow, pill } from "~/app/_components/ui";
import bears from "~/app/icon.png";
import {
  type DayKey,
  dayKeyOf,
  daysTogether,
  daysUntil,
  formatDay,
  formatDayMonthYear,
  formatShortDay,
  startOfDayIn,
  todayIn,
  upcoming,
} from "~/lib/special-dates";
import { api } from "~/trpc/server";

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
  const plans = (await api.dates.list()).map((plan) => {
    const day = dayKeyOf(plan.day);
    return { ...plan, day, daysUntil: daysUntil(day, today) };
  });

  const comingUp: ComingUpItem[] = [
    // The next occasion and the anniversary already have their own cards.
    ...dates
      .filter((d) => d.id !== next.id && d.id !== anniversary.id)
      .map((d) => ({
        key: d.id,
        emoji: d.emoji,
        title: d.title,
        aside: d.age === undefined ? undefined : `(turns ${d.age})`,
        detail: formatDay(d.date),
        daysUntil: d.daysUntil,
      })),
    ...plans
      .filter((plan) => plan.daysUntil >= 0)
      .map((plan) => {
        const when = formatShortDay(plan.day);
        const stops = plan.stops.length;
        return {
          key: plan.id,
          emoji: "💌",
          title: plan.title,
          href: `/dates/${plan.id}`,
          detail:
            stops > 0
              ? `${when} · ${plan.stops.map((s) => s.place.name).join(" → ")}`
              : when,
          phoneDetail:
            stops > 0
              ? `${when} · ${stops} stop${stops === 1 ? "" : "s"}`
              : when,
          daysUntil: plan.daysUntil,
        };
      }),
  ].sort((a, b) => a.daysUntil - b.daysUntil);

  return (
    <main className="mx-auto flex max-w-md flex-col gap-[18px] px-5 pt-14 pb-[120px] lg:grid lg:max-w-none lg:grid-cols-[1.2fr_0.9fr] lg:gap-6 lg:px-10 lg:py-9">
      {celebrating.length > 0 && <Confetti />}

      <header className="flex items-center gap-3.5 lg:hidden">
        <Image
          src={bears}
          alt=""
          width={64}
          height={64}
          className="border-ink bg-blush size-16 -rotate-6 rounded-[20px] border-[3px]"
          priority
        />
        <div>
          <h1 className="font-display text-[30px] leading-none font-bold tracking-[-0.5px]">
            Bubbyverse
          </h1>
          <p className="text-sm font-bold opacity-70">
            Alvin &amp; Vivian · day{" "}
            {daysTogether(today).toLocaleString("en-AU")} together
          </p>
        </div>
      </header>

      {celebrating.map((occasion) => (
        <Celebration key={occasion.id} occasion={occasion} />
      ))}

      <section
        className={`${darkCard} lg:col-span-2 lg:flex lg:items-end lg:justify-between`}
      >
        <div>
          <h2 className="font-display text-xs font-semibold tracking-[1.6px] uppercase opacity-80 lg:text-[13px] lg:tracking-[1.8px]">
            Countdown to our anniversary
            <span className="hidden lg:inline">
              {" "}
              · {formatDayMonthYear(anniversary.date)}
            </span>
          </h2>
          {anniversary.daysUntil === 0 ? (
            <p className="font-display mt-3 text-5xl font-bold lg:text-7xl">
              It&apos;s today! 💞
            </p>
          ) : (
            <Countdown
              target={startOfDayIn(anniversary.date)}
              serverNow={Date.now()}
            />
          )}
          <p className="mt-3 text-[13px] font-bold opacity-85 lg:hidden">
            💞 {formatDay(anniversary.date)}
          </p>
        </div>
        <Image
          src={bears}
          alt=""
          width={170}
          height={170}
          className="border-cream bg-blush absolute -right-[18px] -bottom-[26px] size-[120px] rotate-[10deg] rounded-[30px] border-[3px] lg:static lg:-mr-2.5 lg:-mb-10 lg:size-[170px] lg:rotate-[8deg] lg:rounded-[40px] lg:border-4"
        />
      </section>

      <div className="flex flex-col gap-[18px] lg:gap-5">
        <section className={`${card} flex items-center gap-3.5 lg:gap-4`}>
          <div className={emojiTile}>{next.emoji}</div>
          <div className="flex-1">
            <p className={eyebrow}>Next up</p>
            <p className="font-display text-xl leading-[1.1] font-bold lg:text-[22px]">
              {next.title}
              {next.age !== undefined && ` (turns ${next.age})`}
            </p>
            <p className="text-[13px] font-bold opacity-70">
              {formatDay(next.date)}
            </p>
          </div>
          <span className={pill}>
            {next.daysUntil === 1 ? "tomorrow" : `${next.daysUntil} days`}
          </span>
        </section>

        <ComingUp items={comingUp} />
      </div>

      <Calendar
        today={today}
        outings={plans.map(({ id, title, day }) => ({ id, title, day }))}
      />
    </main>
  );
}

/** Dev-only `?today=YYYY-MM-DD` override, for previewing a celebration day. */
function previewDay(value: string | undefined): DayKey | undefined {
  if (process.env.NODE_ENV !== "development" || !value) return undefined;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return undefined;
  return { year, month, day };
}
