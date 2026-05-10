"use client";

import Image from "@tiptap/extension-image";
import {
  EditorContent,
  useEditor,
  type Editor,
  type JSONContent,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useCallback, useEffect, useRef, useState } from "react";

import { api } from "~/trpc/react";

const ALLOWED_IMAGE_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);

type ContentType =
  | "image/png"
  | "image/jpeg"
  | "image/webp"
  | "image/gif"
  | "image/svg+xml";

export interface TiptapEditorProps {
  value: JSONContent | null | undefined;
  onChange: (doc: JSONContent) => void;
  placeholder?: string;
  className?: string;
  /** Used when uploading from this editor instance (for error reporting). */
  label?: string;
}

export function TiptapEditor({
  value,
  onChange,
  placeholder,
  className,
  label,
}: TiptapEditorProps) {
  const [uploading, setUploading] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createUploadUrl = api.uploads.createQuestionImageUploadUrl.useMutation();

  const uploadAndInsert = useCallback(
    async (editor: Editor, file: File) => {
      if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
        setError(`Unsupported image type: ${file.type || "unknown"}`);
        return;
      }
      setError(null);
      setUploading((n) => n + 1);
      try {
        const { signedUrl, publicUrl } = await createUploadUrl.mutateAsync({
          contentType: file.type as ContentType,
          sizeBytes: file.size,
        });
        const res = await fetch(signedUrl, {
          method: "PUT",
          headers: { "Content-Type": file.type },
          body: file,
        });
        if (!res.ok) {
          throw new Error(
            `Upload failed: ${res.status} ${await res.text().catch(() => "")}`,
          );
        }
        editor.chain().focus().setImage({ src: publicUrl }).run();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Upload failed");
      } finally {
        setUploading((n) => n - 1);
      }
    },
    [createUploadUrl],
  );

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ inline: false, allowBase64: false }),
    ],
    content: value ?? null,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none focus:outline-none min-h-[120px] p-3",
      },
      handlePaste(view, event) {
        const files = Array.from(event.clipboardData?.files ?? []).filter((f) =>
          f.type.startsWith("image/"),
        );
        if (files.length === 0) return false;
        event.preventDefault();
        const ed = (view as unknown as { editor?: Editor }).editor;
        const target = ed ?? editorRef.current;
        if (!target) return false;
        for (const f of files) void uploadAndInsert(target, f);
        return true;
      },
      handleDrop(view, event) {
        const files = Array.from(event.dataTransfer?.files ?? []).filter((f) =>
          f.type.startsWith("image/"),
        );
        if (files.length === 0) return false;
        event.preventDefault();
        const ed = (view as unknown as { editor?: Editor }).editor;
        const target = ed ?? editorRef.current;
        if (!target) return false;
        for (const f of files) void uploadAndInsert(target, f);
        return true;
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getJSON());
    },
  });

  // Keep a ref so paste/drop handlers (which capture an early closure) can
  // reach the live editor instance.
  const editorRef = useRef<Editor | null>(null);
  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

  // Re-sync external value changes (e.g. when loading an existing question).
  useEffect(() => {
    if (!editor) return;
    const current = editor.getJSON();
    if (JSON.stringify(current) === JSON.stringify(value ?? null)) return;
    editor.commands.setContent(value ?? "");
  }, [editor, value]);

  return (
    <div className={`rounded border border-gray-300 ${className ?? ""}`}>
      <div className="flex items-center gap-2 border-b border-gray-200 bg-gray-50 px-2 py-1 text-sm">
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleBold().run()}
          className="rounded px-2 py-1 hover:bg-gray-200"
          aria-label="Bold"
        >
          <b>B</b>
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          className="rounded px-2 py-1 italic hover:bg-gray-200"
          aria-label="Italic"
        >
          I
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          className="rounded px-2 py-1 hover:bg-gray-200"
          aria-label="Bullet list"
        >
          • List
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="ml-auto rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700 disabled:opacity-50"
          disabled={uploading > 0}
        >
          {uploading > 0 ? `Uploading… (${uploading})` : "Insert image"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept={Array.from(ALLOWED_IMAGE_TYPES).join(",")}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (!file || !editor) return;
            void uploadAndInsert(editor, file);
          }}
        />
      </div>
      {placeholder && editor?.isEmpty ? (
        <div className="pointer-events-none px-3 pt-3 text-sm text-gray-400">
          {placeholder}
        </div>
      ) : null}
      <EditorContent editor={editor} />
      {error ? (
        <div className="border-t border-red-200 bg-red-50 px-3 py-1 text-xs text-red-700">
          {label ? `${label}: ` : ""}
          {error}
        </div>
      ) : null}
    </div>
  );
}
