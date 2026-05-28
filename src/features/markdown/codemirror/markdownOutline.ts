export interface MarkdownOutlineItem {
  id: string;
  level: 1 | 2 | 3;
  title: string;
  line: number;
}

function slugifyTitle(title: string, index: number) {
  const slug = title
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .slice(0, 48);

  return slug ? `${slug}-${index}` : `heading-${index}`;
}

export function extractMarkdownOutline(markdown: string): MarkdownOutlineItem[] {
  const outline: MarkdownOutlineItem[] = [];
  const lines = markdown.split(/\r?\n/);
  let inFence = false;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (/^\s*```/.test(line) || /^\s*~~~/.test(line)) {
      inFence = !inFence;
      continue;
    }

    if (inFence) continue;

    const match = /^(#{1,3})\s+(.+?)\s*#*\s*$/.exec(line);
    if (!match) continue;

    const level = match[1].length as 1 | 2 | 3;
    const title = match[2].trim();
    if (!title) continue;

    outline.push({
      id: slugifyTitle(title, outline.length),
      level,
      title,
      line: index + 1,
    });
  }

  return outline;
}

export function countMarkdownWords(markdown: string) {
  const text = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/[#>*_~|[\]()-]/g, " ")
    .trim();

  const chineseChars = text.match(/[\u4e00-\u9fff]/g)?.length ?? 0;
  const latinWords = text.match(/[A-Za-z0-9]+(?:[-_][A-Za-z0-9]+)*/g)?.length ?? 0;
  return chineseChars + latinWords;
}
