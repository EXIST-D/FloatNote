export function TodayView() {
  return (
    <section className="grid gap-3 p-3">
      <div className="rounded-md border border-[var(--app-border)] bg-white/35 p-3 text-sm">
        整理组会汇报提纲
      </div>
      <div className="rounded-md border border-[var(--app-border)] bg-white/25 p-3 text-sm text-[var(--text-muted)]">
        补实验记录截图
      </div>
      <input
        className="h-10 rounded-md border border-[var(--app-border)] bg-white/45 px-3 text-sm outline-none placeholder:text-[var(--text-muted)] focus:ring-2 focus:ring-[var(--accent)]"
        placeholder="写下今天要做的事"
      />
    </section>
  );
}
