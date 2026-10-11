"use client";

import { useState } from "react";

import { type DayKey, occurrencesInMonth } from "~/lib/special-dates";

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];

export function Calendar({ today }: { today: DayKey }) {
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
  const monthName = new Intl.DateTimeFormat("en-AU", {
    timeZone: "UTC",
    month: "long",
    year: "numeric",
  }).format(new Date(Date.UTC(view.year, view.month - 1, 1)));

  return (
    <section className="rounded-3xl bg-white/80 p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => shiftMonth(-1)}
          className="rounded-full px-3 py-1 text-xl hover:bg-[#f9e2e1]"
          aria-label="Previous month"
        >
          ‹
        </button>
        <h2 className="text-lg font-bold">{monthName}</h2>
        <button
          type="button"
          onClick={() => shiftMonth(1)}
          className="rounded-full px-3 py-1 text-xl hover:bg-[#f9e2e1]"
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-sm">
        {WEEKDAYS.map((weekday, i) => (
          <p key={i} className="pb-1 text-xs font-semibold opacity-60">
            {weekday}
          </p>
        ))}
        {Array.from({ length: leadingBlanks }, (_, i) => (
          <span key={`blank-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const special = specials.find((s) => s.day === day);
          const isToday =
            view.year === today.year &&
            view.month === today.month &&
            day === today.day;
          return (
            <div
              key={day}
              title={special?.title}
              className={`flex aspect-square flex-col items-center justify-center rounded-xl ${
                special ? "bg-[#f9e2e1] font-bold" : ""
              } ${isToday ? "ring-2 ring-[#5b4636]" : ""}`}
            >
              <span>{day}</span>
              {special && <span className="text-xs">{special.emoji}</span>}
            </div>
          );
        })}
      </div>

      {specials.length > 0 && (
        <ul className="mt-4 space-y-1 text-sm">
          {specials.map((special) => (
            <li key={special.id}>
              {special.emoji} {special.day} —{" "}
              <span className="font-semibold">{special.title}</span>
              {special.age !== undefined && ` (turns ${special.age})`}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
