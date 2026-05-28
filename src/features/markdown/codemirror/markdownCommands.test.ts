/* @vitest-environment jsdom */

import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { afterEach, describe, expect, it } from "vitest";
import { insertLink, prefixSelectedLines, setHeading, toggleTaskLine, wrapSelection } from "./markdownCommands";

function createView(doc: string, selection?: { anchor: number; head?: number }) {
  return new EditorView({
    state: EditorState.create({
      doc,
      selection: selection ? { anchor: selection.anchor, head: selection.head ?? selection.anchor } : undefined,
    }),
    parent: document.body,
  });
}

describe("markdownCommands", () => {
  const views: EditorView[] = [];

  afterEach(() => {
    while (views.length) views.pop()?.destroy();
  });

  function view(doc: string, selection?: { anchor: number; head?: number }) {
    const nextView = createView(doc, selection);
    views.push(nextView);
    return nextView;
  }

  it("wraps selected text", () => {
    const editor = view("浮笺", { anchor: 0, head: 2 });
    wrapSelection(editor, "**");

    expect(editor.state.doc.toString()).toBe("**浮笺**");
  });

  it("sets heading markers on selected lines", () => {
    const editor = view("标题\n正文", { anchor: 0, head: 2 });
    setHeading(editor, 2);

    expect(editor.state.doc.toString()).toBe("## 标题\n正文");
  });

  it("toggles task line state", () => {
    const editor = view("完成测试");
    toggleTaskLine(editor);
    expect(editor.state.doc.toString()).toBe("- [ ] 完成测试");

    toggleTaskLine(editor);
    expect(editor.state.doc.toString()).toBe("- [x] 完成测试");
  });

  it("prefixes selected lines", () => {
    const editor = view("第一行\n第二行", { anchor: 0, head: 5 });
    prefixSelectedLines(editor, "> ");

    expect(editor.state.doc.toString()).toBe("> 第一行\n> 第二行");
  });

  it("inserts link around selected text", () => {
    const editor = view("GitHub", { anchor: 0, head: 6 });
    insertLink(editor);

    expect(editor.state.doc.toString()).toBe("[GitHub](https://)");
  });
});
