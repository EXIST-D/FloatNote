interface TimerStripProps {
  title: string;
  elapsed: string;
  paused?: boolean;
  onClick: () => void;
}

export function TimerStrip({ title, elapsed, paused = false, onClick }: TimerStripProps) {
  return (
    <button
      type="button"
      className="mx-1 mb-1 flex h-7 w-[calc(100%-0.5rem)] items-center justify-between rounded-md bg-[var(--accent)] px-2 text-xs text-[var(--accent-contrast)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
      onClick={onClick}
    >
      <span className="min-w-0 flex-1 truncate text-left">
        {paused ? "已暂停" : "专注中"} · {title}
      </span>
      <strong className="ml-2 shrink-0 text-sm tabular-nums">{elapsed}</strong>
    </button>
  );
}
