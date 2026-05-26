const MAX_TASK_TITLE_LENGTH = 60;

export function noteToTaskTitle(content: string) {
  const firstLine = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find(Boolean);

  if (!firstLine) return "未命名灵感";

  const chars = Array.from(firstLine);
  if (chars.length <= MAX_TASK_TITLE_LENGTH) return firstLine;

  return `${chars.slice(0, MAX_TASK_TITLE_LENGTH).join("")}…`;
}
