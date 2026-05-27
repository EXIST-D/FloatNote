import { PanelBody } from "../../components/layout/PanelBody";
import { useReviewActions } from "../review/useReviewActions";
import { SortableTaskList } from "../tasks/SortableTaskList";
import { TaskInput } from "./TaskInput";
import { useTodayTasks } from "./useTodayTasks";

export function TodayView() {
  const { tasks, loading, error, addTask, changeStatus, editTask, changeLabel, removeTask, changeOrder } = useTodayTasks();
  const reviewActions = useReviewActions();

  return (
    <PanelBody>
      <TaskInput placeholder="写下今天要做的事" onSubmit={addTask} />
      <button type="button" className="review-inline-button" onClick={() => void reviewActions.finishReview("today")}>
        结束今日
      </button>
      {reviewActions.message && <p className="review-message">{reviewActions.message}</p>}
      {reviewActions.error && <p className="review-error">{reviewActions.error}</p>}
      {error && <p className="rounded-md bg-red-50 p-2 text-xs text-red-700">{error}</p>}
      {loading ? (
        <p className="p-2 text-xs text-[var(--text-muted)]">正在读取今日任务...</p>
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
    </PanelBody>
  );
}
