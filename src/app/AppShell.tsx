import { useState } from "react";
import { FloatingWindow } from "../components/layout/FloatingWindow";
import { TabBar } from "../components/layout/TabBar";
import { TimerStrip } from "../components/layout/TimerStrip";
import { FocusView } from "../features/focus/FocusView";
import { HistoryView } from "../features/history/HistoryView";
import { NotesView } from "../features/notes/NotesView";
import { TodayView } from "../features/today/TodayView";
import { WeekView } from "../features/week/WeekView";
import type { AppTab } from "../types/domain";

export function AppShell() {
  const [activeTab, setActiveTab] = useState<AppTab>("today");
  const hasFocusSession = true;

  return (
    <FloatingWindow>
      <TabBar activeTab={activeTab} onChange={setActiveTab} />
      {hasFocusSession && (
        <TimerStrip title="整理组会提纲" elapsed="18:42" onClick={() => setActiveTab("focus")} />
      )}
      {activeTab === "today" && <TodayView />}
      {activeTab === "week" && <WeekView />}
      {activeTab === "notes" && <NotesView />}
      {activeTab === "focus" && <FocusView />}
      {activeTab === "history" && <HistoryView />}
    </FloatingWindow>
  );
}
