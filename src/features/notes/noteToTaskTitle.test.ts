import { describe, expect, it } from "vitest";
import { noteToTaskTitle } from "./noteToTaskTitle";

describe("noteToTaskTitle", () => {
  it("uses the first non-empty line as task title", () => {
    expect(noteToTaskTitle("  \n  整理本周组会提纲\n补充引用材料")).toBe("整理本周组会提纲");
  });

  it("falls back when note content is blank", () => {
    expect(noteToTaskTitle(" \n\t ")).toBe("未命名灵感");
  });

  it("keeps long Chinese titles readable by clipping at 60 characters", () => {
    const title = "这是一段非常长的灵感内容".repeat(6);
    expect(noteToTaskTitle(title)).toHaveLength(61);
    expect(noteToTaskTitle(title).endsWith("…")).toBe(true);
  });
});
