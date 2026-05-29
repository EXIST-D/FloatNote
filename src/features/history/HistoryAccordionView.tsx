import { useState } from "react";
import { EmptyState } from "../../components/common/EmptyState";
import { DashboardPage } from "../../components/layout/DashboardPage";
import { formatDuration } from "../../lib/time";
import { formatFocusHistorySummary, formatHistoryDateLabel } from "./historyFormat";
import { summarizeHistoryDay } from "./historySummary";
import { useHistory } from "./useHistory";

export function HistoryAccordionView() {
  const { groups, loading, error, removeHistoryItem } = useHistory();
  const [openDate, setOpenDate] = useState<string | null>(null);

  if (error) return <main className="dashboard-page text-red-700">{error}</main>;
  if (loading) return <main className="dashboard-page dashboard-centered">正在读取历史...</main>;
  if (groups.length === 0) return <main className="dashboard-page"><EmptyState title="还没有历史记录" /></main>;

  return (
    <DashboardPage eyebrow="按天归档" title="历史" description={`${groups.length} 个日期分组，点击某天查看复盘、任务、灵感和专注`}>
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
                    复盘 {summary.reviewCount} · 任务 {summary.taskCount} · 灵感 {summary.noteCount} · 专注 {formatDuration(summary.focusSeconds)}
                  </small>
                </span>
                <em>{open ? "收起" : "展开"}</em>
              </button>
              {open && (
                <div className="history-day-detail">
                  {group.reviews.map((review) => (
                    <div key={review.id} className="history-record history-record-review">
                      <span>
                        <strong>{review.title}</strong>
                        <small>
                          完成 {review.snapshot.completedTasks.length} /{" "}
                          {review.snapshot.completedTasks.length + review.snapshot.unfinishedTasks.length} · 专注{" "}
                          {formatDuration(review.snapshot.focusSeconds)}
                        </small>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm("删除这条复盘总结？可在回收站恢复。")) void removeHistoryItem("review", review.id);
                        }}
                      >
                        删除
                      </button>
                    </div>
                  ))}
                  {group.tasks.map((task) => (
                    <div key={task.id} className="history-record">
                      <span>任务 · {task.title}</span>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm("删除这条任务记录？可在回收站恢复。")) void removeHistoryItem("task", task.id);
                        }}
                      >
                        删除
                      </button>
                    </div>
                  ))}
                  {group.notes.map((note) => (
                    <div key={note.id} className="history-record">
                      <span>灵感 · {note.content}</span>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm("删除这条灵感记录？可在回收站恢复。")) void removeHistoryItem("note", note.id);
                        }}
                      >
                        删除
                      </button>
                    </div>
                  ))}
                  {group.focusSessions.map((session) => (
                    <div key={session.id} className="history-record">
                      <span>专注 · {formatFocusHistorySummary(session)}</span>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm("删除这条专注记录？删除后不可恢复。")) void removeHistoryItem("focus", session.id);
                        }}
                      >
                        删除
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </article>
          );
        })}
      </section>
    </DashboardPage>
  );
}
