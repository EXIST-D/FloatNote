import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type MarkdownSaveStatus = "idle" | "dirty" | "saving" | "saved" | "error";

interface MarkdownAutosaveOptions {
  noteId: string | null;
  value: string;
  initialValue: string;
  enabled?: boolean;
  delayMs?: number;
  onSave: (noteId: string, markdown: string) => Promise<void>;
}

export function createMarkdownAutosaveScheduler(save: (markdown: string) => Promise<void>, delayMs = 800) {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  let pendingMarkdown: string | undefined;

  function cancel() {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = undefined;
  }

  async function flush() {
    cancel();
    if (pendingMarkdown === undefined) return;

    const nextMarkdown = pendingMarkdown;
    pendingMarkdown = undefined;
    await save(nextMarkdown);
  }

  function queue(markdown: string) {
    pendingMarkdown = markdown;
    cancel();
    timeoutId = setTimeout(() => {
      void flush();
    }, delayMs);
  }

  return {
    queue,
    flush,
    cancel,
    hasPending: () => pendingMarkdown !== undefined,
  };
}

export function useMarkdownAutosave({
  noteId,
  value,
  initialValue,
  enabled = true,
  delayMs = 800,
  onSave,
}: MarkdownAutosaveOptions) {
  const [status, setStatus] = useState<MarkdownSaveStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const lastSavedRef = useRef(initialValue);

  useEffect(() => {
    lastSavedRef.current = initialValue;
    setStatus("idle");
    setError(null);
  }, [noteId, initialValue]);

  const saveNow = useCallback(
    async (markdown = value) => {
      if (!enabled || !noteId) return;
      if (markdown === lastSavedRef.current) {
        setStatus("saved");
        return;
      }

      setStatus("saving");
      setError(null);
      try {
        await onSave(noteId, markdown);
        lastSavedRef.current = markdown;
        setStatus("saved");
      } catch (err) {
        setStatus("error");
        setError(err instanceof Error ? err.message : "保存失败");
      }
    },
    [enabled, noteId, onSave, value],
  );

  const scheduler = useMemo(() => createMarkdownAutosaveScheduler(saveNow, delayMs), [delayMs, saveNow]);

  useEffect(() => {
    if (!enabled || !noteId) return undefined;
    if (value === lastSavedRef.current) {
      scheduler.cancel();
      setStatus("idle");
      return undefined;
    }

    setStatus("dirty");
    scheduler.queue(value);
    return () => scheduler.cancel();
  }, [enabled, noteId, scheduler, value]);

  return {
    status,
    error,
    saveNow,
  };
}
