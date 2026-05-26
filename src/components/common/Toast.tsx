interface ToastProps {
  message: string | null;
}

export function Toast({ message }: ToastProps) {
  if (!message) return null;

  return (
    <div className="pointer-events-none absolute inset-x-3 bottom-3 z-30 flex justify-center">
      <div className="max-w-full rounded-md border border-[var(--menu-border)] bg-[var(--menu-bg)] px-3 py-2 text-xs text-[var(--text-main)] shadow-[var(--surface-shadow)]">
        {message}
      </div>
    </div>
  );
}
