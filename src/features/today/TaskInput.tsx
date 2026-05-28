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
    <form className="task-input flex min-w-0 gap-1.5" onSubmit={handleSubmit}>
      <input
        data-quick-task-input
        value={title}
        onChange={(event) => setTitle(event.currentTarget.value)}
        className="task-input-field h-8 min-w-0 flex-1 px-2 text-sm outline-none placeholder:text-[var(--text-muted)]"
        placeholder={placeholder}
      />
      <button
        type="submit"
        className="task-input-button grid h-8 w-8 place-items-center transition disabled:cursor-not-allowed disabled:opacity-60"
        disabled={saving || !title.trim()}
        aria-label="新增"
        title="新增"
      >
        <Plus size={15} />
      </button>
    </form>
  );
}
