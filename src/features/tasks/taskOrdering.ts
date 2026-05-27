import type { Task } from "../../types/domain";

export function buildReorderedTasks(tasks: Task[], activeId: string, overId: string) {
  const activeIndex = tasks.findIndex((task) => task.id === activeId);
  const overIndex = tasks.findIndex((task) => task.id === overId);

  if (activeIndex < 0 || overIndex < 0) {
    return tasks.map((task, index) => ({ ...task, sortOrder: index + 1 }));
  }

  const next = [...tasks];
  const [moved] = next.splice(activeIndex, 1);
  next.splice(overIndex, 0, moved);

  return next.map((task, index) => ({ ...task, sortOrder: index + 1 }));
}

export function getTopInsertSortOrder(tasks: Pick<Task, "sortOrder">[]) {
  if (tasks.length === 0) return 0;

  const minOrder = tasks.reduce((min, task) => Math.min(min, task.sortOrder), Number.POSITIVE_INFINITY);
  return minOrder - 1;
}
