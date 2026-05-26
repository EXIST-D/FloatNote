import { tabs } from "../../app/tabs";
import type { AppTab } from "../../types/domain";

interface TabBarProps {
  activeTab: AppTab;
  onChange: (tab: AppTab) => void;
}

export function TabBar({ activeTab, onChange }: TabBarProps) {
  return (
    <nav className="grid shrink-0 grid-cols-5 gap-0.5 bg-white/25 p-1" aria-label="主导航">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`min-w-0 rounded-md px-1 py-1.5 text-xs leading-none transition focus:outline-none focus:ring-2 focus:ring-[var(--accent)] ${
            activeTab === tab.id
              ? "border border-[var(--accent)] bg-[var(--app-bg-soft)] text-[var(--accent)] shadow-sm"
              : "text-[var(--text-muted)] hover:bg-white/30 hover:text-[var(--text-main)]"
          }`}
          onClick={() => onChange(tab.id)}
        >
          <span className="block truncate">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
