import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import Vditor from "vditor";
import "vditor/dist/index.css";
import { buildVditorOptions, toolbarTipLabels } from "./vditorConfig";

export interface VditorMarkdownEditorHandle {
  focus: () => void;
  getValue: () => string;
  insertValue: (value: string, render?: boolean) => void;
  replaceValue: (value: string) => void;
  scrollToHeading: (index: number) => void;
  setValue: (value: string) => void;
}

interface VditorMarkdownEditorProps {
  value: string;
  placeholder?: string;
  autoFocus?: boolean;
  onChange: (value: string) => void;
  onSaveShortcut?: () => void;
}

const VDITOR_CDN = "/vendor/vditor";
const VDITOR_ICON = "ant";
const VDITOR_ICON_SCRIPT_ID = "vditorIconScript";
const VDITOR_ICON_READY_SYMBOL_ID = "vditor-icon-bold";

let iconScriptPromise: Promise<void> | null = null;

const markVditorIconsAsLoaded = () => {
  if (document.getElementById(VDITOR_ICON_SCRIPT_ID)) return;

  const marker = document.createElement("script");
  marker.id = VDITOR_ICON_SCRIPT_ID;
  marker.type = "application/json";
  marker.setAttribute("data-floatnote-vditor-icons", "loaded");
  document.head.appendChild(marker);
};

const ensureVditorIcons = () => {
  if (document.getElementById(VDITOR_ICON_SCRIPT_ID)) return Promise.resolve();

  if (document.getElementById(VDITOR_ICON_READY_SYMBOL_ID)) {
    markVditorIconsAsLoaded();
    return Promise.resolve();
  }

  if (!iconScriptPromise) {
    iconScriptPromise = new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.id = VDITOR_ICON_SCRIPT_ID;
      script.src = `${VDITOR_CDN}/dist/js/icons/${VDITOR_ICON}.js`;
      script.async = false;
      script.onload = () => resolve();
      script.onerror = () => {
        script.remove();
        iconScriptPromise = null;
        reject(new Error(`Failed to load Vditor icon script: ${script.src}`));
      };
      document.head.appendChild(script);
    });
  }

  return iconScriptPromise;
};

const findToolbarButton = (target: EventTarget | null) => {
  if (!(target instanceof Element)) return null;
  return target.closest<HTMLElement>(".vditor-toolbar [data-type]");
};

const installToolbarTooltips = (host: HTMLElement) => {
  const tooltip = document.createElement("div");
  tooltip.className = "markdown-toolbar-tooltip";
  host.appendChild(tooltip);

  const syncToolbarTipAttributes = () => {
    host.querySelectorAll<HTMLElement>(".vditor-toolbar [data-type]").forEach((button) => {
      const type = button.getAttribute("data-type") ?? "";
      const label = button.getAttribute("aria-label") || toolbarTipLabels[type];
      if (!label) return;
      button.setAttribute("title", label);
      button.parentElement?.setAttribute("data-floatnote-tip", label);
    });
  };

  syncToolbarTipAttributes();
  const syncSoon = window.setTimeout(syncToolbarTipAttributes, 0);
  const syncLater = window.setTimeout(syncToolbarTipAttributes, 300);

  const show = (button: HTMLElement) => {
    const type = button.getAttribute("data-type") ?? "";
    const label = button.getAttribute("aria-label") || toolbarTipLabels[type];
    if (!label) return;

    const hostRect = host.getBoundingClientRect();
    const buttonRect = button.getBoundingClientRect();
    tooltip.textContent = label;
    tooltip.style.left = `${buttonRect.left - hostRect.left + buttonRect.width / 2}px`;
    tooltip.style.top = `${buttonRect.bottom - hostRect.top + 8}px`;
    tooltip.classList.add("is-visible");
  };

  const hide = () => {
    tooltip.classList.remove("is-visible");
  };

  const onMouseOver = (event: MouseEvent) => {
    const button = findToolbarButton(event.target);
    if (button) show(button);
  };

  const onMouseOut = (event: MouseEvent) => {
    const button = findToolbarButton(event.target);
    if (button) hide();
  };

  const onMouseMove = (event: MouseEvent) => {
    const element = document.elementFromPoint(event.clientX, event.clientY);
    const button = findToolbarButton(element);
    if (button && host.contains(button)) {
      show(button);
    } else if (element && !host.contains(element)) {
      hide();
    }
  };

  const onFocusIn = (event: FocusEvent) => {
    const button = findToolbarButton(event.target);
    if (button) show(button);
  };

  host.addEventListener("mouseover", onMouseOver);
  host.addEventListener("mouseout", onMouseOut);
  host.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mousemove", onMouseMove, true);
  host.addEventListener("focusin", onFocusIn);
  host.addEventListener("focusout", hide);

  return () => {
    host.removeEventListener("mouseover", onMouseOver);
    host.removeEventListener("mouseout", onMouseOut);
    host.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mousemove", onMouseMove, true);
    host.removeEventListener("focusin", onFocusIn);
    host.removeEventListener("focusout", hide);
    window.clearTimeout(syncSoon);
    window.clearTimeout(syncLater);
    tooltip.remove();
  };
};

export const VditorMarkdownEditor = forwardRef<VditorMarkdownEditorHandle, VditorMarkdownEditorProps>(
  ({ value, placeholder = "记下一点灵感，随笔或 Markdown 片段", autoFocus = false, onChange, onSaveShortcut }, ref) => {
    const hostRef = useRef<HTMLDivElement | null>(null);
    const editorRef = useRef<Vditor | null>(null);
    const tooltipCleanupRef = useRef<(() => void) | null>(null);
    const valueRef = useRef(value);
    const onChangeRef = useRef(onChange);
    const onSaveShortcutRef = useRef(onSaveShortcut);

    onChangeRef.current = onChange;
    onSaveShortcutRef.current = onSaveShortcut;

    useImperativeHandle(ref, () => ({
      focus: () => editorRef.current?.focus(),
      getValue: () => editorRef.current?.getValue() ?? valueRef.current,
      insertValue: (nextValue: string, render = true) => {
        editorRef.current?.insertValue(nextValue, render);
      },
      replaceValue: (nextValue: string) => {
        valueRef.current = nextValue;
        editorRef.current?.setValue(nextValue, true);
        onChangeRef.current(nextValue);
      },
      scrollToHeading: (index: number) => {
        const editorRoot = hostRef.current?.querySelector(".vditor-reset");
        const heading = editorRoot?.querySelectorAll("h1,h2,h3,h4,h5,h6").item(index);
        heading?.scrollIntoView({ block: "center", behavior: "smooth" });
      },
      setValue: (nextValue: string) => {
        valueRef.current = nextValue;
        editorRef.current?.setValue(nextValue, true);
      },
    }));

    useEffect(() => {
      const host = hostRef.current;
      if (!host) return undefined;

      let disposed = false;

      ensureVditorIcons()
        .catch((error: unknown) => {
          console.warn(error);
        })
        .then(() => {
          if (disposed || !hostRef.current) return;

          const editor = new Vditor(
            hostRef.current,
            buildVditorOptions({
              cdn: VDITOR_CDN,
              placeholder,
              value: valueRef.current,
              onInput: (markdown: string) => {
              valueRef.current = markdown;
              onChangeRef.current(markdown);
            },
              onReady: () => {
              editor.setValue(valueRef.current, true);
              editor.disabledCache();
              tooltipCleanupRef.current?.();
              tooltipCleanupRef.current = installToolbarTooltips(host);
              if (autoFocus) window.setTimeout(() => editor.focus(), 0);
            },
            }),
          );

          editorRef.current = editor;
        });

      return () => {
        disposed = true;
        tooltipCleanupRef.current?.();
        tooltipCleanupRef.current = null;
        editorRef.current?.destroy();
        editorRef.current = null;
      };
    }, []);

    useEffect(() => {
      const editor = editorRef.current;
      if (!editor || value === valueRef.current || value === editor.getValue()) {
        valueRef.current = value;
        return;
      }

      valueRef.current = value;
      editor.setValue(value, true);
    }, [value]);

    return (
      <div
        className="vditor-markdown-editor"
        onKeyDown={(event) => {
          if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
            event.preventDefault();
            onSaveShortcutRef.current?.();
          }
        }}
      >
        <div ref={hostRef} className="vditor-markdown-editor-host" />
      </div>
    );
  },
);

VditorMarkdownEditor.displayName = "VditorMarkdownEditor";
