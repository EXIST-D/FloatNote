import { getDb } from "./db";
import type { MainWindowStyle, ReviewMode, TaskPriority } from "../types/domain";
import { DEFAULT_PRIORITY_COLORS, isPriorityColorMap } from "../features/tasks/taskPriority";

export const DEFAULT_DASHBOARD_HERO_KICKER = "今日工作盘";
export const DEFAULT_DASHBOARD_HERO_TITLE = "把零散任务、灵感和专注时间收在一张桌面上";

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

export function isReviewMode(value: string | null): value is ReviewMode {
  return value === "manual_with_prompt" || value === "manual_only";
}

export async function getReviewMode() {
  const saved = await getSetting("review_mode");
  return isReviewMode(saved) ? saved : "manual_with_prompt";
}

export async function setReviewMode(mode: ReviewMode) {
  await setSetting("review_mode", mode);
}

export async function getDashboardHeroCopy() {
  const [kicker, title] = await Promise.all([getSetting("dashboard_hero_kicker"), getSetting("dashboard_hero_title")]);
  return {
    kicker: kicker?.trim() || DEFAULT_DASHBOARD_HERO_KICKER,
    title: title?.trim() || DEFAULT_DASHBOARD_HERO_TITLE,
  };
}

export async function setDashboardHeroCopy(copy: { kicker: string; title: string }) {
  await Promise.all([
    setSetting("dashboard_hero_kicker", copy.kicker.trim() || DEFAULT_DASHBOARD_HERO_KICKER),
    setSetting("dashboard_hero_title", copy.title.trim() || DEFAULT_DASHBOARD_HERO_TITLE),
  ]);
}
