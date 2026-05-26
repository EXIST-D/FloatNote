import type { ReactNode } from "react";

interface PanelBodyProps {
  children: ReactNode;
  className?: string;
}

export function PanelBody({ children, className = "" }: PanelBodyProps) {
  return <section className={`grid max-h-[300px] gap-2 overflow-auto p-2 ${className}`}>{children}</section>;
}
