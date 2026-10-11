/**
 * Recurring dates the site counts down to and celebrates. Dates are plain calendar days;
 * "today" is read in TIME_ZONE so everything flips over at local midnight.
 */
export const TIME_ZONE = "Australia/Sydney";

export type DayKey = { year: number; month: number; day: number };

type SpecialDate = {
  id: string;
  title: string;
  emoji: string;
  month: number;
  day: number;
  celebration: string;
  /** Birthdays only, so the site can say how old someone is turning. */
  birthYear?: number;
};

export const SPECIAL_DATES: SpecialDate[] = [
  {
    id: "anniversary",
    title: "Our anniversary",
    emoji: "💞",
    month: 6,
    day: 19,
    celebration: "Happy anniversary!",
  },
  {
    id: "half-anniversary",
    title: "Our half-anniversary",
    emoji: "💕",
    month: 12,
    day: 19,
    celebration: "Happy half-anniversary!",
  },
  {
    id: "alvin-birthday",
    title: "Alvin's birthday",
    emoji: "🎂",
    month: 9,
    day: 19,
    birthYear: 2004,
    celebration: "Happy birthday, Alvin!",
  },
  {
    id: "vivian-birthday",
    title: "Vivian's birthday",
    emoji: "🎂",
    month: 1,
    day: 10,
    birthYear: 2007,
    celebration: "Happy birthday, Vivian!",
  },
  {
    id: "valentines-day",
    title: "Valentine's Day",
    emoji: "💝",
    month: 2,
    day: 14,
    celebration: "Happy Valentine's Day!",
  },
  {
    id: "girlfriend-day",
    title: "National Girlfriend Day",
    emoji: "🌸",
    month: 8,
    day: 1,
    celebration: "Happy Girlfriend Day, Vivian!",
  },
  {
    id: "boyfriend-day",
    title: "National Boyfriend Day",
    emoji: "🧸",
    month: 10,
    day: 3,
    celebration: "Happy Boyfriend Day, Alvin!",
  },
];

export type Occurrence = SpecialDate & {
  date: DayKey;
  daysUntil: number;
  /** Birthdays only: the age being turned on `date`. */
  age?: number;
};

const DAY_MS = 86_400_000;

const toUtc = (date: DayKey) => Date.UTC(date.year, date.month - 1, date.day);

export function todayIn(timeZone = TIME_ZONE, now = new Date()): DayKey {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(now);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === type)?.value);
  return { year: part("year"), month: part("month"), day: part("day") };
}

/** The instant `date` begins (local midnight) in `timeZone`. */
export function startOfDayIn(date: DayKey, timeZone = TIME_ZONE): number {
  const utcMidnight = toUtc(date);
  let instant = utcMidnight;
  // Second pass settles days where the UTC offset changes (daylight saving).
  for (let pass = 0; pass < 2; pass++) {
    instant = utcMidnight - utcOffsetAt(instant, timeZone);
  }
  return instant;
}

function utcOffsetAt(instant: number, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  }).formatToParts(new Date(instant));
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === type)?.value);
  const wallClock = Date.UTC(
    part("year"),
    part("month") - 1,
    part("day"),
    part("hour"),
    part("minute"),
    part("second"),
  );
  return wallClock - (instant - (instant % 1000));
}

function occurrence(
  special: SpecialDate,
  year: number,
  today: DayKey,
): Occurrence {
  const date = { year, month: special.month, day: special.day };
  return {
    ...special,
    date,
    daysUntil: Math.round((toUtc(date) - toUtc(today)) / DAY_MS),
    age: special.birthYear === undefined ? undefined : year - special.birthYear,
  };
}

/** Each special date's next occurrence (today counts), soonest first. */
export function upcoming(today: DayKey): Occurrence[] {
  return SPECIAL_DATES.map((special) => {
    const passed =
      special.month < today.month ||
      (special.month === today.month && special.day < today.day);
    return occurrence(special, passed ? today.year + 1 : today.year, today);
  }).sort((a, b) => a.daysUntil - b.daysUntil);
}

export function occurrencesInMonth(
  year: number,
  month: number,
  today: DayKey,
): Occurrence[] {
  return SPECIAL_DATES.filter((special) => special.month === month)
    .map((special) => occurrence(special, year, today))
    .sort((a, b) => a.day - b.day);
}

export function formatDay(date: DayKey): string {
  return new Intl.DateTimeFormat("en-AU", {
    timeZone: "UTC",
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(toUtc(date)));
}

export function formatDaysUntil(days: number): string {
  if (days === 0) return "today";
  if (days === 1) return "tomorrow";
  return `in ${days} days`;
}
