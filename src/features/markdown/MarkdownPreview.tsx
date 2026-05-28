import { MarkdownReader } from "./MarkdownReader";

interface MarkdownPreviewProps {
  content: string;
  emptyText?: string;
  className?: string;
}

export function MarkdownPreview({ content, emptyText = "暂无内容", className = "" }: MarkdownPreviewProps) {
  return <MarkdownReader content={content} emptyText={emptyText} className={`markdown-preview ${className}`} />;
}
