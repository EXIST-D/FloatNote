import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import Vditor from "vditor";
import "vditor/dist/index.css";

export interface VditorMarkdownEditorHandle {
  focus: () => void;
  getValue: () => string;
}

interface VditorMarkdownEditorProps {
  value: string;
  placeholder?: string;
  autoFocus?: boolean;
  onChange: (value: string) => void;
  onSaveShortcut?: () => void;
}

const toolbar = [
  "headings",
  "bold",
  "italic",
  "strike",
  "|",
  "quote",
  "list",
  "ordered-list",
  "check",
  "|",
  "line",
  "code",
  "inline-code",
  "link",
  "table",
  "|",
  "undo",
  "redo",
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

export const VditorMarkdownEditor = forwardRef<VditorMarkdownEditorHandle, VditorMarkdownEditorProps>(
  ({ value, placeholder = "记下一点灵感，随笔或 Markdown 片段", autoFocus = false, onChange, onSaveShortcut }, ref) => {
    const hostRef = useRef<HTMLDivElement | null>(null);
    const editorRef = useRef<Vditor | null>(null);
    const valueRef = useRef(value);
    const onChangeRef = useRef(onChange);
    const onSaveShortcutRef = useRef(onSaveShortcut);

    onChangeRef.current = onChange;
    onSaveShortcutRef.current = onSaveShortcut;

    useImperativeHandle(ref, () => ({
      focus: () => editorRef.current?.focus(),
      getValue: () => editorRef.current?.getValue() ?? valueRef.current,
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
              if (autoFocus) window.setTimeout(() => editor.focus(), 0);
            },
          });

          editorRef.current = editor;
        });

      return () => {
        disposed = true;
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
