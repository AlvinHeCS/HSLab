import { redirect } from "next/navigation";

import { auth } from "~/server/auth";

import { NewQuestionForm } from "./new-question-form";

export default async function NewQuestionPage() {
  const session = await auth();
  if (!session?.user) redirect("/api/auth/signin");
  if (session.user.role !== "admin") {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <h1 className="text-xl font-semibold">Forbidden</h1>
        <p className="mt-2 text-sm text-gray-600">
          Admin role required to author questions.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="text-2xl font-semibold">New question</h1>
      <p className="mt-1 text-sm text-gray-600">
        Author a draft question. Images can be inserted into any rich-text
        field via the toolbar, paste, or drag-drop.
      </p>
      <div className="mt-6">
        <NewQuestionForm />
      </div>
    </main>
  );
}
