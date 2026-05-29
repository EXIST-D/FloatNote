/* @vitest-environment jsdom */

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { MarkdownFindReplace } from "./MarkdownFindReplace";

const changeInput = (input: HTMLInputElement, value: string) => {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
  setter?.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
};

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe("MarkdownFindReplace", () => {
  let host: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    host = document.createElement("div");
    document.body.appendChild(host);
    root = createRoot(host);
  });

  afterEach(() => {
    root.unmount();
    host.remove();
  });

  it("shows match count and replaces the current match", async () => {
    const onReplace = vi.fn();

    await act(async () => {
      root.render(<MarkdownFindReplace open value="Alpha beta alpha" onClose={() => {}} onReplace={onReplace} />);
    });

    await act(async () => {
      changeInput(document.querySelector<HTMLInputElement>('input[aria-label="查找内容"]')!, "alpha");
      changeInput(document.querySelector<HTMLInputElement>('input[aria-label="替换内容"]')!, "gamma");
    });

    expect(document.querySelector('[aria-label="匹配数量"]')?.textContent).toBe("1/2");

    await act(async () => {
      document.querySelector<HTMLButtonElement>("button.markdown-find-text")?.click();
    });

    expect(onReplace).toHaveBeenCalledWith("gamma beta alpha");
  });

  it("can replace all matches", async () => {
    const onReplace = vi.fn();

    await act(async () => {
      root.render(<MarkdownFindReplace open value="Alpha beta alpha" onClose={() => {}} onReplace={onReplace} />);
    });

    await act(async () => {
      changeInput(document.querySelector<HTMLInputElement>('input[aria-label="查找内容"]')!, "alpha");
      changeInput(document.querySelector<HTMLInputElement>('input[aria-label="替换内容"]')!, "gamma");
    });

    const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>("button.markdown-find-text"));
    await act(async () => {
      buttons[1].click();
    });

    expect(onReplace).toHaveBeenCalledWith("gamma beta gamma");
  });

  it("closes through the close button", async () => {
    const onClose = vi.fn();

    await act(async () => {
      root.render(<MarkdownFindReplace open value="" onClose={onClose} onReplace={() => {}} />);
    });

    await act(async () => {
      document.querySelector<HTMLButtonElement>('button[aria-label="关闭查找替换"]')?.click();
    });

    expect(onClose).toHaveBeenCalled();
  });
});
