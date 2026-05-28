import type { Reminder, ReminderStatus, Task, TaskScope } from "../types/domain";
import { getDb } from "./db";

interface ReminderRow {
  id: string;
  task_id: string;
  task_scope: TaskScope;
  task_title: string;
  remind_at: string;
  status: ReminderStatus;
  created_at: string;
  updated_at: string;
  sent_at: string | null;
}

function mapReminder(row: ReminderRow): Reminder {
  return {
    id: row.id,
    taskId: row.task_id,
    taskScope: row.task_scope,
    taskTitle: row.task_title,
    remindAt: row.remind_at,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    sentAt: row.sent_at,
  };
}

export async function createReminder(task: Task, remindAt: string) {
  const db = await getDb();
  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  await db.execute(
    `INSERT INTO reminders (id, task_id, task_scope, task_title, remind_at, status, created_at, updated_at, sent_at)
     VALUES ($1, $2, $3, $4, $5, 'pending', $6, $6, NULL)`,
    [id, task.id, task.scope, task.title, remindAt, now],
  );
  return { id, taskId: task.id, taskScope: task.scope, taskTitle: task.title, remindAt, status: "pending", createdAt: now, updatedAt: now, sentAt: null } satisfies Reminder;
}

export async function listReminders() {
  const db = await getDb();
  const rows = await db.select<ReminderRow[]>("SELECT * FROM reminders ORDER BY status ASC, remind_at ASC");
  return rows.map(mapReminder);
}

export async function listDueReminders(nowIso = new Date().toISOString()) {
  const db = await getDb();
  const rows = await db.select<ReminderRow[]>("SELECT * FROM reminders WHERE status = 'pending' AND remind_at <= $1 ORDER BY remind_at ASC", [nowIso]);
  return rows.map(mapReminder);
}

export async function markReminderSent(id: string) {
  const db = await getDb();
  const now = new Date().toISOString();
  await db.execute("UPDATE reminders SET status = 'sent', sent_at = $1, updated_at = $1 WHERE id = $2", [now, id]);
}

export async function dismissReminder(id: string) {
  const db = await getDb();
  await db.execute("UPDATE reminders SET status = 'dismissed', updated_at = $1 WHERE id = $2", [new Date().toISOString(), id]);
}

export async function deleteReminder(id: string) {
  const db = await getDb();
  await db.execute("DELETE FROM reminders WHERE id = $1", [id]);
}

export async function deleteRemindersForTask(taskId: string) {
  const db = await getDb();
  await db.execute("DELETE FROM reminders WHERE task_id = $1", [taskId]);
}
