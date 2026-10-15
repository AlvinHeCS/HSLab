/**
 * Sticker Book styles shared across pages: cream paper, chunky ink outlines and hard pink
 * offset shadows. Phone sizes first; `lg:` is the desktop (sidebar) layout.
 */
export const card =
  "rounded-3xl border-[3px] border-ink bg-white px-[18px] py-4 shadow-[5px_5px_0_var(--color-sticker)] lg:px-[22px] lg:py-[18px] lg:shadow-[6px_6px_0_var(--color-sticker)]";

/** The dark brown hero card (countdown). */
export const darkCard =
  "relative overflow-hidden rounded-[28px] bg-ink p-[22px] pb-5 text-cream lg:rounded-[30px] lg:px-9 lg:py-[30px]";

/** Column for every page except Home, clearing the phone tab bar at the bottom. */
export const page =
  "mx-auto flex w-full max-w-md flex-col gap-[18px] px-5 pt-10 pb-[120px] lg:max-w-2xl lg:px-10 lg:py-9";

export const pageTitle =
  "font-display text-[30px] leading-none font-bold tracking-[-0.5px]";

export const cardTitle = "font-display text-lg font-bold lg:text-xl";

export const eyebrow =
  "font-display text-[11px] font-semibold tracking-[1.4px] uppercase opacity-60";

/** Square blush tile holding an emoji, e.g. the next occasion. */
export const emojiTile =
  "grid size-[52px] shrink-0 place-items-center rounded-2xl border-[3px] border-ink bg-blush text-[26px] lg:size-14 lg:rounded-[18px] lg:text-[28px]";

export const pill =
  "rounded-full bg-ink px-3 py-1.5 font-display text-[13px] font-bold whitespace-nowrap text-white lg:px-3.5 lg:py-2 lg:text-sm";

export const blushPill =
  "rounded-full bg-blush px-2.5 py-1 font-display text-[13px] font-bold whitespace-nowrap lg:px-3 lg:py-[5px]";

export const input =
  "w-full rounded-2xl border-2 border-ink bg-white px-3 py-2 font-semibold outline-none placeholder:font-medium placeholder:text-ink/45 focus:shadow-[3px_3px_0_var(--color-sticker)]";

export const button =
  "rounded-full bg-ink px-4 py-2 font-display font-semibold text-cream hover:bg-[#4a382b] disabled:opacity-50";

export const quietButton =
  "rounded-full px-3 py-1 font-display text-sm font-semibold hover:bg-blush disabled:opacity-50";

/** Blush pill link/button, e.g. "Plan a date here". */
export const chip =
  "inline-block rounded-full border-2 border-ink bg-blush px-3 py-1 font-display text-sm font-semibold hover:bg-sticker";

export const link = "hover:underline hover:decoration-dotted";
