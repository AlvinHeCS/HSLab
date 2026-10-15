import { notFound } from "next/navigation";

import { DateHeader } from "~/app/(site)/dates/_components/date-header";
import { StopList } from "~/app/(site)/dates/_components/stop-list";
import { card, cardTitle, eyebrow, page } from "~/app/_components/ui";
import {
  dayKeyOf,
  daysUntil,
  formatDay,
  formatDaysUntil,
  isoDay,
  SPECIAL_DATES,
  todayIn,
} from "~/lib/special-dates";
import { api } from "~/trpc/server";

export const dynamic = "force-dynamic";

export default async function DatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const plan = await api.dates.byId({ id: (await params).id });
  if (!plan) notFound();

  const day = dayKeyOf(plan.day);
  const until = daysUntil(day, todayIn());
  const occasion = SPECIAL_DATES.find((d) => d.id === plan.occasionId);

  return (
    <main className={page}>
      <section className={card}>
        <DateHeader
          id={plan.id}
          values={{
            title: plan.title,
            day: isoDay(day),
            occasionId: plan.occasionId,
            notes: plan.notes,
          }}
          heading={
            <>
              <p className={eyebrow}>
                {occasion ? `${occasion.emoji} ${occasion.title}` : "💌 Date"}
              </p>
              <h1 className="font-display mt-0.5 text-[26px] leading-tight font-bold">
                {plan.title}
              </h1>
              <p className="text-sm font-bold opacity-70">
                {formatDay(day)}
                {until >= 0 && ` · ${formatDaysUntil(until)}`}
              </p>
              {plan.notes && (
                <p className="mt-2 font-semibold whitespace-pre-wrap">
                  {plan.notes}
                </p>
              )}
            </>
          }
        />
      </section>

      <section className={card}>
        <h2 className={`${cardTitle} mb-3`}>The plan</h2>
        <StopList planId={plan.id} stops={plan.stops} canRate={until <= 0} />
      </section>
    </main>
  );
}
