import { listen } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useEffect, useState } from "react";
import { getSetting, setSetting } from "../data/settingsRepository";
import { DashboardHome } from "../features/dashboard/DashboardHome";
import { DashboardNav } from "../features/dashboard/DashboardNav";
import { FocusView } from "../features/focus/FocusView";
import { useFocusSession } from "../features/focus/useFocusSession";
import { HistoryAccordionView } from "../features/history/HistoryAccordionView";
import { NotesView } from "../features/notes/NotesView";
import { DashboardSettingsView } from "../features/settings/DashboardSettingsView";
import { useSettings } from "../features/settings/useSettings";
import { TodayView } from "../features/today/TodayView";
import { WeekView } from "../features/week/WeekView";
import type { DashboardTab } from "../types/domain";

function isDashboardTab(value: unknown): value is DashboardTab {
  return value === "home" || value === "today" || value === "week" || value === "notes" || value === "focus" || value === "history" || value === "settings";
}

export function DashboardShell() {
  const settings = useSettings({ manageFloatingWindow: false });
  const focus = useFocusSession();
  const [activeTab, setActiveTab] = useState<DashboardTab>("home");

  useEffect(() => {
    const appWindow = getCurrentWindow();
    let unlistenClose: (() => void) | undefined;
    appWindow.onCloseRequested((event) => {
      event.preventDefault();
      void appWindow.hide();
    }).then((fn) => {
      unlistenClose = fn;
    });

    void getSetting("dashboard_active_tab").then((value) => {
      if (isDashboardTab(value)) setActiveTab(value);
    });

    let unlisten: (() => void) | undefined;
    listen<DashboardTab>("dashboard:navigate", (event) => {
      if (isDashboardTab(event.payload)) setActiveTab(event.payload);
    }).then((fn) => {
      unlisten = fn;
    });
    return () => {
      unlisten?.();
      unlistenClose?.();
    };
  }, []);

  function changeTab(tab: DashboardTab) {
    setActiveTab(tab);
    void setSetting("dashboard_active_tab", tab);
  }

  return (
    <main className="dashboard-shell" data-main-window-style={settings.mainWindowStyle}>
      <DashboardNav activeTab={activeTab} onChange={changeTab} />
      <section className="dashboard-content">
        {activeTab === "home" && <DashboardHome onNavigate={changeTab} />}
        {activeTab === "today" && <TodayView />}
        {activeTab === "week" && <WeekView />}
        {activeTab === "notes" && <NotesView />}
        {activeTab === "focus" && <FocusView focus={focus} />}
        {activeTab === "history" && <HistoryAccordionView />}
        {activeTab === "settings" && <DashboardSettingsView settings={settings} />}
      </section>
    </main>
  );
}
