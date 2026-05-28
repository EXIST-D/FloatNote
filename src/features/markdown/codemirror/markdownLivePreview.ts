import { RangeSetBuilder } from "@codemirror/state";
import { Decoration, type DecorationSet, EditorView, ViewPlugin, type ViewUpdate, WidgetType } from "@codemirror/view";

export type MarkdownLineKind = "heading" | "task" | "list" | "quote" | "fence" | "paragraph";

export interface MarkdownLineInfo {
  kind: MarkdownLineKind;
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  prefixLength: number;
  checked?: boolean;
}

class TaskCheckboxWidget extends WidgetType {
  constructor(private readonly checked: boolean) {
    super();
  }

  toDOM() {
    const checkbox = document.createElement("span");
    checkbox.className = `cm-live-task-checkbox ${this.checked ? "is-checked" : ""}`;
    checkbox.setAttribute("aria-hidden", "true");
    checkbox.textContent = this.checked ? "✓" : "";
    return checkbox;
  }
}

export function classifyMarkdownLine(text: string): MarkdownLineInfo {
  const heading = /^(#{1,6})\s+/.exec(text);
  if (heading) {
    return {
      kind: "heading",
      headingLevel: heading[1].length as 1 | 2 | 3 | 4 | 5 | 6,
      prefixLength: heading[0].length,
    };
  }

  const task = /^(\s*[-*+]\s+\[([ xX])\]\s+)/.exec(text);
  if (task) {
    return {
      kind: "task",
      prefixLength: task[1].length,
      checked: task[2].toLowerCase() === "x",
    };
  }

  const quote = /^(\s*>\s*)/.exec(text);
  if (quote) return { kind: "quote", prefixLength: quote[1].length };

  const fence = /^\s*(```|~~~)/.exec(text);
  if (fence) return { kind: "fence", prefixLength: 0 };

  const list = /^(\s*(?:[-*+]|\d+\.)\s+)/.exec(text);
  if (list) return { kind: "list", prefixLength: list[1].length };

  return { kind: "paragraph", prefixLength: 0 };
}

function lineClass(info: MarkdownLineInfo, isCurrentLine: boolean) {
  const classes = [`cm-live-${info.kind}`];
  if (info.headingLevel) classes.push(`cm-live-heading-${info.headingLevel}`);
  if (isCurrentLine) classes.push("cm-live-current-line");
  return classes.join(" ");
}

function addLineDecorations(view: EditorView) {
  const builder = new RangeSetBuilder<Decoration>();
  const cursor = view.state.selection.main.head;
  const currentLine = view.state.doc.lineAt(cursor);

  for (const { from, to } of view.visibleRanges) {
    for (let position = from; position <= to; ) {
      const line = view.state.doc.lineAt(position);
      const text = line.text;
      const info = classifyMarkdownLine(text);
      const isCurrentLine = line.number === currentLine.number;
      const className = lineClass(info, isCurrentLine);

      builder.add(line.from, line.from, Decoration.line({ class: className }));

      if (!isCurrentLine && info.kind === "heading" && info.prefixLength > 0) {
        builder.add(line.from, line.from + info.prefixLength, Decoration.replace({}));
      }

      if (!isCurrentLine && info.kind === "quote" && info.prefixLength > 0) {
        builder.add(line.from, line.from + info.prefixLength, Decoration.replace({}));
      }

      if (!isCurrentLine && info.kind === "task" && info.prefixLength > 0) {
        builder.add(
          line.from,
          line.from + info.prefixLength,
          Decoration.replace({
            widget: new TaskCheckboxWidget(Boolean(info.checked)),
          }),
        );
      }

      if (line.to + 1 > to) break;
      position = line.to + 1;
    }
  }

  return builder.finish();
}

export const markdownLivePreviewExtension = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = addLineDecorations(view);
    }

    update(update: ViewUpdate) {
      if (update.docChanged || update.viewportChanged || update.selectionSet) {
        this.decorations = addLineDecorations(update.view);
      }
    }
  },
  {
    decorations: (plugin) => plugin.decorations,
  },
);
