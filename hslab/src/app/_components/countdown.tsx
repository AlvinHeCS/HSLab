"use client";

import { useEffect, useState } from "react";

const UNITS = [
  ["days", 86_400_000],
  ["hours", 3_600_000],
  ["mins", 60_000],
  ["secs", 1_000],
] as const;

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
    <div className="grid grid-cols-4 gap-2">
      {UNITS.map(([label, ms]) => {
        const value = Math.floor(remaining / ms);
        remaining -= value * ms;
        return (
          <div key={label} className="rounded-2xl bg-[#f9e2e1] py-3">
            <p className="text-3xl font-bold tabular-nums">{value}</p>
            <p className="text-xs tracking-wide uppercase opacity-70">
              {label}
            </p>
          </div>
        );
      })}
    </div>
  );
}
