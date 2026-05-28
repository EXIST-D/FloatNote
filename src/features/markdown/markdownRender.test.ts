import { describe, expect, it } from "vitest";
import { renderMarkdownToHtml } from "./markdownRender";

describe("renderMarkdownToHtml", () => {
  it("renders headings, task lists and links", () => {
    const html = renderMarkdownToHtml("# 标题\n- [x] 完成\n- [ ] 待办\n[链接](https://example.com)");
    expect(html).toContain("<h1>标题</h1>");
    expect(html).toContain("checked");
    expect(html).toContain('href="https://example.com"');
  });

  it("renders quotes, code blocks, emphasis and line breaks", () => {
    const html = renderMarkdownToHtml("> 摘录\n\n**重点** 和 *斜体*\n\n```ts\nconst value = 1;\n```");
    expect(html).toContain("<blockquote>摘录</blockquote>");
    expect(html).toContain("<strong>重点</strong>");
    expect(html).toContain("<em>斜体</em>");
    expect(html).toContain("<pre><code>");
    expect(html).toContain("const value = 1;");
  });

  it("escapes raw html", () => {
    expect(renderMarkdownToHtml("<script>alert(1)</script>")).toContain("&lt;script&gt;");
  });
});
