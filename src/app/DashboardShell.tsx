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
import { RemindersView } from "../features/reminders/RemindersView";
import { useReminderScheduler } from "../features/reminders/useReminderScheduler";
import { ReviewPrompt } from "../features/review/ReviewPrompt";
import { useReviewActions } from "../features/review/useReviewActions";
import { useReviewPrompt } from "../features/review/useReviewPrompt";
import { SearchView } from "../features/search/SearchView";
import { DashboardSettingsView } from "../features/settings/DashboardSettingsView";
import { useSettings } from "../features/settings/useSettings";
import { TodayView } from "../features/today/TodayView";
import { TrashView } from "../features/trash/TrashView";
import { WeekView } from "../features/week/WeekView";
import type { DashboardTab } from "../types/domain";

function isDashboardTab(value: unknown): value is DashboardTab {
  return (
    value === "home" ||
    value === "search" ||
    value === "today" ||
    value === "week" ||
    value === "notes" ||
    value === "focus" ||
    value === "reminders" ||
    value === "history" ||
    value === "trash" ||
    value === "settings"
  );
}

export function DashboardShell() {
  const settings = useSettings({ manageFloatingWindow: false });
  const focus = useFocusSession();
  const reviewActions = useReviewActions();
  const reviewPrompt = useReviewPrompt();
  const [activeTab, setActiveTab] = useState<DashboardTab>("home");
  useReminderScheduler();

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
        changeTab("search");
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <main className="dashboard-shell" data-main-window-style={settings.mainWindowStyle} style={settings.dashboardBackgroundStyle}>
      <DashboardNav activeTab={activeTab} onChange={changeTab} />
      <section className="dashboard-content">
        <ReviewPrompt
          prompt={reviewPrompt.prompt}
          onConfirm={(prompt) => {
            void reviewActions.finishReview(prompt.kind === "yesterday" ? "today" : "week", prompt.periodKey);
            reviewPrompt.dismissPrompt();
          }}
          onDismiss={reviewPrompt.dismissPrompt}
        />
        {reviewActions.message && (
          <button type="button" className="review-toast" onClick={reviewActions.clearMessage}>
            {reviewActions.message}
          </button>
        )}
        {reviewActions.error && <p className="review-error">{reviewActions.error}</p>}
        {activeTab === "home" && <DashboardHome onNavigate={changeTab} heroCopy={settings.dashboardHeroCopy} />}
        {activeTab === "search" && <SearchView onNavigate={changeTab} />}
        {activeTab === "today" && <TodayView />}
        {activeTab === "week" && <WeekView />}
        {activeTab === "notes" && <NotesView />}
        {activeTab === "focus" && <FocusView focus={focus} />}
        {activeTab === "reminders" && <RemindersView />}
        {activeTab === "history" && <HistoryAccordionView />}
        {activeTab === "trash" && <TrashView />}
        {activeTab === "settings" && <DashboardSettingsView settings={settings} />}
      </section>
    </main>
  );
}
