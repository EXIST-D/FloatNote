import type { TrashEntityType, TrashItem } from "../types/domain";
import { getDb } from "./db";

interface TrashRow {
  id: string;
  entity_type: TrashEntityType;
  entity_id: string;
  title: string;
  payload_json: string;
  deleted_at: string;
}

function mapTrash(row: TrashRow): TrashItem {
  return {
    id: row.id,
    entityType: row.entity_type,
    entityId: row.entity_id,
    title: row.title,
    payloadJson: row.payload_json,
    deletedAt: row.deleted_at,
  };
}

export async function addTrashItem(input: { entityType: TrashEntityType; entityId: string; title: string; payload: unknown }) {
  const db = await getDb();
  await db.execute(
    "INSERT INTO trash_items (id, entity_type, entity_id, title, payload_json, deleted_at) VALUES ($1, $2, $3, $4, $5, $6)",
    [crypto.randomUUID(), input.entityType, input.entityId, input.title, JSON.stringify(input.payload), new Date().toISOString()],
  );
}

export async function listTrashItems() {
  const db = await getDb();
  const rows = await db.select<TrashRow[]>("SELECT * FROM trash_items ORDER BY deleted_at DESC");
  return rows.map(mapTrash);
}

export async function deleteTrashItem(id: string) {
  const db = await getDb();
  await db.execute("DELETE FROM trash_items WHERE id = $1", [id]);
}

export async function clearTrashItems() {
  const db = await getDb();
  await db.execute("DELETE FROM trash_items");
}

export async function restoreTrashItem(item: TrashItem) {
  const db = await getDb();
  const payload = JSON.parse(item.payloadJson) as Record<string, unknown>;

  if (item.entityType === "task") {
    await db.execute(
      `INSERT OR REPLACE INTO tasks
        (id, scope, title, status, priority, label_id, sort_order, planned_date, week_key, created_at, updated_at, completed_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        payload.id,
        payload.scope,
        payload.title,
        payload.status,
        payload.priority ?? "medium",
        payload.label_id ?? null,
        payload.sort_order ?? 0,
        payload.planned_date ?? null,
        payload.week_key ?? null,
        payload.created_at,
        new Date().toISOString(),
        payload.completed_at ?? null,
      ],
    );
  }

  if (item.entityType === "note") {
    await db.execute(
      "INSERT OR REPLACE INTO notes (id, content, created_at, updated_at, archived_at) VALUES ($1, $2, $3, $4, $5)",
      [payload.id, payload.content, payload.created_at, new Date().toISOString(), payload.archived_at ?? null],
    );
  }

  if (item.entityType === "review") {
    await db.execute(
      `INSERT OR REPLACE INTO review_summaries
        (id, period_type, period_key, title, summary_json, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [payload.id, payload.period_type, payload.period_key, payload.title, payload.summary_json, payload.created_at, new Date().toISOString()],
    );
  }

  await deleteTrashItem(item.id);
}
