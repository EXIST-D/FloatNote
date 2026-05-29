import { ChevronDown, ChevronUp, Replace, Search, X } from "lucide-react";
import { useMemo, useState } from "react";

import { findMarkdownMatches, replaceAllMarkdownMatches, replaceMarkdownMatch } from "../findReplace";

interface MarkdownFindReplaceProps {
  open: boolean;
  value: string;
  onClose: () => void;
  onReplace: (value: string) => void;
}

export function MarkdownFindReplace({ open, value, onClose, onReplace }: MarkdownFindReplaceProps) {
  const [query, setQuery] = useState("");
  const [replacement, setReplacement] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const matches = useMemo(
    () => findMarkdownMatches(value, query, { caseSensitive }),
    [caseSensitive, query, value],
  );
  const activeIndex = matches.length === 0 ? 0 : Math.min(currentIndex, matches.length - 1);
  const currentMatch = matches[activeIndex];

  if (!open) return null;

  const move = (direction: 1 | -1) => {
    if (matches.length === 0) return;
    setCurrentIndex((index) => (index + direction + matches.length) % matches.length);
  };

  const replaceCurrent = () => {
    if (!currentMatch) return;
    const nextValue = replaceMarkdownMatch(value, currentMatch, replacement);
    onReplace(nextValue);
    setCurrentIndex(Math.max(activeIndex - 1, 0));
  };

  const replaceAll = () => {
    if (matches.length === 0) return;
    onReplace(replaceAllMarkdownMatches(value, query, replacement, { caseSensitive }));
    setCurrentIndex(0);
  };

  return (
    <section className="markdown-find-panel" aria-label="Markdown 查找替换">
      <label className="markdown-find-field">
        <Search size={16} aria-hidden="true" />
        <input
          aria-label="查找内容"
          value={query}
          placeholder="查找"
          onChange={(event) => {
            setQuery(event.target.value);
            setCurrentIndex(0);
          }}
        />
      </label>

      <label className="markdown-find-field">
        <Replace size={16} aria-hidden="true" />
        <input
          aria-label="替换内容"
          value={replacement}
          placeholder="替换为"
          onChange={(event) => setReplacement(event.target.value)}
        />
      </label>

      <span className="markdown-find-count" aria-label="匹配数量">
        {matches.length === 0 ? "0/0" : `${activeIndex + 1}/${matches.length}`}
      </span>

      <button className="markdown-find-icon" type="button" aria-label="上一个匹配" onClick={() => move(-1)}>
        <ChevronUp size={16} />
      </button>
      <button className="markdown-find-icon" type="button" aria-label="下一个匹配" onClick={() => move(1)}>
        <ChevronDown size={16} />
      </button>
      <button className="markdown-find-text" type="button" onClick={replaceCurrent}>
        替换
      </button>
      <button className="markdown-find-text" type="button" onClick={replaceAll}>
        全部
      </button>
      <label className="markdown-find-case">
        <input
          type="checkbox"
          checked={caseSensitive}
          onChange={(event) => {
            setCaseSensitive(event.target.checked);
            setCurrentIndex(0);
          }}
        />
        Aa
      </label>
      <button className="markdown-find-icon" type="button" aria-label="关闭查找替换" onClick={onClose}>
        <X size={16} />
      </button>
    </section>
  );
}
