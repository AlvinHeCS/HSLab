"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { Person } from "../../../../generated/prisma";
import { PlaceSearch } from "~/app/_components/place-search";
import { button, input, quietButton } from "~/app/_components/ui";
import { PERSON_NAME } from "~/lib/people";
import { api, type RouterOutputs } from "~/trpc/react";

type SavedPlace = RouterOutputs["place"]["save"];

/** Pick a place, say who wants to go and why, then save it to the wishlist. */
export function WishlistAdd() {
  const router = useRouter();
  const [place, setPlace] = useState<SavedPlace | null>(null);
  const add = api.wishlist.add.useMutation({
    onSuccess: () => {
      setPlace(null);
      router.refresh();
    },
  });

  if (!place) {
    return (
      <PlaceSearch placeholder="Somewhere we should go…" onPick={setPlace} />
    );
  }

  return (
    <WishlistDetails
      placeName={place.name}
      pending={add.isPending}
      onCancel={() => setPlace(null)}
      onSave={(addedBy, reason) =>
        add.mutate({ placeId: place.id, addedBy, reason })
      }
    />
  );
}

export function WishlistDetails({
  placeName,
  pending,
  onCancel,
  onSave,
}: {
  placeName: string;
  pending: boolean;
  onCancel?: () => void;
  onSave: (addedBy: Person, reason: string | undefined) => void;
}) {
  const [addedBy, setAddedBy] = useState<Person>("vivian");
  const [reason, setReason] = useState("");

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        onSave(addedBy, reason.trim() || undefined);
      }}
    >
      <p className="font-semibold">⭐ {placeName}</p>
      <div
        className="flex gap-2"
        role="radiogroup"
        aria-label="Who wants to go"
      >
        {(["alvin", "vivian"] as const).map((person) => (
          <button
            key={person}
            type="button"
            role="radio"
            aria-checked={addedBy === person}
            onClick={() => setAddedBy(person)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
              addedBy === person ? "bg-[#5b4636] text-white" : "bg-white"
            }`}
          >
            {PERSON_NAME[person]} wants to go
          </button>
        ))}
      </div>
      <input
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        maxLength={500}
        placeholder="Why? (optional)"
        className={input}
      />
      <div className="flex gap-2">
        <button type="submit" disabled={pending} className={button}>
          Add to wishlist
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className={quietButton}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export function WishlistRemove({
  id,
  label,
  ariaLabel,
}: {
  id: string;
  label: string;
  ariaLabel?: string;
}) {
  const router = useRouter();
  const remove = api.wishlist.remove.useMutation({
    onSuccess: () => router.refresh(),
  });
  return (
    <button
      type="button"
      disabled={remove.isPending}
      onClick={() => remove.mutate({ id })}
      aria-label={ariaLabel}
      className={quietButton}
    >
      {label}
    </button>
  );
}
