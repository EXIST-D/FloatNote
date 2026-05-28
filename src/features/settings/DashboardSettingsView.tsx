import { ClipboardList, Download, Droplets, Image, Palette, Tags, Type } from "lucide-react";
import { buildExportSnapshot, exportSnapshotAsJson, exportSnapshotAsMarkdown } from "../../data/exportRepository";
import {
  DEFAULT_DASHBOARD_HERO_KICKER,
  DEFAULT_DASHBOARD_HERO_TITLE,
} from "../../data/settingsRepository";
import type { DashboardBackgroundPreset, FontStyleName, MainWindowStyle, PaperOpacityName, ReviewMode, TaskLabel } from "../../types/domain";
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

const backgroundPresets: Array<{ id: DashboardBackgroundPreset; label: string }> = [
  { id: "moon", label: "月光" },
  { id: "paper", label: "纸纹" },
  { id: "grid", label: "浅格" },
  { id: "night", label: "夜读" },
  { id: "green", label: "墨绿" },
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

  async function exportData(format: "markdown" | "json") {
    const snapshot = await buildExportSnapshot();
    const content = format === "markdown" ? exportSnapshotAsMarkdown(snapshot) : exportSnapshotAsJson(snapshot);
    const blob = new Blob([content], { type: format === "markdown" ? "text/markdown;charset=utf-8" : "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `浮笺导出-${new Date().toISOString().slice(0, 10)}.${format === "markdown" ? "md" : "json"}`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function handleBackgroundFile(file: File | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      window.alert("请选择图片文件");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      window.alert("图片请控制在 3MB 以内");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") return;
      void settings.setDashboardBackground({ ...settings.dashboardBackground, mode: "image", imageDataUrl: reader.result });
    };
    reader.readAsDataURL(file);
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
            <Image size={18} /> 主窗口背景
          </h2>
          <div className="settings-options">
            {backgroundPresets.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`setting-chip ${settings.dashboardBackground.mode === "preset" && settings.dashboardBackground.preset === item.id ? "is-active" : ""}`}
                onClick={() => void settings.setDashboardBackground({ ...settings.dashboardBackground, mode: "preset", preset: item.id })}
              >
                {item.label}
              </button>
            ))}
            <label className="setting-chip setting-file-chip">
              选择图片
              <input type="file" accept="image/*" onChange={(event) => handleBackgroundFile(event.currentTarget.files?.[0] ?? null)} />
            </label>
          </div>
          <div className="settings-range-grid">
            <label>
              <span>可见度</span>
              <input
                type="range"
                min="0"
                max="0.8"
                step="0.02"
                value={settings.dashboardBackground.opacity}
                onChange={(event) => void settings.setDashboardBackground({ ...settings.dashboardBackground, opacity: Number(event.currentTarget.value) })}
              />
            </label>
            <label>
              <span>模糊</span>
              <input
                type="range"
                min="0"
                max="16"
                step="1"
                value={settings.dashboardBackground.blur}
                onChange={(event) => void settings.setDashboardBackground({ ...settings.dashboardBackground, blur: Number(event.currentTarget.value) })}
              />
            </label>
            <label>
              <span>压暗</span>
              <input
                type="range"
                min="0"
                max="0.5"
                step="0.02"
                value={settings.dashboardBackground.dim}
                onChange={(event) => void settings.setDashboardBackground({ ...settings.dashboardBackground, dim: Number(event.currentTarget.value) })}
              />
            </label>
          </div>
        </article>

        <article className="settings-card settings-card-wide">
          <h2>
            <Download size={18} /> 导出数据
          </h2>
          <div className="settings-actions">
            <button type="button" onClick={() => void exportData("markdown")}>
              导出 Markdown
            </button>
            <button type="button" onClick={() => void exportData("json")}>
              导出 JSON
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
