import { getDb } from "./db";
import type { MainWindowStyle, TaskPriority } from "../types/domain";
import { DEFAULT_PRIORITY_COLORS, isPriorityColorMap } from "../features/tasks/taskPriority";

export interface WindowPositionSetting {
  x: number;
  y: number;
}

export interface WindowSizeSetting {
  width: number;
  height: number;
}

export interface WindowBoundsSetting extends WindowPositionSetting, WindowSizeSetting {}

export async function getSetting(key: string) {
  const db = await getDb();
  const rows = await db.select<Array<{ value: string }>>("SELECT value FROM settings WHERE key = $1", [key]);
  return rows[0]?.value ?? null;
}

export async function setSetting(key: string, value: string) {
  const db = await getDb();
  await db.execute(
    "INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
    [key, value],
  );
}

export function parseJsonSetting<T>(value: string | null, guard: (parsed: unknown) => parsed is T) {
  if (!value) return null;

  try {
    const parsed: unknown = JSON.parse(value);
    return guard(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function isWindowPositionSetting(value: unknown): value is WindowPositionSetting {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as Partial<WindowPositionSetting>).x === "number" &&
    typeof (value as Partial<WindowPositionSetting>).y === "number"
  );
}

export function isWindowSizeSetting(value: unknown): value is WindowSizeSetting {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as Partial<WindowSizeSetting>).width === "number" &&
    typeof (value as Partial<WindowSizeSetting>).height === "number" &&
    (value as WindowSizeSetting).width >= 320 &&
    (value as WindowSizeSetting).height >= 260
  );
}

export function isWindowBoundsSetting(value: unknown): value is WindowBoundsSetting {
  return isWindowPositionSetting(value) && isWindowSizeSetting(value);
}

export function isMainWindowStyle(value: string | null): value is MainWindowStyle {
  return value === "desk" || value === "minimal" || value === "green";
}

export async function getPriorityColors() {
  return parseJsonSetting(await getSetting("priority_colors"), isPriorityColorMap) ?? DEFAULT_PRIORITY_COLORS;
}

export async function setPriorityColors(colors: Record<TaskPriority, string>) {
  await setSetting("priority_colors", JSON.stringify(colors));
}
