import { Eye, Pencil } from "lucide-react";
import { useState } from "react";
import { MarkdownPreview } from "./MarkdownPreview";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onSubmit?: () => void;
}

export function MarkdownEditor({ value, onChange, placeholder, onSubmit }: MarkdownEditorProps) {
  const [mode, setMode] = useState<"edit" | "preview">("edit");

  return (
    <section className="markdown-editor">
      <div className="markdown-editor-toolbar">
        <button type="button" className={mode === "edit" ? "is-active" : ""} onClick={() => setMode("edit")}>
          <Pencil size={14} />
          编辑
        </button>
        <button type="button" className={mode === "preview" ? "is-active" : ""} onClick={() => setMode("preview")}>
          <Eye size={14} />
          预览
        </button>
      </div>
      {mode === "edit" ? (
        <textarea
          data-quick-note-input
          value={value}
          onChange={(event) => onChange(event.currentTarget.value)}
          onKeyDown={(event) => {
            if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
              event.preventDefault();
              onSubmit?.();
            }
          }}
          className="note-editor markdown-editor-input min-h-24 resize-none p-2 text-sm leading-6 outline-none placeholder:text-[var(--text-muted)]"
          placeholder={placeholder}
        />
      ) : (
        <MarkdownPreview content={value} />
      )}
    </section>
  );
}
