import type { TaskPriority } from "../../types/domain";

interface PriorityPickerProps {
  value: TaskPriority;
  onChange: (priority: TaskPriority) => void;
}

const priorities: Array<{ id: TaskPriority; label: string }> = [
  { id: "high", label: "高" },
  { id: "medium", label: "中" },
  { id: "low", label: "低" },
];

export function PriorityPicker({ value, onChange }: PriorityPickerProps) {
  return (
    <div className="priority-picker" role="group" aria-label="任务优先级">
      {priorities.map((item) => (
        <button
          key={item.id}
          type="button"
          className={value === item.id ? "is-active" : ""}
          data-priority={item.id}
          onClick={() => onChange(item.id)}
        >
          <span aria-hidden="true" />
          {item.label}
        </button>
      ))}
    </div>
  );
}
