import { Plus } from "lucide-react";
import { useState } from "react";

interface TaskInputProps {
  placeholder: string;
  onSubmit: (title: string) => Promise<void>;
}

export function TaskInput({ placeholder, onSubmit }: TaskInputProps) {
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const nextTitle = title.trim();
    if (!nextTitle || saving) return;

    setSaving(true);
    try {
      await onSubmit(nextTitle);
      setTitle("");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="flex gap-2" onSubmit={handleSubmit}>
      <input
        value={title}
        onChange={(event) => setTitle(event.currentTarget.value)}
        className="h-10 min-w-0 flex-1 rounded-md border border-[var(--app-border)] bg-white/45 px-3 text-sm outline-none placeholder:text-[var(--text-muted)] focus:ring-2 focus:ring-[var(--accent)]"
        placeholder={placeholder}
      />
      <button
        type="submit"
        className="grid h-10 w-10 place-items-center rounded-md bg-[var(--accent)] text-[var(--accent-contrast)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={saving || !title.trim()}
        aria-label="新增任务"
        title="新增任务"
      >
        <Plus size={17} />
      </button>
    </form>
  );
}
