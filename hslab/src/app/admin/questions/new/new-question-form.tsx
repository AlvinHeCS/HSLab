"use client";

import { type JSONContent } from "@tiptap/react";
import { useMemo, useState } from "react";

import { TiptapEditor } from "~/components/editor/tiptap-editor";
import {
  Grade,
  QuestionDifficulty,
  QuestionType,
  type MathSubtopic,
  type MathTopic,
} from "../../../../../generated/prisma";
import {
  GRADE_LABELS,
  GRADE_TOPICS,
  SUBTOPIC_LABELS,
  TOPIC_LABELS,
  TOPIC_SUBTOPICS,
} from "~/server/taxonomy";
import { api } from "~/trpc/react";

type Choice = { label: string; doc: JSONContent };

type PartDraft = {
  questionType: QuestionType;
  promptDoc: JSONContent | null;
  explanationDoc: JSONContent | null;
  correctAnswer: string;
  choices: Choice[];
  isStandalone: boolean;
  toleranceOverride: string;
};

function emptyChoices(): Choice[] {
  return ["A", "B", "C", "D"].map((label) => ({
    label,
    doc: { type: "doc", content: [] },
  }));
}

function emptyPart(): PartDraft {
  return {
    questionType: QuestionType.mcq,
    promptDoc: null,
    explanationDoc: null,
    correctAnswer: "A",
    choices: emptyChoices(),
    isStandalone: true,
    toleranceOverride: "",
  };
}

export function NewQuestionForm() {
  const [grade, setGrade] = useState<Grade>(Grade.Y11_ADVANCED);
  const validTopics = useMemo(() => GRADE_TOPICS[grade], [grade]);
  const [topic, setTopic] = useState<MathTopic>(validTopics[0]!);
  const validSubtopics = useMemo(() => TOPIC_SUBTOPICS[topic], [topic]);
  const [subtopic, setSubtopic] = useState<MathSubtopic>(validSubtopics[0]!);
  const [difficulty, setDifficulty] = useState<QuestionDifficulty>(
    QuestionDifficulty.medium,
  );
  const [stimulusDoc, setStimulusDoc] = useState<JSONContent | null>(null);
  const [parts, setParts] = useState<PartDraft[]>(() => [emptyPart()]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  // Keep cascading selects coherent.
  const handleGradeChange = (g: Grade) => {
    setGrade(g);
    const firstTopic = GRADE_TOPICS[g][0]!;
    setTopic(firstTopic);
    setSubtopic(TOPIC_SUBTOPICS[firstTopic][0]!);
  };
  const handleTopicChange = (t: MathTopic) => {
    setTopic(t);
    setSubtopic(TOPIC_SUBTOPICS[t][0]!);
  };

  const updatePart = (i: number, patch: Partial<PartDraft>) => {
    setParts((prev) =>
      prev.map((p, idx) => (idx === i ? { ...p, ...patch } : p)),
    );
  };

  const createMutation = api.questions.create.useMutation({
    onSuccess: (q) => {
      setSavedId(q.id);
      setStimulusDoc(null);
      setParts([emptyPart()]);
    },
    onError: (err) => {
      setSubmitError(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSavedId(null);

    const builtParts = parts.map((p, idx) => {
      if (!p.promptDoc) {
        throw new Error(`Part ${idx + 1}: prompt required`);
      }
      const base = {
        orderIndex: idx,
        isStandalone: p.isStandalone,
        questionType: p.questionType,
        promptDoc: p.promptDoc,
        explanationDoc: p.explanationDoc,
        correctAnswer: p.correctAnswer.trim(),
        toleranceOverride:
          p.questionType === QuestionType.numeric && p.toleranceOverride
            ? Number(p.toleranceOverride)
            : null,
        choices:
          p.questionType === QuestionType.mcq
            ? p.choices.map((c) => ({ label: c.label, doc: c.doc }))
            : null,
      };
      return base;
    });

    try {
      createMutation.mutate({
        grade,
        topic,
        subtopic,
        difficulty,
        stimulusDoc,
        parts: builtParts,
      });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Submission failed");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Field label="Grade">
          <select
            value={grade}
            onChange={(e) => handleGradeChange(e.target.value as Grade)}
            className="w-full rounded border border-gray-300 p-2"
          >
            {Object.values(Grade).map((g) => (
              <option key={g} value={g}>
                {GRADE_LABELS[g]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Topic">
          <select
            value={topic}
            onChange={(e) => handleTopicChange(e.target.value as MathTopic)}
            className="w-full rounded border border-gray-300 p-2"
          >
            {validTopics.map((t) => (
              <option key={t} value={t}>
                {TOPIC_LABELS[t]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Subtopic">
          <select
            value={subtopic}
            onChange={(e) => setSubtopic(e.target.value as MathSubtopic)}
            className="w-full rounded border border-gray-300 p-2"
          >
            {validSubtopics.map((s) => (
              <option key={s} value={s}>
                {SUBTOPIC_LABELS[s]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Difficulty">
          <select
            value={difficulty}
            onChange={(e) =>
              setDifficulty(e.target.value as QuestionDifficulty)
            }
            className="w-full rounded border border-gray-300 p-2"
          >
            {Object.values(QuestionDifficulty).map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </Field>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-medium text-gray-700">
          Stimulus (optional)
        </h2>
        <TiptapEditor
          value={stimulusDoc}
          onChange={setStimulusDoc}
          placeholder="Shared context for all parts. Leave empty if the question is single-part flat."
          label="Stimulus"
        />
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-gray-700">Parts</h2>
          <button
            type="button"
            onClick={() => setParts((p) => [...p, emptyPart()])}
            className="rounded border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50"
          >
            + Add part
          </button>
        </div>
        {parts.map((part, i) => (
          <PartEditor
            key={i}
            index={i}
            part={part}
            onChange={(patch) => updatePart(i, patch)}
            onRemove={
              parts.length > 1
                ? () => setParts((p) => p.filter((_, idx) => idx !== i))
                : undefined
            }
          />
        ))}
      </section>

      {submitError ? (
        <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {submitError}
        </div>
      ) : null}
      {savedId ? (
        <div className="rounded border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          Saved as draft <code className="font-mono">{savedId}</code>.
        </div>
      ) : null}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={createMutation.isPending}
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {createMutation.isPending ? "Saving…" : "Save draft"}
        </button>
        <p className="text-xs text-gray-500">
          Status defaults to <code>draft</code>. You can publish from the
          question detail page.
        </p>
      </div>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-gray-700">{label}</span>
      {children}
    </label>
  );
}

function PartEditor({
  index,
  part,
  onChange,
  onRemove,
}: {
  index: number;
  part: PartDraft;
  onChange: (patch: Partial<PartDraft>) => void;
  onRemove?: () => void;
}) {
  return (
    <div className="rounded border border-gray-200 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-medium">
          Part {String.fromCharCode(97 + index)}
        </h3>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1 text-xs text-gray-600">
            <input
              type="checkbox"
              checked={part.isStandalone}
              onChange={(e) => onChange({ isStandalone: e.target.checked })}
            />
            Standalone (battle-eligible)
          </label>
          <select
            value={part.questionType}
            onChange={(e) =>
              onChange({ questionType: e.target.value as QuestionType })
            }
            className="rounded border border-gray-300 p-1 text-sm"
          >
            {Object.values(QuestionType).map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          {onRemove ? (
            <button
              type="button"
              onClick={onRemove}
              className="text-xs text-red-600 hover:underline"
            >
              Remove
            </button>
          ) : null}
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">
            Prompt
          </label>
          <TiptapEditor
            value={part.promptDoc}
            onChange={(d) => onChange({ promptDoc: d })}
            placeholder="The actual question prompt."
            label={`Part ${index + 1} prompt`}
          />
        </div>

        {part.questionType === QuestionType.mcq ? (
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">
              Choices
            </label>
            <div className="space-y-2">
              {part.choices.map((choice, ci) => (
                <div key={choice.label} className="flex gap-2">
                  <div className="flex w-12 items-center justify-center rounded bg-gray-100 font-mono">
                    {choice.label}
                  </div>
                  <div className="flex-1">
                    <TiptapEditor
                      value={choice.doc}
                      onChange={(d) =>
                        onChange({
                          choices: part.choices.map((c, idx) =>
                            idx === ci ? { ...c, doc: d } : c,
                          ),
                        })
                      }
                      placeholder={`Choice ${choice.label}`}
                      label={`Choice ${choice.label}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">
              Correct answer
              {part.questionType === QuestionType.mcq
                ? " (label, e.g. A)"
                : part.questionType === QuestionType.numeric
                  ? " (numeric)"
                  : " (text)"}
            </label>
            <input
              type="text"
              value={part.correctAnswer}
              onChange={(e) => onChange({ correctAnswer: e.target.value })}
              className="w-full rounded border border-gray-300 p-2 text-sm"
              required
            />
          </div>
          {part.questionType === QuestionType.numeric ? (
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                Tolerance override (optional)
              </label>
              <input
                type="number"
                step="any"
                min="0"
                value={part.toleranceOverride}
                onChange={(e) =>
                  onChange({ toleranceOverride: e.target.value })
                }
                className="w-full rounded border border-gray-300 p-2 text-sm"
              />
            </div>
          ) : null}
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">
            Explanation (optional)
          </label>
          <TiptapEditor
            value={part.explanationDoc}
            onChange={(d) => onChange({ explanationDoc: d })}
            placeholder="Shown after the student answers."
            label={`Part ${index + 1} explanation`}
          />
        </div>
      </div>
    </div>
  );
}
