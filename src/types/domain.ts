export type AppTab = "today" | "week" | "notes" | "focus";

export type DashboardTab = "home" | "today" | "week" | "notes" | "focus" | "history" | "settings";

export type ThemeName = "paper" | "ink" | "night" | "book" | "reading" | "green";

export type FontStyleName = "clear" | "bookish" | "compact";

export type PaperOpacityName = "clear" | "soft" | "solid";

export type MainWindowStyle = "desk" | "minimal" | "green";

export type TaskPriority = "high" | "medium" | "low";

export type TaskScope = "today" | "week";

export type TaskStatus = "active" | "done" | "archived";

export interface Task {
  id: string;
  scope: TaskScope;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  sortOrder: number;
  plannedDate: string | null;
  weekKey: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

export interface Note {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
}

export type FocusStatus = "running" | "paused" | "completed" | "canceled";

export interface FocusSession {
  id: string;
  taskId: string | null;
  title: string;
  startedAt: string;
  endedAt: string | null;
  durationSeconds: number;
  status: FocusStatus;
  createdAt: string;
  updatedAt: string;
}

export interface HistoryDayGroup {
  date: string;
  tasks: Task[];
  notes: Note[];
  focusSessions: FocusSession[];
}
