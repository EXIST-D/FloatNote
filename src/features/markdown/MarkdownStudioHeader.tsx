import { Code2, Eye, Pencil, Plus } from "lucide-react";

export type MarkdownStudioMode = "write" | "read" | "source";

interface MarkdownStudioHeaderProps {
  mode: MarkdownStudioMode;
  title: string;
  saveStatus: string;
  canSaveNew: boolean;
  isNewDraft: boolean;
  saving: boolean;
  onModeChange: (mode: MarkdownStudioMode) => void;
  onNew: () => void;
  onSaveNew: () => void;
}

export function MarkdownStudioHeader({
  mode,
  title,
  saveStatus,
  canSaveNew,
  isNewDraft,
  saving,
  onModeChange,
  onNew,
  onSaveNew,
}: MarkdownStudioHeaderProps) {
  return (
    <header className="markdown-studio-header">
      <div className="min-w-0">
        <p className="dashboard-eyebrow">Markdown Studio</p>
        <h2>{title}</h2>
      </div>
      <div className="markdown-studio-header-actions">
        <span className="markdown-save-status">{saveStatus}</span>
        <div className="markdown-mode-switch" aria-label="Markdown 模式切换">
          <button type="button" className={mode === "write" ? "is-active" : ""} onClick={() => onModeChange("write")}>
            <Pencil size={14} />
            写作
          </button>
          <button type="button" className={mode === "read" ? "is-active" : ""} onClick={() => onModeChange("read")}>
            <Eye size={14} />
            阅读
          </button>
          <button type="button" className={mode === "source" ? "is-active" : ""} onClick={() => onModeChange("source")}>
            <Code2 size={14} />
            源码
          </button>
        </div>
        {isNewDraft ? (
          <button type="button" className="primary-action" disabled={!canSaveNew || saving} onClick={onSaveNew}>
            收进灵感
          </button>
        ) : (
          <button type="button" className="secondary-action" onClick={onNew}>
            <Plus size={14} />
            新建灵感
          </button>
        )}
      </div>
    </header>
  );
}
