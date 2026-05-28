import { ArrowRight, FileText, ListTree, PanelRightClose, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { EmptyState } from "../../components/common/EmptyState";
import { IconButton } from "../../components/common/IconButton";
import { Toast } from "../../components/common/Toast";
import { PanelBody } from "../../components/layout/PanelBody";
import type { Note, TaskScope } from "../../types/domain";
import { useNotes } from "../notes/useNotes";
import { MarkdownStudioHeader } from "./MarkdownStudioHeader";
import { useMarkdownAutosave, type MarkdownSaveStatus } from "./useMarkdownAutosave";
import { VditorMarkdownEditor, type VditorMarkdownEditorHandle } from "./vditor/VditorMarkdownEditor";

export interface MarkdownOutlineItem {
  id: string;
  index: number;
  level: number;
  title: string;
}

function getNoteTitle(content: string) {
  const firstLine = content
    .split("\n")
    .map((line) => line.trim())
    .find(Boolean);

  return (firstLine ?? "未命名灵感")
    .replace(/^#{1,6}\s+/, "")
    .replace(/^[-*+]\s+/, "")
    .replace(/^>\s+/, "")
    .slice(0, 36);
}

function getNoteExcerpt(content: string) {
  return content
    .replace(/```[\s\S]*?```/g, " 代码片段 ")
    .replace(/[#>*_`~|\-[\]()]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 84);
}

function cleanHeadingText(value: string) {
  return value
    .replace(/[*_`~[\]()]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function extractMarkdownOutline(content: string): MarkdownOutlineItem[] {
  const items: MarkdownOutlineItem[] = [];

  content.split(/\r?\n/).forEach((line, lineIndex) => {
    const match = /^(#{1,6})\s+(.+)$/.exec(line.trim());
    if (!match) return;

    items.push({
      id: `${lineIndex}-${items.length}`,
      index: items.length,
      level: match[1].length,
      title: cleanHeadingText(match[2]) || "未命名标题",
    });
  });

  return items;
}

function formatNoteDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getSaveStatusLabel(status: MarkdownSaveStatus, isNewDraft: boolean, error: string | null) {
  if (isNewDraft) return "草稿";
  if (status === "dirty") return "有未保存修改";
  if (status === "saving") return "保存中...";
  if (status === "saved") return "已保存";
  if (status === "error") return error ? `保存失败：${error}` : "保存失败";
  return "已同步";
}

export function MarkdownStudio() {
  const { notes, loading, error, addNote, editNote, convertNote, removeNote } = useNotes();
  const editorRef = useRef<VditorMarkdownEditorHandle | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const selectedNote = useMemo(() => notes.find((note) => note.id === selectedId) ?? null, [notes, selectedId]);
  const isNewDraft = selectedId === null;
  const outline = useMemo(() => extractMarkdownOutline(draft), [draft]);

  const autosave = useMarkdownAutosave({
    noteId: selectedId,
    value: draft,
    initialValue: selectedNote?.content ?? "",
    enabled: Boolean(selectedId),
    onSave: editNote,
  });

  useEffect(() => {
    if (selectedId && notes.some((note) => note.id === selectedId)) return;
    const firstNote = notes[0];
    if (!firstNote) {
      setSelectedId(null);
      return;
    }
    setSelectedId(firstNote.id);
    setDraft(firstNote.content);
  }, [notes, selectedId]);

  useEffect(() => {
    if (!feedback) return undefined;

    const timeoutId = window.setTimeout(() => setFeedback(null), 1800);
    return () => window.clearTimeout(timeoutId);
  }, [feedback]);

  async function startNewNote() {
    if (selectedId) await autosave.saveNow(draft);
    setSelectedId(null);
    setDraft("");
    window.setTimeout(() => editorRef.current?.focus(), 0);
  }

  async function selectNote(note: Note) {
    if (selectedId && selectedId !== note.id) await autosave.saveNow(draft);
    setSelectedId(note.id);
    setDraft(note.content);
    window.setTimeout(() => editorRef.current?.focus(), 0);
  }

  async function saveNewNote() {
    const nextContent = draft.trim();
    if (!nextContent || saving) return;

    setSaving(true);
    try {
      const note = await addNote(nextContent);
      setSelectedId(note.id);
      setDraft(note.content);
      setFeedback("已收进灵感");
    } finally {
      setSaving(false);
    }
  }

  async function convert(scope: TaskScope) {
    if (!selectedNote && !draft.trim()) return;

    const note = selectedNote ?? {
      id: "draft",
      content: draft,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      archivedAt: null,
    };

    await convertNote(note, scope);
    setFeedback(scope === "today" ? "已转为今日任务" : "已转为本周任务");
  }

  async function deleteSelectedNote() {
    if (!selectedNote) return;
    await removeNote(selectedNote.id);
    setFeedback("灵感已移入回收站");
  }

  const title = isNewDraft ? "新灵感草稿" : getNoteTitle(draft || selectedNote?.content || "");
  const saveStatus = getSaveStatusLabel(autosave.status, isNewDraft, autosave.error);

  return (
    <PanelBody className="markdown-studio">
      <MarkdownStudioHeader
        title={title}
        saveStatus={saveStatus}
        canSaveNew={Boolean(draft.trim())}
        isNewDraft={isNewDraft}
        saving={saving}
        onNew={() => void startNewNote()}
        onSaveNew={() => void saveNewNote()}
      />
      {error && <p className="rounded-md bg-red-50 p-2 text-xs text-red-700">{error}</p>}
      <div className="markdown-studio-layout markdown-studio-layout-vditor is-outline-open">
        <aside className="markdown-studio-sidebar">
          <button type="button" className={`markdown-note-item ${isNewDraft ? "is-active" : ""}`} onClick={() => void startNewNote()}>
            <FileText size={15} />
            <span className="min-w-0">
              <strong>新灵感草稿</strong>
              <small>用 Markdown 记录一段新的想法</small>
            </span>
          </button>
          {loading ? (
            <p className="p-2 text-xs text-[var(--text-muted)]">正在读取灵感...</p>
          ) : notes.length === 0 ? (
            <EmptyState title="还没有灵感记录" />
          ) : (
            <div className="markdown-note-list">
              {notes.map((note) => (
                <button
                  key={note.id}
                  type="button"
                  className={`markdown-note-item ${selectedId === note.id ? "is-active" : ""}`}
                  onClick={() => void selectNote(note)}
                >
                  <span className="markdown-note-dot" />
                  <span className="min-w-0">
                    <strong>{getNoteTitle(note.content)}</strong>
                    <small>{getNoteExcerpt(note.content) || "Markdown 灵感"}</small>
                    <em>{formatNoteDate(note.updatedAt)}</em>
                  </span>
                </button>
              ))}
            </div>
          )}
        </aside>
        <section
          className="markdown-studio-editor"
          onKeyDown={(event) => {
            if ((event.ctrlKey || event.metaKey) && event.key === "Enter" && isNewDraft) {
              event.preventDefault();
              void saveNewNote();
            }
          }}
        >
          <div className="markdown-studio-editor-actions">
            <button type="button" className="note-action" disabled={!draft.trim()} onClick={() => void convert("today")}>
              <ArrowRight size={12} />
              今日任务
            </button>
            <button type="button" className="note-action" disabled={!draft.trim()} onClick={() => void convert("week")}>
              <ArrowRight size={12} />
              本周任务
            </button>
            <button type="button" className="note-action is-active" aria-pressed="true" onClick={() => editorRef.current?.focus()}>
              <PanelRightClose size={12} />
              大纲
            </button>
            {!isNewDraft && (
              <IconButton label="删除灵感" onClick={() => void deleteSelectedNote()}>
                <Trash2 size={14} />
              </IconButton>
            )}
          </div>
          <div className="markdown-editor-workspace is-outline-open">
            <div className="markdown-editor-frame markdown-editor-frame-vditor">
              <VditorMarkdownEditor
                ref={editorRef}
                value={draft}
                autoFocus
                onChange={setDraft}
                onSaveShortcut={() => (isNewDraft ? void saveNewNote() : void autosave.saveNow(draft))}
              />
            </div>
            <aside className="markdown-outline-panel-vditor" aria-label="Markdown 大纲">
              <header>
                <span>
                  <ListTree size={15} />
                  文稿大纲
                </span>
                <small>{outline.length > 0 ? `${outline.length} 个标题` : "暂无标题"}</small>
              </header>
              {outline.length === 0 ? (
                <p className="markdown-outline-empty-vditor">使用 #、##、### 写标题后，这里会自动生成层级。</p>
              ) : (
                <div className="markdown-outline-list-vditor">
                  {outline.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`markdown-outline-item-vditor level-${Math.min(item.level, 4)}`}
                      onClick={() => editorRef.current?.scrollToHeading(item.index)}
                    >
                      <em>H{item.level}</em>
                      <span>{item.title}</span>
                    </button>
                  ))}
                </div>
              )}
            </aside>
          </div>
        </section>
      </div>
      <Toast message={feedback} />
    </PanelBody>
  );
}
