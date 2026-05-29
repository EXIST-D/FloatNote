import { invoke } from "@tauri-apps/api/core";
import { ClipboardList, Download, Image, Palette, Pin, RotateCcw, Tags } from "lucide-react";
import type { ReactNode } from "react";
import { DashboardPage } from "../../components/layout/DashboardPage";
import { buildExportSnapshot, exportSnapshotAsJson, exportSnapshotAsMarkdown } from "../../data/exportRepository";
import { DEFAULT_DASHBOARD_HERO_KICKER, DEFAULT_DASHBOARD_HERO_TITLE } from "../../data/settingsRepository";
import type { DashboardAppearanceSetting, FontFamilyName, ReviewMode, TaskLabel } from "../../types/domain";
import { useTaskLabels } from "../tasks/useTaskLabels";
import type { useSettings } from "./useSettings";

type SettingsController = ReturnType<typeof useSettings>;

const reviewModes: Array<{ id: ReviewMode; label: string }> = [
  { id: "manual_with_prompt", label: "手动结束 + 轻提示" },
  { id: "manual_only", label: "仅手动结束" },
];

const backgroundFits: Array<{ id: DashboardAppearanceSetting["backgroundFit"]; label: string }> = [
  { id: "cover", label: "填充" },
  { id: "contain", label: "完整显示" },
  { id: "repeat", label: "平铺" },
];

const fontFamilies: Array<{ id: FontFamilyName; label: string; sample: string }> = [
  { id: "yahei", label: "微软雅黑", sample: "清晰现代" },
  { id: "songti", label: "宋体", sample: "端正规整" },
  { id: "kaiti", label: "楷体", sample: "书写感" },
  { id: "fangsong", label: "仿宋", sample: "文稿感" },
];

interface DashboardSettingsViewProps {
  settings: SettingsController;
}

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function SettingsSection({
  id,
  icon,
  title,
  children,
}: {
  id: string;
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="settings-section" id={id}>
      <h2>
        <span>{icon}</span>
        {title}
      </h2>
      <div className="settings-panel">{children}</div>
    </section>
  );
}

function SettingsRow({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="settings-row">
      <div className="settings-row-copy">
        <strong>{title}</strong>
        <span>{description}</span>
      </div>
      <div className="settings-row-control">{children}</div>
    </div>
  );
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
      <span className="task-label-color-dot" style={{ background: label.color }} />
      <input
        aria-label="标签名称"
        defaultValue={label.name}
        onBlur={(event) => void onEdit(label.id, { name: event.currentTarget.value, color: label.color })}
      />
      <input
        aria-label={`${label.name} 颜色`}
        className="task-label-color-input"
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
    const fileName = `浮笺导出-${new Date().toISOString().slice(0, 10)}.${format === "markdown" ? "md" : "json"}`;

    try {
      const savedPath = await invoke<string>("save_export_file", { fileName, contents: content });
      window.alert(`已导出到：${savedPath}`);
      return;
    } catch {
      // Keep browser preview/dev usable if the native command is unavailable.
    }

    const blob = new Blob([content], { type: format === "markdown" ? "text/markdown;charset=utf-8" : "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
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
      void settings.setDashboardAppearance({ backgroundImageDataUrl: reader.result });
    };
    reader.readAsDataURL(file);
  }

  return (
    <DashboardPage
      className="settings-page settings-page-quiet"
      eyebrow="设置中心"
      title="设置"
      description="外观、行为、标签和数据管理集中在这里"
    >
      <div className="settings-shell">
        <aside className="settings-side-nav" aria-label="设置分组">
          <a href="#settings-appearance">外观</a>
          <a href="#settings-behavior">行为</a>
          <a href="#settings-data">数据</a>
          <a href="#settings-labels">标签</a>
        </aside>

        <div className="settings-sections">
          <SettingsSection id="settings-appearance" icon={<Palette size={18} />} title="外观">
            <SettingsRow title="主窗口底色" description="设置主窗口的基础颜色">
              <label className="settings-color-control">
                <span style={{ background: settings.dashboardAppearance.baseColor }} />
                <input
                  aria-label="主窗口底色"
                  type="color"
                  value={settings.dashboardAppearance.baseColor}
                  onChange={(event) => void settings.setDashboardAppearance({ baseColor: event.currentTarget.value })}
                />
                <em>{settings.dashboardAppearance.baseColor.toUpperCase()}</em>
              </label>
            </SettingsRow>
            <SettingsRow title="主窗口强调色" description="影响选中态、按钮和焦点边框">
              <label className="settings-color-control">
                <span style={{ background: settings.dashboardAppearance.accentColor }} />
                <input
                  aria-label="主窗口强调色"
                  type="color"
                  value={settings.dashboardAppearance.accentColor}
                  onChange={(event) => void settings.setDashboardAppearance({ accentColor: event.currentTarget.value })}
                />
                <em>{settings.dashboardAppearance.accentColor.toUpperCase()}</em>
              </label>
            </SettingsRow>
            <SettingsRow title="主窗口透明度" description="只影响主窗口，不影响桌面浮笺">
              <label className="settings-range-control">
                <input
                  aria-label="主窗口透明度"
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={settings.dashboardAppearance.opacity}
                  onChange={(event) => void settings.setDashboardAppearance({ opacity: Number(event.currentTarget.value) })}
                />
                <span>{formatPercent(settings.dashboardAppearance.opacity)}</span>
              </label>
            </SettingsRow>
            <SettingsRow title="主窗口背景图片" description="选择一张本地图片作为主窗口背景">
              <div className="settings-inline-actions">
                <label className="settings-file-button">
                  <Image size={14} />
                  选择图片
                  <input type="file" accept="image/*" onChange={(event) => handleBackgroundFile(event.currentTarget.files?.[0] ?? null)} />
                </label>
                <button type="button" onClick={() => void settings.setDashboardAppearance({ backgroundImageDataUrl: null })}>
                  清除图片
                </button>
              </div>
            </SettingsRow>
            <SettingsRow title="图片适配方式" description="控制背景图片的填充方式">
              <select
                value={settings.dashboardAppearance.backgroundFit}
                onChange={(event) =>
                  void settings.setDashboardAppearance({ backgroundFit: event.currentTarget.value as DashboardAppearanceSetting["backgroundFit"] })
                }
              >
                {backgroundFits.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </SettingsRow>
            <SettingsRow title="浮笺透明度" description="只影响桌面浮窗的纸面透明度">
              <label className="settings-range-control">
                <input
                  aria-label="浮笺透明度"
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={settings.floatingOpacity}
                  onChange={(event) => void settings.setFloatingOpacity(Number(event.currentTarget.value))}
                />
                <span>{formatPercent(settings.floatingOpacity)}</span>
              </label>
            </SettingsRow>
            <SettingsRow title="中文字体" description="影响主窗口、浮笺、任务和输入内容">
              <select
                value={settings.fontFamily}
                onChange={(event) => void settings.setFontFamily(event.currentTarget.value as FontFamilyName)}
              >
                {fontFamilies.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label} - {item.sample}
                  </option>
                ))}
              </select>
            </SettingsRow>
            <SettingsRow title="恢复默认外观" description="恢复主窗口颜色、透明度和背景图片">
              <button type="button" className="secondary-action" onClick={() => void settings.resetDashboardAppearance()}>
                <RotateCcw size={14} />
                恢复默认
              </button>
            </SettingsRow>
          </SettingsSection>

          <SettingsSection id="settings-behavior" icon={<ClipboardList size={18} />} title="行为">
            <SettingsRow title="复盘方式" description="设置今日和本周结束时的复盘行为">
              <select value={settings.reviewMode} onChange={(event) => void settings.setReviewMode(event.currentTarget.value as ReviewMode)}>
                {reviewModes.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </SettingsRow>
            <SettingsRow title="浮笺置顶" description="让桌面浮笺保持在其它窗口上方">
              <button
                type="button"
                className={`settings-toggle ${settings.alwaysOnTop ? "is-active" : ""}`}
                onClick={() => void settings.setAlwaysOnTop(!settings.alwaysOnTop)}
              >
                <Pin size={14} />
                {settings.alwaysOnTop ? "已启用" : "已关闭"}
              </button>
            </SettingsRow>
            <SettingsRow title="首页小标题" description="自定义主窗口速览页的短标题">
              <input
                value={settings.dashboardHeroCopy.kicker}
                onChange={(event) =>
                  void settings.setDashboardHeroCopy({ ...settings.dashboardHeroCopy, kicker: event.currentTarget.value })
                }
              />
            </SettingsRow>
            <SettingsRow title="首页说明" description="自定义主窗口速览页的说明文案">
              <input
                value={settings.dashboardHeroCopy.title}
                onChange={(event) =>
                  void settings.setDashboardHeroCopy({ ...settings.dashboardHeroCopy, title: event.currentTarget.value })
                }
              />
            </SettingsRow>
            <SettingsRow title="恢复默认文案" description="恢复速览页默认标题和说明">
              <button
                type="button"
                className="secondary-action"
                onClick={() =>
                  void settings.setDashboardHeroCopy({
                    kicker: DEFAULT_DASHBOARD_HERO_KICKER,
                    title: DEFAULT_DASHBOARD_HERO_TITLE,
                  })
                }
              >
                <RotateCcw size={14} />
                恢复文案
              </button>
            </SettingsRow>
          </SettingsSection>

          <SettingsSection id="settings-data" icon={<Download size={18} />} title="数据">
            <SettingsRow title="导出 Markdown" description="导出为适合阅读和归档的 Markdown 文件">
              <button type="button" className="secondary-action" onClick={() => void exportData("markdown")}>
                导出 Markdown
              </button>
            </SettingsRow>
            <SettingsRow title="导出 JSON" description="导出完整备份数据，便于后续恢复或迁移">
              <button type="button" className="secondary-action" onClick={() => void exportData("json")}>
                导出 JSON
              </button>
            </SettingsRow>
          </SettingsSection>

          <SettingsSection id="settings-labels" icon={<Tags size={18} />} title="标签">
            <div className="settings-label-block">
              <div className="settings-label-head">
                <div>
                  <strong>任务等级标签</strong>
                  <span>自定义任务优先级名称、颜色和默认等级</span>
                </div>
                <button type="button" className="secondary-action" onClick={() => void taskLabels.addLabel()} disabled={taskLabels.loading}>
                  新增标签
                </button>
              </div>
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
            </div>
          </SettingsSection>
        </div>
      </div>
    </DashboardPage>
  );
}
