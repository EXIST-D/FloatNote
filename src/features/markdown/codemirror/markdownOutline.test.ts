import { describe, expect, it } from "vitest";
import { countMarkdownWords, extractMarkdownOutline } from "./markdownOutline";

describe("extractMarkdownOutline", () => {
  it("extracts h1 to h3 headings with line numbers", () => {
    const outline = extractMarkdownOutline("# 项目\n\n## 今日\n内容\n### 灵感\n#### 忽略");

    expect(outline).toEqual([
      { id: "项目-0", level: 1, title: "项目", line: 1 },
      { id: "今日-1", level: 2, title: "今日", line: 3 },
      { id: "灵感-2", level: 3, title: "灵感", line: 5 },
    ]);
  });

  it("ignores headings inside fenced code", () => {
    const outline = extractMarkdownOutline("## 正文\n```ts\n# 代码标题\n```\n### 结尾");

    expect(outline.map((item) => item.title)).toEqual(["正文", "结尾"]);
  });
});

describe("countMarkdownWords", () => {
  it("counts Chinese characters and latin words without markdown marks", () => {
    expect(countMarkdownWords("# 今日计划\n写 Markdown editor and tests")).toBe(9);
  });
});
