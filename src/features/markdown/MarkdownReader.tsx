import Markdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";

interface MarkdownReaderProps {
  content: string;
  emptyText?: string;
  className?: string;
}

export function MarkdownReader({ content, emptyText = "暂无内容", className = "" }: MarkdownReaderProps) {
  const markdown = content.trim() ? content : emptyText;

  return (
    <article className={`markdown-reader ${className}`}>
      <Markdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        components={{
          a({ children, href, ...props }) {
            return (
              <a href={href} target="_blank" rel="noreferrer" {...props}>
                {children}
              </a>
            );
          },
        }}
      >
        {markdown}
      </Markdown>
    </article>
  );
}
