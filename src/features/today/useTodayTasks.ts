import { useCallback, useEffect, useState } from "react";
import { createTask, deleteTask, listTasks, reorderTasks, updateTaskStatus, updateTaskTitle } from "../../data/tasksRepository";
import type { Task, TaskStatus } from "../../types/domain";

export function useTodayTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setTasks(await listTasks("today"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "读取今日任务失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  async function addTask(title: string) {
    await createTask("today", title);
    await reload();
  }

  async function changeStatus(id: string, status: TaskStatus) {
    await updateTaskStatus(id, status);
    await reload();
  }

  async function editTask(id: string, title: string) {
    await updateTaskTitle(id, title);
    await reload();
  }

  async function removeTask(id: string) {
    await deleteTask(id);
    await reload();
  }

  async function changeOrder(nextTasks: Task[]) {
    await reorderTasks(nextTasks);
    await reload();
  }

  return { tasks, loading, error, addTask, changeStatus, editTask, removeTask, changeOrder, reload };
}
