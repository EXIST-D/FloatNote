import { afterEach, describe, expect, it, vi } from "vitest";
import { createMarkdownAutosaveScheduler } from "./useMarkdownAutosave";

describe("createMarkdownAutosaveScheduler", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("debounces saves and flushes the latest markdown", async () => {
    vi.useFakeTimers();
    const save = vi.fn(async () => undefined);
    const scheduler = createMarkdownAutosaveScheduler(save, 400);

    scheduler.queue("# 第一版");
    scheduler.queue("# 第二版");

    await vi.advanceTimersByTimeAsync(399);
    expect(save).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);
    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledWith("# 第二版");
  });

  it("can flush pending markdown immediately", async () => {
    vi.useFakeTimers();
    const save = vi.fn(async () => undefined);
    const scheduler = createMarkdownAutosaveScheduler(save, 800);

    scheduler.queue("即时保存");
    await scheduler.flush();

    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledWith("即时保存");
  });
});
