import { PhysicalPosition } from "@tauri-apps/api/dpi";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useCallback, useEffect, useState } from "react";
import { getSetting, setSetting } from "../../data/settingsRepository";
import type { AppTab, ThemeName } from "../../types/domain";

function isThemeName(value: string | null): value is ThemeName {
  return value === "paper" || value === "ink" || value === "night";
}

function isAppTab(value: string | null): value is AppTab {
  return value === "today" || value === "week" || value === "notes" || value === "focus" || value === "history";
}

export function useSettings() {
  const [theme, setThemeState] = useState<ThemeName>("paper");
  const [alwaysOnTop, setAlwaysOnTopState] = useState(true);
  const [lastActiveTab, setLastActiveTabState] = useState<AppTab>("today");

  useEffect(() => {
    async function load() {
      const [savedTheme, savedAlwaysOnTop, savedTab, savedPosition] = await Promise.all([
        getSetting("theme"),
        getSetting("always_on_top"),
        getSetting("last_active_tab"),
        getSetting("window_position"),
      ]);

      const nextTheme = isThemeName(savedTheme) ? savedTheme : "paper";
      const nextAlwaysOnTop = savedAlwaysOnTop === null ? true : savedAlwaysOnTop === "true";
      const nextTab = isAppTab(savedTab) ? savedTab : "today";

      setThemeState(nextTheme);
      setAlwaysOnTopState(nextAlwaysOnTop);
      setLastActiveTabState(nextTab);
      document.documentElement.dataset.theme = nextTheme;

      const appWindow = getCurrentWindow();
      await appWindow.setAlwaysOnTop(nextAlwaysOnTop);

      if (savedPosition) {
        const position = JSON.parse(savedPosition) as { x: number; y: number };
        await appWindow.setPosition(new PhysicalPosition(position.x, position.y));
      }
    }

    void load();
  }, []);

  useEffect(() => {
    const appWindow = getCurrentWindow();
    let timeoutId: number | undefined;
    let unlisten: (() => void) | undefined;

    appWindow.onMoved(({ payload }) => {
      if (timeoutId) window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        void setSetting("window_position", JSON.stringify({ x: payload.x, y: payload.y }));
      }, 250);
    }).then((fn) => {
      unlisten = fn;
    });

    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
      unlisten?.();
    };
  }, []);

  const setTheme = useCallback(async (nextTheme: ThemeName) => {
    setThemeState(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    await setSetting("theme", nextTheme);
  }, []);

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
    alwaysOnTop,
    setAlwaysOnTop,
    lastActiveTab,
    setLastActiveTab,
  };
}
