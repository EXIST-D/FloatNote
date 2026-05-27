import { emitTo } from "@tauri-apps/api/event";
import { Window } from "@tauri-apps/api/window";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { setSetting } from "../../data/settingsRepository";
import type { DashboardTab } from "../../types/domain";

export async function openDashboardWindow(page: DashboardTab = "home") {
  await setSetting("dashboard_active_tab", page);
  const dashboard =
    (await Window.getByLabel("dashboard")) ??
    new WebviewWindow("dashboard", {
      title: "浮笺工作台",
      url: "/",
      width: 1100,
      height: 760,
      minWidth: 860,
      minHeight: 560,
      resizable: true,
      decorations: true,
      visible: false,
    });

  await dashboard.show();
  await dashboard.unminimize();
  await dashboard.setFocus();
  await emitTo("dashboard", "dashboard:navigate", page);
}

export async function openFloatingWindow() {
  const floating = await Window.getByLabel("main");
  if (!floating) return;

  await floating.show();
  await floating.unminimize();
  await floating.setFocus();
}
