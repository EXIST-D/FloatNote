import { BarChart3, CalendarDays, Clock3, Home, Lightbulb, ListTodo, PanelTopOpen, Settings, Sparkles } from "lucide-react";
import { openFloatingWindow } from "./useDashboardWindow";
import type { DashboardTab } from "../../types/domain";

interface DashboardNavProps {
  activeTab: DashboardTab;
  onChange: (tab: DashboardTab) => void;
}

const navItems: Array<{ id: DashboardTab; label: string; icon: typeof Home }> = [
  { id: "home", label: "速览", icon: Home },
  { id: "today", label: "今日", icon: ListTodo },
  { id: "week", label: "本周", icon: CalendarDays },
  { id: "notes", label: "灵感", icon: Lightbulb },
  { id: "focus", label: "专注", icon: Clock3 },
  { id: "history", label: "历史", icon: BarChart3 },
  { id: "settings", label: "设置", icon: Settings },
];

export function DashboardNav({ activeTab, onChange }: DashboardNavProps) {
  return (
    <aside className="dashboard-nav">
      <div className="dashboard-brand">
        <span className="dashboard-brand-mark">
          <Sparkles size={18} />
        </span>
        <div className="min-w-0">
          <strong>浮笺</strong>
          <span>中文桌面工作台</span>
        </div>
        <button type="button" className="dashboard-float-button" onClick={() => void openFloatingWindow()} aria-label="打开浮窗" title="打开浮窗">
          <PanelTopOpen size={17} />
        </button>
      </div>
      <nav className="dashboard-nav-list" aria-label="主窗口导航">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              className={`dashboard-nav-item ${activeTab === item.id ? "is-active" : ""}`}
              onClick={() => onChange(item.id)}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
