import Link from "next/link";

import {
  blushPill,
  button,
  card,
  cardTitle,
  emojiTile,
  page,
  pageTitle,
} from "~/app/_components/ui";
import {
  dayKeyOf,
  daysUntil,
  formatDay,
  formatDaysUntil,
  SPECIAL_DATES,
  todayIn,
} from "~/lib/special-dates";
import type { RouterOutputs } from "~/trpc/react";
import { api } from "~/trpc/server";

export const dynamic = "force-dynamic";

type Plan = RouterOutputs["dates"]["list"][number];

export default async function DatesPage() {
  const today = todayIn();
  const plans = (await api.dates.list()).map((plan) => ({
    ...plan,
    daysUntil: daysUntil(dayKeyOf(plan.day), today),
  }));
  // The list comes newest first; upcoming dates read better soonest first.
  const upcoming = plans.filter((p) => p.daysUntil >= 0).reverse();
  const past = plans.filter((p) => p.daysUntil < 0);

  return (
    <main className={page}>
      <header className="flex items-center justify-between">
        <h1 className={pageTitle}>Our dates</h1>
        <Link href="/dates/new" className={button}>
          + Log a date
        </Link>
      </header>

      {plans.length === 0 && (
        <p className={`${card} font-bold`}>
          No dates yet. Log your first one! 💕
        </p>
      )}

      {upcoming.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className={cardTitle}>Coming up</h2>
          {upcoming.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              aside={formatDaysUntil(plan.daysUntil)}
            />
          ))}
        </section>
      )}

      {past.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className={cardTitle}>Memories</h2>
          {past.map((plan) => (
            <PlanCard key={plan.id} plan={plan} aside={averageHearts(plan)} />
          ))}
        </section>
      )}
    </main>
  );
}

function PlanCard({ plan, aside }: { plan: Plan; aside: string | null }) {
  const occasion = SPECIAL_DATES.find((d) => d.id === plan.occasionId);
  return (
    <Link
      href={`/dates/${plan.id}`}
      className={`${card} flex items-center gap-3.5 lg:gap-4`}
    >
      <span className={emojiTile}>{occasion?.emoji ?? "💌"}</span>
      <div className="min-w-0 flex-1">
        <p className="font-display text-lg leading-tight font-bold">
          {plan.title}
        </p>
        <p className="text-[13px] font-bold opacity-70">
          {formatDay(dayKeyOf(plan.day))}
        </p>
        {plan.stops.length > 0 && (
          <p className="mt-0.5 text-xs font-bold opacity-65">
            {plan.stops.map((s) => s.place.name).join(" → ")}
          </p>
        )}
      </div>
      {aside && <span className={blushPill}>{aside}</span>}
    </Link>
  );
}

function averageHearts(plan: Plan): string | null {
  const ratings = plan.stops
    .flatMap((s) => [s.ratingAlvin, s.ratingVivian])
    .filter((r) => r !== null);
  if (ratings.length === 0) return null;
  const average = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
  return `❤️ ${average.toFixed(1)}`;
}
