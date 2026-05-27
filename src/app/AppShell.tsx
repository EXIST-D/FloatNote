import { useEffect, useState } from "react";
import { FloatingWindow } from "../components/layout/FloatingWindow";
import { TabBar } from "../components/layout/TabBar";
import { TimerStrip } from "../components/layout/TimerStrip";
import { FocusView } from "../features/focus/FocusView";
import { useFocusSession } from "../features/focus/useFocusSession";
import { NotesView } from "../features/notes/NotesView";
import { useSettings } from "../features/settings/useSettings";
import { useGlobalShortcut } from "../features/shortcuts/useGlobalShortcut";
import { TodayView } from "../features/today/TodayView";
import { WeekView } from "../features/week/WeekView";
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

  return (
    <FloatingWindow
      alwaysOnTop={settings.alwaysOnTop}
      onAlwaysOnTopChange={(value) => void settings.setAlwaysOnTop(value)}
      toastMessage={shortcutError}
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
      {activeTab === "today" && <TodayView />}
      {activeTab === "week" && <WeekView />}
      {activeTab === "notes" && <NotesView />}
      {activeTab === "focus" && <FocusView focus={focus} />}
    </FloatingWindow>
  );
}
