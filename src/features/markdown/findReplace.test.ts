import { describe, expect, it } from "vitest";

import { findMarkdownMatches, replaceAllMarkdownMatches, replaceMarkdownMatch } from "./findReplace";

describe("findReplace", () => {
  it("finds all plain-text markdown matches case-insensitively by default", () => {
    expect(findMarkdownMatches("Alpha beta alpha", "alpha")).toEqual([
      { index: 0, length: 5 },
      { index: 11, length: 5 },
    ]);
  });

  it("can match case sensitively", () => {
    expect(findMarkdownMatches("Alpha beta alpha", "alpha", { caseSensitive: true })).toEqual([{ index: 11, length: 5 }]);
  });

  it("handles empty query safely", () => {
    expect(findMarkdownMatches("Alpha", "")).toEqual([]);
  });

  it("replaces one selected match", () => {
    const source = "Alpha beta alpha";
    const matches = findMarkdownMatches(source, "alpha");

    expect(replaceMarkdownMatch(source, matches[1], "gamma")).toBe("Alpha beta gamma");
  });

  it("replaces all matches while preserving unmatched content", () => {
    expect(replaceAllMarkdownMatches("Alpha beta alpha", "alpha", "gamma")).toBe("gamma beta gamma");
  });
});
