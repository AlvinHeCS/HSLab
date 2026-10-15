"use client";

import { useRouter } from "next/navigation";

import { DateForm } from "~/app/dates/_components/date-form";
import { api } from "~/trpc/react";

export function NewDate({
  today,
  place,
}: {
  today: string;
  place: { id: string; name: string } | null;
}) {
  const router = useRouter();
  const create = api.dates.create.useMutation({
    onSuccess: ({ id }) => router.push(`/dates/${id}`),
  });

  return (
    <>
      {place && (
        <p className="text-sm">
          Starting at <span className="font-semibold">{place.name}</span>
        </p>
      )}
      <DateForm
        initial={{
          title: place?.name ?? "",
          day: today,
          occasionId: null,
          notes: null,
        }}
        submitLabel="Save date"
        pending={create.isPending || create.isSuccess}
        onSubmit={(values) => create.mutate({ ...values, placeId: place?.id })}
      />
      {create.error && (
        <p className="text-sm text-red-700">Couldn&apos;t save that date.</p>
      )}
    </>
  );
}
