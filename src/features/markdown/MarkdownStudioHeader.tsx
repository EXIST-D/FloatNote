import { Plus, Save } from "lucide-react";

interface MarkdownStudioHeaderProps {
  title: string;
  saveStatus: string;
  canSaveNew: boolean;
  isNewDraft: boolean;
  saving: boolean;
  onNew: () => void;
  onSaveNew: () => void;
}

export function MarkdownStudioHeader({
  title,
  saveStatus,
  canSaveNew,
  isNewDraft,
  saving,
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
        {isNewDraft ? (
          <button type="button" className="primary-action" disabled={!canSaveNew || saving} onClick={onSaveNew}>
            <Save size={14} />
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
