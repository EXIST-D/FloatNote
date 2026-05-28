import type { Note } from "../types/domain";
import { getDb } from "./db";
import { addTrashItem } from "./trashRepository";

interface NoteRow {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
}

function mapNote(row: NoteRow): Note {
  return {
    id: row.id,
    content: row.content,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    archivedAt: row.archived_at,
  };
}

export async function listRecentNotes(limit = 20) {
  const db = await getDb();
  const rows = await db.select<NoteRow[]>(
    "SELECT * FROM notes WHERE archived_at IS NULL ORDER BY created_at DESC LIMIT $1",
    [limit],
  );
  return rows.map(mapNote);
}

export async function createNote(content: string) {
  const db = await getDb();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  await db.execute("INSERT INTO notes (id, content, created_at, updated_at, archived_at) VALUES ($1, $2, $3, $3, NULL)", [
    id,
    content,
    now,
  ]);
  return { id, content, createdAt: now, updatedAt: now, archivedAt: null } satisfies Note;
}

export async function updateNote(id: string, content: string) {
  const db = await getDb();
  await db.execute("UPDATE notes SET content = $1, updated_at = $2 WHERE id = $3", [content, new Date().toISOString(), id]);
}

export async function deleteNote(id: string) {
  const db = await getDb();
  const rows = await db.select<Array<Record<string, unknown>>>("SELECT * FROM notes WHERE id = $1 LIMIT 1", [id]);
  const row = rows[0];
  if (row) {
    await addTrashItem({ entityType: "note", entityId: id, title: String(row.content ?? "灵感").slice(0, 48), payload: row });
  }
  await db.execute("DELETE FROM notes WHERE id = $1", [id]);
}

export async function listNotesForHistory() {
  const db = await getDb();
  const rows = await db.select<NoteRow[]>("SELECT * FROM notes ORDER BY created_at DESC");
  return rows.map(mapNote);
}
