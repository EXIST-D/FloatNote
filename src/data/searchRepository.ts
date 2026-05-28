import type { SearchResult } from "../types/domain";
import { formatDuration } from "../lib/time";
import { getDb } from "./db";

function likeQuery(query: string) {
  return `%${query.trim().replace(/%/g, "\\%").replace(/_/g, "\\_")}%`;
}

function snippet(value: string, query: string) {
  const text = value.replace(/\s+/g, " ").trim();
  const index = text.toLowerCase().indexOf(query.toLowerCase());
  if (index < 0) return text.slice(0, 96);
  return text.slice(Math.max(0, index - 24), index + query.length + 72);
}

export async function searchAll(query: string) {
  const keyword = query.trim();
  if (!keyword) return [];

  const db = await getDb();
  const like = likeQuery(keyword);
  const [tasks, notes, reviews, focus] = await Promise.all([
    db.select<Array<{ id: string; title: string; scope: string; updated_at: string }>>(
      "SELECT id, title, scope, updated_at FROM tasks WHERE status != 'archived' AND title LIKE $1 ESCAPE '\\' ORDER BY updated_at DESC LIMIT 20",
      [like],
    ),
    db.select<Array<{ id: string; content: string; updated_at: string }>>(
      "SELECT id, content, updated_at FROM notes WHERE archived_at IS NULL AND content LIKE $1 ESCAPE '\\' ORDER BY updated_at DESC LIMIT 20",
      [like],
    ),
    db.select<Array<{ id: string; title: string; summary_json: string; updated_at: string }>>(
      "SELECT id, title, summary_json, updated_at FROM review_summaries WHERE title LIKE $1 OR summary_json LIKE $1 ORDER BY updated_at DESC LIMIT 20",
      [like],
    ),
    db.select<Array<{ id: string; title: string; duration_seconds: number; updated_at: string }>>(
      "SELECT id, title, duration_seconds, updated_at FROM focus_sessions WHERE title LIKE $1 ORDER BY updated_at DESC LIMIT 20",
      [like],
    ),
  ]);

  return [
    ...tasks.map((task) => ({
      id: task.id,
      type: "task" as const,
      title: task.scope === "week" ? "本周任务" : "今日任务",
      snippet: snippet(task.title, keyword),
      date: task.updated_at,
      targetTab: task.scope === "week" ? "week" as const : "today" as const,
    })),
    ...notes.map((note) => ({
      id: note.id,
      type: "note" as const,
      title: "灵感",
      snippet: snippet(note.content, keyword),
      date: note.updated_at,
      targetTab: "notes" as const,
    })),
    ...reviews.map((review) => ({
      id: review.id,
      type: "review" as const,
      title: review.title,
      snippet: snippet(review.summary_json, keyword),
      date: review.updated_at,
      targetTab: "history" as const,
    })),
    ...focus.map((session) => ({
      id: session.id,
      type: "focus" as const,
      title: "专注摘要",
      snippet: `${session.title} · ${formatDuration(session.duration_seconds)}`,
      date: session.updated_at,
      targetTab: "focus" as const,
    })),
  ] satisfies SearchResult[];
}
