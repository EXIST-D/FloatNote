import type { ButtonHTMLAttributes, ReactNode } from "react";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  children: ReactNode;
}

export function IconButton({ label, children, className = "", ...props }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`grid h-6 w-6 place-items-center rounded-md text-[var(--text-muted)] transition hover:bg-black/5 hover:text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
