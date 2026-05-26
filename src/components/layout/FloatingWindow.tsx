import { PhysicalSize } from "@tauri-apps/api/dpi";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Minus, Pin, Settings, X } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import type { ThemeName } from "../../types/domain";
import { IconButton } from "../common/IconButton";
import { ThemeMenu } from "../theme/ThemeMenu";

interface FloatingWindowProps {
  children: ReactNode;
  theme: ThemeName;
  onThemeChange: (theme: ThemeName) => void;
  alwaysOnTop: boolean;
  onAlwaysOnTopChange: (value: boolean) => void;
}

export function FloatingWindow({ children, theme, onThemeChange, alwaysOnTop, onAlwaysOnTopChange }: FloatingWindowProps) {
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const windowRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const element = windowRef.current;
    if (!element) return;

    const appWindow = getCurrentWindow();
    let frameId = 0;

    const resizeToContent = () => {
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(() => {
        const rect = element.getBoundingClientRect();
        const width = Math.ceil(rect.width + 2);
        const height = Math.ceil(rect.height + 2);
        void appWindow.setSize(new PhysicalSize(width, height));
      });
    };

    const observer = new ResizeObserver(resizeToContent);
    observer.observe(element);
    resizeToContent();

    return () => {
      window.cancelAnimationFrame(frameId);
      observer.disconnect();
    };
  }, []);

  return (
    <main className="bg-transparent">
      <section
        ref={windowRef}
        className="relative w-[340px] overflow-hidden rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] text-[var(--text-main)] shadow-[var(--shadow)]"
      >
        <header
          data-tauri-drag-region
          className="flex h-8 items-center justify-between border-b border-[var(--app-border)] bg-[var(--drag-bg)] px-2.5"
        >
          <h1 className="text-sm font-semibold tracking-normal">桌面便利贴</h1>
          <div className="flex items-center gap-1">
            <IconButton
              label={alwaysOnTop ? "取消置顶" : "置顶"}
              className={alwaysOnTop ? "text-[var(--accent)]" : ""}
              onClick={() => onAlwaysOnTopChange(!alwaysOnTop)}
            >
              <Pin size={15} fill={alwaysOnTop ? "currentColor" : "none"} />
            </IconButton>
            <IconButton label="主题" onClick={() => setThemeMenuOpen((open) => !open)}>
              <Settings size={15} />
            </IconButton>
            <IconButton label="收起" onClick={() => void getCurrentWindow().hide()}>
              <Minus size={15} />
            </IconButton>
            <IconButton label="关闭" onClick={() => void getCurrentWindow().hide()}>
              <X size={15} />
            </IconButton>
          </div>
        </header>
        {themeMenuOpen && (
          <ThemeMenu
            theme={theme}
            onChange={(nextTheme) => {
              onThemeChange(nextTheme);
              setThemeMenuOpen(false);
            }}
          />
        )}
        {children}
      </section>
    </main>
  );
}
