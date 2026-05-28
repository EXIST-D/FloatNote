import type { TaskScope, TaskStatus, TrashEntityType, TrashItem } from "../types/domain";
import { getDb } from "./db";

interface TrashRow {
  id: string;
  entity_type: TrashEntityType;
  entity_id: string;
  title: string;
  payload_json: string;
  deleted_at: string;
}

type TrashPayload = Record<string, unknown>;

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

function isRecord(value: unknown): value is TrashPayload {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readRequiredString(payload: TrashPayload, key: string) {
  const value = payload[key];
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`回收站数据缺少字段：${key}`);
  }
  return value;
}

function readOptionalString(payload: TrashPayload, key: string) {
  const value = payload[key];
  return typeof value === "string" ? value : null;
}

function readNumber(payload: TrashPayload, key: string, fallback: number) {
  const value = payload[key];
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function parsePayload(item: TrashItem) {
  try {
    const parsed: unknown = JSON.parse(item.payloadJson);
    if (!isRecord(parsed)) throw new Error("payload is not an object");
    return parsed;
  } catch {
    throw new Error("回收站数据已损坏，无法恢复");
  }
}

function readTaskScope(value: string): TaskScope {
  if (value === "today" || value === "week") return value;
  throw new Error("回收站任务范围无效");
}

function readTaskStatus(value: string): TaskStatus {
  if (value === "active" || value === "done" || value === "archived") return value;
  throw new Error("回收站任务状态无效");
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
  const payload = parsePayload(item);
  const now = new Date().toISOString();

  if (item.entityType === "task") {
    const id = readRequiredString(payload, "id");
    const scope = readTaskScope(readRequiredString(payload, "scope"));
    const title = readRequiredString(payload, "title");
    const status = readTaskStatus(readRequiredString(payload, "status"));
    const priority = readOptionalString(payload, "priority") ?? "medium";

    await db.execute(
      `INSERT OR REPLACE INTO tasks
        (id, scope, title, status, priority, label_id, sort_order, planned_date, week_key, created_at, updated_at, completed_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        id,
        scope,
        title,
        status,
        priority,
        readOptionalString(payload, "label_id"),
        readNumber(payload, "sort_order", 0),
        readOptionalString(payload, "planned_date"),
        readOptionalString(payload, "week_key"),
        readRequiredString(payload, "created_at"),
        now,
        readOptionalString(payload, "completed_at"),
      ],
    );
  }

  if (item.entityType === "note") {
    await db.execute(
      "INSERT OR REPLACE INTO notes (id, content, created_at, updated_at, archived_at) VALUES ($1, $2, $3, $4, $5)",
      [
        readRequiredString(payload, "id"),
        readRequiredString(payload, "content"),
        readRequiredString(payload, "created_at"),
        now,
        readOptionalString(payload, "archived_at"),
      ],
    );
  }

  if (item.entityType === "review") {
    await db.execute(
      `INSERT OR REPLACE INTO review_summaries
        (id, period_type, period_key, title, summary_json, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        readRequiredString(payload, "id"),
        readRequiredString(payload, "period_type"),
        readRequiredString(payload, "period_key"),
        readRequiredString(payload, "title"),
        readRequiredString(payload, "summary_json"),
        readRequiredString(payload, "created_at"),
        now,
      ],
    );
  }

  await deleteTrashItem(item.id);
}
