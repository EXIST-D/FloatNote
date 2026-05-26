import { useCallback, useEffect, useState } from "react";
import { createNote, deleteNote, listRecentNotes } from "../../data/notesRepository";
import type { Note } from "../../types/domain";

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setNotes(await listRecentNotes(50));
    } catch (err) {
      setError(err instanceof Error ? err.message : "读取灵感失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  async function addNote(content: string) {
    await createNote(content);
    await reload();
  }

  async function removeNote(id: string) {
    await deleteNote(id);
    await reload();
  }

  return { notes, loading, error, addNote, removeNote, reload };
}
