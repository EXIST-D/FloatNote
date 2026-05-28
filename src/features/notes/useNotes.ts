import { useCallback, useEffect, useState } from "react";
import { createNote, deleteNote, listRecentNotes, updateNote } from "../../data/notesRepository";
import { createTaskFromNote } from "../../data/tasksRepository";
import type { Note, TaskScope } from "../../types/domain";

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

  async function editNote(id: string, content: string) {
    await updateNote(id, content);
    await reload();
  }

  async function convertNote(note: Note, scope: TaskScope) {
    await createTaskFromNote(scope, note.content);
  }

  async function removeNote(id: string) {
    await deleteNote(id);
    await reload();
  }

  return { notes, loading, error, addNote, editNote, convertNote, removeNote, reload };
}
