import type { TaskLabel } from "../../types/domain";

interface TaskLabelPickerProps {
  labels: TaskLabel[];
  value: string | null;
  onChange: (labelId: string) => void;
}

export function TaskLabelPicker({ labels, value, onChange }: TaskLabelPickerProps) {
  if (labels.length === 0) {
    return <p className="px-1 text-[var(--text-muted)]">暂无标签</p>;
  }

  return (
    <div className="task-label-picker" role="group" aria-label="任务等级标签">
      {labels.map((label) => (
        <button
          key={label.id}
          type="button"
          className={value === label.id ? "is-active" : ""}
          onClick={() => onChange(label.id)}
          title={label.name}
        >
          <span aria-hidden="true" style={{ background: label.color }} />
          {label.name}
        </button>
      ))}
    </div>
  );
}
