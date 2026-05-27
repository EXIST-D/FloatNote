import { useCallback, useEffect, useState } from "react";
import { listFocusSessionsForHistory } from "../../data/focusRepository";
import { listRecentNotes } from "../../data/notesRepository";
import { listTasks } from "../../data/tasksRepository";
import type { FocusSession, Note, Task } from "../../types/domain";

export interface DashboardSummary {
  todayTasks: Task[];
  weekTasks: Task[];
  notes: Note[];
  focusSessions: FocusSession[];
  todayFocusSeconds: number;
}

function isToday(iso: string | null) {
  if (!iso) return false;
  const date = new Date(iso);
  const now = new Date();
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate();
}

export function useDashboardSummary() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [todayTasks, weekTasks, notes, focusSessions] = await Promise.all([
        listTasks("today"),
        listTasks("week"),
        listRecentNotes(8),
        listFocusSessionsForHistory(),
      ]);
      const todayFocusSeconds = focusSessions
        .filter((session) => isToday(session.endedAt ?? session.startedAt))
        .reduce((total, session) => total + session.durationSeconds, 0);

      setSummary({ todayTasks, weekTasks, notes, focusSessions, todayFocusSeconds });
    } catch (err) {
      setError(err instanceof Error ? err.message : "读取速览失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { summary, loading, error, reload };
}
