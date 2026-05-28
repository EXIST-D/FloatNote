/* @vitest-environment jsdom */

import { createRoot, type Root } from "react-dom/client";
import { act } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { VditorMarkdownEditor } from "./VditorMarkdownEditor";

const destroyMock = vi.fn();
const setValueMock = vi.fn();
const disabledCacheMock = vi.fn();
const focusMock = vi.fn();

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

vi.mock("vditor", () => ({
  default: vi.fn().mockImplementation(function (_host: HTMLDivElement, options: Record<string, unknown>) {
    queueMicrotask(() => {
      if (typeof options.after === "function") options.after();
      if (typeof options.input === "function") options.input("changed markdown");
    });

    return {
      destroy: destroyMock,
      disabledCache: disabledCacheMock,
      focus: focusMock,
      getValue: () => "changed markdown",
      setValue: setValueMock,
    };
  }),
}));

vi.mock("vditor/dist/index.css", () => ({}));

describe("VditorMarkdownEditor", () => {
  let host: HTMLDivElement;
  let root: Root;
  let iconSprite: SVGSVGElement;

  beforeEach(() => {
    host = document.createElement("div");
    iconSprite = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    iconSprite.innerHTML = '<symbol id="vditor-icon-bold"></symbol>';
    document.body.appendChild(host);
    document.body.appendChild(iconSprite);
    root = createRoot(host);
    destroyMock.mockClear();
    setValueMock.mockClear();
    disabledCacheMock.mockClear();
    focusMock.mockClear();
  });

  afterEach(() => {
    root.unmount();
    host.remove();
    iconSprite.remove();
    document.getElementById("vditorIconScript")?.remove();
  });

  it("sets initial value after Vditor is ready and disables Vditor cache", async () => {
    await act(async () => {
      root.render(<VditorMarkdownEditor value="# 初始内容" onChange={() => {}} />);
      await Promise.resolve();
    });

    expect(setValueMock).toHaveBeenCalledWith("# 初始内容", true);
    expect(disabledCacheMock).toHaveBeenCalled();
    expect(document.getElementById("vditorIconScript")).not.toBeNull();
  });

  it("emits markdown changes through onChange", async () => {
    const onChange = vi.fn();
    await act(async () => {
      root.render(<VditorMarkdownEditor value="" onChange={onChange} />);
      await Promise.resolve();
    });

    expect(onChange).toHaveBeenCalledWith("changed markdown");
  });

  it("destroys Vditor on unmount", async () => {
    await act(async () => {
      root.render(<VditorMarkdownEditor value="" onChange={() => {}} />);
      await Promise.resolve();
    });
    act(() => root.unmount());

    expect(destroyMock).toHaveBeenCalled();
  });
});
