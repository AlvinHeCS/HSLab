"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Hearts } from "~/app/_components/hearts";
import { PlaceSearch } from "~/app/_components/place-search";
import { input, link, quietButton } from "~/app/_components/ui";
import { api, type RouterOutputs } from "~/trpc/react";

type Stop = NonNullable<RouterOutputs["dates"]["byId"]>["stops"][number];

/** The places a date is made of, in order. Ratings unlock once the day arrives. */
export function StopList({
  planId,
  stops,
  canRate,
}: {
  planId: string;
  stops: Stop[];
  canRate: boolean;
}) {
  const router = useRouter();
  const addStop = api.dates.addStop.useMutation({
    onSuccess: () => router.refresh(),
  });

  return (
    <div className="flex flex-col gap-3">
      {stops.length === 0 && (
        <p className="text-sm opacity-70">
          No stops yet. Add the first one below.
        </p>
      )}
      <ol className="flex flex-col gap-3">
        {stops.map((stop, i) => (
          <StopRow
            key={stop.id}
            stop={stop}
            position={i + 1}
            isFirst={i === 0}
            isLast={i === stops.length - 1}
            canRate={canRate}
          />
        ))}
      </ol>
      <PlaceSearch
        placeholder="Add a stop: search Sydney places…"
        onPick={(place) => addStop.mutate({ planId, placeId: place.id })}
      />
      {addStop.isPending && (
        <p className="text-sm font-bold opacity-70">Adding…</p>
      )}
    </div>
  );
}

function StopRow({
  stop,
  position,
  isFirst,
  isLast,
  canRate,
}: {
  stop: Stop;
  position: number;
  isFirst: boolean;
  isLast: boolean;
  canRate: boolean;
}) {
  const router = useRouter();
  const refresh = { onSuccess: () => router.refresh() };
  const update = api.dates.updateStop.useMutation(refresh);
  const move = api.dates.moveStop.useMutation(refresh);
  const remove = api.dates.removeStop.useMutation(refresh);
  const [time, setTime] = useState(stop.time ?? "");
  const [notes, setNotes] = useState(stop.notes ?? "");
  const busy = move.isPending || remove.isPending;

  return (
    <li className="border-ink bg-cream rounded-2xl border-2 p-3">
      <div className="flex items-start gap-2">
        <span className="bg-ink font-display text-cream mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold">
          {position}
        </span>
        <div className="flex-1">
          <Link
            href={`/places/${stop.place.id}`}
            className={`font-extrabold ${link}`}
          >
            {stop.place.name}
          </Link>
          <p className="text-xs font-bold opacity-65">
            {[stop.place.category, stop.place.suburb]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
        <div className="flex">
          <button
            type="button"
            aria-label="Move up"
            disabled={isFirst || busy}
            onClick={() => move.mutate({ id: stop.id, direction: "up" })}
            className={quietButton}
          >
            ↑
          </button>
          <button
            type="button"
            aria-label="Move down"
            disabled={isLast || busy}
            onClick={() => move.mutate({ id: stop.id, direction: "down" })}
            className={quietButton}
          >
            ↓
          </button>
          <button
            type="button"
            aria-label={`Remove ${stop.place.name}`}
            disabled={busy}
            onClick={() => remove.mutate({ id: stop.id })}
            className={quietButton}
          >
            ✕
          </button>
        </div>
      </div>

      <div className="mt-2 flex flex-col gap-2 pl-8">
        <input
          type="time"
          aria-label="Time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          onBlur={() => {
            if (time !== (stop.time ?? "")) {
              update.mutate({ id: stop.id, time: time || null });
            }
          }}
          className={`${input} w-32 py-1 text-sm`}
        />
        <textarea
          rows={1}
          aria-label="Notes"
          placeholder="Notes"
          maxLength={1000}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={() => {
            if (notes.trim() !== (stop.notes ?? "")) {
              update.mutate({ id: stop.id, notes: notes.trim() || null });
            }
          }}
          className={`${input} py-1 text-sm`}
        />
        {canRate && (
          <>
            <Hearts
              label="Alvin"
              value={stop.ratingAlvin}
              disabled={update.isPending}
              onChange={(ratingAlvin) =>
                update.mutate({ id: stop.id, ratingAlvin })
              }
            />
            <Hearts
              label="Vivian"
              value={stop.ratingVivian}
              disabled={update.isPending}
              onChange={(ratingVivian) =>
                update.mutate({ id: stop.id, ratingVivian })
              }
            />
          </>
        )}
      </div>
    </li>
  );
}
