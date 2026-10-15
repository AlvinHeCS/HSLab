import Link from "next/link";

import { card, quietButton } from "~/app/_components/ui";
import {
  WishlistAdd,
  WishlistRemove,
} from "~/app/wishlist/_components/wishlist-add";
import { PERSON_NAME } from "~/lib/people";
import { api } from "~/trpc/server";

export const dynamic = "force-dynamic";

export default async function WishlistPage() {
  const items = await api.wishlist.list();

  return (
    <main className="mx-auto flex max-w-md flex-col gap-5 px-4 py-6">
      <h1 className="text-3xl font-extrabold tracking-tight">Wishlist</h1>

      <section className={card}>
        <WishlistAdd />
      </section>

      {items.length === 0 && (
        <p className="text-center opacity-70">
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
                  className="font-semibold underline decoration-dotted"
                >
                  {item.place.name}
                </Link>
                {item.place._count.stops > 0 && (
                  <span className="ml-2 rounded-full bg-[#f9e2e1] px-2 py-0.5 text-xs font-semibold">
                    ✓ Been
                  </span>
                )}
                <p className="text-xs opacity-70">
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
            <p className="mt-2 text-sm">
              <span className="font-semibold">{PERSON_NAME[item.addedBy]}</span>{" "}
              wants to go{item.reason ? `: ${item.reason}` : ""}
            </p>
            <Link
              href={`/dates/new?place=${item.place.id}`}
              className={`${quietButton} mt-2 inline-block bg-[#f9e2e1]`}
            >
              💌 Plan a date here
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
