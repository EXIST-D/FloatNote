import type { AppTab } from "../types/domain";

export interface TabDefinition {
  id: AppTab;
  label: string;
}

export const tabs: TabDefinition[] = [
  { id: "today", label: "今日" },
  { id: "week", label: "本周" },
  { id: "notes", label: "灵感" },
  { id: "focus", label: "专注" },
];
