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
      className="mx-2 mb-2 flex h-8 w-[calc(100%-1rem)] items-center justify-between rounded-md bg-[var(--accent)] px-3 text-xs text-[var(--accent-contrast)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
      onClick={onClick}
    >
      <span>
        {paused ? "已暂停" : "专注中"} · {title}
      </span>
      <strong className="text-sm tabular-nums">{elapsed}</strong>
    </button>
  );
}
