import { useCallback, useEffect, useState } from "react";
import {
  createTaskLabel,
  deleteTaskLabel,
  listTaskLabels,
  setDefaultTaskLabel,
  updateTaskLabel,
} from "../../data/taskLabelsRepository";
import type { TaskLabel } from "../../types/domain";

export function useTaskLabels() {
  const [labels, setLabels] = useState<TaskLabel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setLabels(await listTaskLabels());
    } catch (err) {
      setError(err instanceof Error ? err.message : "读取任务标签失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  async function addLabel() {
    await createTaskLabel();
    await reload();
  }

  async function editLabel(id: string, patch: { name: string; color: string }) {
    await updateTaskLabel(id, patch);
    await reload();
  }

  async function makeDefault(id: string) {
    await setDefaultTaskLabel(id);
    await reload();
  }

  async function removeLabel(id: string) {
    await deleteTaskLabel(id);
    await reload();
  }

  return { labels, loading, error, reload, addLabel, editLabel, makeDefault, removeLabel };
}
