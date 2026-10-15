"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { button, input, quietButton } from "~/app/_components/ui";
import {
  WishlistDetails,
  WishlistRemove,
} from "~/app/(site)/wishlist/_components/wishlist-add";
import { api } from "~/trpc/react";

export function PlaceWishlist({
  placeId,
  placeName,
  wishlistId,
}: {
  placeId: string;
  placeName: string;
  wishlistId: string | null;
}) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const add = api.wishlist.add.useMutation({
    onSuccess: () => {
      setAdding(false);
      router.refresh();
    },
  });

  if (wishlistId) {
    return <WishlistRemove id={wishlistId} label="Remove from wishlist" />;
  }
  if (!adding) {
    return (
      <button
        type="button"
        onClick={() => setAdding(true)}
        className={quietButton}
      >
        ⭐ Add to wishlist
      </button>
    );
  }
  return (
    <WishlistDetails
      placeName={placeName}
      pending={add.isPending}
      onCancel={() => setAdding(false)}
      onSave={(addedBy, reason) => add.mutate({ placeId, addedBy, reason })}
    />
  );
}

/** The venue's own site or booking page. We link out instead of booking in-app. */
export function WebsiteForm({
  placeId,
  website,
}: {
  placeId: string;
  website: string | null;
}) {
  const router = useRouter();
  const [value, setValue] = useState(website ?? "");
  const save = api.place.setWebsite.useMutation({
    onSuccess: () => router.refresh(),
  });

  return (
    <form
      className="flex gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        save.mutate({ id: placeId, website: value.trim() });
      }}
    >
      <input
        type="url"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="https://… (website or booking page)"
        aria-label="Website or booking page"
        className={`${input} text-sm`}
      />
      <button
        type="submit"
        disabled={save.isPending || value.trim() === (website ?? "")}
        className={`${button} text-sm`}
      >
        Save
      </button>
    </form>
  );
}
