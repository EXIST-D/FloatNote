interface EmptyStateProps {
  title: string;
}

export function EmptyState({ title }: EmptyStateProps) {
  return (
    <div className="rounded-md border border-dashed border-[var(--app-border)] bg-white/20 px-3 py-2 text-center text-xs text-[var(--text-muted)]">
      {title}
    </div>
  );
}
