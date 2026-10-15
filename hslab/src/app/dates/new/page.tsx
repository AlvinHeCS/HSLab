import { NewDate } from "~/app/dates/_components/new-date";
import { card } from "~/app/_components/ui";
import { isoDay, todayIn } from "~/lib/special-dates";
import { api } from "~/trpc/server";

export const dynamic = "force-dynamic";

export default async function NewDatePage({
  searchParams,
}: {
  searchParams: Promise<{ place?: string }>;
}) {
  const placeId = (await searchParams).place;
  const place = placeId ? await api.place.byId({ id: placeId }) : null;

  return (
    <main className="mx-auto flex max-w-md flex-col gap-5 px-4 py-6">
      <h1 className="text-3xl font-extrabold tracking-tight">Log a date</h1>
      <section className={`${card} flex flex-col gap-3`}>
        <NewDate
          today={isoDay(todayIn())}
          place={place && { id: place.id, name: place.name }}
        />
      </section>
    </main>
  );
}
