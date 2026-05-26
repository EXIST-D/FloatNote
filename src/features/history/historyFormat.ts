import type { FocusSession } from "../../types/domain";

function toLocalDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function formatFocusDuration(seconds: number) {
  const safeSeconds = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(safeSeconds / 60);

  if (minutes <= 0) return "不足 1 分钟";
  if (minutes < 60) return `${minutes} 分钟`;

  const hours = Math.floor(minutes / 60);
  const restMinutes = minutes % 60;
  return restMinutes > 0 ? `${hours} 小时 ${restMinutes} 分钟` : `${hours} 小时`;
}

export function formatHistoryDateLabel(dateKey: string, now = new Date()) {
  const today = toLocalDateKey(now);
  const yesterday = toLocalDateKey(addDays(now, -1));

  if (dateKey === today) return `今天 · ${dateKey}`;
  if (dateKey === yesterday) return `昨天 · ${dateKey}`;
  return dateKey;
}

export function formatFocusHistorySummary(session: FocusSession) {
  const title = session.title.trim() || "未命名专注";
  return `专注 ${formatFocusDuration(session.durationSeconds)} · ${title}`;
}
