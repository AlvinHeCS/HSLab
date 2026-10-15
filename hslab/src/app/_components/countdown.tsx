"use client";

import { useEffect, useState } from "react";

const UNITS = [
  { ms: 86_400_000, short: "days", long: "days" },
  { ms: 3_600_000, short: "hrs", long: "hours" },
  { ms: 60_000, short: "min", long: "minutes" },
  // Seconds only fit beside the others on the wide desktop hero.
  { ms: 1_000, short: "sec", long: "seconds", desktopOnly: true },
];

/** Ticks down to `target`. Starts from the server's clock so hydration matches. */
export function Countdown({
  target,
  serverNow,
}: {
  target: number;
  serverNow: number;
}) {
  const [now, setNow] = useState(serverNow);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  let remaining = Math.max(0, target - now);

  return (
    <div className="mt-3 flex items-end gap-3 lg:mt-3.5 lg:gap-7">
      {UNITS.map(({ ms, short, long, desktopOnly }, i) => {
        const value = Math.floor(remaining / ms);
        remaining -= value * ms;
        return (
          <div key={long} className={desktopOnly ? "hidden lg:block" : ""}>
            <p className="font-display text-[56px] leading-none font-bold tabular-nums lg:text-[88px]">
              {i === 0 ? value : String(value).padStart(2, "0")}
            </p>
            <p className="mt-1 text-xs font-bold opacity-80 lg:mt-0 lg:text-sm">
              <span className="lg:hidden">{short}</span>
              <span className="hidden lg:inline">{long}</span>
            </p>
          </div>
        );
      })}
    </div>
  );
}
