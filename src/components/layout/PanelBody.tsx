import type { ReactNode } from "react";

interface PanelBodyProps {
  children: ReactNode;
  className?: string;
}

export function PanelBody({ children, className = "" }: PanelBodyProps) {
  return <section className={`grid min-h-0 flex-1 gap-2 overflow-auto p-2 ${className}`}>{children}</section>;
}
