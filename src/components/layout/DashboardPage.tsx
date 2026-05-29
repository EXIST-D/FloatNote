import type { ReactNode } from "react";

interface DashboardPageProps {
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  description?: string;
  eyebrow?: string;
  title: string;
  toolbar?: ReactNode;
}

export function DashboardPage({
  actions,
  children,
  className = "",
  contentClassName = "",
  description,
  eyebrow,
  title,
  toolbar,
}: DashboardPageProps) {
  return (
    <main className={`dashboard-page dashboard-page-quiet ${className}`}>
      <header className="dashboard-command-bar">
        <div className="dashboard-command-copy">
          {eyebrow && <p>{eyebrow}</p>}
          <h1>{title}</h1>
          {description && <span>{description}</span>}
        </div>
        {actions && <div className="dashboard-command-actions">{actions}</div>}
      </header>
      {toolbar && <div className="dashboard-page-toolbar">{toolbar}</div>}
      <section className={`dashboard-page-scroll ${contentClassName}`}>{children}</section>
    </main>
  );
}
