"use client";

import Link from "next/link";
import { useState } from "react";

import { card, link } from "~/app/_components/ui";
import { type DayKey, occurrencesInMonth } from "~/lib/special-dates";

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];

/** A date we've logged or planned, shown alongside the special dates. */
type Outing = { id: string; title: string; day: DayKey };

export function Calendar({
  today,
  outings,
}: {
  today: DayKey;
  outings: Outing[];
}) {
  const [view, setView] = useState({ year: today.year, month: today.month });

  const shiftMonth = (delta: number) =>
    setView(({ year, month }) => {
      const index = year * 12 + (month - 1) + delta;
      return { year: Math.floor(index / 12), month: (index % 12) + 1 };
    });

  const firstWeekday = new Date(
    Date.UTC(view.year, view.month - 1, 1),
  ).getUTCDay();
  const leadingBlanks = (firstWeekday + 6) % 7; // weeks start on Monday
  const daysInMonth = new Date(Date.UTC(view.year, view.month, 0)).getUTCDate();
  const specials = occurrencesInMonth(view.year, view.month, today);
  const monthOutings = outings
    .filter(({ day }) => day.year === view.year && day.month === view.month)
    .sort((a, b) => a.day.day - b.day.day);
  const monthName = new Intl.DateTimeFormat("en-AU", {
    timeZone: "UTC",
    month: "long",
    year: "numeric",
  }).format(new Date(Date.UTC(view.year, view.month - 1, 1)));

  return (
    <section className={card}>
      <div className="mb-2.5 flex items-center justify-between lg:mb-3">
        <button
          type="button"
          onClick={() => shiftMonth(-1)}
          className="font-display hover:bg-blush rounded-full px-2 text-[22px] font-bold lg:text-2xl"
          aria-label="Previous month"
        >
          ‹
        </button>
        <h2 className="font-display text-lg font-bold lg:text-xl">
          {monthName}
        </h2>
        <button
          type="button"
          onClick={() => shiftMonth(1)}
          className="font-display hover:bg-blush rounded-full px-2 text-[22px] font-bold lg:text-2xl"
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[13px] font-extrabold lg:gap-1.5 lg:text-sm">
        {WEEKDAYS.map((weekday, i) => (
          <p key={i} className="text-[11px] opacity-50">
            {weekday}
          </p>
        ))}
        {Array.from({ length: leadingBlanks }, (_, i) => (
          <span key={`blank-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const special = specials.find((s) => s.day === day);
          const outing = monthOutings.find((o) => o.day.day === day);
          const emoji = special?.emoji ?? (outing && "💌");
          const isToday =
            view.year === today.year &&
            view.month === today.month &&
            day === today.day;
          return (
            <div
              key={day}
              title={special?.title ?? outing?.title}
              className={`flex flex-col items-center justify-center rounded-[10px] lg:rounded-xl ${
                emoji ? "py-1 lg:py-[5px]" : "py-1.5 lg:py-2"
              } ${
                isToday
                  ? "bg-ink text-white"
                  : emoji
                    ? "border-ink bg-blush border-2"
                    : ""
              }`}
            >
              <span>{day}</span>
              {emoji && (
                <span className="text-[10px] leading-none lg:text-[11px]">
                  {emoji}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {specials.length + monthOutings.length > 0 && (
        <ul className="mt-3.5 flex flex-col gap-1.5 text-[13px] font-bold">
          {specials.map((special) => (
            <li key={special.id}>
              {special.emoji} {special.day} — {special.title}
              {special.age !== undefined && ` (turns ${special.age})`}
            </li>
          ))}
          {monthOutings.map((outing) => (
            <li key={outing.id}>
              💌 {outing.day.day} —{" "}
              <Link href={`/dates/${outing.id}`} className={link}>
                {outing.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
