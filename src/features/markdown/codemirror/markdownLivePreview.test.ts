import { describe, expect, it } from "vitest";
import { classifyMarkdownLine } from "./markdownLivePreview";

describe("classifyMarkdownLine", () => {
  it("recognizes headings", () => {
    expect(classifyMarkdownLine("## 今日计划")).toMatchObject({
      kind: "heading",
      headingLevel: 2,
      prefixLength: 3,
    });
  });

  it("recognizes task state", () => {
    expect(classifyMarkdownLine("- [x] 已完成")).toMatchObject({
      kind: "task",
      checked: true,
    });
    expect(classifyMarkdownLine("- [ ] 未完成")).toMatchObject({
      kind: "task",
      checked: false,
    });
  });

  it("recognizes quote, list and fence lines", () => {
    expect(classifyMarkdownLine("> 引用")).toMatchObject({ kind: "quote" });
    expect(classifyMarkdownLine("1. 步骤")).toMatchObject({ kind: "list" });
    expect(classifyMarkdownLine("```ts")).toMatchObject({ kind: "fence" });
  });
});
