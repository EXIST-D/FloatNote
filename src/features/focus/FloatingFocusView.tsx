import { useState } from "react";
import { PanelBody } from "../../components/layout/PanelBody";
import type { useFocusSession } from "./useFocusSession";

type FocusController = ReturnType<typeof useFocusSession>;

interface FloatingFocusViewProps {
  focus: FocusController;
}

export function FloatingFocusView({ focus }: FloatingFocusViewProps) {
  const [title, setTitle] = useState("");
  const { session, elapsedText, loading, error, start, pause, resume, complete } = focus;

  return (
    <PanelBody className="floating-focus-view">
      <section className="floating-focus-card">
        <span>{session ? (session.status === "paused" ? "已暂停" : "当前专注") : "尚未开始"}</span>
        <strong>{elapsedText}</strong>
        <p>{session?.title || "给正在做的事起个名字"}</p>
      </section>
      {error && <p className="floating-error">{error}</p>}
      {!session && (
        <form
          className="floating-focus-form"
          onSubmit={(event) => {
            event.preventDefault();
            void start(title);
            setTitle("");
          }}
        >
          <input
            value={title}
            onChange={(event) => setTitle(event.currentTarget.value)}
            className="task-input-field h-9 min-w-0 px-2 text-sm outline-none placeholder:text-[var(--text-muted)]"
            placeholder="现在要专注什么？"
          />
          <button type="submit" className="primary-action h-9 rounded-md text-sm disabled:opacity-60" disabled={loading}>
            开始专注
          </button>
        </form>
      )}
      {session?.status === "running" && (
        <div className="floating-focus-actions">
          <button className="secondary-action h-9 rounded-md text-sm" onClick={() => void pause()}>
            暂停
          </button>
          <button className="primary-action h-9 rounded-md text-sm" onClick={() => void complete()}>
            结束
          </button>
        </div>
      )}
      {session?.status === "paused" && (
        <div className="floating-focus-actions">
          <button className="secondary-action h-9 rounded-md text-sm" onClick={() => void resume()}>
            继续
          </button>
          <button className="primary-action h-9 rounded-md text-sm" onClick={() => void complete()}>
            结束
          </button>
        </div>
      )}
    </PanelBody>
  );
}
