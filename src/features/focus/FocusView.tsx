export function FocusView() {
  return (
    <section className="grid gap-3 p-3">
      <div className="rounded-md bg-[var(--accent)] p-4 text-[var(--accent-contrast)]">
        <p className="text-xs">当前专注</p>
        <strong className="mt-2 block text-4xl tabular-nums">18:42</strong>
        <p className="mt-2 text-sm">整理组会提纲</p>
      </div>
      <button className="h-10 rounded-md border border-[var(--app-border)] bg-white/35 text-sm text-[var(--text-main)]">
        暂停
      </button>
    </section>
  );
}
