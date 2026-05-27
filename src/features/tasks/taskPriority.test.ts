import { describe, expect, it } from "vitest";
import { DEFAULT_PRIORITY_COLORS, getPriorityColor, isTaskPriority, priorityColorsToCssVars } from "./taskPriority";

describe("taskPriority", () => {
  it("accepts only high medium low", () => {
    expect(isTaskPriority("high")).toBe(true);
    expect(isTaskPriority("medium")).toBe(true);
    expect(isTaskPriority("low")).toBe(true);
    expect(isTaskPriority("urgent")).toBe(false);
  });

  it("uses amber as default medium priority color", () => {
    expect(DEFAULT_PRIORITY_COLORS.medium).toBe("#d6a441");
    expect(getPriorityColor("medium", DEFAULT_PRIORITY_COLORS)).toBe("#d6a441");
  });

  it("exports priority colors as css variables", () => {
    expect(priorityColorsToCssVars(DEFAULT_PRIORITY_COLORS)).toEqual({
      "--priority-high": "#c95742",
      "--priority-medium": "#d6a441",
      "--priority-low": "#4f8b6c",
    });
  });
});
