import { ArrowRight, Clock3, Image, Lightbulb, ListTodo, NotebookTabs } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { formatDuration } from "../../lib/time";
import type { DashboardTab } from "../../types/domain";
import { formatFocusHistorySummary } from "../history/historyFormat";
import { useHistory } from "../history/useHistory";
import { useReviewActions } from "../review/useReviewActions";
import { useDashboardSummary } from "./useDashboardSummary";

interface DashboardHomeProps {
  onNavigate: (tab: DashboardTab) => void;
  heroCopy: {
    kicker: string;
    title: string;
  };
}

function StatusList({ items, emptyText }: { items: string[]; emptyText: string }) {
  if (items.length === 0) return <p className="dashboard-empty">{emptyText}</p>;
  return (
    <ul className="dashboard-mini-list">
      {items.slice(0, 5).map((item, index) => (
        <li key={`${item}-${index}`}>{item}</li>
      ))}
    </ul>
  );
}

function WorkCard({
  title,
  subtitle,
  accent,
  icon: Icon,
  onClick,
  children,
  action,
}: {
  title: string;
  subtitle: string;
  accent: string;
  icon: typeof ListTodo;
  onClick: () => void;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <article className="dashboard-work-card" style={{ "--card-accent": accent } as CSSProperties}>
      <span className="dashboard-card-bar" />
      <button type="button" className="dashboard-card-head" onClick={onClick}>
        <span className="dashboard-card-icon">
          <Icon size={18} />
        </span>
        <span>
          <strong>{title}</strong>
          <small>{subtitle}</small>
        </span>
        <ArrowRight size={16} />
      </button>
      <span className="dashboard-card-body">{children}</span>
      {action && <span className="dashboard-card-actions">{action}</span>}
    </article>
  );
}

export function DashboardHome({ onNavigate, heroCopy }: DashboardHomeProps) {
  const { summary, loading, error } = useDashboardSummary();
  const { groups } = useHistory();
  const reviewActions = useReviewActions();

  if (loading) {
    return <main className="dashboard-page dashboard-centered">正在整理今日纸面...</main>;
  }

  if (error || !summary) {
    return <main className="dashboard-page dashboard-centered text-red-700">{error ?? "速览暂不可用"}</main>;
  }

  const activeToday = summary.todayTasks.filter((task) => task.status === "active").length;
  const activeWeek = summary.weekTasks.filter((task) => task.status === "active").length;
  const recentHistory = groups.slice(0, 4);
  const recentHistoryText =
    recentHistory.length > 0
      ? recentHistory
          .map((group) => {
            const recordCount = group.reviews.length + group.tasks.length + group.notes.length + group.focusSessions.length;
            const reviewTitle = group.reviews[0]?.title;
            return reviewTitle ? `${group.date} · ${reviewTitle}` : `${group.date} · ${recordCount} 条`;
          })
          .join(" / ")
      : "暂无历史记录";

  return (
    <main className="dashboard-page">
      <section className="dashboard-hero">
        <div>
          <p>{heroCopy.kicker}</p>
          <h1>{heroCopy.title}</h1>
          <div className="dashboard-hero-actions">
            <button type="button" onClick={() => onNavigate("settings")}>
              <Image size={15} />
              调整背景
            </button>
          </div>
        </div>
        <div className="dashboard-hero-metric">
          <span>今日专注</span>
          <strong>{formatDuration(summary.todayFocusSeconds)}</strong>
        </div>
      </section>

      <section className="dashboard-work-grid" aria-label="工作台速览">
        <WorkCard
          title="今日任务"
          subtitle={`${activeToday} 项待处理`}
          accent="var(--color-amber)"
          icon={ListTodo}
          onClick={() => onNavigate("today")}
          action={
            <button type="button" onClick={() => void reviewActions.finishReview("today")}>
              结束今日
            </button>
          }
        >
          <StatusList items={summary.todayTasks.map((task) => task.title)} emptyText="今天还没有任务" />
        </WorkCard>
        <WorkCard
          title="本周任务"
          subtitle={`${activeWeek} 项待处理`}
          accent="var(--color-moss)"
          icon={NotebookTabs}
          onClick={() => onNavigate("week")}
          action={
            <button type="button" onClick={() => void reviewActions.finishReview("week")}>
              结束本周
            </button>
          }
        >
          <StatusList items={summary.weekTasks.map((task) => task.title)} emptyText="本周还没有任务" />
        </WorkCard>
        <WorkCard title="最近灵感" subtitle={`${summary.notes.length} 条记录`} accent="var(--color-coral)" icon={Lightbulb} onClick={() => onNavigate("notes")}>
          <StatusList items={summary.notes.map((note) => note.content)} emptyText="还没有灵感记录" />
        </WorkCard>
        <WorkCard
          title="专注时长"
          subtitle={`今日 ${formatDuration(summary.todayFocusSeconds)}`}
          accent="var(--color-sky)"
          icon={Clock3}
          onClick={() => onNavigate("focus")}
        >
          <StatusList items={summary.focusSessions.slice(0, 4).map(formatFocusHistorySummary)} emptyText="还没有专注记录" />
        </WorkCard>
      </section>
      {reviewActions.message && <p className="review-message">{reviewActions.message}</p>}
      {reviewActions.error && <p className="review-error">{reviewActions.error}</p>}

      <button type="button" className="dashboard-history-strip" onClick={() => onNavigate("history")}>
        <span>最近历史</span>
        <strong>{recentHistoryText}</strong>
        <ArrowRight size={16} />
      </button>
    </main>
  );
}
