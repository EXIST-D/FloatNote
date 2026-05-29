import { PanelBody } from "../../components/layout/PanelBody";
import { SortableTaskList } from "../tasks/SortableTaskList";
import { TaskInput } from "../today/TaskInput";
import { useWeekTasks } from "./useWeekTasks";

export function FloatingWeekView() {
  const { tasks, loading, error, addTask, changeStatus, editTask, changeLabel, removeTask, changeOrder } = useWeekTasks();
  const activeCount = tasks.filter((task) => task.status === "active").length;
  const doneCount = tasks.filter((task) => task.status === "done").length;

  return (
    <PanelBody className="floating-task-view">
      <TaskInput placeholder="写下本周组会或待汇报事项" onSubmit={addTask} />
      <p className="floating-status-line">未完成 {activeCount} · 已完成 {doneCount}</p>
      {error && <p className="floating-error">{error}</p>}
      <section className="floating-list-panel">
        {loading ? (
          <p className="floating-empty">正在读取本周任务...</p>
        ) : (
          <SortableTaskList
            tasks={tasks}
            emptyText="本周还没有任务"
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
