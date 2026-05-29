import { describe, expect, it } from "vitest";

import { buildVditorOptions, markdownToolbar, toolbarTipLabels } from "./vditorConfig";

describe("vditorConfig", () => {
  it("builds a full Markdown Studio toolbar inspired by tauri-markdown", () => {
    const more = markdownToolbar.find((item) => typeof item === "object" && item.name === "more") as IMenuItem | undefined;

    expect(markdownToolbar).toEqual(
      expect.arrayContaining([
        "outline",
        expect.objectContaining({ name: "undo", tipPosition: "s" }),
        expect.objectContaining({ name: "redo", tipPosition: "s" }),
        expect.objectContaining({ name: "headings", tip: "标题" }),
        expect.objectContaining({ name: "bold", tip: "加粗" }),
        expect.objectContaining({ name: "italic", tip: "斜体" }),
        expect.objectContaining({ name: "strike", tip: "删除线" }),
        expect.objectContaining({ name: "link", tip: "链接" }),
        expect.objectContaining({ name: "list", tip: "无序列表" }),
        expect.objectContaining({ name: "ordered-list", tip: "有序列表" }),
        expect.objectContaining({ name: "check", tip: "任务列表" }),
        expect.objectContaining({ name: "quote", tip: "引用" }),
        expect.objectContaining({ name: "code", tip: "代码块" }),
        expect.objectContaining({ name: "table", tip: "表格" }),
        expect.objectContaining({ name: "edit-mode", tip: "编辑模式" }),
        expect.objectContaining({
          name: "more",
          toolbar: expect.arrayContaining(["both", "code-theme", "content-theme", "preview", "info", "help"]),
        }),
      ]),
    );
    expect(more?.toolbar).toEqual(
      expect.arrayContaining([
        "both",
        "preview",
        expect.objectContaining({ name: "emoji", tip: "表情" }),
        expect.objectContaining({ name: "line", tip: "分割线" }),
        expect.objectContaining({ name: "inline-code", tip: "行内代码" }),
        expect.objectContaining({ name: "indent", tip: "增加缩进" }),
        expect.objectContaining({ name: "outdent", tip: "减少缩进" }),
        expect.objectContaining({ name: "insert-before", tip: "前方插入" }),
        expect.objectContaining({ name: "insert-after", tip: "后方插入" }),
        "code-theme",
        "content-theme",
        "info",
        "help",
      ]),
    );
  });

  it("defines Chinese toolbar tips for custom tooltip fallback", () => {
    expect(toolbarTipLabels.italic).toBe("斜体");
    expect(toolbarTipLabels["ordered-list"]).toBe("有序列表");
    expect(toolbarTipLabels["edit-mode"]).toBe("编辑模式");
  });

  it("builds Vditor options with outline, counter, preview and pinned toolbar", () => {
    const options = buildVditorOptions({
      cdn: "/vendor/vditor",
      placeholder: "写一点 Markdown",
      value: "# 初始",
      onInput: () => undefined,
      onReady: () => undefined,
    });

    expect(options.mode).toBe("ir");
    expect(options.lang).toBe("zh_CN");
    expect(options.cache).toEqual({ enable: false });
    expect(options.outline).toEqual({ enable: true, position: "left" });
    expect(options.counter).toEqual({ enable: true });
    expect(options.toolbarConfig).toEqual({ pin: true });
    expect(options.preview?.markdown).toEqual(
      expect.objectContaining({
        toc: true,
        mark: true,
        footnotes: true,
        autoSpace: true,
      }),
    );
    expect(options.preview?.math).toEqual({ engine: "KaTeX" });
    expect(options.preview?.hljs).toEqual(expect.objectContaining({ enable: true, lineNumber: true }));
  });
});
