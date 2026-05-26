import Database from "@tauri-apps/plugin-sql";

let database: Database | null = null;

export async function getDb() {
  if (!database) {
    database = await Database.load("sqlite:desk-note.db");
  }

  return database;
}
