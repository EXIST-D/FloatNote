export function NotesView() {
  return (
    <section className="grid gap-3 p-3">
      <textarea
        className="min-h-28 resize-none rounded-md border border-[var(--app-border)] bg-white/45 p-3 text-sm leading-6 outline-none placeholder:text-[var(--text-muted)] focus:ring-2 focus:ring-[var(--accent)]"
        placeholder="记下一点灵感、随笔或突然想到的句子"
      />
      <div className="rounded-md border border-[var(--app-border)] bg-white/25 p-3 text-sm text-[var(--text-muted)]">
        刚想到：把“组会问题”单独留一个小标签。
      </div>
    </section>
  );
}
