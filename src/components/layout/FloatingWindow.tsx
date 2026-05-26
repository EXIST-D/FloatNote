import { Minus, Pin, Settings, X } from "lucide-react";
import type { ReactNode } from "react";
import { IconButton } from "../common/IconButton";

interface FloatingWindowProps {
  children: ReactNode;
}

export function FloatingWindow({ children }: FloatingWindowProps) {
  return (
    <main className="min-h-screen bg-transparent p-4">
      <section className="w-[360px] overflow-hidden rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] text-[var(--text-main)] shadow-[var(--shadow)]">
        <header
          data-tauri-drag-region
          className="flex h-9 items-center justify-between border-b border-[var(--app-border)] bg-[var(--drag-bg)] px-3"
        >
          <h1 className="text-sm font-semibold tracking-normal">桌面便利贴</h1>
          <div className="flex items-center gap-1">
            <IconButton label="置顶">
              <Pin size={15} />
            </IconButton>
            <IconButton label="设置">
              <Settings size={15} />
            </IconButton>
            <IconButton label="收起">
              <Minus size={15} />
            </IconButton>
            <IconButton label="关闭">
              <X size={15} />
            </IconButton>
          </div>
        </header>
        {children}
      </section>
    </main>
  );
}
