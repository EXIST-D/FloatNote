import { Bell, Check, Clipboard, Pencil, RotateCcw, Trash2 } from "lucide-react";
import type { Task, TaskLabel } from "../../types/domain";
import { TaskLabelPicker } from "./TaskLabelPicker";

interface TaskContextMenuProps {
  task: Task;
  x: number;
  y: number;
  labels: TaskLabel[];
  onClose: () => void;
  onToggleStatus: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onCopy: (task: Task) => void;
  onLabelChange: (task: Task, labelId: string) => void;
  onReminder: (task: Task, preset: "30m" | "1h" | "tonight" | "tomorrow" | "custom") => void;
}

export function TaskContextMenu({ task, x, y, labels, onClose, onToggleStatus, onEdit, onDelete, onCopy, onLabelChange, onReminder }: TaskContextMenuProps) {
  const left = Math.max(12, Math.min(x, Math.max(12, window.innerWidth - 228)));
  const top = Math.max(12, Math.min(y, Math.max(12, window.innerHeight - 276)));

  const items = [
    {
      label: task.status === "done" ? "取消完成" : "完成",
      icon: task.status === "done" ? RotateCcw : Check,
      action: () => onToggleStatus(task),
    },
    { label: "编辑", icon: Pencil, action: () => onEdit(task) },
    { label: "复制文本", icon: Clipboard, action: () => onCopy(task) },
    { label: "删除", icon: Trash2, action: () => onDelete(task), danger: true },
  ];

  return (
    <div className="fixed inset-0 z-40" onClick={onClose} onContextMenu={(event) => event.preventDefault()}>
      <div
        className="task-context-menu popover grid gap-1 p-1 text-xs"
        style={{ left, top, position: "fixed" }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="task-menu-section">
          <p className="mb-1 text-[var(--text-muted)]">等级标签</p>
          <TaskLabelPicker
            labels={labels}
            value={task.labelId}
            onChange={(labelId) => {
              onLabelChange(task, labelId);
              onClose();
            }}
          />
        </div>
        <div className="task-menu-section">
          <p className="mb-1 text-[var(--text-muted)]">添加提醒</p>
          <div className="task-reminder-presets">
            {[
              ["30m", "30分钟"],
              ["1h", "1小时"],
              ["tonight", "今晚"],
              ["tomorrow", "明早"],
              ["custom", "自定"],
            ].map(([preset, label]) => (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  onReminder(task, preset as "30m" | "1h" | "tonight" | "tomorrow" | "custom");
                  onClose();
                }}
              >
                <Bell size={12} />
                {label}
              </button>
            ))}
          </div>
        </div>
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              type="button"
              className={`task-menu-item ${item.danger ? "is-danger" : ""}`}
              onClick={() => {
                item.action();
                onClose();
              }}
            >
              <Icon size={14} />
              <span className="min-w-0 truncate">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
