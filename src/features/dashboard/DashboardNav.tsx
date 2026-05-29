import { BarChart3, Bell, CalendarDays, Clock3, Home, Lightbulb, ListTodo, PanelTopOpen, Search, Settings, Trash2 } from "lucide-react";
import appIconUrl from "../../assets/app-icon.png";
import type { DashboardTab } from "../../types/domain";
import { openFloatingWindow } from "./useDashboardWindow";

interface DashboardNavProps {
  activeTab: DashboardTab;
  onChange: (tab: DashboardTab) => void;
}

const navGroups: Array<{ label: string; items: Array<{ id: DashboardTab; label: string; icon: typeof Home }> }> = [
  {
    label: "工作",
    items: [
      { id: "home", label: "速览", icon: Home },
      { id: "today", label: "今日", icon: ListTodo },
      { id: "week", label: "本周", icon: CalendarDays },
      { id: "focus", label: "专注", icon: Clock3 },
    ],
  },
  {
    label: "记录",
    items: [
      { id: "notes", label: "灵感", icon: Lightbulb },
      { id: "search", label: "搜索", icon: Search },
      { id: "history", label: "历史", icon: BarChart3 },
    ],
  },
  {
    label: "系统",
    items: [
      { id: "reminders", label: "提醒", icon: Bell },
      { id: "trash", label: "回收站", icon: Trash2 },
    ],
  },
];

export function DashboardNav({ activeTab, onChange }: DashboardNavProps) {
  return (
    <aside className="dashboard-nav">
      <div className="dashboard-brand">
        <span className="dashboard-brand-mark">
          <img src={appIconUrl} alt="" />
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
        {navGroups.map((group) => (
          <section key={group.label} className="dashboard-nav-group" aria-label={group.label}>
            <p>{group.label}</p>
            {group.items.map((item) => {
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
          </section>
        ))}
      </nav>
      <div className="dashboard-nav-footer">
        <button
          type="button"
          className={`dashboard-nav-item ${activeTab === "settings" ? "is-active" : ""}`}
          onClick={() => onChange("settings")}
        >
          <Settings size={18} />
          <span>设置</span>
        </button>
      </div>
    </aside>
  );
}
