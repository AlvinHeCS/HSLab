import { type Occurrence } from "~/lib/special-dates";

const CONFETTI = ["💖", "💕", "🎉", "🧸", "🌸", "✨"];

/** Falling hearts across the whole page, shown on a special day. */
export function Confetti() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 overflow-hidden"
    >
      {Array.from({ length: 24 }, (_, i) => (
        <span
          key={i}
          className="confetti absolute -top-12 text-2xl"
          style={{
            left: `${(i * 37) % 100}%`,
            animationDelay: `${(i * 0.45) % 6}s`,
            animationDuration: `${5 + (i % 4)}s`,
          }}
        >
          {CONFETTI[i % CONFETTI.length]}
        </span>
      ))}
    </div>
  );
}

export function Celebration({ occasion }: { occasion: Occurrence }) {
  return (
    <section className="rounded-3xl bg-white p-6 text-center shadow-md">
      <p className="text-6xl">{occasion.emoji}</p>
      <h2 className="mt-3 text-2xl font-extrabold">{occasion.celebration}</h2>
      {occasion.age !== undefined && (
        <p className="mt-1 opacity-80">{occasion.age} today! 🎈</p>
      )}
    </section>
  );
}
