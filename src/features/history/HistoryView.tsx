import { EmptyState } from "../../components/common/EmptyState";
import { PanelBody } from "../../components/layout/PanelBody";
import { formatDuration } from "../../lib/time";
import { useHistory } from "./useHistory";

export function HistoryView() {
  const { groups, loading, error } = useHistory();

  return (
    <PanelBody>
      {error && <p className="rounded-md bg-red-50 p-2 text-xs text-red-700">{error}</p>}
      {loading ? (
        <p className="p-2 text-xs text-[var(--text-muted)]">正在读取历史...</p>
      ) : groups.length === 0 ? (
        <EmptyState title="还没有历史记录" />
      ) : (
        <div className="grid max-h-60 gap-2 overflow-auto pr-1">
          {groups.map((group) => (
            <article key={group.date} className="min-w-0 rounded-md border border-[var(--app-border)] bg-white/25 p-2">
              <h2 className="text-sm font-semibold">{group.date}</h2>
              {group.tasks.length > 0 && (
                <section className="mt-2">
                  <h3 className="text-xs text-[var(--text-muted)]">任务</h3>
                  <ul className="mt-1 grid gap-0.5 text-sm">
                    {group.tasks.map((task) => (
                      <li key={task.id} className={`truncate ${task.status === "done" ? "text-[var(--text-muted)] line-through" : ""}`}>
                        {task.title}
                      </li>
                    ))}
                  </ul>
                </section>
              )}
              {group.notes.length > 0 && (
                <section className="mt-2">
                  <h3 className="text-xs text-[var(--text-muted)]">灵感</h3>
                  <ul className="mt-1 grid gap-0.5 text-sm">
                    {group.notes.map((note) => (
                      <li key={note.id} className="line-clamp-2 whitespace-pre-wrap">
                        {note.content}
                      </li>
                    ))}
                  </ul>
                </section>
              )}
              {group.focusSessions.length > 0 && (
                <section className="mt-2">
                  <h3 className="text-xs text-[var(--text-muted)]">专注</h3>
                  <ul className="mt-1 grid gap-0.5 text-sm">
                    {group.focusSessions.map((session) => (
                      <li key={session.id} className="flex min-w-0 justify-between gap-3">
                        <span className="min-w-0 truncate">{session.title}</span>
                        <span className="shrink-0 tabular-nums text-[var(--text-muted)]">{formatDuration(session.durationSeconds)}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </article>
          ))}
        </div>
      )}
    </PanelBody>
  );
}
