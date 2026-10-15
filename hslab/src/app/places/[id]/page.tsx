import Link from "next/link";
import { notFound } from "next/navigation";

import { card, quietButton } from "~/app/_components/ui";
import {
  PlaceWishlist,
  WebsiteForm,
} from "~/app/places/_components/place-actions";
import { PERSON_NAME } from "~/lib/people";
import { dayKeyOf, formatDay } from "~/lib/special-dates";
import { api } from "~/trpc/server";

export const dynamic = "force-dynamic";

export default async function PlacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const place = await api.place.byId({ id: (await params).id });
  if (!place) notFound();

  const where = [place.address, place.suburb].filter(Boolean).join(", ");
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    [place.name, where, "NSW"].filter(Boolean).join(", "),
  )}`;

  return (
    <main className="mx-auto flex max-w-md flex-col gap-5 px-4 py-6">
      <section className={`${card} flex flex-col gap-3`}>
        <div>
          {place.category && (
            <p className="text-xs font-semibold tracking-wide uppercase opacity-60">
              {place.category}
            </p>
          )}
          <h1 className="text-2xl font-extrabold">{place.name}</h1>
          {where && <p className="opacity-80">{where}</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={mapsUrl}
            target="_blank"
            rel="noreferrer"
            className={`${quietButton} bg-[#f9e2e1]`}
          >
            📍 Open in Google Maps ↗
          </a>
          {place.website && (
            <a
              href={place.website}
              target="_blank"
              rel="noreferrer"
              className={`${quietButton} bg-[#f9e2e1]`}
            >
              🔗 Website / book ↗
            </a>
          )}
          <Link
            href={`/dates/new?place=${place.id}`}
            className={`${quietButton} bg-[#f9e2e1]`}
          >
            💌 Plan a date here
          </Link>
        </div>
        <WebsiteForm placeId={place.id} website={place.website} />
        {place.wishlist && (
          <p className="text-sm">
            ⭐{" "}
            <span className="font-semibold">
              {PERSON_NAME[place.wishlist.addedBy]}
            </span>{" "}
            wants to go
            {place.wishlist.reason ? `: ${place.wishlist.reason}` : ""}
          </p>
        )}
        <div>
          <PlaceWishlist
            placeId={place.id}
            placeName={place.name}
            wishlistId={place.wishlist?.id ?? null}
          />
        </div>
      </section>

      <section className={card}>
        <h2 className="mb-3 text-lg font-bold">Our visits</h2>
        {place.stops.length === 0 ? (
          <p className="text-sm opacity-70">We haven&apos;t been here yet.</p>
        ) : (
          <ul className="divide-y divide-[#f9e2e1]">
            {place.stops.map((stop) => (
              <li key={stop.id} className="py-2">
                <Link
                  href={`/dates/${stop.plan.id}`}
                  className="font-semibold underline decoration-dotted"
                >
                  {stop.plan.title}
                </Link>
                <p className="text-sm opacity-70">
                  {formatDay(dayKeyOf(stop.plan.day))}
                </p>
                <p className="text-sm">
                  Alvin {heartsText(stop.ratingAlvin)} · Vivian{" "}
                  {heartsText(stop.ratingVivian)}
                </p>
                {stop.notes && <p className="text-sm">{stop.notes}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>

      {place.source === "osm" && (
        <p className="text-center text-xs opacity-60">
          Place data ©{" "}
          <a
            href="https://www.openstreetmap.org/copyright"
            className="underline"
          >
            OpenStreetMap contributors
          </a>
        </p>
      )}
    </main>
  );
}

function heartsText(rating: number | null): string {
  return rating === null ? "–" : "❤️".repeat(rating);
}
