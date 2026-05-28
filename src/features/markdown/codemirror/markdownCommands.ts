import type { EditorView } from "@codemirror/view";
import { redo, undo } from "@codemirror/commands";

export type MarkdownWrapToken = "**" | "*" | "`";

function getSelectedText(view: EditorView) {
  const selection = view.state.selection.main;
  return {
    from: selection.from,
    to: selection.to,
    text: view.state.doc.sliceString(selection.from, selection.to),
  };
}

function lineRangeForSelection(view: EditorView) {
  const selection = view.state.selection.main;
  const startLine = view.state.doc.lineAt(selection.from);
  const endLine = view.state.doc.lineAt(selection.to);
  return { from: startLine.from, to: endLine.to };
}

export function wrapSelection(view: EditorView, token: MarkdownWrapToken) {
  const { from, to, text } = getSelectedText(view);
  const hasSelection = from !== to;
  const nextText = hasSelection ? `${token}${text}${token}` : `${token}${token}`;
  const cursorOffset = hasSelection ? nextText.length : token.length;

  view.dispatch({
    changes: { from, to, insert: nextText },
    selection: { anchor: from + cursorOffset },
    userEvent: "input",
  });
  view.focus();
}

export function setHeading(view: EditorView, level: 1 | 2 | 3) {
  const range = lineRangeForSelection(view);
  const currentText = view.state.doc.sliceString(range.from, range.to);
  const marker = "#".repeat(level);
  const nextText = currentText
    .split("\n")
    .map((line) => {
      if (!line.trim()) return line;
      return `${marker} ${line.replace(/^#{1,6}\s+/, "")}`;
    })
    .join("\n");

  view.dispatch({
    changes: { from: range.from, to: range.to, insert: nextText },
    selection: { anchor: range.from + nextText.length },
    userEvent: "input",
  });
  view.focus();
}

export function prefixSelectedLines(view: EditorView, prefix: string) {
  const range = lineRangeForSelection(view);
  const currentText = view.state.doc.sliceString(range.from, range.to);
  const nextText = currentText
    .split("\n")
    .map((line) => {
      if (!line.trim()) return `${prefix}`;
      return line.startsWith(prefix) ? line.slice(prefix.length) : `${prefix}${line}`;
    })
    .join("\n");

  view.dispatch({
    changes: { from: range.from, to: range.to, insert: nextText },
    selection: { anchor: range.from + nextText.length },
    userEvent: "input",
  });
  view.focus();
}

export function toggleTaskLine(view: EditorView) {
  const range = lineRangeForSelection(view);
  const currentText = view.state.doc.sliceString(range.from, range.to);
  const nextText = currentText
    .split("\n")
    .map((line) => {
      if (/^\s*[-*+]\s+\[[ xX]\]\s+/.test(line)) {
        return line.replace(/^(\s*[-*+]\s+\[)( |x|X)(\]\s+)/, (_, start: string, state: string, end: string) =>
          `${start}${state === " " ? "x" : " "}${end}`,
        );
      }
      if (/^\s*[-*+]\s+/.test(line)) {
        return line.replace(/^(\s*[-*+]\s+)/, "$1[ ] ");
      }
      return line.trim() ? `- [ ] ${line}` : "- [ ] ";
    })
    .join("\n");

  view.dispatch({
    changes: { from: range.from, to: range.to, insert: nextText },
    selection: { anchor: range.from + nextText.length },
    userEvent: "input",
  });
  view.focus();
}

export function insertBlock(view: EditorView, block: string) {
  const { from, to } = getSelectedText(view);
  const prefix = from > 0 && view.state.doc.sliceString(from - 1, from) !== "\n" ? "\n" : "";
  const suffix = to < view.state.doc.length && view.state.doc.sliceString(to, to + 1) !== "\n" ? "\n" : "";
  const insert = `${prefix}${block}${suffix}`;

  view.dispatch({
    changes: { from, to, insert },
    selection: { anchor: from + insert.length },
    userEvent: "input",
  });
  view.focus();
}

export function insertLink(view: EditorView) {
  const { from, to, text } = getSelectedText(view);
  const label = text || "链接文字";
  const insert = `[${label}](https://)`;
  const cursor = from + insert.length - 1;

  view.dispatch({
    changes: { from, to, insert },
    selection: { anchor: cursor },
    userEvent: "input",
  });
  view.focus();
}

export const markdownCommandActions = {
  bold: (view: EditorView) => wrapSelection(view, "**"),
  italic: (view: EditorView) => wrapSelection(view, "*"),
  inlineCode: (view: EditorView) => wrapSelection(view, "`"),
  h1: (view: EditorView) => setHeading(view, 1),
  h2: (view: EditorView) => setHeading(view, 2),
  h3: (view: EditorView) => setHeading(view, 3),
  bulletList: (view: EditorView) => prefixSelectedLines(view, "- "),
  orderedList: (view: EditorView) => prefixSelectedLines(view, "1. "),
  quote: (view: EditorView) => prefixSelectedLines(view, "> "),
  task: toggleTaskLine,
  codeBlock: (view: EditorView) => insertBlock(view, "```txt\n\n```"),
  table: (view: EditorView) => insertBlock(view, "| 项目 | 内容 |\n| --- | --- |\n|  |  |"),
  link: insertLink,
  undo,
  redo,
};
