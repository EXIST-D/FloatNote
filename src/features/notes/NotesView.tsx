import { Trash2 } from "lucide-react";
import { useState } from "react";
import { EmptyState } from "../../components/common/EmptyState";
import { IconButton } from "../../components/common/IconButton";
import { useNotes } from "./useNotes";

export function NotesView() {
  const { notes, loading, error, addNote, removeNote } = useNotes();
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

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

  return (
    <section className="grid gap-2 p-2">
      <textarea
        value={content}
        onChange={(event) => setContent(event.currentTarget.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && event.ctrlKey) {
            event.preventDefault();
            void saveNote();
          }
        }}
        className="min-h-20 resize-none rounded-md border border-[var(--app-border)] bg-white/45 p-2 text-sm leading-5 outline-none placeholder:text-[var(--text-muted)] focus:ring-2 focus:ring-[var(--accent)]"
        placeholder="记下一点灵感或随笔"
      />
      <button
        type="button"
        className="h-8 rounded-md bg-[var(--accent)] text-sm text-[var(--accent-contrast)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
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
        <div className="grid max-h-36 gap-1.5 overflow-auto pr-1">
          {notes.map((note) => (
            <article key={note.id} className="grid grid-cols-[1fr_auto] gap-1.5 rounded-md border border-[var(--app-border)] bg-white/25 px-2 py-1.5 text-sm leading-5">
              <p className="line-clamp-3 whitespace-pre-wrap">{note.content}</p>
              <IconButton label="删除" onClick={() => void removeNote(note.id)}>
                <Trash2 size={13} />
              </IconButton>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
