import { canDeleteTaskLabel, getDefaultTaskLabel, normalizeTaskLabelName } from "../features/tasks/taskLabels";
import type { TaskLabel } from "../types/domain";
import { getDb } from "./db";

interface TaskLabelRow {
  id: string;
  name: string;
  color: string;
  sort_order: number;
  is_default: number;
  created_at: string;
  updated_at: string;
}

function mapTaskLabel(row: TaskLabelRow): TaskLabel {
  return {
    id: row.id,
    name: row.name,
    color: row.color,
    sortOrder: row.sort_order,
    isDefault: row.is_default === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listTaskLabels() {
  const db = await getDb();
  const rows = await db.select<TaskLabelRow[]>("SELECT * FROM task_labels ORDER BY sort_order ASC, created_at ASC");
  return rows.map(mapTaskLabel);
}

export async function getDefaultTaskLabelFromDb() {
  return getDefaultTaskLabel(await listTaskLabels());
}

export async function createTaskLabel(name = "新标签", color = "#d6a441") {
  const db = await getDb();
  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  const rows = await db.select<Array<{ next_order: number }>>("SELECT COALESCE(MAX(sort_order), 0) + 1 AS next_order FROM task_labels");
  const sortOrder = rows[0]?.next_order ?? 1;

  await db.execute(
    "INSERT INTO task_labels (id, name, color, sort_order, is_default, created_at, updated_at) VALUES ($1, $2, $3, $4, 0, $5, $5)",
    [id, normalizeTaskLabelName(name), color, sortOrder, now],
  );

  return { id, name: normalizeTaskLabelName(name), color, sortOrder, isDefault: false, createdAt: now, updatedAt: now } satisfies TaskLabel;
}

export async function updateTaskLabel(id: string, patch: { name: string; color: string }) {
  const db = await getDb();
  await db.execute("UPDATE task_labels SET name = $1, color = $2, updated_at = $3 WHERE id = $4", [
    normalizeTaskLabelName(patch.name),
    patch.color,
    new Date().toISOString(),
    id,
  ]);
}

export async function setDefaultTaskLabel(id: string) {
  const db = await getDb();
  const now = new Date().toISOString();
  await db.execute("UPDATE task_labels SET is_default = 0, updated_at = $1", [now]);
  await db.execute("UPDATE task_labels SET is_default = 1, updated_at = $1 WHERE id = $2", [now, id]);
}

export async function countTasksUsingLabel(id: string) {
  const db = await getDb();
  const rows = await db.select<Array<{ count: number }>>("SELECT COUNT(*) AS count FROM tasks WHERE label_id = $1", [id]);
  return rows[0]?.count ?? 0;
}

export async function deleteTaskLabel(id: string) {
  const labels = await listTaskLabels();
  const usedTaskCount = await countTasksUsingLabel(id);
  const result = canDeleteTaskLabel({ labelCount: labels.length, usedTaskCount });
  if (!result.allowed) {
    throw new Error(result.reason ?? "无法删除这个标签");
  }

  const db = await getDb();
  await db.execute("DELETE FROM task_labels WHERE id = $1", [id]);

  const remaining = (await listTaskLabels()).sort((a, b) => a.sortOrder - b.sortOrder);
  if (remaining.length > 0 && !remaining.some((label) => label.isDefault)) {
    await setDefaultTaskLabel(remaining[0].id);
  }
}
