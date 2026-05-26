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
    <div className="grid gap-2">
      {tasks.map((task) => (
        <article
          key={task.id}
          className={`grid grid-cols-[auto_1fr_auto] items-center gap-2 rounded-md border border-[var(--app-border)] bg-white/30 p-2 text-sm ${
            task.status === "done" ? "text-[var(--text-muted)] opacity-70" : "text-[var(--text-main)]"
          }`}
        >
          <button
            type="button"
            className={`grid h-5 w-5 place-items-center rounded border border-[var(--app-border)] ${
              task.status === "done" ? "bg-[var(--accent)] text-[var(--accent-contrast)]" : "bg-white/40"
            }`}
            onClick={() => task.status === "active" && onComplete(task.id)}
            aria-label={task.status === "done" ? "已完成" : "完成任务"}
            title={task.status === "done" ? "已完成" : "完成任务"}
          >
            {task.status === "done" && <Check size={13} />}
          </button>
          <span className={task.status === "done" ? "line-through" : ""}>{task.title}</span>
          <IconButton label="删除任务" onClick={() => onDelete(task.id)}>
            <Trash2 size={14} />
          </IconButton>
        </article>
      ))}
    </div>
  );
}
