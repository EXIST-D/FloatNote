// @vitest-environment jsdom

import { act } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it } from "vitest";
import { MarkdownReader } from "./MarkdownReader";

async function renderMarkdown(markdown: string) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  await act(async () => {
    root.render(<MarkdownReader content={markdown} />);
  });
  return { container, root };
}

describe("MarkdownReader", () => {
  it("renders common markdown safely", async () => {
    const markdown = [
      "# 标题",
      "",
      "- [x] 已完成",
      "- [ ] 待处理",
      "",
      "| 列 | 值 |",
      "| --- | --- |",
      "| A | B |",
      "",
      "> 引用",
      "",
      "```ts",
      "const value = 1;",
      "```",
      "",
      "<script>alert(1)</script>",
    ].join("\n");

    const { container, root } = await renderMarkdown(markdown);
    expect(container.querySelector("h1")?.textContent).toBe("标题");
    expect(container.querySelectorAll("input[type='checkbox']")).toHaveLength(2);
    expect(container.querySelector("table")).not.toBeNull();
    expect(container.querySelector("blockquote")?.textContent).toContain("引用");
    expect(container.querySelector("code")?.textContent).toContain("const value = 1;");
    expect(container.querySelector("script")).toBeNull();
    await act(async () => root.unmount());
  });
});
