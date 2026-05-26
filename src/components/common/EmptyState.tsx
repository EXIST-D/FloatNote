interface EmptyStateProps {
  title: string;
}

export function EmptyState({ title }: EmptyStateProps) {
  return (
    <div className="rounded-md border border-dashed border-[var(--app-border)] bg-white/20 p-4 text-center text-sm text-[var(--text-muted)]">
      {title}
    </div>
  );
}
