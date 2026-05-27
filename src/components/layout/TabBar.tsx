import { tabs } from "../../app/tabs";
import type { AppTab } from "../../types/domain";

interface TabBarProps {
  activeTab: AppTab;
  onChange: (tab: AppTab) => void;
}

export function TabBar({ activeTab, onChange }: TabBarProps) {
  return (
    <nav className="note-tabbar grid shrink-0 grid-cols-4 gap-0.5 p-1" aria-label="浮窗导航">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`note-tab min-w-0 rounded-md px-1 py-1.5 text-xs leading-none transition focus:outline-none focus:ring-2 focus:ring-[var(--accent)] ${
            activeTab === tab.id ? "is-active" : ""
          }`}
          onClick={() => onChange(tab.id)}
        >
          <span className="block truncate">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
