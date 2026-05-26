import { Check, Clipboard, Pencil, RotateCcw, Trash2 } from "lucide-react";
import type { Task } from "../../types/domain";

interface TaskContextMenuProps {
  task: Task;
  x: number;
  y: number;
  onClose: () => void;
  onToggleStatus: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onCopy: (task: Task) => void;
}

export function TaskContextMenu({ task, x, y, onClose, onToggleStatus, onEdit, onDelete, onCopy }: TaskContextMenuProps) {
  const left = Math.max(12, Math.min(x, Math.max(12, window.innerWidth - 152)));
  const top = Math.max(12, Math.min(y, Math.max(12, window.innerHeight - 168)));

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
        className="grid w-36 gap-1 rounded-md border border-[var(--menu-border)] bg-[var(--menu-bg)] p-1 text-xs shadow-[var(--surface-shadow)]"
        style={{ left, top, position: "fixed" }}
        onClick={(event) => event.stopPropagation()}
      >
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              type="button"
              className={`flex h-8 items-center gap-2 rounded px-2 text-left transition hover:bg-black/5 ${
                item.danger ? "text-[var(--danger)]" : "text-[var(--text-main)]"
              }`}
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
