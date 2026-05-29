export type MarkdownToolbarItem = string | IMenuItem;

type BuildVditorOptionsArgs = {
  cdn: string;
  compact?: boolean;
  placeholder: string;
  value: string;
  onInput: (value: string) => void;
  onReady: () => void;
};

export const toolbarTipLabels: Record<string, string> = {
  outline: "大纲",
  undo: "撤销",
  redo: "重做",
  emoji: "表情",
  headings: "标题",
  bold: "加粗",
  italic: "斜体",
  strike: "删除线",
  link: "链接",
  list: "无序列表",
  "ordered-list": "有序列表",
  check: "任务列表",
  indent: "增加缩进",
  outdent: "减少缩进",
  quote: "引用",
  line: "分割线",
  code: "代码块",
  "inline-code": "行内代码",
  table: "表格",
  "insert-before": "前方插入",
  "insert-after": "后方插入",
  "edit-mode": "编辑模式",
  both: "分屏预览",
  "code-theme": "代码主题",
  "content-theme": "内容主题",
  preview: "预览",
  info: "关于",
  help: "帮助",
};

const tool = (name: string, tip = toolbarTipLabels[name], hotkey = ""): IMenuItem => ({
  hotkey,
  name,
  tip,
  tipPosition: "s",
});

export const markdownToolbar: MarkdownToolbarItem[] = [
  "outline",
  tool("undo", "撤销", "Ctrl+Z"),
  tool("redo", "重做", "Ctrl+Y"),
  "|",
  tool("headings", "标题"),
  tool("bold", "加粗", "Ctrl+B"),
  tool("italic", "斜体", "Ctrl+I"),
  tool("strike", "删除线"),
  tool("link", "链接", "Ctrl+K"),
  "|",
  tool("list", "无序列表"),
  tool("ordered-list", "有序列表"),
  tool("check", "任务列表"),
  "|",
  tool("quote", "引用"),
  tool("code", "代码块"),
  tool("table", "表格"),
  "|",
  {
    ...tool("edit-mode", "编辑模式"),
    tipPosition: "e",
  },
  "|",
  {
    name: "more",
    tip: "更多",
    tipPosition: "e",
    toolbar: [
      "both",
      "preview",
      tool("emoji", "表情"),
      tool("line", "分割线"),
      tool("inline-code", "行内代码"),
      tool("indent", "增加缩进"),
      tool("outdent", "减少缩进"),
      tool("insert-before", "前方插入"),
      tool("insert-after", "后方插入"),
      "code-theme",
      "content-theme",
      "info",
      "help",
    ],
  },
];

export function buildVditorOptions({
  cdn,
  compact = false,
  placeholder,
  value,
  onInput,
  onReady,
}: BuildVditorOptionsArgs): IOptions {
  return {
    cache: { enable: false },
    cdn,
    counter: { enable: !compact },
    height: "100%",
    hint: {
      delay: 500,
      parse: true,
    },
    icon: "ant",
    lang: "zh_CN",
    minHeight: compact ? 180 : 520,
    mode: "ir",
    outline: {
      enable: !compact,
      position: "left",
    },
    placeholder,
    preview: {
      delay: 300,
      hljs: {
        enable: true,
        lineNumber: true,
        style: "github",
      },
      markdown: {
        autoSpace: true,
        footnotes: true,
        mark: true,
        toc: true,
      },
      math: {
        engine: "KaTeX",
      },
      theme: {
        current: "light",
        list: {
          "ant-design": "Ant Design",
          dark: "Dark",
          light: "Light",
          wechat: "WeChat",
        },
      },
    },
    tab: "\t",
    theme: "classic",
    toolbar: compact ? [] : markdownToolbar,
    toolbarConfig: { pin: !compact },
    value,
    width: "100%",
    after: onReady,
    input: onInput,
  };
}
