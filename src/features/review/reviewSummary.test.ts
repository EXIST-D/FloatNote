import { describe, expect, it } from "vitest";
import type { FocusSession, Note, Task, TaskLabel } from "../../types/domain";
import { buildReviewSnapshot, createReviewTitle, getWeekKey, toLocalDateKey } from "./reviewSummary";

const label: TaskLabel = {
  id: "label-medium",
  name: "中优先级",
  color: "#d6a441",
  sortOrder: 2,
  isDefault: true,
  createdAt: "2026-05-27T00:00:00.000Z",
  updatedAt: "2026-05-27T00:00:00.000Z",
};

function task(id: string, title: string, status: Task["status"]): Task {
  return {
    id,
    scope: "today",
    title,
    status,
    priority: "medium",
    labelId: label.id,
    label,
    sortOrder: 1,
    plannedDate: "2026-05-27",
    weekKey: null,
    createdAt: "2026-05-27T08:00:00.000Z",
    updatedAt: "2026-05-27T09:00:00.000Z",
    completedAt: status === "done" ? "2026-05-27T10:00:00.000Z" : null,
  };
}

function note(id: string, content: string): Note {
  return { id, content, createdAt: "2026-05-27T11:00:00.000Z", updatedAt: "2026-05-27T11:00:00.000Z", archivedAt: null };
}

function focus(id: string, durationSeconds: number): FocusSession {
  return {
    id,
    taskId: null,
    title: id,
    startedAt: "2026-05-27T12:00:00.000Z",
    endedAt: "2026-05-27T13:00:00.000Z",
    durationSeconds,
    status: "completed",
    createdAt: "2026-05-27T12:00:00.000Z",
    updatedAt: "2026-05-27T13:00:00.000Z",
  };
}

describe("reviewSummary", () => {
  it("builds a snapshot with completed tasks, unfinished tasks, notes and focus duration", () => {
    const snapshot = buildReviewSnapshot({
      tasks: [task("a", "写方案", "done"), task("b", "整理数据", "active")],
      notes: [
        note("n1", "第一个灵感"),
        note("n2", "第二个灵感"),
        note("n3", "第三个灵感"),
        note("n4", "第四个灵感"),
      ],
      focusSessions: [focus("论文阅读", 1800), focus("代码整理", 600)],
      notePreviewLimit: 3,
    });

    expect(snapshot).toEqual({
      completedTasks: [{ id: "a", title: "写方案", labelName: "中优先级" }],
      unfinishedTasks: [{ id: "b", title: "整理数据", labelName: "中优先级" }],
      noteCount: 4,
      notePreviews: ["第一个灵感", "第二个灵感", "第三个灵感"],
      focusSeconds: 2400,
    });
  });

  it("creates day and week review titles", () => {
    expect(createReviewTitle("day", "2026-05-27")).toBe("今日复盘 · 2026-05-27");
    expect(createReviewTitle("week", "2026-W22")).toBe("本周复盘 · 2026-W22");
  });

  it("formats local date and week keys", () => {
    const date = new Date(2026, 4, 27, 8, 0, 0);
    expect(toLocalDateKey(date)).toBe("2026-05-27");
    expect(getWeekKey(date)).toMatch(/^2026-W\d{2}$/);
  });
});
