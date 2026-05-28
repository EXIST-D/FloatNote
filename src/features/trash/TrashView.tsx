import { RotateCcw, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { EmptyState } from "../../components/common/EmptyState";
import { IconButton } from "../../components/common/IconButton";
import { Toast } from "../../components/common/Toast";
import { clearTrashItems, deleteTrashItem, listTrashItems, restoreTrashItem } from "../../data/trashRepository";
import type { TrashItem } from "../../types/domain";

const entityLabels = {
  task: "任务",
  note: "灵感",
  review: "历史",
};

export function TrashView() {
  const [items, setItems] = useState<TrashItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await listTrashItems());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    if (!feedback) return;
    const timeoutId = window.setTimeout(() => setFeedback(null), 2200);
    return () => window.clearTimeout(timeoutId);
  }, [feedback]);

  async function restore(item: TrashItem) {
    try {
      await restoreTrashItem(item);
      setFeedback("已恢复");
      await reload();
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : "恢复失败");
    }
  }

  async function remove(id: string) {
    try {
      await deleteTrashItem(id);
      setFeedback("已永久删除");
      await reload();
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : "永久删除失败");
    }
  }

  async function clearAll() {
    if (!window.confirm("永久清空回收站？")) return;
    try {
      await clearTrashItems();
      setFeedback("回收站已清空");
      await reload();
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : "清空回收站失败");
    }
  }

  if (loading) return <main className="dashboard-page dashboard-centered">正在读取回收站...</main>;

  return (
    <main className="dashboard-page">
      <div className="dashboard-page-title">
        <p>误删恢复</p>
        <h1>回收站</h1>
        {items.length > 0 && (
          <button type="button" className="secondary-action" onClick={() => void clearAll()}>
            清空
          </button>
        )}
      </div>
      {items.length === 0 ? (
        <EmptyState title="回收站是空的" />
      ) : (
        <section className="trash-list">
          {items.map((item) => (
            <article key={item.id} className="trash-card">
              <span>
                <strong>{item.title}</strong>
                <small>
                  {entityLabels[item.entityType]} · {new Date(item.deletedAt).toLocaleString()}
                </small>
              </span>
              <IconButton label="恢复" onClick={() => void restore(item)}>
                <RotateCcw size={14} />
              </IconButton>
              <IconButton label="永久删除" onClick={() => void remove(item.id)}>
                <Trash2 size={14} />
              </IconButton>
            </article>
          ))}
        </section>
      )}
      <Toast message={feedback} />
    </main>
  );
}
