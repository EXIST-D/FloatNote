import { PanelBody } from "../../components/layout/PanelBody";
import { SortableTaskList } from "../tasks/SortableTaskList";
import { TaskInput } from "./TaskInput";
import { useTodayTasks } from "./useTodayTasks";

export function FloatingTodayView() {
  const { tasks, loading, error, addTask, changeStatus, editTask, changeLabel, removeTask, changeOrder } = useTodayTasks();
  const activeCount = tasks.filter((task) => task.status === "active").length;
  const doneCount = tasks.filter((task) => task.status === "done").length;

  return (
    <PanelBody className="floating-task-view">
      <TaskInput placeholder="写下今天要做的事" onSubmit={addTask} />
      <p className="floating-status-line">未完成 {activeCount} · 已完成 {doneCount}</p>
      {error && <p className="floating-error">{error}</p>}
      <section className="floating-list-panel">
        {loading ? (
          <p className="floating-empty">正在读取今日任务...</p>
        ) : (
          <SortableTaskList
            tasks={tasks}
            emptyText="今天还没有任务"
            onStatusChange={changeStatus}
            onTitleChange={editTask}
            onLabelChange={changeLabel}
            onDelete={removeTask}
            onReorder={changeOrder}
          />
        )}
      </section>
    </PanelBody>
  );
}
