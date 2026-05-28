import { formatDuration } from "../lib/time";
import { getDb } from "./db";

export interface ExportSnapshot {
  exportedAt: string;
  tasks: Array<Record<string, unknown>>;
  notes: Array<Record<string, unknown>>;
  focusSessions: Array<Record<string, unknown>>;
  reviewSummaries: Array<Record<string, unknown>>;
  reminders: Array<Record<string, unknown>>;
  settings: Array<Record<string, unknown>>;
}

export async function buildExportSnapshot(): Promise<ExportSnapshot> {
  const db = await getDb();
  const [tasks, notes, focusSessions, reviewSummaries, reminders, settings] = await Promise.all([
    db.select<Array<Record<string, unknown>>>("SELECT * FROM tasks ORDER BY scope ASC, sort_order ASC"),
    db.select<Array<Record<string, unknown>>>("SELECT * FROM notes ORDER BY created_at DESC"),
    db.select<Array<Record<string, unknown>>>("SELECT * FROM focus_sessions ORDER BY started_at DESC"),
    db.select<Array<Record<string, unknown>>>("SELECT * FROM review_summaries ORDER BY updated_at DESC"),
    db.select<Array<Record<string, unknown>>>("SELECT * FROM reminders ORDER BY remind_at ASC"),
    db.select<Array<Record<string, unknown>>>("SELECT * FROM settings ORDER BY key ASC"),
  ]);
  return { exportedAt: new Date().toISOString(), tasks, notes, focusSessions, reviewSummaries, reminders, settings };
}

export function exportSnapshotAsJson(snapshot: ExportSnapshot) {
  return JSON.stringify(snapshot, null, 2);
}

export function exportSnapshotAsMarkdown(snapshot: ExportSnapshot) {
  const lines = [`# 浮笺导出`, "", `导出时间：${snapshot.exportedAt}`, "", "## 任务"];
  for (const task of snapshot.tasks) {
    lines.push(`- [${task.status === "done" ? "x" : " "}] ${task.title}（${task.scope}）`);
  }

  lines.push("", "## 灵感");
  for (const note of snapshot.notes) {
    lines.push("", `### ${String(note.created_at).slice(0, 10)}`, "", String(note.content));
  }

  lines.push("", "## 专注");
  for (const session of snapshot.focusSessions) {
    lines.push(`- ${session.title}：${formatDuration(Number(session.duration_seconds ?? 0))}`);
  }

  lines.push("", "## 历史复盘");
  for (const review of snapshot.reviewSummaries) {
    lines.push("", `### ${review.title}`, "", "```json", String(review.summary_json), "```");
  }

  lines.push("", "## 提醒");
  for (const reminder of snapshot.reminders) {
    lines.push(`- ${reminder.task_title}：${reminder.remind_at}（${reminder.status}）`);
  }

  return `${lines.join("\n")}\n`;
}
