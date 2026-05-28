import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import { markdown } from "@codemirror/lang-markdown";
import { bracketMatching, defaultHighlightStyle, foldGutter, indentOnInput, syntaxHighlighting } from "@codemirror/language";
import { searchKeymap } from "@codemirror/search";
import { EditorState } from "@codemirror/state";
import {
  drawSelection,
  dropCursor,
  EditorView,
  highlightActiveLine,
  highlightActiveLineGutter,
  highlightSpecialChars,
  keymap,
  lineNumbers,
  rectangularSelection,
} from "@codemirror/view";
import { forwardRef, useEffect, useImperativeHandle, useRef, type MutableRefObject } from "react";
import { markdownLivePreviewExtension } from "./markdownLivePreview";

export interface MarkdownCodeMirrorHandle {
  focus: () => void;
  scrollToLine: (line: number) => void;
  getView: () => EditorView | null;
}

interface MarkdownCodeMirrorProps {
  value: string;
  placeholder?: string;
  autoFocus?: boolean;
  onChange: (value: string) => void;
  onSaveShortcut?: () => void;
  onViewReady?: (view: EditorView | null) => void;
}

const moonPaperTheme = EditorView.theme({
  "&": {
    height: "100%",
    minHeight: "0",
    color: "var(--text-main)",
    background: "transparent",
    fontFamily: "var(--font-ui)",
    fontSize: "15px",
  },
  ".cm-scroller": {
    overflow: "auto",
    fontFamily: "var(--font-ui)",
    lineHeight: "1.85",
  },
  ".cm-content": {
    minHeight: "100%",
    padding: "26px 34px 52px",
    caretColor: "var(--accent)",
  },
  ".cm-line": {
    padding: "0 2px",
  },
  ".cm-gutters": {
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    borderRight: "1px solid var(--border-subtle)",
    color: "var(--text-subtle)",
  },
  ".cm-activeLineGutter": {
    backgroundColor: "rgba(124, 92, 200, 0.12)",
    color: "var(--accent)",
  },
  ".cm-activeLine": {
    backgroundColor: "transparent",
  },
  ".cm-selectionBackground, &.cm-focused .cm-selectionBackground": {
    backgroundColor: "rgba(124, 92, 200, 0.24)",
  },
  "&.cm-focused": {
    outline: "none",
  },
  ".cm-tooltip": {
    border: "1px solid var(--border-subtle)",
    borderRadius: "var(--radius-md)",
    backgroundColor: "var(--surface-popover)",
    boxShadow: "var(--shadow-lifted)",
  },
  ".cm-live-heading": {
    fontFamily: "var(--font-title)",
    color: "#073b78",
    fontWeight: "700",
  },
  ".cm-live-heading-1": {
    fontSize: "2rem",
    lineHeight: "1.55",
  },
  ".cm-live-heading-2": {
    marginTop: "0.35rem",
    backgroundColor: "rgba(109, 143, 191, 0.1)",
    fontSize: "1.55rem",
    lineHeight: "1.65",
  },
  ".cm-live-heading-3": {
    fontSize: "1.2rem",
    lineHeight: "1.55",
  },
  ".cm-live-quote": {
    borderLeft: "3px solid var(--accent)",
    backgroundColor: "rgba(255, 255, 255, 0.22)",
    color: "var(--text-muted)",
    paddingLeft: "12px",
  },
  ".cm-live-list, .cm-live-task": {
    color: "var(--text-main)",
  },
  ".cm-live-fence": {
    fontFamily: "var(--font-mono)",
    color: "var(--text-muted)",
  },
  ".cm-live-current-line": {
    backgroundColor: "rgba(255, 255, 255, 0.42)",
    boxShadow: "inset 3px 0 0 rgba(124, 92, 200, 0.34)",
  },
  ".cm-live-task-checkbox": {
    display: "inline-grid",
    width: "16px",
    height: "16px",
    marginRight: "8px",
    placeItems: "center",
    border: "1px solid var(--border-strong)",
    borderRadius: "4px",
    color: "var(--accent)",
    fontSize: "12px",
    verticalAlign: "-2px",
  },
});

function createExtensions(
  onChangeRef: MutableRefObject<(value: string) => void>,
  onSaveShortcutRef: MutableRefObject<(() => void) | undefined>,
) {
  return [
    lineNumbers(),
    foldGutter(),
    highlightActiveLineGutter(),
    highlightSpecialChars(),
    history(),
    drawSelection(),
    dropCursor(),
    EditorState.allowMultipleSelections.of(true),
    indentOnInput(),
    bracketMatching(),
    rectangularSelection(),
    highlightActiveLine(),
    syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
    markdown(),
    markdownLivePreviewExtension,
    moonPaperTheme,
    EditorView.lineWrapping,
    EditorView.updateListener.of((update) => {
      if (update.docChanged) onChangeRef.current(update.state.doc.toString());
    }),
    keymap.of([
      {
        key: "Mod-s",
        run: () => {
          onSaveShortcutRef.current?.();
          return true;
        },
      },
      indentWithTab,
      ...defaultKeymap,
      ...historyKeymap,
      ...searchKeymap,
    ]),
  ];
}

export const MarkdownCodeMirror = forwardRef<MarkdownCodeMirrorHandle, MarkdownCodeMirrorProps>(
  ({ value, autoFocus = false, onChange, onSaveShortcut, onViewReady }, ref) => {
    const hostRef = useRef<HTMLDivElement | null>(null);
    const viewRef = useRef<EditorView | null>(null);
    const valueRef = useRef(value);
    const onChangeRef = useRef(onChange);
    const onSaveShortcutRef = useRef(onSaveShortcut);

    onChangeRef.current = onChange;
    onSaveShortcutRef.current = onSaveShortcut;

    useImperativeHandle(ref, () => ({
      focus: () => viewRef.current?.focus(),
      scrollToLine: (line) => {
        const view = viewRef.current;
        if (!view) return;
        const safeLine = Math.max(1, Math.min(line, view.state.doc.lines));
        const position = view.state.doc.line(safeLine).from;
        view.dispatch({
          selection: { anchor: position },
          effects: EditorView.scrollIntoView(position, { y: "center" }),
        });
        view.focus();
      },
      getView: () => viewRef.current,
    }));

    useEffect(() => {
      const host = hostRef.current;
      if (!host) return undefined;

      const view = new EditorView({
        state: EditorState.create({
          doc: value,
          extensions: createExtensions(onChangeRef, onSaveShortcutRef),
        }),
        parent: host,
      });
      viewRef.current = view;
      onViewReady?.(view);
      if (autoFocus) window.setTimeout(() => view.focus(), 0);

      return () => {
        onViewReady?.(null);
        view.destroy();
        viewRef.current = null;
      };
    }, []);

    useEffect(() => {
      const view = viewRef.current;
      if (!view || value === valueRef.current || value === view.state.doc.toString()) {
        valueRef.current = value;
        return;
      }

      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: value },
      });
      valueRef.current = value;
    }, [value]);

    return <div ref={hostRef} className="markdown-codemirror" />;
  },
);

MarkdownCodeMirror.displayName = "MarkdownCodeMirror";
