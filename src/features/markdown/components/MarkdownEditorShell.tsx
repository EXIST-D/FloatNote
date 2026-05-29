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
        }
      }}
    >
      <header className="markdown-editor-shell-header">
        <div className="markdown-editor-title-block">
          <FileText size={18} aria-hidden="true" />
          <div>
            <h3>{title}</h3>
            <span>{saveStatus}</span>
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
        value={editorRef.current?.getValue() ?? value}
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
