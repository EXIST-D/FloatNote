import type { CSSProperties } from "react";
import type { TaskLabel } from "../../types/domain";

const defaultTimestamp = "2026-05-27T00:00:00.000Z";

export const DEFAULT_TASK_LABELS: TaskLabel[] = [
  {
    id: "label-high",
    name: "高优先级",
    color: "#c95742",
    sortOrder: 1,
    isDefault: false,
    createdAt: defaultTimestamp,
    updatedAt: defaultTimestamp,
  },
  {
    id: "label-medium",
    name: "中优先级",
    color: "#d6a441",
    sortOrder: 2,
    isDefault: true,
    createdAt: defaultTimestamp,
    updatedAt: defaultTimestamp,
  },
  {
    id: "label-low",
    name: "低优先级",
    color: "#4f8b6c",
    sortOrder: 3,
    isDefault: false,
    createdAt: defaultTimestamp,
    updatedAt: defaultTimestamp,
  },
];

export function getDefaultTaskLabel(labels: TaskLabel[]) {
  return labels.find((label) => label.isDefault) ?? labels[0] ?? DEFAULT_TASK_LABELS[1];
}

export function normalizeTaskLabelName(name: string) {
  const trimmed = name.trim();
  return trimmed || "未命名标签";
}

export function canDeleteTaskLabel({ labelCount, usedTaskCount }: { labelCount: number; usedTaskCount: number }) {
  if (labelCount <= 1) {
    return { allowed: false, reason: "至少需要保留一个任务等级标签" };
  }

  if (usedTaskCount > 0) {
    return { allowed: false, reason: `这个标签仍被 ${usedTaskCount} 个任务使用` };
  }

  return { allowed: true, reason: null };
}

export function taskLabelsToCssVars(labels: TaskLabel[]) {
  return Object.fromEntries(labels.map((label) => [`--task-label-${label.id}`, label.color])) as CSSProperties;
}

export function labelIdFromPriority(priority: string | null | undefined) {
  if (priority === "high") return "label-high";
  if (priority === "low") return "label-low";
  return "label-medium";
}
