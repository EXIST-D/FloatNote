import { ClipboardList, Droplets, Palette, Tags, Type } from "lucide-react";
import {
  DEFAULT_DASHBOARD_HERO_KICKER,
  DEFAULT_DASHBOARD_HERO_TITLE,
} from "../../data/settingsRepository";
import type { FontStyleName, MainWindowStyle, PaperOpacityName, ReviewMode, TaskLabel } from "../../types/domain";
import { useTaskLabels } from "../tasks/useTaskLabels";
import type { useSettings } from "./useSettings";

type SettingsController = ReturnType<typeof useSettings>;

const mainStyles: Array<{ id: MainWindowStyle; label: string; note: string }> = [
  { id: "desk", label: "月光纸笺", note: "柔和纸面" },
  { id: "minimal", label: "清简", note: "低噪整理" },
  { id: "green", label: "墨绿", note: "沉静工作台" },
];

const fontStyles: Array<{ id: FontStyleName; label: string }> = [
  { id: "clear", label: "清晰" },
  { id: "bookish", label: "书卷" },
  { id: "compact", label: "紧凑" },
];

const opacityStyles: Array<{ id: PaperOpacityName; label: string }> = [
  { id: "clear", label: "清透" },
  { id: "soft", label: "柔和" },
  { id: "solid", label: "实色" },
];

const reviewModes: Array<{ id: ReviewMode; label: string }> = [
  { id: "manual_with_prompt", label: "手动结束 + 轻提示" },
  { id: "manual_only", label: "仅手动结束" },
];

interface DashboardSettingsViewProps {
  settings: SettingsController;
}

function LabelEditorRow({
  label,
  onEdit,
  onDefault,
  onDelete,
}: {
  label: TaskLabel;
  onEdit: (id: string, patch: { name: string; color: string }) => Promise<void>;
  onDefault: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  return (
    <div className="task-label-editor-row">
      <input
        aria-label="标签名称"
        defaultValue={label.name}
        onBlur={(event) => void onEdit(label.id, { name: event.currentTarget.value, color: label.color })}
      />
      <input
        aria-label={`${label.name} 颜色`}
        type="color"
        value={label.color}
        onChange={(event) => void onEdit(label.id, { name: label.name, color: event.currentTarget.value })}
      />
      <button type="button" onClick={() => void onDefault(label.id)} disabled={label.isDefault}>
        {label.isDefault ? "默认" : "设为默认"}
      </button>
      <button type="button" className="danger-text" onClick={() => void onDelete(label.id)}>
        删除
      </button>
    </div>
  );
}

export function DashboardSettingsView({ settings }: DashboardSettingsViewProps) {
  const taskLabels = useTaskLabels();

  async function removeLabel(id: string) {
    try {
      await taskLabels.removeLabel(id);
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "删除标签失败");
    }
  }

  return (
    <main className="dashboard-page settings-page">
      <div className="dashboard-page-title">
        <p>外观实验室</p>
        <h1>把浮笺调成顺手的样子</h1>
      </div>
      <section className="settings-grid">
        <article className="settings-card settings-card-wide">
          <h2>
            <Palette size={18} /> 主窗口形态
          </h2>
          <div className="settings-options settings-swatch-row">
            {mainStyles.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`setting-chip setting-swatch ${settings.mainWindowStyle === item.id ? "is-active" : ""}`}
                onClick={() => void settings.setMainWindowStyle(item.id)}
              >
                <span className={`swatch-preview swatch-preview-${item.id}`} />
                <strong>{item.label}</strong>
                <small>{item.note}</small>
              </button>
            ))}
          </div>
        </article>

        <article className="settings-card">
          <h2>
            <ClipboardList size={18} /> 复盘方式
          </h2>
          <div className="settings-options">
            {reviewModes.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`setting-chip ${settings.reviewMode === item.id ? "is-active" : ""}`}
                onClick={() => void settings.setReviewMode(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </article>

        <article className="settings-card">
          <h2>
            <Type size={18} /> 字感
          </h2>
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

        <article className="settings-card">
          <h2>
            <Droplets size={18} /> 纸面透明度
          </h2>
          <div className="settings-options">
            {opacityStyles.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`setting-chip ${settings.paperOpacity === item.id ? "is-active" : ""}`}
                onClick={() => void settings.setPaperOpacity(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </article>

        <article className="settings-card settings-card-wide">
          <h2>
            <Type size={18} /> 首页文案
          </h2>
          <label className="settings-field">
            <span>小标题</span>
            <input
              value={settings.dashboardHeroCopy.kicker}
              onChange={(event) =>
                void settings.setDashboardHeroCopy({ ...settings.dashboardHeroCopy, kicker: event.currentTarget.value })
              }
            />
          </label>
          <label className="settings-field">
            <span>主标题</span>
            <input
              value={settings.dashboardHeroCopy.title}
              onChange={(event) =>
                void settings.setDashboardHeroCopy({ ...settings.dashboardHeroCopy, title: event.currentTarget.value })
              }
            />
          </label>
          <div className="settings-actions">
            <button
              type="button"
              onClick={() =>
                void settings.setDashboardHeroCopy({
                  kicker: DEFAULT_DASHBOARD_HERO_KICKER,
                  title: DEFAULT_DASHBOARD_HERO_TITLE,
                })
              }
            >
              恢复默认文案
            </button>
          </div>
        </article>

        <article className="settings-card settings-card-wide">
          <h2>
            <Tags size={18} /> 任务等级标签
          </h2>
          {taskLabels.error && <p className="settings-error">{taskLabels.error}</p>}
          <div className="task-label-editor">
            {taskLabels.labels.map((label) => (
              <LabelEditorRow
                key={label.id}
                label={label}
                onEdit={taskLabels.editLabel}
                onDefault={taskLabels.makeDefault}
                onDelete={removeLabel}
              />
            ))}
          </div>
          <div className="settings-actions">
            <button type="button" onClick={() => void taskLabels.addLabel()} disabled={taskLabels.loading}>
              新增等级标签
            </button>
          </div>
        </article>
      </section>
    </main>
  );
}
