import { emitTo } from "@tauri-apps/api/event";
import { Window } from "@tauri-apps/api/window";
import { setSetting } from "../../data/settingsRepository";
import type { DashboardTab } from "../../types/domain";

export async function openDashboardWindow(page: DashboardTab = "home") {
  await setSetting("dashboard_active_tab", page);
  const dashboard = await Window.getByLabel("dashboard");
  if (!dashboard) return;

  await dashboard.show();
  await dashboard.unminimize();
  await dashboard.setFocus();
  await emitTo("dashboard", "dashboard:navigate", page);
}
