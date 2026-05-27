import { useState } from "react";
import { EmptyState } from "../../components/common/EmptyState";
import { formatDuration } from "../../lib/time";
import { formatFocusHistorySummary, formatHistoryDateLabel } from "./historyFormat";
import { summarizeHistoryDay } from "./historySummary";
import { useHistory } from "./useHistory";

export function HistoryAccordionView() {
  const { groups, loading, error } = useHistory();
  const [openDate, setOpenDate] = useState<string | null>(null);

  if (error) return <main className="dashboard-page text-red-700">{error}</main>;
  if (loading) return <main className="dashboard-page dashboard-centered">正在读取历史...</main>;
  if (groups.length === 0) return <main className="dashboard-page"><EmptyState title="还没有历史记录" /></main>;

  return (
    <main className="dashboard-page">
      <div className="dashboard-page-title">
        <p>按天归档</p>
        <h1>历史</h1>
      </div>
      <section className="history-accordion">
        {groups.map((group) => {
          const summary = summarizeHistoryDay(group);
          const open = openDate === group.date;
          return (
            <article key={group.date} className="history-day">
              <button type="button" className="history-day-summary" onClick={() => setOpenDate(open ? null : group.date)}>
                <span>
                  <strong>{formatHistoryDateLabel(group.date)}</strong>
                  <small>
                    任务 {summary.taskCount} · 灵感 {summary.noteCount} · 专注 {formatDuration(summary.focusSeconds)}
                  </small>
                </span>
                <em>{open ? "收起" : "展开"}</em>
              </button>
              {open && (
                <div className="history-day-detail">
                  {group.tasks.map((task) => <p key={task.id}>任务 · {task.title}</p>)}
                  {group.notes.map((note) => <p key={note.id}>灵感 · {note.content}</p>)}
                  {group.focusSessions.map((session) => <p key={session.id}>专注 · {formatFocusHistorySummary(session)}</p>)}
                </div>
              )}
            </article>
          );
        })}
      </section>
    </main>
  );
}
