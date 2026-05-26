import { PhysicalPosition, PhysicalSize } from "@tauri-apps/api/dpi";
import { getCurrentWindow, primaryMonitor } from "@tauri-apps/api/window";
import { useCallback, useEffect, useState } from "react";
import {
  getSetting,
  isWindowPositionSetting,
  isWindowSizeSetting,
  parseJsonSetting,
  setSetting,
} from "../../data/settingsRepository";
import type { AppTab, FontStyleName, PaperOpacityName, ThemeName } from "../../types/domain";

function isThemeName(value: string | null): value is ThemeName {
  return value === "paper" || value === "ink" || value === "night" || value === "book" || value === "reading" || value === "green";
}

function isFontStyleName(value: string | null): value is FontStyleName {
  return value === "clear" || value === "bookish" || value === "compact";
}

function isPaperOpacityName(value: string | null): value is PaperOpacityName {
  return value === "clear" || value === "soft" || value === "solid";
}

function isAppTab(value: string | null): value is AppTab {
  return value === "today" || value === "week" || value === "notes" || value === "focus" || value === "history";
}

function applyAppearance(theme: ThemeName, fontStyle: FontStyleName, paperOpacity: PaperOpacityName) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.dataset.fontStyle = fontStyle;
  document.documentElement.dataset.paperOpacity = paperOpacity;
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

export function useSettings() {
  const [theme, setThemeState] = useState<ThemeName>("paper");
  const [fontStyle, setFontStyleState] = useState<FontStyleName>("clear");
  const [paperOpacity, setPaperOpacityState] = useState<PaperOpacityName>("solid");
  const [alwaysOnTop, setAlwaysOnTopState] = useState(true);
  const [lastActiveTab, setLastActiveTabState] = useState<AppTab>("today");

  useEffect(() => {
    async function load() {
      const [savedTheme, savedFontStyle, savedPaperOpacity, savedAlwaysOnTop, savedTab, savedPosition, savedSize] = await Promise.all([
        getSetting("theme"),
        getSetting("font_style"),
        getSetting("paper_opacity"),
        getSetting("always_on_top"),
        getSetting("last_active_tab"),
        getSetting("window_position"),
        getSetting("window_size"),
      ]);

      const nextTheme = isThemeName(savedTheme) ? savedTheme : "paper";
      const nextFontStyle = isFontStyleName(savedFontStyle) ? savedFontStyle : "clear";
      const nextPaperOpacity = isPaperOpacityName(savedPaperOpacity) ? savedPaperOpacity : "solid";
      const nextAlwaysOnTop = savedAlwaysOnTop === null ? true : savedAlwaysOnTop === "true";
      const nextTab = isAppTab(savedTab) ? savedTab : "today";

      setThemeState(nextTheme);
      setFontStyleState(nextFontStyle);
      setPaperOpacityState(nextPaperOpacity);
      setAlwaysOnTopState(nextAlwaysOnTop);
      setLastActiveTabState(nextTab);
      applyAppearance(nextTheme, nextFontStyle, nextPaperOpacity);

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

    void load();
  }, []);

  useEffect(() => {
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
  }, []);

  const setTheme = useCallback(
    async (nextTheme: ThemeName) => {
      setThemeState(nextTheme);
      applyAppearance(nextTheme, fontStyle, paperOpacity);
      await setSetting("theme", nextTheme);
    },
    [fontStyle, paperOpacity],
  );

  const setFontStyle = useCallback(
    async (nextFontStyle: FontStyleName) => {
      setFontStyleState(nextFontStyle);
      applyAppearance(theme, nextFontStyle, paperOpacity);
      await setSetting("font_style", nextFontStyle);
    },
    [paperOpacity, theme],
  );

  const setPaperOpacity = useCallback(
    async (nextPaperOpacity: PaperOpacityName) => {
      setPaperOpacityState(nextPaperOpacity);
      applyAppearance(theme, fontStyle, nextPaperOpacity);
      await setSetting("paper_opacity", nextPaperOpacity);
    },
    [fontStyle, theme],
  );

  const setAlwaysOnTop = useCallback(async (nextValue: boolean) => {
    setAlwaysOnTopState(nextValue);
    await getCurrentWindow().setAlwaysOnTop(nextValue);
    await setSetting("always_on_top", String(nextValue));
  }, []);

  const setLastActiveTab = useCallback(async (tab: AppTab) => {
    setLastActiveTabState(tab);
    await setSetting("last_active_tab", tab);
  }, []);

  return {
    theme,
    setTheme,
    fontStyle,
    setFontStyle,
    paperOpacity,
    setPaperOpacity,
    alwaysOnTop,
    setAlwaysOnTop,
    lastActiveTab,
    setLastActiveTab,
  };
}
