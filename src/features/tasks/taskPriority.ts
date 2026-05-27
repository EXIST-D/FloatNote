import type { TaskPriority } from "../../types/domain";
import type { CSSProperties } from "react";

export const DEFAULT_PRIORITY_COLORS: Record<TaskPriority, string> = {
  high: "#c95742",
  medium: "#d6a441",
  low: "#4f8b6c",
};

export function isTaskPriority(value: unknown): value is TaskPriority {
  return value === "high" || value === "medium" || value === "low";
}

export function normalizeTaskPriority(value: unknown): TaskPriority {
  return isTaskPriority(value) ? value : "medium";
}

export function getPriorityColor(priority: TaskPriority, colors: Record<TaskPriority, string>) {
  return colors[priority] ?? DEFAULT_PRIORITY_COLORS[priority];
}

export function priorityColorsToCssVars(colors: Record<TaskPriority, string>) {
  return {
    "--priority-high": getPriorityColor("high", colors),
    "--priority-medium": getPriorityColor("medium", colors),
    "--priority-low": getPriorityColor("low", colors),
  } as CSSProperties;
}

export function isPriorityColorMap(value: unknown): value is Record<TaskPriority, string> {
  if (typeof value !== "object" || value === null) return false;
  const map = value as Partial<Record<TaskPriority, unknown>>;
  return ["high", "medium", "low"].every((priority) => typeof map[priority as TaskPriority] === "string");
}
