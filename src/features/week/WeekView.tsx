import { PanelBody } from "../../components/layout/PanelBody";
import { SortableTaskList } from "../tasks/SortableTaskList";
import { TaskInput } from "../today/TaskInput";
import { useWeekTasks } from "./useWeekTasks";

export function WeekView() {
  const { tasks, loading, error, addTask, changeStatus, editTask, removeTask, changeOrder } = useWeekTasks();

  return (
    <PanelBody>
      <TaskInput placeholder="写下本周组会或待汇报事项" onSubmit={addTask} />
      {error && <p className="rounded-md bg-red-50 p-2 text-xs text-red-700">{error}</p>}
      {loading ? (
        <p className="p-2 text-xs text-[var(--text-muted)]">正在读取本周任务...</p>
      ) : (
        <SortableTaskList
          tasks={tasks}
          emptyText="本周还没有任务"
          onStatusChange={changeStatus}
          onTitleChange={editTask}
          onDelete={removeTask}
          onReorder={changeOrder}
        />
      )}
    </PanelBody>
  );
}
