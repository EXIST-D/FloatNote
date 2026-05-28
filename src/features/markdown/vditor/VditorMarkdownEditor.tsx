import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import Vditor from "vditor";
import "vditor/dist/index.css";

export interface VditorMarkdownEditorHandle {
  focus: () => void;
  getValue: () => string;
  scrollToHeading: (index: number) => void;
}

interface VditorMarkdownEditorProps {
  value: string;
  placeholder?: string;
  autoFocus?: boolean;
  onChange: (value: string) => void;
  onSaveShortcut?: () => void;
}

const toolbarTipLabels: Record<string, string> = {
  headings: "标题",
  bold: "加粗",
  italic: "斜体",
  strike: "删除线",
  quote: "引用",
  list: "无序列表",
  "ordered-list": "有序列表",
  check: "任务列表",
  line: "分割线",
  code: "代码块",
  "inline-code": "行内代码",
  link: "链接",
  table: "表格",
  undo: "撤销",
  redo: "重做",
};

const toolbar = [
  { name: "headings", tip: toolbarTipLabels.headings, tipPosition: "s" },
  { name: "bold", tip: toolbarTipLabels.bold, tipPosition: "s" },
  { name: "italic", tip: toolbarTipLabels.italic, tipPosition: "s" },
  { name: "strike", tip: toolbarTipLabels.strike, tipPosition: "s" },
  "|",
  { name: "quote", tip: toolbarTipLabels.quote, tipPosition: "s" },
  { name: "list", tip: toolbarTipLabels.list, tipPosition: "s" },
  { name: "ordered-list", tip: toolbarTipLabels["ordered-list"], tipPosition: "s" },
  { name: "check", tip: toolbarTipLabels.check, tipPosition: "s" },
  "|",
  { name: "line", tip: toolbarTipLabels.line, tipPosition: "s" },
  { name: "code", tip: toolbarTipLabels.code, tipPosition: "s" },
  { name: "inline-code", tip: toolbarTipLabels["inline-code"], tipPosition: "s" },
  { name: "link", tip: toolbarTipLabels.link, tipPosition: "s" },
  { name: "table", tip: toolbarTipLabels.table, tipPosition: "s" },
  "|",
  { name: "undo", tip: toolbarTipLabels.undo, tipPosition: "s" },
  { name: "redo", tip: toolbarTipLabels.redo, tipPosition: "s" },
] as const;

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
      scrollToHeading: (index: number) => {
        const editorRoot = hostRef.current?.querySelector(".vditor-reset");
        const heading = editorRoot?.querySelectorAll("h1,h2,h3,h4,h5,h6").item(index);
        heading?.scrollIntoView({ block: "center", behavior: "smooth" });
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

          const editor = new Vditor(hostRef.current, {
            mode: "ir",
            toolbarConfig: {
              pin: true,
            },
            lang: "zh_CN",
            theme: "classic",
            icon: VDITOR_ICON,
            cdn: VDITOR_CDN,
            height: "100%",
            minHeight: 420,
            placeholder,
            cache: {
              enable: false,
            },
            toolbar: [...toolbar],
            preview: {
              markdown: {
                toc: true,
              },
              theme: {
                current: "light",
              },
              hljs: {
                enable: true,
                style: "github",
              },
            },
            input: (markdown: string) => {
              valueRef.current = markdown;
              onChangeRef.current(markdown);
            },
            after: () => {
              editor.setValue(valueRef.current, true);
              editor.disabledCache();
              tooltipCleanupRef.current?.();
              tooltipCleanupRef.current = installToolbarTooltips(host);
              if (autoFocus) window.setTimeout(() => editor.focus(), 0);
            },
          });

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
