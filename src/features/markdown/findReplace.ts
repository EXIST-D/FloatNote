export type MarkdownMatch = {
  index: number;
  length: number;
};

type FindMarkdownMatchesOptions = {
  caseSensitive?: boolean;
};

export function findMarkdownMatches(
  source: string,
  query: string,
  options: FindMarkdownMatchesOptions = {},
): MarkdownMatch[] {
  if (!query) return [];

  const needle = options.caseSensitive ? query : query.toLocaleLowerCase();
  const haystack = options.caseSensitive ? source : source.toLocaleLowerCase();
  const matches: MarkdownMatch[] = [];
  let cursor = 0;

  while (cursor < haystack.length) {
    const index = haystack.indexOf(needle, cursor);
    if (index === -1) break;

    matches.push({ index, length: query.length });
    cursor = index + Math.max(query.length, 1);
  }

  return matches;
}

export function replaceMarkdownMatch(source: string, match: MarkdownMatch | undefined, replacement: string): string {
  if (!match) return source;

  return `${source.slice(0, match.index)}${replacement}${source.slice(match.index + match.length)}`;
}

export function replaceAllMarkdownMatches(
  source: string,
  query: string,
  replacement: string,
  options: FindMarkdownMatchesOptions = {},
): string {
  const matches = findMarkdownMatches(source, query, options);
  if (matches.length === 0) return source;

  let output = "";
  let cursor = 0;

  for (const match of matches) {
    output += source.slice(cursor, match.index);
    output += replacement;
    cursor = match.index + match.length;
  }

  return output + source.slice(cursor);
}
