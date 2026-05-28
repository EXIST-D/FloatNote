import {
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  CodeToggle,
  CreateLink,
  DiffSourceToggleWrapper,
  InsertCodeBlock,
  InsertTable,
  ListsToggle,
  MDXEditor,
  type MDXEditorMethods,
  Separator,
  StrikeThroughSupSubToggles,
  UndoRedo,
  codeBlockPlugin,
  codeMirrorPlugin,
  diffSourcePlugin,
  headingsPlugin,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
  markdownShortcutPlugin,
  quotePlugin,
  tablePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";
import { useEffect, useMemo, useRef } from "react";

interface MarkdownRichEditorProps {
  markdown: string;
  onChange: (markdown: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
  onSaveShortcut?: () => void;
}

export function MarkdownRichEditor({
  markdown,
  onChange,
  placeholder = "写下 Markdown 灵感、会议片段或一段随笔",
  autoFocus = false,
  className = "",
  onSaveShortcut,
}: MarkdownRichEditorProps) {
  const editorRef = useRef<MDXEditorMethods>(null);
  const currentMarkdownRef = useRef(markdown);

  useEffect(() => {
    if (markdown === currentMarkdownRef.current) return;
    currentMarkdownRef.current = markdown;
    editorRef.current?.setMarkdown(markdown);
  }, [markdown]);

  const plugins = useMemo(
    () => [
      headingsPlugin(),
      listsPlugin(),
      quotePlugin(),
      linkPlugin(),
      linkDialogPlugin(),
      tablePlugin(),
      thematicBreakPlugin(),
      codeBlockPlugin({ defaultCodeBlockLanguage: "txt" }),
      codeMirrorPlugin({
        autoLoadLanguageSupport: false,
        codeBlockLanguages: {
          js: "JavaScript",
          jsx: "JSX",
          ts: "TypeScript",
          tsx: "TSX",
          css: "CSS",
          json: "JSON",
          md: "Markdown",
          txt: "Text",
        },
      }),
      diffSourcePlugin({ viewMode: "rich-text", diffMarkdown: "" }),
      toolbarPlugin({
        toolbarClassName: "markdown-rich-toolbar",
        toolbarContents: () => (
          <DiffSourceToggleWrapper>
            <UndoRedo />
            <Separator />
            <BlockTypeSelect />
            <BoldItalicUnderlineToggles options={["Bold", "Italic"]} />
            <StrikeThroughSupSubToggles options={["Strikethrough"]} />
            <CodeToggle />
            <Separator />
            <ListsToggle options={["bullet", "number", "check"]} />
            <CreateLink />
            <InsertTable />
            <InsertCodeBlock />
          </DiffSourceToggleWrapper>
        ),
      }),
      markdownShortcutPlugin(),
    ],
    [],
  );

  return (
    <div
      className={`markdown-rich-editor ${className}`}
      onKeyDown={(event) => {
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
          event.preventDefault();
          onSaveShortcut?.();
        }
      }}
    >
      <MDXEditor
        ref={editorRef}
        markdown={markdown}
        onChange={(nextMarkdown, initialMarkdownNormalize) => {
          if (initialMarkdownNormalize) return;
          currentMarkdownRef.current = nextMarkdown;
          onChange(nextMarkdown);
        }}
        placeholder={placeholder}
        autoFocus={autoFocus ? { defaultSelection: "rootEnd", preventScroll: true } : false}
        suppressHtmlProcessing
        trim={false}
        className="markdown-rich-root"
        contentEditableClassName="markdown-rich-content"
        plugins={plugins}
      />
    </div>
  );
}
