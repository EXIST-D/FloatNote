import { Check, Trash2 } from "lucide-react";
import { EmptyState } from "../../components/common/EmptyState";
import { IconButton } from "../../components/common/IconButton";
import type { Task } from "../../types/domain";

interface TaskListProps {
  tasks: Task[];
  emptyText: string;
  onComplete: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function TaskList({ tasks, emptyText, onComplete, onDelete }: TaskListProps) {
  if (tasks.length === 0) {
    return <EmptyState title={emptyText} />;
  }

  return (
    <div className="grid max-h-36 gap-1.5 overflow-auto pr-1">
      {tasks.map((task) => (
        <article
          key={task.id}
          className={`grid min-h-8 min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-1.5 rounded-md border border-[var(--app-border)] bg-white/25 px-2 py-1 text-sm ${
            task.status === "done" ? "text-[var(--text-muted)] opacity-70" : "text-[var(--text-main)]"
          }`}
        >
          <button
            type="button"
            className={`grid h-4 w-4 place-items-center rounded border border-[var(--app-border)] ${
              task.status === "done" ? "bg-[var(--accent)] text-[var(--accent-contrast)]" : "bg-white/40"
            }`}
            onClick={() => task.status === "active" && onComplete(task.id)}
            aria-label={task.status === "done" ? "已完成" : "完成"}
            title={task.status === "done" ? "已完成" : "完成"}
          >
            {task.status === "done" && <Check size={11} />}
          </button>
          <span className={`min-w-0 truncate ${task.status === "done" ? "line-through" : ""}`}>{task.title}</span>
          <IconButton label="删除" onClick={() => onDelete(task.id)}>
            <Trash2 size={13} />
          </IconButton>
        </article>
      ))}
    </div>
  );
}
