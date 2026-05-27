import type { TaskPriority } from "../../types/domain";

interface PriorityColorBarProps {
  priority: TaskPriority;
}

export function PriorityColorBar({ priority }: PriorityColorBarProps) {
  return <span className="priority-color-bar" data-priority={priority} aria-hidden="true" />;
}
