import { Bell, Trash2 } from "lucide-react";
import { EmptyState } from "../../components/common/EmptyState";
import { IconButton } from "../../components/common/IconButton";
import { useReminders } from "./useReminders";

const statusLabel = {
  pending: "待提醒",
  sent: "已提醒",
  dismissed: "已忽略",
};

export function RemindersView() {
  const { reminders, loading, dismiss, remove } = useReminders();

  if (loading) return <main className="dashboard-page dashboard-centered">正在读取提醒...</main>;

  return (
    <main className="dashboard-page">
      <div className="dashboard-page-title">
        <p>应用运行期间生效</p>
        <h1>提醒总览</h1>
      </div>
      {reminders.length === 0 ? (
        <EmptyState title="还没有任务提醒" />
      ) : (
        <section className="reminder-list">
          {reminders.map((reminder) => (
            <article key={reminder.id} className="reminder-card">
              <Bell size={16} />
              <span>
                <strong>{reminder.taskTitle}</strong>
                <small>
                  {new Date(reminder.remindAt).toLocaleString()} · {statusLabel[reminder.status]}
                </small>
              </span>
              {reminder.status === "pending" && <button onClick={() => void dismiss(reminder.id)}>忽略</button>}
              <IconButton label="删除提醒" onClick={() => void remove(reminder.id)}>
                <Trash2 size={14} />
              </IconButton>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
