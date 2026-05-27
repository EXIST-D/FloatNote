import type { HistoryDayGroup } from "../../types/domain";

export interface HistoryDaySummary {
  date: string;
  taskCount: number;
  noteCount: number;
  focusSeconds: number;
  preview: string[];
}

export function summarizeHistoryDay(group: HistoryDayGroup): HistoryDaySummary {
  const preview = [
    ...group.tasks.map((task) => task.title),
    ...group.notes.map((note) => note.content),
    ...group.focusSessions.map((session) => session.title),
  ]
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 3);

  return {
    date: group.date,
    taskCount: group.tasks.length,
    noteCount: group.notes.length,
    focusSeconds: group.focusSessions.reduce((total, session) => total + Math.max(0, session.durationSeconds), 0),
    preview,
  };
}
