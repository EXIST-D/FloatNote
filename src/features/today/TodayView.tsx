import { TaskInput } from "./TaskInput";
import { TaskList } from "./TaskList";
import { useTodayTasks } from "./useTodayTasks";

export function TodayView() {
  const { tasks, loading, error, addTask, markDone, removeTask } = useTodayTasks();

  return (
    <section className="grid gap-3 p-3">
      <TaskInput placeholder="写下今天要做的事" onSubmit={addTask} />
      {error && <p className="rounded-md bg-red-50 p-2 text-xs text-red-700">{error}</p>}
      {loading ? (
        <p className="p-2 text-sm text-[var(--text-muted)]">正在读取今日任务...</p>
      ) : (
        <TaskList tasks={tasks} emptyText="今天还没有任务" onComplete={markDone} onDelete={removeTask} />
      )}
    </section>
  );
}
