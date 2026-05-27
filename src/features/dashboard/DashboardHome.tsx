import { ArrowRight, Clock3, Lightbulb, ListTodo, NotebookTabs } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import type { DashboardTab } from "../../types/domain";
import { formatDuration } from "../../lib/time";
import { formatFocusHistorySummary } from "../history/historyFormat";
import { useHistory } from "../history/useHistory";
import { useDashboardSummary } from "./useDashboardSummary";

interface DashboardHomeProps {
  onNavigate: (tab: DashboardTab) => void;
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
}: {
  title: string;
  subtitle: string;
  accent: string;
  icon: typeof ListTodo;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button type="button" className="dashboard-work-card" style={{ "--card-accent": accent } as CSSProperties} onClick={onClick}>
      <span className="dashboard-card-bar" />
      <span className="dashboard-card-head">
        <span className="dashboard-card-icon">
          <Icon size={18} />
        </span>
        <span>
          <strong>{title}</strong>
          <small>{subtitle}</small>
        </span>
        <ArrowRight size={16} />
      </span>
      <span className="dashboard-card-body">{children}</span>
    </button>
  );
}

export function DashboardHome({ onNavigate }: DashboardHomeProps) {
  const { summary, loading, error } = useDashboardSummary();
  const { groups } = useHistory();

  if (loading) {
    return <main className="dashboard-page dashboard-centered">正在整理今日书桌...</main>;
  }

  if (error || !summary) {
    return <main className="dashboard-page dashboard-centered text-red-700">{error ?? "速览不可用"}</main>;
  }

  const recentHistory = groups.slice(0, 4);

  return (
    <main className="dashboard-page">
      <section className="dashboard-hero">
        <div>
          <p>今日工作盘</p>
          <h1>把零散任务、灵感和专注时间收在一张桌面上</h1>
        </div>
        <strong>{formatDuration(summary.todayFocusSeconds)}</strong>
      </section>

      <section className="dashboard-work-grid">
        <WorkCard
          title="今日任务"
          subtitle={`${summary.todayTasks.filter((task) => task.status === "active").length} 项待处理`}
          accent="var(--priority-medium)"
          icon={ListTodo}
          onClick={() => onNavigate("today")}
        >
          <StatusList items={summary.todayTasks.map((task) => task.title)} emptyText="今天还没有任务" />
        </WorkCard>
        <WorkCard
          title="本周任务"
          subtitle={`${summary.weekTasks.filter((task) => task.status === "active").length} 项待处理`}
          accent="var(--priority-low)"
          icon={NotebookTabs}
          onClick={() => onNavigate("week")}
        >
          <StatusList items={summary.weekTasks.map((task) => task.title)} emptyText="本周还没有任务" />
        </WorkCard>
        <WorkCard title="最近灵感" subtitle={`${summary.notes.length} 条记录`} accent="#b98063" icon={Lightbulb} onClick={() => onNavigate("notes")}>
          <StatusList items={summary.notes.map((note) => note.content)} emptyText="还没有灵感记录" />
        </WorkCard>
        <WorkCard
          title="专注时长"
          subtitle={`今日 ${formatDuration(summary.todayFocusSeconds)}`}
          accent="#6f7fa8"
          icon={Clock3}
          onClick={() => onNavigate("focus")}
        >
          <StatusList items={summary.focusSessions.slice(0, 4).map(formatFocusHistorySummary)} emptyText="还没有专注记录" />
        </WorkCard>
      </section>

      <button type="button" className="dashboard-history-strip" onClick={() => onNavigate("history")}>
        <span>最近历史</span>
        <strong>{recentHistory.length > 0 ? recentHistory.map((group) => `${group.date} · ${group.tasks.length + group.notes.length} 条`).join(" / ") : "暂无历史"}</strong>
        <ArrowRight size={16} />
      </button>
    </main>
  );
}
