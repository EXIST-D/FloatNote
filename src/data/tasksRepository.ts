import type { Task, TaskScope, TaskStatus } from "../types/domain";
import { getDb } from "./db";

interface TaskRow {
  id: string;
  scope: TaskScope;
  title: string;
  status: TaskStatus;
  sort_order: number;
  planned_date: string | null;
  week_key: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

function mapTask(row: TaskRow): Task {
  return {
    id: row.id,
    scope: row.scope,
    title: row.title,
    status: row.status,
    sortOrder: row.sort_order,
    plannedDate: row.planned_date,
    weekKey: row.week_key,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    completedAt: row.completed_at,
  };
}

export async function listTasks(scope: TaskScope) {
  const db = await getDb();
  const rows = await db.select<TaskRow[]>(
    "SELECT * FROM tasks WHERE scope = $1 AND status != 'archived' ORDER BY status ASC, sort_order ASC, created_at ASC",
    [scope],
  );
  return rows.map(mapTask);
}

export async function createTask(scope: TaskScope, title: string) {
  const db = await getDb();
  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  const sortOrderRows = await db.select<Array<{ next_order: number | null }>>(
    "SELECT COALESCE(MAX(sort_order), 0) + 1 AS next_order FROM tasks WHERE scope = $1",
    [scope],
  );
  const sortOrder = sortOrderRows[0]?.next_order ?? 1;

  await db.execute(
    "INSERT INTO tasks (id, scope, title, status, sort_order, planned_date, week_key, created_at, updated_at, completed_at) VALUES ($1, $2, $3, 'active', $4, $5, $6, $7, $7, NULL)",
    [id, scope, title, sortOrder, scope === "today" ? now.slice(0, 10) : null, scope === "week" ? getWeekKey() : null, now],
  );

  return {
    id,
    scope,
    title,
    status: "active",
    sortOrder,
    plannedDate: scope === "today" ? now.slice(0, 10) : null,
    weekKey: scope === "week" ? getWeekKey() : null,
    createdAt: now,
    updatedAt: now,
    completedAt: null,
  } satisfies Task;
}

export async function updateTaskTitle(id: string, title: string) {
  const db = await getDb();
  await db.execute("UPDATE tasks SET title = $1, updated_at = $2 WHERE id = $3", [title, new Date().toISOString(), id]);
}

export async function completeTask(id: string) {
  const db = await getDb();
  const now = new Date().toISOString();
  await db.execute("UPDATE tasks SET status = 'done', completed_at = $1, updated_at = $1 WHERE id = $2", [now, id]);
}

export async function deleteTask(id: string) {
  const db = await getDb();
  await db.execute("DELETE FROM tasks WHERE id = $1", [id]);
}

export async function listTasksForHistory() {
  const db = await getDb();
  const rows = await db.select<TaskRow[]>("SELECT * FROM tasks ORDER BY COALESCE(completed_at, created_at) DESC");
  return rows.map(mapTask);
}

function getWeekKey() {
  const date = new Date();
  const yearStart = new Date(date.getFullYear(), 0, 1);
  const dayOffset = Math.floor((date.getTime() - yearStart.getTime()) / 86400000);
  const week = Math.ceil((dayOffset + yearStart.getDay() + 1) / 7);
  return `${date.getFullYear()}-W${String(week).padStart(2, "0")}`;
}
