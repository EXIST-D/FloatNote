import type { TaskLabel } from "../../types/domain";

interface TaskLabelColorBarProps {
  label: TaskLabel | null;
}

export function TaskLabelColorBar({ label }: TaskLabelColorBarProps) {
  return <span className="priority-color-bar task-label-color-bar" style={{ background: label?.color ?? "#d6a441" }} aria-hidden="true" />;
}
