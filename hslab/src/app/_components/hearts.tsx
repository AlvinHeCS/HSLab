"use client";

/** 1–5 heart rating. Tapping the current rating clears it. */
export function Hearts({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-14 text-xs font-semibold opacity-70">{label}</span>
      <div className="flex" role="radiogroup" aria-label={`${label}'s rating`}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} heart${n === 1 ? "" : "s"}`}
            disabled={disabled}
            onClick={() => onChange(value === n ? null : n)}
            className="px-0.5 text-lg disabled:opacity-50"
          >
            {value !== null && n <= value ? "❤️" : "🤍"}
          </button>
        ))}
      </div>
    </div>
  );
}
