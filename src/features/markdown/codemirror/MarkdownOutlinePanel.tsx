import { ChevronDown, ChevronRight, PanelRightClose, Pin, PinOff } from "lucide-react";
import type { MarkdownOutlineItem } from "./markdownOutline";

interface MarkdownOutlinePanelProps {
  items: MarkdownOutlineItem[];
  wordCount: number;
  lineCount: number;
  pinned: boolean;
  collapsedGroups: Set<string>;
  onJump: (line: number) => void;
  onClose: () => void;
  onTogglePinned: () => void;
  onToggleGroup: (id: string) => void;
}

function isHiddenByCollapsedGroup(item: MarkdownOutlineItem, items: MarkdownOutlineItem[], collapsedGroups: Set<string>) {
  if (item.level !== 3) return false;

  const currentIndex = items.findIndex((candidate) => candidate.id === item.id);
  for (let index = currentIndex - 1; index >= 0; index -= 1) {
    const parent = items[index];
    if (parent.level === 2) return collapsedGroups.has(parent.id);
    if (parent.level === 1) return false;
  }

  return false;
}

export function MarkdownOutlinePanel({
  items,
  wordCount,
  lineCount,
  pinned,
  collapsedGroups,
  onJump,
  onClose,
  onTogglePinned,
  onToggleGroup,
}: MarkdownOutlinePanelProps) {
  return (
    <aside className={`markdown-outline-panel ${pinned ? "is-pinned" : ""}`}>
      <header>
        <div>
          <strong>文稿大纲</strong>
          <small>{items.length ? `${items.length} 个标题` : "暂无标题"}</small>
        </div>
        <div className="markdown-outline-actions">
          <button type="button" title={pinned ? "取消固定" : "固定大纲"} aria-label={pinned ? "取消固定" : "固定大纲"} onClick={onTogglePinned}>
            {pinned ? <PinOff size={14} /> : <Pin size={14} />}
          </button>
          <button type="button" title="收起大纲" aria-label="收起大纲" onClick={onClose}>
            <PanelRightClose size={14} />
          </button>
        </div>
      </header>
      <div className="markdown-outline-stats">
        <span>
          <strong>{wordCount}</strong>
          字词
        </span>
        <span>
          <strong>{lineCount}</strong>
          行
        </span>
      </div>
      <div className="markdown-outline-list">
        {items.length === 0 ? (
          <p className="markdown-outline-empty">使用 H1 / H2 / H3 标题后，这里会自动生成大纲。</p>
        ) : (
          items.map((item) => {
            if (isHiddenByCollapsedGroup(item, items, collapsedGroups)) return null;
            const isCollapsible = item.level === 2 && items.some((candidate) => candidate.level === 3 && candidate.line > item.line);
            const collapsed = collapsedGroups.has(item.id);

            return (
              <button
                key={item.id}
                type="button"
                className={`markdown-outline-item level-${item.level}`}
                onClick={() => (isCollapsible ? onToggleGroup(item.id) : onJump(item.line))}
                onDoubleClick={() => onJump(item.line)}
              >
                <span className="markdown-outline-chevron">
                  {isCollapsible ? collapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} /> : null}
                </span>
                <span>{item.title}</span>
                <em>{item.line}</em>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
}
