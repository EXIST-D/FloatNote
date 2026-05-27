import { useCallback, useEffect, useState } from "react";
import { deleteFocusSession, listFocusSessionsForHistory } from "../../data/focusRepository";
import { deleteNote, listNotesForHistory } from "../../data/notesRepository";
import { deleteReviewSummary, listReviewSummaries } from "../../data/reviewRepository";
import { deleteTask, listTasksForHistory } from "../../data/tasksRepository";
import type { FocusSession, HistoryDayGroup, Note, ReviewSummary, Task } from "../../types/domain";

function toLocalDateKey(iso: string) {
  const date = new Date(iso);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function ensureGroup(groups: Map<string, HistoryDayGroup>, date: string) {
  const existing = groups.get(date);
  if (existing) return existing;

  const next: HistoryDayGroup = { date, reviews: [], tasks: [], notes: [], focusSessions: [] };
  groups.set(date, next);
  return next;
}

function buildGroups(tasks: Task[], notes: Note[], focusSessions: FocusSession[], reviews: ReviewSummary[]) {
  const groups = new Map<string, HistoryDayGroup>();

  for (const review of reviews) {
    const date = toLocalDateKey(review.updatedAt);
    ensureGroup(groups, date).reviews.push(review);
  }

  for (const task of tasks) {
    const date = toLocalDateKey(task.completedAt ?? task.updatedAt ?? task.createdAt);
    ensureGroup(groups, date).tasks.push(task);
  }

  for (const note of notes) {
    const date = toLocalDateKey(note.createdAt);
    ensureGroup(groups, date).notes.push(note);
  }

  for (const focus of focusSessions) {
    const date = toLocalDateKey(focus.endedAt ?? focus.startedAt);
    ensureGroup(groups, date).focusSessions.push(focus);
  }

  return [...groups.values()].sort((a, b) => b.date.localeCompare(a.date));
}

export function useHistory() {
  const [groups, setGroups] = useState<HistoryDayGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [tasks, notes, focusSessions, reviews] = await Promise.all([
        listTasksForHistory(),
        listNotesForHistory(),
        listFocusSessionsForHistory(),
        listReviewSummaries(),
      ]);
      setGroups(buildGroups(tasks, notes, focusSessions, reviews));
    } catch (err) {
      setError(err instanceof Error ? err.message : "读取历史归档失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  async function removeHistoryItem(kind: "review" | "task" | "note" | "focus", id: string) {
    if (kind === "review") await deleteReviewSummary(id);
    if (kind === "task") await deleteTask(id);
    if (kind === "note") await deleteNote(id);
    if (kind === "focus") await deleteFocusSession(id);
    await reload();
  }

  return { groups, loading, error, reload, removeHistoryItem };
}
