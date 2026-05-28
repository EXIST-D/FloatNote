import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToVerticalAxis, restrictToWindowEdges } from "@dnd-kit/modifiers";
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { emit } from "@tauri-apps/api/event";
import { Check, GripVertical, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { EmptyState } from "../../components/common/EmptyState";
import { IconButton } from "../../components/common/IconButton";
import { Toast } from "../../components/common/Toast";
import { createReminder } from "../../data/remindersRepository";
import type { Task, TaskStatus } from "../../types/domain";
import { buildReorderedTasks } from "./taskOrdering";
import { TaskContextMenu } from "./TaskContextMenu";
import { TaskLabelColorBar } from "./TaskLabelColorBar";
import { useTaskLabels } from "./useTaskLabels";

type ReminderPreset = "30m" | "1h" | "tonight" | "tomorrow";

interface SortableTaskListProps {
  tasks: Task[];
  emptyText: string;
  onStatusChange: (id: string, status: TaskStatus) => Promise<void>;
  onTitleChange: (id: string, title: string) => Promise<void>;
  onLabelChange: (id: string, labelId: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onReorder: (tasks: Task[]) => Promise<void>;
}

interface SortableTaskRowProps {
  task: Task;
  expanded: boolean;
  editing: boolean;
  editValue: string;
  onExpandToggle: (id: string) => void;
  onEditStart: (task: Task) => void;
  onEditValueChange: (value: string) => void;
  onEditCancel: () => void;
  onEditCommit: () => void;
  onContextMenu: (task: Task, x: number, y: number) => void;
  onStatusChange: (task: Task) => void;
  onDelete: (id: string) => void;
}

function SortableTaskRow({
  task,
  expanded,
  editing,
  editValue,
  onExpandToggle,
  onEditStart,
  onEditValueChange,
  onEditCancel,
  onEditCommit,
  onContextMenu,
  onStatusChange,
  onDelete,
}: SortableTaskRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`task-row grid min-w-0 grid-cols-[4px_auto_auto_minmax(0,1fr)_auto] items-start gap-1.5 px-1.5 py-1.5 text-sm ${
        task.status === "done" ? "text-[var(--text-muted)] opacity-75" : "text-[var(--text-main)]"
      } ${isDragging ? "z-20 shadow-[var(--surface-shadow)]" : ""}`}
      onContextMenu={(event) => {
        event.preventDefault();
        onContextMenu(task, event.clientX, event.clientY);
      }}
    >
      <TaskLabelColorBar label={task.label} />
      <button
        type="button"
        className="task-drag-handle mt-0.5 grid h-6 w-5 place-items-center"
        aria-label="拖拽排序"
        title="拖拽排序"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={14} />
      </button>
      <button
        type="button"
        className={`task-checkbox mt-0.5 grid h-5 w-5 place-items-center ${task.status === "done" ? "is-done" : ""}`}
        onClick={() => onStatusChange(task)}
        aria-label={task.status === "done" ? "取消完成" : "完成"}
        title={task.status === "done" ? "取消完成" : "完成"}
      >
        {task.status === "done" && <Check size={12} />}
      </button>

      {editing ? (
        <input
          autoFocus
          value={editValue}
          className="task-edit-input min-w-0 px-2 py-1 text-sm outline-none"
          onChange={(event) => onEditValueChange(event.target.value)}
          onBlur={onEditCommit}
          onKeyDown={(event) => {
            if (event.key === "Enter") onEditCommit();
            if (event.key === "Escape") onEditCancel();
          }}
        />
      ) : (
        <button
          type="button"
          className={`task-title-button min-w-0 text-left leading-snug ${expanded ? "whitespace-pre-wrap break-words" : "task-title-collapsed"} ${
            task.status === "done" ? "line-through" : ""
          }`}
          onClick={() => onExpandToggle(task.id)}
          onDoubleClick={() => onEditStart(task)}
          title={task.title}
        >
          {task.title}
        </button>
      )}

      <IconButton label="删除" className="mt-0.5" onClick={() => onDelete(task.id)}>
        <Trash2 size={13} />
      </IconButton>
    </article>
  );
}

export function SortableTaskList({ tasks, emptyText, onStatusChange, onTitleChange, onLabelChange, onDelete, onReorder }: SortableTaskListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [menuState, setMenuState] = useState<{ task: Task; x: number; y: number } | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const taskLabels = useTaskLabels();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const taskIds = useMemo(() => tasks.map((task) => task.id), [tasks]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuState(null);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!feedback) return;
    const timeoutId = window.setTimeout(() => setFeedback(null), 1800);
    return () => window.clearTimeout(timeoutId);
  }, [feedback]);

  if (tasks.length === 0) {
    return <EmptyState title={emptyText} />;
  }

  function startEdit(task: Task) {
    setEditingId(task.id);
    setEditValue(task.title);
  }

  async function commitEdit() {
    if (!editingId) return;

    const nextTitle = editValue.trim();
    const current = tasks.find((task) => task.id === editingId);
    setEditingId(null);
    setEditValue("");

    if (!nextTitle || current?.title === nextTitle) return;
    await onTitleChange(editingId, nextTitle);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const reordered = buildReorderedTasks(tasks, String(active.id), String(over.id));
    await onReorder(reordered);
  }

  async function copyTask(task: Task) {
    try {
      await navigator.clipboard.writeText(task.title);
      setFeedback("任务文本已复制");
    } catch {
      setFeedback("当前环境无法访问剪贴板");
    }
  }

  function resolveReminderTime(preset: ReminderPreset) {
    const date = new Date();
    if (preset === "30m") date.setMinutes(date.getMinutes() + 30);
    if (preset === "1h") date.setHours(date.getHours() + 1);
    if (preset === "tonight") date.setHours(20, 0, 0, 0);
    if (preset === "tomorrow") {
      date.setDate(date.getDate() + 1);
      date.setHours(9, 0, 0, 0);
    }
    if (date.getTime() <= Date.now()) date.setDate(date.getDate() + 1);
    return date.toISOString();
  }

  async function addReminderAt(task: Task, remindAt: string) {
    await createReminder(task, remindAt);
    await emit("reminders:changed");
    setFeedback(`已为“${task.title}”添加提醒`);
  }

  async function addReminder(task: Task, preset: ReminderPreset) {
    await addReminderAt(task, resolveReminderTime(preset));
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
        onDragEnd={(event) => void handleDragEnd(event)}
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          <div className="grid min-h-0 gap-1.5 overflow-auto pr-1">
            {tasks.map((task) => (
              <SortableTaskRow
                key={task.id}
                task={task}
                expanded={expandedId === task.id}
                editing={editingId === task.id}
                editValue={editValue}
                onExpandToggle={(id) => setExpandedId((current) => (current === id ? null : id))}
                onEditStart={startEdit}
                onEditValueChange={setEditValue}
                onEditCancel={() => {
                  setEditingId(null);
                  setEditValue("");
                }}
                onEditCommit={() => void commitEdit()}
                onContextMenu={(nextTask, x, y) => setMenuState({ task: nextTask, x, y })}
                onStatusChange={(nextTask) => void onStatusChange(nextTask.id, nextTask.status === "done" ? "active" : "done")}
                onDelete={(id) => void onDelete(id)}
              />
            ))}
          </div>
        </SortableContext>
        {menuState && (
          <TaskContextMenu
            task={menuState.task}
            labels={taskLabels.labels}
            x={menuState.x}
            y={menuState.y}
            onClose={() => setMenuState(null)}
            onToggleStatus={(task) => void onStatusChange(task.id, task.status === "done" ? "active" : "done")}
            onEdit={startEdit}
            onDelete={(task) => void onDelete(task.id)}
            onCopy={(task) => void copyTask(task)}
            onLabelChange={(task, labelId) => void onLabelChange(task.id, labelId)}
            onReminder={(task, preset) => void addReminder(task, preset)}
            onCustomReminder={(task, remindAt) => void addReminderAt(task, remindAt)}
          />
        )}
      </DndContext>
      <Toast message={feedback} />
    </>
  );
}
