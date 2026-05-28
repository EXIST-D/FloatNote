import { Eye, Pencil } from "lucide-react";
import { useMemo, useState } from "react";
import { renderMarkdownToHtml } from "./markdownRender";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function MarkdownEditor({ value, onChange, placeholder }: MarkdownEditorProps) {
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const previewHtml = useMemo(() => renderMarkdownToHtml(value), [value]);

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
          className="note-editor markdown-editor-input min-h-24 resize-none p-2 text-sm leading-6 outline-none placeholder:text-[var(--text-muted)]"
          placeholder={placeholder}
        />
      ) : (
        <div className="markdown-preview" dangerouslySetInnerHTML={{ __html: previewHtml || "<p>暂无内容</p>" }} />
      )}
    </section>
  );
}
