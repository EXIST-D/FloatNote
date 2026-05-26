import { useState } from "react";
import type { useFocusSession } from "./useFocusSession";

type FocusController = ReturnType<typeof useFocusSession>;

interface FocusViewProps {
  focus: FocusController;
}

export function FocusView({ focus }: FocusViewProps) {
  const [title, setTitle] = useState("");
  const { session, elapsedText, loading, error, start, pause, resume, complete } = focus;

  return (
    <section className="grid gap-3 p-3">
      <div className="rounded-md bg-[var(--accent)] p-4 text-[var(--accent-contrast)]">
        <p className="text-xs">{session ? (session.status === "paused" ? "已暂停" : "当前专注") : "尚未开始"}</p>
        <strong className="mt-2 block text-4xl tabular-nums">{elapsedText}</strong>
        <p className="mt-2 text-sm">{session?.title ?? "给正在做的事起个名字"}</p>
      </div>
      {error && <p className="rounded-md bg-red-50 p-2 text-xs text-red-700">{error}</p>}
      {!session && (
        <form
          className="grid gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            void start(title);
            setTitle("");
          }}
        >
          <input
            value={title}
            onChange={(event) => setTitle(event.currentTarget.value)}
            className="h-10 rounded-md border border-[var(--app-border)] bg-white/45 px-3 text-sm outline-none placeholder:text-[var(--text-muted)] focus:ring-2 focus:ring-[var(--accent)]"
            placeholder="现在要专注什么"
          />
          <button
            type="submit"
            className="h-10 rounded-md bg-[var(--accent)] text-sm text-[var(--accent-contrast)] disabled:opacity-60"
            disabled={loading}
          >
            开始专注
          </button>
        </form>
      )}
      {session?.status === "running" && (
        <div className="grid grid-cols-2 gap-2">
          <button className="h-10 rounded-md border border-[var(--app-border)] bg-white/35 text-sm" onClick={() => void pause()}>
            暂停
          </button>
          <button className="h-10 rounded-md bg-[var(--accent)] text-sm text-[var(--accent-contrast)]" onClick={() => void complete()}>
            结束
          </button>
        </div>
      )}
      {session?.status === "paused" && (
        <div className="grid grid-cols-2 gap-2">
          <button className="h-10 rounded-md border border-[var(--app-border)] bg-white/35 text-sm" onClick={() => void resume()}>
            继续
          </button>
          <button className="h-10 rounded-md bg-[var(--accent)] text-sm text-[var(--accent-contrast)]" onClick={() => void complete()}>
            结束
          </button>
        </div>
      )}
    </section>
  );
}
