import { notFound } from "next/navigation";

import { DateHeader } from "~/app/dates/_components/date-header";
import { StopList } from "~/app/dates/_components/stop-list";
import { card } from "~/app/_components/ui";
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
    <main className="mx-auto flex max-w-md flex-col gap-5 px-4 py-6">
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
              <p className="text-xs font-semibold tracking-wide uppercase opacity-60">
                {occasion ? `${occasion.emoji} ${occasion.title}` : "💌 Date"}
              </p>
              <h1 className="mt-1 text-2xl font-extrabold">{plan.title}</h1>
              <p className="opacity-80">
                {formatDay(day)}
                {until >= 0 && ` · ${formatDaysUntil(until)}`}
              </p>
              {plan.notes && (
                <p className="mt-2 whitespace-pre-wrap">{plan.notes}</p>
              )}
            </>
          }
        />
      </section>

      <section className={card}>
        <h2 className="mb-3 text-lg font-bold">The plan</h2>
        <StopList planId={plan.id} stops={plan.stops} canRate={until <= 0} />
      </section>
    </main>
  );
}
