import type { FocusSession, FocusStatus } from "../types/domain";
import { getDb } from "./db";

interface FocusRow {
  id: string;
  task_id: string | null;
  title: string;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number;
  status: FocusStatus;
  created_at: string;
  updated_at: string;
}

function mapFocus(row: FocusRow): FocusSession {
  return {
    id: row.id,
    taskId: row.task_id,
    title: row.title,
    startedAt: row.started_at,
    endedAt: row.ended_at,
    durationSeconds: row.duration_seconds,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getActiveFocusSession() {
  const db = await getDb();
  const rows = await db.select<FocusRow[]>(
    "SELECT * FROM focus_sessions WHERE status IN ('running', 'paused') ORDER BY created_at DESC LIMIT 1",
  );
  return rows[0] ? mapFocus(rows[0]) : null;
}

export async function startFocusSession(title: string, taskId: string | null = null) {
  const db = await getDb();
  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  await db.execute(
    "INSERT INTO focus_sessions (id, task_id, title, started_at, ended_at, duration_seconds, status, created_at, updated_at) VALUES ($1, $2, $3, $4, NULL, 0, 'running', $4, $4)",
    [id, taskId, title, now],
  );
  return {
    id,
    taskId,
    title,
    startedAt: now,
    endedAt: null,
    durationSeconds: 0,
    status: "running",
    createdAt: now,
    updatedAt: now,
  } satisfies FocusSession;
}

export async function pauseFocusSession(id: string, durationSeconds: number) {
  const db = await getDb();
  await db.execute("UPDATE focus_sessions SET status = 'paused', duration_seconds = $1, updated_at = $2 WHERE id = $3", [
    durationSeconds,
    new Date().toISOString(),
    id,
  ]);
}

export async function resumeFocusSession(id: string) {
  const db = await getDb();
  await db.execute("UPDATE focus_sessions SET status = 'running', updated_at = $1 WHERE id = $2", [new Date().toISOString(), id]);
}

export async function completeFocusSession(id: string, durationSeconds: number) {
  const db = await getDb();
  const now = new Date().toISOString();
  await db.execute(
    "UPDATE focus_sessions SET status = 'completed', ended_at = $1, duration_seconds = $2, updated_at = $1 WHERE id = $3",
    [now, durationSeconds, id],
  );
}

export async function listFocusSessionsForHistory() {
  const db = await getDb();
  const rows = await db.select<FocusRow[]>(
    "SELECT * FROM focus_sessions WHERE status IN ('completed', 'canceled') ORDER BY COALESCE(ended_at, started_at) DESC",
  );
  return rows.map(mapFocus);
}
