import { describe, expect, it } from "vitest";
import { extractMarkdownOutline } from "./MarkdownStudio";

describe("extractMarkdownOutline", () => {
  it("builds a heading outline from markdown content", () => {
    expect(
      extractMarkdownOutline(`
# 今日

普通文本
## **答案**
### \`细节\`
      `),
    ).toEqual([
      { id: "1-0", index: 0, level: 1, title: "今日" },
      { id: "4-1", index: 1, level: 2, title: "答案" },
      { id: "5-2", index: 2, level: 3, title: "细节" },
    ]);
  });
});
