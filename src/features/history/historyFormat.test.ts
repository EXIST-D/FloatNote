import { describe, expect, it } from "vitest";
import type { FocusSession } from "../../types/domain";
import { formatFocusHistorySummary, formatHistoryDateLabel } from "./historyFormat";

describe("formatHistoryDateLabel", () => {
  it("labels today in Chinese while keeping the date", () => {
    expect(formatHistoryDateLabel("2026-05-27", new Date("2026-05-27T12:00:00+08:00"))).toBe("今天 · 2026-05-27");
  });

  it("labels yesterday in Chinese while keeping the date", () => {
    expect(formatHistoryDateLabel("2026-05-26", new Date("2026-05-27T12:00:00+08:00"))).toBe("昨天 · 2026-05-26");
  });

  it("returns the plain date for older groups", () => {
    expect(formatHistoryDateLabel("2026-05-20", new Date("2026-05-27T12:00:00+08:00"))).toBe("2026-05-20");
  });
});

describe("formatFocusHistorySummary", () => {
  const baseSession: FocusSession = {
    id: "focus-1",
    taskId: null,
    title: "整理组会提纲",
    startedAt: "2026-05-27T09:00:00.000Z",
    endedAt: "2026-05-27T09:24:00.000Z",
    durationSeconds: 24 * 60,
    status: "completed",
    createdAt: "2026-05-27T09:00:00.000Z",
    updatedAt: "2026-05-27T09:24:00.000Z",
  };

  it("summarizes completed focus sessions in Chinese", () => {
    expect(formatFocusHistorySummary(baseSession)).toBe("专注 24 分钟 · 整理组会提纲");
  });

  it("uses a default title when focus title is blank", () => {
    expect(formatFocusHistorySummary({ ...baseSession, title: " " })).toBe("专注 24 分钟 · 未命名专注");
  });
});
