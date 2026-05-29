import { ArrowRight, FileText, Plus, Save, Search, Trash2 } from "lucide-react";
import { useState, type RefObject } from "react";

import { IconButton } from "../../../components/common/IconButton";
import { VditorMarkdownEditor, type VditorMarkdownEditorHandle } from "../vditor/VditorMarkdownEditor";
import { MarkdownFindReplace } from "./MarkdownFindReplace";

interface MarkdownEditorShellProps {
  autoFocus?: boolean;
  canDelete?: boolean;
  editorRef: RefObject<VditorMarkdownEditorHandle | null>;
  isDraft: boolean;
  onChange: (value: string) => void;
  onCreateNote: () => void;
  onDeleteNote: () => void;
  onSave: () => void;
  onSendToToday: () => void;
  onSendToWeek: () => void;
  placeholder?: string;
  saveStatus: string;
  title: string;
  value: string;
}

function getSaveStatusTone(status: string) {
  if (status.includes("失败")) return "error";
  if (status.includes("保存中")) return "saving";
  if (status.includes("未保存")) return "dirty";
  if (status.includes("已保存") || status.includes("已同步")) return "saved";
  return "draft";
}

export function MarkdownEditorShell({
  autoFocus,
  canDelete = true,
  editorRef,
  isDraft,
  onChange,
  onCreateNote,
  onDeleteNote,
  onSave,
  onSendToToday,
  onSendToWeek,
  placeholder,
  saveStatus,
  title,
  value,
}: MarkdownEditorShellProps) {
  const [isFindOpen, setIsFindOpen] = useState(false);

  const replaceValue = (nextValue: string) => {
    if (editorRef.current) {
      editorRef.current.replaceValue(nextValue);
      return;
    }

    onChange(nextValue);
  };

  return (
    <section
      className="markdown-editor-shell"
      onKeyDownCapture={(event) => {
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "f") {
          event.preventDefault();
          setIsFindOpen(true);
        } else if (event.key === "Escape" && isFindOpen) {
          event.preventDefault();
          setIsFindOpen(false);
        }
      }}
    >
      <header className="markdown-editor-shell-header">
        <div className="markdown-editor-title-block">
          <FileText size={18} aria-hidden="true" />
          <div>
            <h3>{title}</h3>
            <span className={`markdown-save-chip is-${getSaveStatusTone(saveStatus)}`}>{saveStatus}</span>
          </div>
        </div>

        <div className="markdown-editor-shell-actions">
          <IconButton label="新建灵感" onClick={onCreateNote}>
            <Plus size={17} />
          </IconButton>
          <IconButton label="查找替换" onClick={() => setIsFindOpen((open) => !open)}>
            <Search size={17} />
          </IconButton>
          <IconButton label={isDraft ? "保存灵感" : "立即保存"} onClick={onSave}>
            <Save size={17} />
          </IconButton>
          <button className="note-action" type="button" onClick={onSendToToday}>
            <ArrowRight size={15} />
            转今日
          </button>
          <button className="note-action" type="button" onClick={onSendToWeek}>
            <ArrowRight size={15} />
            转本周
          </button>
          {canDelete ? (
            <IconButton label="删除灵感" onClick={onDeleteNote}>
              <Trash2 size={17} />
            </IconButton>
          ) : null}
        </div>
      </header>

      <MarkdownFindReplace
        open={isFindOpen}
        value={value}
        onClose={() => setIsFindOpen(false)}
        onReplace={replaceValue}
      />

      <div className="markdown-editor-workspace">
        <VditorMarkdownEditor
          ref={editorRef}
          value={value}
          placeholder={placeholder}
          autoFocus={autoFocus}
          onChange={onChange}
          onSaveShortcut={onSave}
        />
      </div>
    </section>
  );
}
