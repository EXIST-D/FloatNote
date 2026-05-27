import { describe, expect, it } from "vitest";
import type { FocusSession, HistoryDayGroup, Note, Task } from "../../types/domain";
import { summarizeHistoryDay } from "./historySummary";

const now = "2026-05-27T09:00:00.000Z";
const label = {
  id: "label-medium",
  name: "中优先级",
  color: "#d6a441",
  sortOrder: 2,
  isDefault: true,
  createdAt: now,
  updatedAt: now,
};

function task(title: string): Task {
  return {
    id: title,
    scope: "today",
    title,
    status: "done",
    priority: "medium",
    labelId: label.id,
    label,
    sortOrder: 1,
    plannedDate: "2026-05-27",
    weekKey: null,
    createdAt: now,
    updatedAt: now,
    completedAt: now,
  };
}

function note(content: string): Note {
  return { id: content, content, createdAt: now, updatedAt: now, archivedAt: null };
}

function focus(title: string, durationSeconds: number): FocusSession {
  return {
    id: title,
    taskId: null,
    title,
    startedAt: now,
    endedAt: now,
    durationSeconds,
    status: "completed",
    createdAt: now,
    updatedAt: now,
  };
}

describe("summarizeHistoryDay", () => {
  it("counts records and focus duration", () => {
    const group: HistoryDayGroup = {
      date: "2026-05-27",
      reviews: [],
      tasks: [task("写方案")],
      notes: [note("一个新点子")],
      focusSessions: [focus("论文阅读", 1800), focus("代码整理", 600)],
    };

    expect(summarizeHistoryDay(group)).toEqual({
      date: "2026-05-27",
      reviewCount: 0,
      taskCount: 1,
      noteCount: 1,
      focusSeconds: 2400,
      preview: ["写方案", "一个新点子", "论文阅读"],
    });
  });
});
