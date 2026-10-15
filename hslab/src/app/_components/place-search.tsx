"use client";

import { useEffect, useState } from "react";

import { input } from "~/app/_components/ui";
import { api, type RouterOutputs } from "~/trpc/react";

type SavedPlace = RouterOutputs["place"]["save"];

/** Search Sydney places, or fall back to adding one by name, then hand back the saved place. */
export function PlaceSearch({
  placeholder = "Search Sydney places…",
  onPick,
}: {
  placeholder?: string;
  onPick: (place: SavedPlace) => void;
}) {
  const [text, setText] = useState("");
  const query = useDebounced(text.trim(), 400);
  const results = api.place.search.useQuery(
    { query },
    { enabled: query.length >= 2, staleTime: 60_000, retry: 1 },
  );
  const save = api.place.save.useMutation({
    onSuccess: (place) => {
      setText("");
      onPick(place);
    },
  });

  return (
    <div className="flex flex-col gap-2">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        className={input}
        disabled={save.isPending}
      />
      {query.length >= 2 && text.trim().length >= 2 && (
        <ul className="divide-blush border-ink divide-y-2 overflow-hidden rounded-2xl border-2 bg-white">
          {results.isLoading && (
            <li className="px-3 py-2 text-sm font-bold opacity-60">
              Searching…
            </li>
          )}
          {results.error && (
            <li className="px-3 py-2 text-sm font-bold text-red-700">
              Search isn&apos;t working right now.
            </li>
          )}
          {results.data?.map((place) => (
            <li key={place.sourceId}>
              <button
                type="button"
                disabled={save.isPending}
                onClick={() => save.mutate({ source: "osm", ...place })}
                className="hover:bg-blush w-full px-3 py-2 text-left"
              >
                <p className="font-extrabold">{place.name}</p>
                <p className="text-xs font-bold opacity-65">
                  {[place.category, place.address, place.suburb]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </button>
            </li>
          ))}
          <li>
            <button
              type="button"
              disabled={save.isPending}
              onClick={() =>
                save.mutate({ source: "manual", name: text.trim() })
              }
              className="hover:bg-blush w-full px-3 py-2 text-left text-sm font-bold"
            >
              Can&apos;t find it? Add “{text.trim()}” by name
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}

function useDebounced<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}
