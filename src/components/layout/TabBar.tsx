import { tabs } from "../../app/tabs";
import type { AppTab } from "../../types/domain";

interface TabBarProps {
  activeTab: AppTab;
  onChange: (tab: AppTab) => void;
}

export function TabBar({ activeTab, onChange }: TabBarProps) {
  return (
    <nav className="grid grid-cols-5 gap-1 bg-white/25 p-1.5" aria-label="主导航">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`h-7 rounded-md text-xs transition focus:outline-none focus:ring-2 focus:ring-[var(--accent)] ${
            activeTab === tab.id
              ? "bg-[var(--app-bg-soft)] text-[var(--accent)] shadow-sm"
              : "text-[var(--text-muted)] hover:bg-white/30 hover:text-[var(--text-main)]"
          }`}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
