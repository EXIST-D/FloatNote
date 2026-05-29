import { PhysicalPosition, PhysicalSize } from "@tauri-apps/api/dpi";
import { emit, listen } from "@tauri-apps/api/event";
import { getCurrentWindow, primaryMonitor } from "@tauri-apps/api/window";
import type { CSSProperties } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DEFAULT_DASHBOARD_APPEARANCE,
  DEFAULT_FLOATING_OPACITY,
  DEFAULT_FONT_FAMILY,
  getDashboardAppearance,
  getDashboardHeroCopy,
  getFloatingOpacity,
  getFontFamily,
  getPriorityColors,
  getReviewMode,
  getSetting,
  isWindowPositionSetting,
  isWindowSizeSetting,
  parseJsonSetting,
  setDashboardAppearance as saveDashboardAppearance,
  setDashboardHeroCopy as saveDashboardHeroCopy,
  setFloatingOpacity as saveFloatingOpacity,
  setFontFamily as saveFontFamily,
  setPriorityColors as savePriorityColors,
  setReviewMode as saveReviewMode,
  setSetting,
} from "../../data/settingsRepository";
import type {
  AppTab,
  DashboardAppearanceSetting,
  FontFamilyName,
  ReviewMode,
  TaskPriority,
  ThemeName,
} from "../../types/domain";
import { priorityColorsToCssVars } from "../tasks/taskPriority";

const APPEARANCE_CHANGED_EVENT = "appearance:changed";

interface AppearancePayload {
  theme: ThemeName;
  fontFamily: FontFamilyName;
  floatingOpacity: number;
  priorityColors: Record<TaskPriority, string>;
}

function isThemeName(value: string | null): value is ThemeName {
  return value === "paper" || value === "ink" || value === "night" || value === "book" || value === "reading" || value === "green";
}

function isFontFamilyName(value: unknown): value is FontFamilyName {
  return value === "yahei" || value === "songti" || value === "kaiti" || value === "fangsong";
}

function isAppTab(value: string | null): value is AppTab {
  return value === "today" || value === "week" || value === "notes" || value === "focus";
}

function clampOpacity(value: unknown, min: number, max: number, fallback: number) {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  return Math.min(Math.max(value, min), max);
}

function applyAppearance(
  theme: ThemeName,
  fontFamily: FontFamilyName,
  floatingOpacity: number,
  priorityColors?: Record<TaskPriority, string>,
) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.dataset.fontFamily = fontFamily;
  document.documentElement.style.setProperty("--floating-opacity", String(floatingOpacity));
  document.documentElement.style.setProperty("--paper-alpha", String(floatingOpacity));
  if (priorityColors) {
    const vars = priorityColorsToCssVars(priorityColors);
    for (const [key, value] of Object.entries(vars)) {
      document.documentElement.style.setProperty(key, String(value));
    }
  }
}

function isAppearancePayload(value: unknown): value is AppearancePayload {
  if (typeof value !== "object" || value === null) return false;
  const payload = value as Partial<AppearancePayload>;
  return (
    isThemeName(payload.theme ?? null) &&
    isFontFamilyName(payload.fontFamily) &&
    typeof payload.floatingOpacity === "number" &&
    payload.floatingOpacity >= 0.7 &&
    payload.floatingOpacity <= 1 &&
    typeof payload.priorityColors === "object" &&
    payload.priorityColors !== null
  );
}

async function emitAppearance(payload: AppearancePayload) {
  await emit(APPEARANCE_CHANGED_EVENT, payload);
}

async function clampPositionToWorkArea(position: { x: number; y: number }, size: { width: number; height: number }) {
  const monitor = await primaryMonitor();
  const workArea = monitor?.workArea;
  if (!workArea) return position;

  const minX = workArea.position.x;
  const minY = workArea.position.y;
  const maxX = workArea.position.x + workArea.size.width - size.width;
  const maxY = workArea.position.y + workArea.size.height - size.height;

  return {
    x: Math.min(Math.max(position.x, minX), Math.max(minX, maxX)),
    y: Math.min(Math.max(position.y, minY), Math.max(minY, maxY)),
  };
}

interface UseSettingsOptions {
  manageFloatingWindow?: boolean;
}

export function useSettings({ manageFloatingWindow = true }: UseSettingsOptions = {}) {
  const [theme, setThemeState] = useState<ThemeName>("paper");
  const [fontFamily, setFontFamilyState] = useState<FontFamilyName>(DEFAULT_FONT_FAMILY);
  const [floatingOpacity, setFloatingOpacityState] = useState(DEFAULT_FLOATING_OPACITY);
  const [dashboardAppearance, setDashboardAppearanceState] =
    useState<DashboardAppearanceSetting>(DEFAULT_DASHBOARD_APPEARANCE);
  const [reviewMode, setReviewModeState] = useState<ReviewMode>("manual_with_prompt");
  const [dashboardHeroCopy, setDashboardHeroCopyState] = useState({
    kicker: "今日工作盘",
    title: "把零散任务、灵感和专注时间收在一张桌面上",
  });
  const [priorityColors, setPriorityColorsState] = useState<Record<TaskPriority, string>>({
    high: "#c95742",
    medium: "#d6a441",
    low: "#4f8b6c",
  });
  const [alwaysOnTop, setAlwaysOnTopState] = useState(true);
  const [lastActiveTab, setLastActiveTabState] = useState<AppTab>("today");

  useEffect(() => {
    async function load() {
      const [
        savedTheme,
        savedFontFamily,
        savedFloatingOpacity,
        savedAlwaysOnTop,
        savedTab,
        savedPosition,
        savedSize,
        savedPriorityColors,
        savedReviewMode,
        savedHeroCopy,
        savedDashboardAppearance,
      ] = await Promise.all([
        getSetting("theme"),
        getFontFamily(),
        getFloatingOpacity(),
        getSetting("always_on_top"),
        getSetting("last_active_tab"),
        getSetting("window_position"),
        getSetting("window_size"),
        getPriorityColors(),
        getReviewMode(),
        getDashboardHeroCopy(),
        getDashboardAppearance(),
      ]);

      const nextTheme = isThemeName(savedTheme) ? savedTheme : "paper";
      const nextTab = isAppTab(savedTab) ? savedTab : "today";
      const nextAlwaysOnTop = savedAlwaysOnTop === null ? true : savedAlwaysOnTop === "true";

      setThemeState(nextTheme);
      setFontFamilyState(savedFontFamily);
      setFloatingOpacityState(savedFloatingOpacity);
      setDashboardAppearanceState(savedDashboardAppearance);
      setReviewModeState(savedReviewMode);
      setDashboardHeroCopyState(savedHeroCopy);
      setPriorityColorsState(savedPriorityColors);
      setAlwaysOnTopState(nextAlwaysOnTop);
      setLastActiveTabState(nextTab);
      applyAppearance(nextTheme, savedFontFamily, savedFloatingOpacity, savedPriorityColors);

      if (manageFloatingWindow) {
        const appWindow = getCurrentWindow();
        await appWindow.setAlwaysOnTop(nextAlwaysOnTop);

        const size = parseJsonSetting(savedSize, isWindowSizeSetting) ?? { width: 420, height: 360 };
        if (size) {
          await appWindow.setSize(new PhysicalSize(size.width, size.height));
        }

        const position = parseJsonSetting(savedPosition, isWindowPositionSetting);
        if (position) {
          const safePosition = await clampPositionToWorkArea(position, size);
          await appWindow.setPosition(new PhysicalPosition(safePosition.x, safePosition.y));
        }
      }
    }

    void load();
  }, [manageFloatingWindow]);

  useEffect(() => {
    let unlisten: (() => void) | undefined;

    listen<unknown>(APPEARANCE_CHANGED_EVENT, (event) => {
      if (!isAppearancePayload(event.payload)) return;
      const payload = event.payload;
      setThemeState(payload.theme);
      setFontFamilyState(payload.fontFamily);
      setFloatingOpacityState(payload.floatingOpacity);
      setPriorityColorsState(payload.priorityColors);
      applyAppearance(payload.theme, payload.fontFamily, payload.floatingOpacity, payload.priorityColors);
    }).then((fn) => {
      unlisten = fn;
    });

    return () => unlisten?.();
  }, []);

  useEffect(() => {
    if (!manageFloatingWindow) return;

    const appWindow = getCurrentWindow();
    let moveTimeoutId: number | undefined;
    let resizeTimeoutId: number | undefined;
    let unlistenMoved: (() => void) | undefined;
    let unlistenResized: (() => void) | undefined;

    appWindow.onMoved(({ payload }) => {
      if (moveTimeoutId) window.clearTimeout(moveTimeoutId);
      moveTimeoutId = window.setTimeout(() => {
        void setSetting("window_position", JSON.stringify({ x: payload.x, y: payload.y }));
      }, 300);
    }).then((fn) => {
      unlistenMoved = fn;
    });

    appWindow.onResized(({ payload }) => {
      if (resizeTimeoutId) window.clearTimeout(resizeTimeoutId);
      resizeTimeoutId = window.setTimeout(() => {
        void setSetting("window_size", JSON.stringify({ width: payload.width, height: payload.height }));
      }, 300);
    }).then((fn) => {
      unlistenResized = fn;
    });

    return () => {
      if (moveTimeoutId) window.clearTimeout(moveTimeoutId);
      if (resizeTimeoutId) window.clearTimeout(resizeTimeoutId);
      unlistenMoved?.();
      unlistenResized?.();
    };
  }, [manageFloatingWindow]);

  const setTheme = useCallback(
    async (nextTheme: ThemeName) => {
      setThemeState(nextTheme);
      applyAppearance(nextTheme, fontFamily, floatingOpacity, priorityColors);
      await setSetting("theme", nextTheme);
      await emitAppearance({ theme: nextTheme, fontFamily, floatingOpacity, priorityColors });
    },
    [floatingOpacity, fontFamily, priorityColors],
  );

  const setFontFamily = useCallback(
    async (nextFontFamily: FontFamilyName) => {
      setFontFamilyState(nextFontFamily);
      applyAppearance(theme, nextFontFamily, floatingOpacity, priorityColors);
      await saveFontFamily(nextFontFamily);
      await emitAppearance({ theme, fontFamily: nextFontFamily, floatingOpacity, priorityColors });
    },
    [floatingOpacity, priorityColors, theme],
  );

  const setFloatingOpacity = useCallback(
    async (nextOpacity: number) => {
      const clamped = clampOpacity(nextOpacity, 0.7, 1, DEFAULT_FLOATING_OPACITY);
      setFloatingOpacityState(clamped);
      applyAppearance(theme, fontFamily, clamped, priorityColors);
      await saveFloatingOpacity(clamped);
      await emitAppearance({ theme, fontFamily, floatingOpacity: clamped, priorityColors });
    },
    [fontFamily, priorityColors, theme],
  );

  const setDashboardAppearance = useCallback(async (patch: Partial<DashboardAppearanceSetting>) => {
    const nextAppearance = { ...dashboardAppearance, ...patch };
    setDashboardAppearanceState(nextAppearance);
    await saveDashboardAppearance(nextAppearance);
  }, [dashboardAppearance]);

  const setReviewMode = useCallback(async (nextMode: ReviewMode) => {
    setReviewModeState(nextMode);
    await saveReviewMode(nextMode);
  }, []);

  const setDashboardHeroCopy = useCallback(async (nextCopy: { kicker: string; title: string }) => {
    setDashboardHeroCopyState(nextCopy);
    await saveDashboardHeroCopy(nextCopy);
  }, []);

  const setPriorityColors = useCallback(async (nextColors: Record<TaskPriority, string>) => {
    setPriorityColorsState(nextColors);
    applyAppearance(theme, fontFamily, floatingOpacity, nextColors);
    await savePriorityColors(nextColors);
    await emitAppearance({ theme, fontFamily, floatingOpacity, priorityColors: nextColors });
  }, [floatingOpacity, fontFamily, theme]);

  const setAlwaysOnTop = useCallback(async (nextValue: boolean) => {
    setAlwaysOnTopState(nextValue);
    await getCurrentWindow().setAlwaysOnTop(nextValue);
    await setSetting("always_on_top", String(nextValue));
  }, []);

  const setLastActiveTab = useCallback(async (tab: AppTab) => {
    setLastActiveTabState(tab);
    await setSetting("last_active_tab", tab);
  }, []);

  const resetDashboardAppearance = useCallback(async () => {
    setDashboardAppearanceState(DEFAULT_DASHBOARD_APPEARANCE);
    await saveDashboardAppearance(DEFAULT_DASHBOARD_APPEARANCE);
  }, []);

  const dashboardAppearanceStyle = useMemo(() => {
    const backgroundImage =
      dashboardAppearance.backgroundImageDataUrl && dashboardAppearance.backgroundImageDataUrl.trim()
        ? `url("${dashboardAppearance.backgroundImageDataUrl}")`
        : "none";

    return {
      "--dashboard-base-color": dashboardAppearance.baseColor,
      "--dashboard-accent-color": dashboardAppearance.accentColor,
      "--dashboard-opacity": String(dashboardAppearance.opacity),
      "--dashboard-bg-image": backgroundImage,
      "--dashboard-bg-opacity": backgroundImage === "none" ? "0" : "0.2",
      "--dashboard-bg-dim": backgroundImage === "none" ? "0" : "0.05",
      "--dashboard-bg-blur": "0px",
      "--dashboard-bg-size": dashboardAppearance.backgroundFit === "repeat" ? "auto" : dashboardAppearance.backgroundFit,
      "--dashboard-bg-repeat": dashboardAppearance.backgroundFit === "repeat" ? "repeat" : "no-repeat",
    } as CSSProperties;
  }, [dashboardAppearance]);

  return {
    theme,
    setTheme,
    fontFamily,
    setFontFamily,
    floatingOpacity,
    setFloatingOpacity,
    dashboardAppearance,
    setDashboardAppearance,
    resetDashboardAppearance,
    dashboardAppearanceStyle,
    reviewMode,
    setReviewMode,
    dashboardHeroCopy,
    setDashboardHeroCopy,
    priorityColors,
    setPriorityColors,
    alwaysOnTop,
    setAlwaysOnTop,
    lastActiveTab,
    setLastActiveTab,
  };
}
