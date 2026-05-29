import { useEffect, useState } from "react";
import { FloatingWindow } from "../components/layout/FloatingWindow";
import { TabBar } from "../components/layout/TabBar";
import { TimerStrip } from "../components/layout/TimerStrip";
import { FloatingFocusView } from "../features/focus/FloatingFocusView";
import { useFocusSession } from "../features/focus/useFocusSession";
import { openDashboardWindow } from "../features/dashboard/useDashboardWindow";
import { FloatingNotesView } from "../features/notes/FloatingNotesView";
import { useSettings } from "../features/settings/useSettings";
import { useGlobalShortcut } from "../features/shortcuts/useGlobalShortcut";
import { FloatingTodayView } from "../features/today/FloatingTodayView";
import { FloatingWeekView } from "../features/week/FloatingWeekView";
import type { AppTab } from "../types/domain";

export function AppShell() {
  const settings = useSettings();
  const [activeTab, setActiveTab] = useState<AppTab>(settings.lastActiveTab);
  const focus = useFocusSession();
  const { shortcutError } = useGlobalShortcut();

  useEffect(() => {
    setActiveTab(settings.lastActiveTab);
  }, [settings.lastActiveTab]);

  function changeTab(tab: AppTab) {
    setActiveTab(tab);
    void settings.setLastActiveTab(tab);
  }

  useEffect(() => {
    function focusLater(selector: string) {
      window.setTimeout(() => {
        const target = document.querySelector<HTMLElement>(selector);
        target?.focus();
      }, 80);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (!(event.ctrlKey || event.metaKey)) return;
      if (event.key.toLowerCase() === "n" && event.shiftKey) {
        event.preventDefault();
        changeTab("notes");
        focusLater("[data-quick-note-input]");
      } else if (event.key.toLowerCase() === "n") {
        event.preventDefault();
        changeTab("today");
        focusLater("[data-quick-task-input]");
      } else if (event.key.toLowerCase() === "f") {
        event.preventDefault();
        void openDashboardWindow("search");
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [settings]);

  return (
    <FloatingWindow
      alwaysOnTop={settings.alwaysOnTop}
      onAlwaysOnTopChange={(value) => void settings.setAlwaysOnTop(value)}
      toastMessage={shortcutError}
      style={settings.floatingAppearanceStyle}
    >
      <TabBar activeTab={activeTab} onChange={changeTab} />
      {focus.session && (
        <TimerStrip
          title={focus.session.title}
          elapsed={focus.elapsedText}
          paused={focus.session.status === "paused"}
          onClick={() => changeTab("focus")}
        />
      )}
      {activeTab === "today" && <FloatingTodayView />}
      {activeTab === "week" && <FloatingWeekView />}
      {activeTab === "notes" && <FloatingNotesView />}
      {activeTab === "focus" && <FloatingFocusView focus={focus} />}
    </FloatingWindow>
  );
}
