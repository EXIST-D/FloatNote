import { useState } from "react";
import { listFocusSessionsForHistory } from "../../data/focusRepository";
import { listRecentNotes } from "../../data/notesRepository";
import { getReviewSummary, upsertReviewSummary } from "../../data/reviewRepository";
import { listTasks } from "../../data/tasksRepository";
import type { TaskScope } from "../../types/domain";
import { buildReviewSnapshot, createReviewTitle, getWeekKey, toLocalDateKey } from "./reviewSummary";

function isInPeriod(iso: string | null, scope: TaskScope, periodKey: string) {
  if (!iso) return false;
  const date = new Date(iso);
  return scope === "today" ? toLocalDateKey(date) === periodKey : getWeekKey(date) === periodKey;
}

export function useReviewActions() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function finishReview(scope: TaskScope, explicitPeriodKey?: string) {
    setError(null);
    const periodType = scope === "today" ? "day" : "week";
    const periodKey = explicitPeriodKey ?? (scope === "today" ? toLocalDateKey() : getWeekKey());
    try {
      const existing = await getReviewSummary(periodType, periodKey);
      if (existing && !window.confirm("已经存在这段周期的复盘总结，是否更新？")) return;

      const [tasks, notes, focusSessions] = await Promise.all([
        listTasks(scope),
        listRecentNotes(scope === "today" ? 50 : 100),
        listFocusSessionsForHistory(),
      ]);
      const snapshot = buildReviewSnapshot({
        tasks,
        notes: notes.filter((note) => isInPeriod(note.createdAt, scope, periodKey)),
        focusSessions: focusSessions.filter((session) => isInPeriod(session.endedAt ?? session.startedAt, scope, periodKey)),
        notePreviewLimit: scope === "today" ? 3 : 5,
      });
      await upsertReviewSummary({
        periodType,
        periodKey,
        title: createReviewTitle(periodType, periodKey),
        snapshot,
      });
      setMessage(scope === "today" ? "今日复盘已写入历史" : "本周复盘已写入历史");
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成复盘失败");
    }
  }

  return { message, error, finishReview, clearMessage: () => setMessage(null) };
}
