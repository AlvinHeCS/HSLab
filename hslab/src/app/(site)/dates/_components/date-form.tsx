"use client";

import { useState } from "react";

import { button, input } from "~/app/_components/ui";
import { SPECIAL_DATES } from "~/lib/special-dates";

export type DateFormValues = {
  title: string;
  day: string;
  occasionId: string | null;
  notes: string | null;
};

/** The title / day / occasion / notes fields, shared by "log a date" and "edit". */
export function DateForm({
  initial,
  submitLabel,
  pending,
  onSubmit,
}: {
  initial: DateFormValues;
  submitLabel: string;
  pending: boolean;
  onSubmit: (values: DateFormValues) => void;
}) {
  const [values, setValues] = useState(initial);
  const set = (patch: Partial<DateFormValues>) =>
    setValues((v) => ({ ...v, ...patch }));

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ ...values, notes: (values.notes ?? "").trim() || null });
      }}
    >
      <label className="flex flex-col gap-1">
        <span className="font-display text-sm font-semibold">
          What are we doing?
        </span>
        <input
          required
          maxLength={120}
          value={values.title}
          onChange={(e) => set({ title: e.target.value })}
          placeholder="Picnic at Balmoral"
          className={input}
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="font-display text-sm font-semibold">When?</span>
        <input
          type="date"
          required
          value={values.day}
          onChange={(e) => set({ day: e.target.value })}
          className={input}
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="font-display text-sm font-semibold">
          Special occasion?
        </span>
        <select
          value={values.occasionId ?? ""}
          onChange={(e) => set({ occasionId: e.target.value || null })}
          className={input}
        >
          <option value="">Just because</option>
          {SPECIAL_DATES.map((d) => (
            <option key={d.id} value={d.id}>
              {d.emoji} {d.title}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1">
        <span className="font-display text-sm font-semibold">Notes</span>
        <textarea
          rows={3}
          maxLength={2000}
          value={values.notes ?? ""}
          onChange={(e) => set({ notes: e.target.value })}
          className={input}
        />
      </label>
      <button type="submit" disabled={pending} className={button}>
        {submitLabel}
      </button>
    </form>
  );
}
