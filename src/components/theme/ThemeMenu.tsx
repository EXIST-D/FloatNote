import type { ThemeName } from "../../types/domain";

interface ThemeMenuProps {
  theme: ThemeName;
  onChange: (theme: ThemeName) => void;
}

const themes: Array<{ id: ThemeName; label: string }> = [
  { id: "paper", label: "纸笺感" },
  { id: "ink", label: "清简墨色" },
  { id: "night", label: "夜灯模式" },
];

export function ThemeMenu({ theme, onChange }: ThemeMenuProps) {
  return (
    <div className="absolute right-3 top-10 z-10 grid w-32 gap-1 rounded-md border border-[var(--app-border)] bg-[var(--app-bg-soft)] p-1 shadow-lg">
      {themes.map((item) => (
        <button
          key={item.id}
          type="button"
          className={`h-8 rounded text-left text-xs transition ${
            theme === item.id
              ? "bg-[var(--accent)] px-2 text-[var(--accent-contrast)]"
              : "px-2 text-[var(--text-muted)] hover:bg-black/5 hover:text-[var(--text-main)]"
          }`}
          onClick={() => onChange(item.id)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
