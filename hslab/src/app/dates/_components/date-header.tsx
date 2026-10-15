"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { quietButton } from "~/app/_components/ui";
import {
  DateForm,
  type DateFormValues,
} from "~/app/dates/_components/date-form";
import { api } from "~/trpc/react";

/** Title block for one date, with edit and delete. */
export function DateHeader({
  id,
  values,
  heading,
}: {
  id: string;
  values: DateFormValues;
  heading: React.ReactNode;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const update = api.dates.update.useMutation({
    onSuccess: () => {
      setEditing(false);
      router.refresh();
    },
  });
  const remove = api.dates.delete.useMutation({
    onSuccess: () => {
      router.push("/dates");
      router.refresh();
    },
  });

  if (editing) {
    return (
      <>
        <DateForm
          initial={values}
          submitLabel="Save changes"
          pending={update.isPending}
          onSubmit={(next) => update.mutate({ id, ...next })}
        />
        <button
          type="button"
          onClick={() => setEditing(false)}
          className={quietButton}
        >
          Cancel
        </button>
      </>
    );
  }

  return (
    <>
      {heading}
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className={quietButton}
        >
          ✏️ Edit
        </button>
        <button
          type="button"
          disabled={remove.isPending}
          onClick={() => {
            if (confirm(`Delete “${values.title}”? This can't be undone.`)) {
              remove.mutate({ id });
            }
          }}
          className={quietButton}
        >
          🗑️ Delete
        </button>
      </div>
    </>
  );
}
