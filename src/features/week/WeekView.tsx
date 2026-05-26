import { EmptyState } from "../../components/common/EmptyState";

export function WeekView() {
  return (
    <section className="grid gap-3 p-3">
      <div className="rounded-md border border-[var(--app-border)] bg-white/30 p-3 text-sm">
        组会前确认本周进展
      </div>
      <EmptyState title="本周任务会显示在这里" />
    </section>
  );
}
