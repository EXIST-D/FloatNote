import { useState } from "react";
import { DashboardPage } from "../../components/layout/DashboardPage";
import type { useFocusSession } from "./useFocusSession";

type FocusController = ReturnType<typeof useFocusSession>;

interface FocusViewProps {
  focus: FocusController;
}

export function FocusView({ focus }: FocusViewProps) {
  const [title, setTitle] = useState("");
  const { session, elapsedText, loading, error, start, pause, resume, complete } = focus;

  return (
    <DashboardPage
      eyebrow="专注计时"
      title="专注"
      description={session ? `正在记录：${session.title || "未命名专注"}` : "开始一段轻量计时，结束后会写入历史"}
    >
      <section className="focus-desk-grid">
        <div className="focus-panel min-w-0">
          <p>{session ? (session.status === "paused" ? "已暂停" : "当前专注") : "尚未开始"}</p>
          <strong>{elapsedText}</strong>
          <span>{session?.title ?? "给正在做的事起个名字"}</span>
        </div>
        <div className="desk-panel focus-control-panel">
          {error && <p className="rounded-md bg-red-50 p-2 text-xs text-red-700">{error}</p>}
          {!session && (
            <form
              className="grid min-w-0 gap-3"
              onSubmit={(event) => {
                event.preventDefault();
                void start(title);
                setTitle("");
              }}
            >
              <label className="settings-field">
                <span>当前任务</span>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.currentTarget.value)}
                  className="task-input-field h-9 min-w-0 px-2 text-sm outline-none placeholder:text-[var(--text-muted)]"
                  placeholder="现在要专注什么？"
                />
              </label>
              <button type="submit" className="primary-action h-9 rounded-md text-sm disabled:opacity-60" disabled={loading}>
                开始专注
              </button>
            </form>
          )}
          {session?.status === "running" && (
            <div className="grid grid-cols-2 gap-2">
              <button className="secondary-action h-9 rounded-md text-sm" onClick={() => void pause()}>
                暂停
              </button>
              <button className="primary-action h-9 rounded-md text-sm" onClick={() => void complete()}>
                结束
              </button>
            </div>
          )}
          {session?.status === "paused" && (
            <div className="grid grid-cols-2 gap-2">
              <button className="secondary-action h-9 rounded-md text-sm" onClick={() => void resume()}>
                继续
              </button>
              <button className="primary-action h-9 rounded-md text-sm" onClick={() => void complete()}>
                结束
              </button>
            </div>
          )}
        </div>
      </section>
    </DashboardPage>
  );
}
