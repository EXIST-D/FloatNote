import { Palette, Type } from "lucide-react";
import { DEFAULT_PRIORITY_COLORS } from "../tasks/taskPriority";
import type { MainWindowStyle, TaskPriority } from "../../types/domain";
import type { useSettings } from "./useSettings";

type SettingsController = ReturnType<typeof useSettings>;

const mainStyles: Array<{ id: MainWindowStyle; label: string }> = [
  { id: "desk", label: "书桌仪表盘" },
  { id: "minimal", label: "极简追踪" },
  { id: "green", label: "墨绿工作台" },
];

const fontStyles: Array<{ id: SettingsController["fontStyle"]; label: string }> = [
  { id: "clear", label: "清晰" },
  { id: "bookish", label: "书卷" },
  { id: "compact", label: "紧凑" },
];

const priorities: Array<{ id: TaskPriority; label: string }> = [
  { id: "high", label: "高优先级" },
  { id: "medium", label: "中优先级" },
  { id: "low", label: "低优先级" },
];

interface DashboardSettingsViewProps {
  settings: SettingsController;
}

export function DashboardSettingsView({ settings }: DashboardSettingsViewProps) {
  function changePriorityColor(priority: TaskPriority, color: string) {
    void settings.setPriorityColors({ ...settings.priorityColors, [priority]: color || DEFAULT_PRIORITY_COLORS[priority] });
  }

  return (
    <main className="dashboard-page">
      <div className="dashboard-page-title">
        <p>把浮笺调成顺手的样子</p>
        <h1>设置</h1>
      </div>
      <section className="settings-grid">
        <article className="settings-card">
          <h2><Palette size={18} /> 主窗口形态</h2>
          <div className="settings-options">
            {mainStyles.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`setting-chip ${settings.mainWindowStyle === item.id ? "is-active" : ""}`}
                onClick={() => void settings.setMainWindowStyle(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </article>
        <article className="settings-card">
          <h2><Type size={18} /> 字感</h2>
          <div className="settings-options">
            {fontStyles.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`setting-chip ${settings.fontStyle === item.id ? "is-active" : ""}`}
                onClick={() => void settings.setFontStyle(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </article>
        <article className="settings-card settings-card-wide">
          <h2><Palette size={18} /> 任务优先级色条</h2>
          <div className="priority-color-editor">
            {priorities.map((item) => (
              <label key={item.id}>
                <span>{item.label}</span>
                <input
                  type="color"
                  value={settings.priorityColors[item.id]}
                  onChange={(event) => changePriorityColor(item.id, event.currentTarget.value)}
                />
              </label>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
