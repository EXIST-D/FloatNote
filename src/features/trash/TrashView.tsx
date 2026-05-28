import { RotateCcw, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { EmptyState } from "../../components/common/EmptyState";
import { IconButton } from "../../components/common/IconButton";
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

  if (loading) return <main className="dashboard-page dashboard-centered">正在读取回收站...</main>;

  return (
    <main className="dashboard-page">
      <div className="dashboard-page-title">
        <p>误删恢复</p>
        <h1>回收站</h1>
        {items.length > 0 && (
          <button
            type="button"
            className="secondary-action"
            onClick={() => {
              if (window.confirm("永久清空回收站？")) void clearTrashItems().then(reload);
            }}
          >
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
              <IconButton label="恢复" onClick={() => void restoreTrashItem(item).then(reload)}>
                <RotateCcw size={14} />
              </IconButton>
              <IconButton label="永久删除" onClick={() => void deleteTrashItem(item.id).then(reload)}>
                <Trash2 size={14} />
              </IconButton>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
