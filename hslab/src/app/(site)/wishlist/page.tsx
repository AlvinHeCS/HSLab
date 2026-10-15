import Link from "next/link";

import { card, chip, link, page, pageTitle } from "~/app/_components/ui";
import {
  WishlistAdd,
  WishlistRemove,
} from "~/app/(site)/wishlist/_components/wishlist-add";
import { PERSON_NAME } from "~/lib/people";
import { api } from "~/trpc/server";

export const dynamic = "force-dynamic";

export default async function WishlistPage() {
  const items = await api.wishlist.list();

  return (
    <main className={page}>
      <h1 className={pageTitle}>Wishlist</h1>

      <section className={card}>
        <WishlistAdd />
      </section>

      {items.length === 0 && (
        <p className="text-center font-bold opacity-70">
          Nothing here yet. Add a place you want to try together.
        </p>
      )}

      <ul className="flex flex-col gap-3">
        {items.map((item) => (
          <li key={item.id} className={card}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <Link
                  href={`/places/${item.place.id}`}
                  className={`font-display text-lg font-bold ${link}`}
                >
                  {item.place.name}
                </Link>
                {item.place._count.stops > 0 && (
                  <span className="bg-blush font-display ml-2 rounded-full px-2 py-0.5 text-xs font-bold">
                    ✓ Been
                  </span>
                )}
                <p className="text-xs font-bold opacity-65">
                  {[item.place.category, item.place.suburb]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
              <WishlistRemove
                id={item.id}
                label="✕"
                ariaLabel={`Remove ${item.place.name} from wishlist`}
              />
            </div>
            <p className="mt-2 text-sm font-semibold">
              <span className="font-extrabold">
                {PERSON_NAME[item.addedBy]}
              </span>{" "}
              wants to go{item.reason ? `: ${item.reason}` : ""}
            </p>
            <Link
              href={`/dates/new?place=${item.place.id}`}
              className={`${chip} mt-3`}
            >
              💌 Plan a date here
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
