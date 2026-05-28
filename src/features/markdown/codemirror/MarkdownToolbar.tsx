import type { ReactNode } from "react";
import type { EditorView } from "@codemirror/view";
import {
  Bold,
  Braces,
  CheckSquare,
  Code2,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  Link,
  List,
  ListChecks,
  ListOrdered,
  PanelRightClose,
  PanelRightOpen,
  Quote,
  Redo2,
  Table2,
  Undo2,
} from "lucide-react";
import { markdownCommandActions } from "./markdownCommands";

interface MarkdownToolbarProps {
  view: EditorView | null;
  outlineOpen: boolean;
  onToggleOutline: () => void;
}

interface ToolbarAction {
  label: string;
  icon: ReactNode;
  run: (view: EditorView) => boolean | void;
}

const primaryActions: ToolbarAction[] = [
  { label: "撤销", icon: <Undo2 size={16} />, run: markdownCommandActions.undo },
  { label: "重做", icon: <Redo2 size={16} />, run: markdownCommandActions.redo },
  { label: "一级标题", icon: <Heading1 size={16} />, run: markdownCommandActions.h1 },
  { label: "二级标题", icon: <Heading2 size={16} />, run: markdownCommandActions.h2 },
  { label: "三级标题", icon: <Heading3 size={16} />, run: markdownCommandActions.h3 },
  { label: "加粗", icon: <Bold size={16} />, run: markdownCommandActions.bold },
  { label: "斜体", icon: <Italic size={16} />, run: markdownCommandActions.italic },
  { label: "行内代码", icon: <Code2 size={16} />, run: markdownCommandActions.inlineCode },
  { label: "引用", icon: <Quote size={16} />, run: markdownCommandActions.quote },
  { label: "无序列表", icon: <List size={16} />, run: markdownCommandActions.bulletList },
  { label: "有序列表", icon: <ListOrdered size={16} />, run: markdownCommandActions.orderedList },
  { label: "任务列表", icon: <CheckSquare size={16} />, run: markdownCommandActions.task },
  { label: "链接", icon: <Link size={16} />, run: markdownCommandActions.link },
  { label: "表格", icon: <Table2 size={16} />, run: markdownCommandActions.table },
  { label: "代码块", icon: <Braces size={16} />, run: markdownCommandActions.codeBlock },
];

export function MarkdownToolbar({ view, outlineOpen, onToggleOutline }: MarkdownToolbarProps) {
  function runAction(action: ToolbarAction) {
    if (!view) return;
    action.run(view);
  }

  return (
    <div className="markdown-toolbar" aria-label="Markdown 编辑工具栏">
      <button
        type="button"
        className="markdown-outline-toggle"
        title={outlineOpen ? "收起大纲" : "展开大纲"}
        aria-label={outlineOpen ? "收起大纲" : "展开大纲"}
        onClick={onToggleOutline}
      >
        {outlineOpen ? <PanelRightClose size={16} /> : <PanelRightOpen size={16} />}
        <ListChecks size={16} />
      </button>
      <div className="markdown-toolbar-group">
        {primaryActions.map((action) => (
          <button key={action.label} type="button" title={action.label} aria-label={action.label} onClick={() => runAction(action)}>
            {action.icon}
          </button>
        ))}
      </div>
    </div>
  );
}
