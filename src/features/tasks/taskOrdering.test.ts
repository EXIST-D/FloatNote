import { describe, expect, it } from "vitest";
import type { Task } from "../../types/domain";
import { buildReorderedTasks } from "./taskOrdering";

function makeTask(id: string, sortOrder: number): Task {
  return {
    id,
    scope: "today",
    title: id,
    status: "active",
    sortOrder,
    plannedDate: "2026-05-27",
    weekKey: null,
    createdAt: "2026-05-27T00:00:00.000Z",
    updatedAt: "2026-05-27T00:00:00.000Z",
    completedAt: null,
  };
}

describe("buildReorderedTasks", () => {
  it("moves an item forward and rewrites stable sort orders", () => {
    const result = buildReorderedTasks([makeTask("a", 1), makeTask("b", 2), makeTask("c", 3)], "a", "c");
    expect(result.map((task) => [task.id, task.sortOrder])).toEqual([
      ["b", 1],
      ["c", 2],
      ["a", 3],
    ]);
  });

  it("moves an item backward and rewrites stable sort orders", () => {
    const result = buildReorderedTasks([makeTask("a", 1), makeTask("b", 2), makeTask("c", 3)], "c", "a");
    expect(result.map((task) => [task.id, task.sortOrder])).toEqual([
      ["c", 1],
      ["a", 2],
      ["b", 3],
    ]);
  });

  it("returns the same order when active and over ids match", () => {
    const result = buildReorderedTasks([makeTask("a", 4), makeTask("b", 9)], "a", "a");
    expect(result.map((task) => [task.id, task.sortOrder])).toEqual([
      ["a", 1],
      ["b", 2],
    ]);
  });
});
