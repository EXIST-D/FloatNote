import { getCurrentWindow } from "@tauri-apps/api/window";
import { LayoutDashboard, Minus, Pin, Settings, X } from "lucide-react";
import type { CSSProperties, MouseEvent, ReactNode } from "react";
import { useState } from "react";
import { openDashboardWindow } from "../../features/dashboard/useDashboardWindow";
import { IconButton } from "../common/IconButton";
import { Toast } from "../common/Toast";

interface FloatingWindowProps {
  children: ReactNode;
  alwaysOnTop: boolean;
  onAlwaysOnTopChange: (value: boolean) => void;
  toastMessage?: string | null;
  style?: CSSProperties;
}

export function FloatingWindow({
  children,
  alwaysOnTop,
  onAlwaysOnTopChange,
  toastMessage = null,
  style,
}: FloatingWindowProps) {
  const [collapsed, setCollapsed] = useState(false);

  function toggleCollapsed(event: MouseEvent<HTMLElement>) {
    if ((event.target as HTMLElement).closest("button")) return;
    setCollapsed((current) => !current);
  }

  return (
    <main className="h-screen w-screen overflow-hidden bg-transparent p-0">
      <section
        className="note-shell relative flex h-full w-full flex-col overflow-hidden text-[var(--text-main)]"
        data-collapsed={collapsed}
        style={style}
      >
        <header
          data-tauri-drag-region
          className="note-titlebar flex h-10 shrink-0 items-center justify-between px-3"
          onDoubleClick={toggleCollapsed}
          title={collapsed ? "双击展开浮笺" : "双击折叠浮笺"}
        >
          <div data-tauri-drag-region className="note-title-lockup">
            <span data-tauri-drag-region className="note-bookmark" />
            <h1 data-tauri-drag-region className="min-w-0 truncate text-sm font-semibold tracking-normal">
              浮笺
            </h1>
          </div>
          <div className="note-window-actions flex items-center gap-1">
            <IconButton
              label={alwaysOnTop ? "取消置顶" : "置顶"}
              className={alwaysOnTop ? "is-active" : ""}
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
        {collapsed ? (
          <button type="button" className="note-collapsed-summary" onClick={() => setCollapsed(false)}>
            <span>浮笺已折叠</span>
            <strong>{alwaysOnTop ? "置顶中" : "双击标题栏展开"}</strong>
          </button>
        ) : (
          children
        )}
        <Toast message={toastMessage} />
      </section>
    </main>
  );
}
