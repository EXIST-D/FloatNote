import { getDb } from "./db";
import { DEFAULT_TASK_LABELS, labelIdFromPriority } from "../features/tasks/taskLabels";

export async function initializeSchema() {
  const db = await getDb();

  await db.execute(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      scope TEXT NOT NULL,
      title TEXT NOT NULL,
      status TEXT NOT NULL,
      sort_order INTEGER NOT NULL,
      planned_date TEXT,
      week_key TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      completed_at TEXT
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      archived_at TEXT
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS focus_sessions (
      id TEXT PRIMARY KEY,
      task_id TEXT,
      title TEXT NOT NULL,
      started_at TEXT NOT NULL,
      ended_at TEXT,
      duration_seconds INTEGER NOT NULL,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS task_labels (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      color TEXT NOT NULL,
      sort_order INTEGER NOT NULL,
      is_default INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS review_summaries (
      id TEXT PRIMARY KEY,
      period_type TEXT NOT NULL,
      period_key TEXT NOT NULL,
      title TEXT NOT NULL,
      summary_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  await db.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_review_summaries_period ON review_summaries(period_type, period_key)");

  await db.execute(`
    CREATE TABLE IF NOT EXISTS reminders (
      id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL,
      task_scope TEXT NOT NULL,
      task_title TEXT NOT NULL,
      remind_at TEXT NOT NULL,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      sent_at TEXT
    )
  `);

  await db.execute("CREATE INDEX IF NOT EXISTS idx_reminders_due ON reminders(status, remind_at)");

  await db.execute(`
    CREATE TABLE IF NOT EXISTS trash_items (
      id TEXT PRIMARY KEY,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      title TEXT NOT NULL,
      payload_json TEXT NOT NULL,
      deleted_at TEXT NOT NULL
    )
  `);

  await db.execute("CREATE INDEX IF NOT EXISTS idx_trash_items_deleted_at ON trash_items(deleted_at DESC)");

  const taskColumns = await db.select<Array<{ name: string }>>("PRAGMA table_info(tasks)");
  if (!taskColumns.some((column) => column.name === "priority")) {
    await db.execute("ALTER TABLE tasks ADD COLUMN priority TEXT NOT NULL DEFAULT 'medium'");
  }

  const taskColumnsAfterPriority = await db.select<Array<{ name: string }>>("PRAGMA table_info(tasks)");
  if (!taskColumnsAfterPriority.some((column) => column.name === "label_id")) {
    await db.execute("ALTER TABLE tasks ADD COLUMN label_id TEXT");
  }

  const labelRows = await db.select<Array<{ count: number }>>("SELECT COUNT(*) AS count FROM task_labels");
  if ((labelRows[0]?.count ?? 0) === 0) {
    const now = new Date().toISOString();
    for (const label of DEFAULT_TASK_LABELS) {
      await db.execute(
        "INSERT INTO task_labels (id, name, color, sort_order, is_default, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $6)",
        [label.id, label.name, label.color, label.sortOrder, label.isDefault ? 1 : 0, now],
      );
    }
  }

  await db.execute("UPDATE tasks SET label_id = $1 WHERE label_id IS NULL AND priority = 'high'", [labelIdFromPriority("high")]);
  await db.execute("UPDATE tasks SET label_id = $1 WHERE label_id IS NULL AND priority = 'medium'", [labelIdFromPriority("medium")]);
  await db.execute("UPDATE tasks SET label_id = $1 WHERE label_id IS NULL AND priority = 'low'", [labelIdFromPriority("low")]);
  await db.execute("UPDATE tasks SET label_id = $1 WHERE label_id IS NULL", [labelIdFromPriority("medium")]);
}
