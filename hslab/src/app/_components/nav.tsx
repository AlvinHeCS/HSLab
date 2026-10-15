"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import bears from "~/app/icon.png";
import { type DayKey, formatDayMonthYear } from "~/lib/special-dates";

const LINKS = [
  { href: "/", label: "🏠 Home" },
  { href: "/dates", label: "💌 Dates" },
  { href: "/wishlist", label: "⭐ Wishlist" },
];

function useIsActive() {
  const pathname = usePathname();
  return (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);
}

/** Desktop navigation, pinned to the left. */
export function Sidebar({ day, since }: { day: number; since: DayKey }) {
  const isActive = useIsActive();

  return (
    <aside className="border-ink sticky top-0 hidden h-screen flex-col gap-7 border-r-[3px] bg-white px-6 py-8 lg:flex">
      <Link href="/" className="flex items-center gap-3">
        <Image
          src={bears}
          alt=""
          width={56}
          height={56}
          className="border-ink bg-blush size-14 -rotate-6 rounded-[18px] border-[3px]"
          priority
        />
        <div>
          <p className="font-display text-[26px] leading-none font-bold">
            Bubbyverse
          </p>
          <p className="mt-[3px] text-xs font-bold opacity-65">
            Alvin &amp; Vivian
          </p>
        </div>
      </Link>

      <nav className="flex flex-col gap-1.5">
        {LINKS.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            aria-current={isActive(href) ? "page" : undefined}
            className={`font-display rounded-full px-[18px] py-3 text-base font-semibold ${
              isActive(href) ? "bg-ink text-cream" : "hover:bg-blush"
            }`}
          >
            {label}
          </Link>
        ))}
      </nav>

      <p className="border-ink bg-blush mt-auto rounded-[22px] border-[3px] p-4 text-[13px] leading-snug font-bold">
        Day{" "}
        <b className="font-display text-[22px] font-bold">
          {day.toLocaleString("en-AU")}
        </b>{" "}
        together
        <br />
        <span className="opacity-65">since {formatDayMonthYear(since)}</span>
      </p>
    </aside>
  );
}

/** Phone navigation, floating at the bottom of the screen. */
export function TabBar() {
  const isActive = useIsActive();

  return (
    <nav className="bg-ink fixed inset-x-4 bottom-[calc(18px+env(safe-area-inset-bottom))] z-10 mx-auto flex max-w-md gap-1.5 rounded-full p-2 shadow-[0_10px_24px_rgba(91,70,54,0.25)] lg:hidden">
      {LINKS.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          aria-current={isActive(href) ? "page" : undefined}
          className={`font-display flex-1 rounded-full py-2.5 text-center text-sm font-semibold ${
            isActive(href)
              ? "bg-cream text-ink"
              : "text-cream hover:bg-white/10"
          }`}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
