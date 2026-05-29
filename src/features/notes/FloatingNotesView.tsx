import { useEffect, useRef, useState } from "react";
import { Toast } from "../../components/common/Toast";
import { PanelBody } from "../../components/layout/PanelBody";
import { VditorMarkdownEditor, type VditorMarkdownEditorHandle } from "../markdown/vditor/VditorMarkdownEditor";
import { useNotes } from "./useNotes";

export function FloatingNotesView() {
  const { error, addNote } = useNotes();
  const editorRef = useRef<VditorMarkdownEditorHandle | null>(null);
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!feedback) return undefined;
    const timeoutId = window.setTimeout(() => setFeedback(null), 1800);
    return () => window.clearTimeout(timeoutId);
  }, [feedback]);

  async function saveNote() {
    const nextContent = (editorRef.current?.getValue() ?? content).trim();
    if (!nextContent || saving) {
      if (!nextContent) setFeedback("先写一点内容");
      return;
    }

    setSaving(true);
    try {
      await addNote(nextContent);
      setContent("");
      editorRef.current?.setValue("");
      setFeedback("已收进灵感");
    } finally {
      setSaving(false);
    }
  }

  return (
    <PanelBody className="floating-notes-view">
      <section className="floating-markdown-box">
        <VditorMarkdownEditor
          ref={editorRef}
          compact
          value={content}
          placeholder="记下一点灵感、随笔或 Markdown 片段"
          autoFocus
          onChange={setContent}
          onSaveShortcut={() => void saveNote()}
        />
      </section>
      <button
        type="button"
        className="floating-note-save primary-action h-9 rounded-md text-sm disabled:cursor-not-allowed disabled:opacity-60"
        disabled={saving || !content.trim()}
        onClick={() => void saveNote()}
      >
        {saving ? "收进中..." : "收进灵感"}
      </button>
      {error && <p className="floating-error">{error}</p>}
      <Toast message={feedback} />
    </PanelBody>
  );
}
