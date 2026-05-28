import { useMemo } from "react";
import { renderMarkdownToHtml } from "./markdownRender";

interface MarkdownPreviewProps {
  content: string;
  emptyText?: string;
  className?: string;
}

export function MarkdownPreview({ content, emptyText = "暂无内容", className = "" }: MarkdownPreviewProps) {
  const html = useMemo(() => renderMarkdownToHtml(content), [content]);
  const safeHtml = html || `<p>${emptyText}</p>`;

  return <div className={`markdown-preview ${className}`} dangerouslySetInnerHTML={{ __html: safeHtml }} />;
}
