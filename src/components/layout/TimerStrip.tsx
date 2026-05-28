interface TimerStripProps {
  title: string;
  elapsed: string;
  paused?: boolean;
  onClick: () => void;
}

export function TimerStrip({ title, elapsed, paused = false, onClick }: TimerStripProps) {
  return (
    <button type="button" className="timer-strip" onClick={onClick}>
      <span className="min-w-0 flex-1 truncate text-left">
        {paused ? "已暂停" : "专注中"} · {title}
      </span>
      <strong className="ml-2 shrink-0 text-sm tabular-nums">{elapsed}</strong>
    </button>
  );
}
