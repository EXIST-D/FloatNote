import { getCurrentWindow } from "@tauri-apps/api/window";
import { LayoutDashboard, Minus, Pin, Settings, X } from "lucide-react";
import type { ReactNode } from "react";
import { openDashboardWindow } from "../../features/dashboard/useDashboardWindow";
import { IconButton } from "../common/IconButton";
import { Toast } from "../common/Toast";

interface FloatingWindowProps {
  children: ReactNode;
  alwaysOnTop: boolean;
  onAlwaysOnTopChange: (value: boolean) => void;
  toastMessage?: string | null;
}

export function FloatingWindow({
  children,
  alwaysOnTop,
  onAlwaysOnTopChange,
  toastMessage = null,
}: FloatingWindowProps) {
  return (
    <main className="h-screen w-screen overflow-hidden bg-transparent p-0">
      <section className="note-shell relative flex h-full w-full flex-col overflow-hidden text-[var(--text-main)]">
        <header data-tauri-drag-region className="note-titlebar flex h-9 shrink-0 items-center justify-between px-3">
          <h1 data-tauri-drag-region className="min-w-0 truncate text-sm font-semibold tracking-normal">
            浮笺
          </h1>
          <div className="flex items-center gap-1">
            <IconButton
              label={alwaysOnTop ? "取消置顶" : "置顶"}
              className={alwaysOnTop ? "text-[var(--accent)]" : ""}
              onClick={() => onAlwaysOnTopChange(!alwaysOnTop)}
            >
              <Pin size={15} fill={alwaysOnTop ? "currentColor" : "none"} />
            </IconButton>
            <IconButton label="打开主窗口" onClick={() => void openDashboardWindow("home")}>
              <LayoutDashboard size={15} />
            </IconButton>
            <IconButton label="设置" onClick={() => void openDashboardWindow("settings")}>
              <Settings size={15} />
            </IconButton>
            <IconButton label="隐藏" onClick={() => void getCurrentWindow().hide()}>
              <Minus size={15} />
            </IconButton>
            <IconButton label="隐藏到托盘" onClick={() => void getCurrentWindow().hide()}>
              <X size={15} />
            </IconButton>
          </div>
        </header>
        {children}
        <Toast message={toastMessage} />
      </section>
    </main>
  );
}
