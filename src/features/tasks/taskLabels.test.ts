import { describe, expect, it } from "vitest";
import {
  DEFAULT_TASK_LABELS,
  canDeleteTaskLabel,
  getDefaultTaskLabel,
  normalizeTaskLabelName,
  taskLabelsToCssVars,
} from "./taskLabels";

describe("taskLabels", () => {
  it("keeps three default labels in stable order", () => {
    expect(DEFAULT_TASK_LABELS.map((label) => [label.name, label.color, label.isDefault])).toEqual([
      ["高优先级", "#c95742", false],
      ["中优先级", "#d6a441", true],
      ["低优先级", "#4f8b6c", false],
    ]);
  });

  it("returns the explicit default label", () => {
    expect(getDefaultTaskLabel(DEFAULT_TASK_LABELS).name).toBe("中优先级");
  });

  it("falls back to first label when no default exists", () => {
    const labels = DEFAULT_TASK_LABELS.map((label) => ({ ...label, isDefault: false }));
    expect(getDefaultTaskLabel(labels).name).toBe("高优先级");
  });

  it("prevents deleting the last label", () => {
    expect(canDeleteTaskLabel({ labelCount: 1, usedTaskCount: 0 })).toEqual({
      allowed: false,
      reason: "至少需要保留一个任务等级标签",
    });
  });

  it("prevents deleting a label used by tasks", () => {
    expect(canDeleteTaskLabel({ labelCount: 3, usedTaskCount: 2 })).toEqual({
      allowed: false,
      reason: "这个标签仍被 2 个任务使用",
    });
  });

  it("exports task label colors as css variables", () => {
    expect(taskLabelsToCssVars(DEFAULT_TASK_LABELS)).toEqual({
      "--task-label-label-high": "#c95742",
      "--task-label-label-medium": "#d6a441",
      "--task-label-label-low": "#4f8b6c",
    });
  });

  it("normalizes empty label names", () => {
    expect(normalizeTaskLabelName("  ")).toBe("未命名标签");
  });
});
