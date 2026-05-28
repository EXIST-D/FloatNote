import { ArrowRight, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { EmptyState } from "../../components/common/EmptyState";
import { IconButton } from "../../components/common/IconButton";
import { Toast } from "../../components/common/Toast";
import { PanelBody } from "../../components/layout/PanelBody";
import type { Note, TaskScope } from "../../types/domain";
import { MarkdownEditor } from "../markdown/MarkdownEditor";
import { useNotes } from "./useNotes";

export function NotesView() {
  const { notes, loading, error, addNote, convertNote, removeNote } = useNotes();
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!feedback) return;

    const timeoutId = window.setTimeout(() => setFeedback(null), 1800);
    return () => window.clearTimeout(timeoutId);
  }, [feedback]);

  async function saveNote() {
    const nextContent = content.trim();
    if (!nextContent || saving) return;

    setSaving(true);
    try {
      await addNote(nextContent);
      setContent("");
    } finally {
      setSaving(false);
    }
  }

  async function convert(note: Note, scope: TaskScope) {
    await convertNote(note, scope);
    setFeedback(scope === "today" ? "已转为今日任务" : "已转为本周任务");
  }

  return (
    <PanelBody className="relative">
      <MarkdownEditor
        value={content}
        onChange={setContent}
        placeholder="记下一点灵感或随笔"
      />
      <button
        type="button"
        className="primary-action h-8 rounded-md text-sm disabled:cursor-not-allowed disabled:opacity-60"
        disabled={saving || !content.trim()}
        onClick={() => void saveNote()}
      >
        收进灵感
      </button>
      {error && <p className="rounded-md bg-red-50 p-2 text-xs text-red-700">{error}</p>}
      {loading ? (
        <p className="p-2 text-xs text-[var(--text-muted)]">正在读取灵感...</p>
      ) : notes.length === 0 ? (
        <EmptyState title="还没有灵感记录" />
      ) : (
        <div className="notes-list grid min-h-0 gap-1.5 overflow-auto pr-1">
          {notes.map((note) => (
            <article key={note.id} className="note-card grid min-w-0 gap-1.5 px-2 py-1.5 text-sm leading-5">
              <p className="line-clamp-4 min-w-0 whitespace-pre-wrap break-words">{note.content}</p>
              <div className="flex min-w-0 items-center justify-end gap-1">
                <button type="button" className="note-action" onClick={() => void convert(note, "today")}>
                  <ArrowRight size={12} />
                  今日
                </button>
                <button type="button" className="note-action" onClick={() => void convert(note, "week")}>
                  <ArrowRight size={12} />
                  本周
                </button>
                <IconButton label="删除" onClick={() => void removeNote(note.id)}>
                  <Trash2 size={13} />
                </IconButton>
              </div>
            </article>
          ))}
        </div>
      )}
      <Toast message={feedback} />
    </PanelBody>
  );
}
