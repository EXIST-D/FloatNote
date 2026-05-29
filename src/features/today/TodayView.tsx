import { CheckCircle2, Circle, Plus } from "lucide-react";
import { DashboardPage } from "../../components/layout/DashboardPage";
import { useReviewActions } from "../review/useReviewActions";
import { SortableTaskList } from "../tasks/SortableTaskList";
import { TaskInput } from "./TaskInput";
import { useTodayTasks } from "./useTodayTasks";

export function TodayView() {
  const { tasks, loading, error, addTask, changeStatus, editTask, changeLabel, removeTask, changeOrder } = useTodayTasks();
  const reviewActions = useReviewActions();
  const activeCount = tasks.filter((task) => task.status === "active").length;
  const doneCount = tasks.filter((task) => task.status === "done").length;

  return (
    <DashboardPage
      eyebrow="今日任务"
      title="今天要推进的事"
      description={`${activeCount} 项待处理，${doneCount} 项已完成`}
      actions={
        <>
          <button type="button" className="secondary-action" onClick={() => document.querySelector<HTMLInputElement>("[data-quick-task-input]")?.focus()}>
            <Plus size={15} />
            新任务
          </button>
          <button type="button" className="primary-action" onClick={() => void reviewActions.finishReview("today")}>
            结束今日
          </button>
        </>
      }
      toolbar={
        <div className="task-filter-bar" aria-label="今日任务状态">
          <span>
            <Circle size={14} />
            未完成 {activeCount}
          </span>
          <span>
            <CheckCircle2 size={14} />
            已完成 {doneCount}
          </span>
        </div>
      }
    >
      <section className="desk-panel task-page-panel">
        <TaskInput placeholder="写下今天要做的事" onSubmit={addTask} />
      </section>
      {reviewActions.message && <p className="review-message">{reviewActions.message}</p>}
      {reviewActions.error && <p className="review-error">{reviewActions.error}</p>}
      {error && <p className="rounded-md bg-red-50 p-2 text-xs text-red-700">{error}</p>}
      <section className="desk-panel task-list-panel">
        {loading ? (
          <p className="dashboard-empty">正在读取今日任务...</p>
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
    </DashboardPage>
  );
}
