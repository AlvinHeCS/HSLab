"use client";

import Link from "next/link";
import { useState } from "react";

import { blushPill, card, cardTitle, link } from "~/app/_components/ui";
import { formatDaysUntil } from "~/lib/special-dates";

export type ComingUpItem = {
  key: string;
  emoji: string;
  title: string;
  /** Muted text after the title, e.g. "(turns 20)". */
  aside?: string;
  href?: string;
  /** Second line; outings show a shorter version on phones. */
  detail: string;
  phoneDetail?: string;
  daysUntil: number;
};

/** Shows the first 3 (phone) or 4 (desktop) items, with "All N →" to show the rest. */
export function ComingUp({ items }: { items: ComingUpItem[] }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <section className={`${card} lg:flex-1`}>
      <div className="mb-2.5 flex items-center justify-between lg:mb-3">
        <h2 className={cardTitle}>Coming up</h2>
        {items.length > 3 && (
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            className={`text-xs font-extrabold opacity-60 hover:opacity-100 ${
              items.length <= 4 ? "lg:hidden" : ""
            }`}
          >
            {expanded ? "Fewer ↑" : `All ${items.length} →`}
          </button>
        )}
      </div>
      <ul className="flex flex-col gap-2.5 lg:gap-3">
        {items.map((item, i) => (
          <li
            key={item.key}
            className={`items-center gap-3 lg:gap-3.5 ${
              expanded || i < 3 ? "flex" : i === 3 ? "hidden lg:flex" : "hidden"
            }`}
          >
            <span className="text-[22px] lg:text-2xl">{item.emoji}</span>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-extrabold lg:text-base">
                {item.href ? (
                  <Link href={item.href} className={link}>
                    {item.title}
                  </Link>
                ) : (
                  item.title
                )}
                {item.aside && (
                  <span className="font-semibold opacity-60">
                    {" "}
                    {item.aside}
                  </span>
                )}
              </p>
              <p className="text-xs font-bold opacity-65">
                {item.phoneDetail ? (
                  <>
                    <span className="lg:hidden">{item.phoneDetail}</span>
                    <span className="hidden lg:inline">{item.detail}</span>
                  </>
                ) : (
                  item.detail
                )}
              </p>
            </div>
            <span className={blushPill}>{formatDaysUntil(item.daysUntil)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
