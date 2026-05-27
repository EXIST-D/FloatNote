import type { FocusSession, Note, ReviewPeriodType, Task } from "../../types/domain";

export function buildReviewSnapshot({
  tasks,
  notes,
  focusSessions,
  notePreviewLimit,
}: {
  tasks: Task[];
  notes: Note[];
  focusSessions: FocusSession[];
  notePreviewLimit: number;
}) {
  return {
    completedTasks: tasks
      .filter((task) => task.status === "done")
      .map((task) => ({ id: task.id, title: task.title, labelName: task.label?.name ?? null })),
    unfinishedTasks: tasks
      .filter((task) => task.status !== "done" && task.status !== "archived")
      .map((task) => ({ id: task.id, title: task.title, labelName: task.label?.name ?? null })),
    noteCount: notes.length,
    notePreviews: notes
      .map((note) => note.content.trim())
      .filter(Boolean)
      .slice(0, notePreviewLimit),
    focusSeconds: focusSessions.reduce((total, session) => total + Math.max(0, session.durationSeconds), 0),
  };
}

export function createReviewTitle(periodType: ReviewPeriodType, periodKey: string) {
  return `${periodType === "day" ? "今日复盘" : "本周复盘"} · ${periodKey}`;
}

export function toLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getWeekKey(date = new Date()) {
  const firstDay = new Date(date.getFullYear(), 0, 1);
  const dayOffset = Math.floor((date.getTime() - firstDay.getTime()) / 86400000);
  const week = Math.ceil((dayOffset + firstDay.getDay() + 1) / 7);
  return `${date.getFullYear()}-W${String(week).padStart(2, "0")}`;
}

export function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}
