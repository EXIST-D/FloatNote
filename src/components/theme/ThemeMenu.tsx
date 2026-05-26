import { Droplets, Palette, Type } from "lucide-react";
import type { FontStyleName, PaperOpacityName, ThemeName } from "../../types/domain";

interface ThemeMenuProps {
  theme: ThemeName;
  onThemeChange: (theme: ThemeName) => void;
  fontStyle: FontStyleName;
  onFontStyleChange: (fontStyle: FontStyleName) => void;
  paperOpacity: PaperOpacityName;
  onPaperOpacityChange: (paperOpacity: PaperOpacityName) => void;
}

const themes: Array<{ id: ThemeName; label: string; swatch: string }> = [
  { id: "paper", label: "纸笺", swatch: "#f0d982" },
  { id: "ink", label: "清简", swatch: "#e9e6da" },
  { id: "night", label: "夜灯", swatch: "#343b36" },
  { id: "book", label: "书卷", swatch: "#d9b36b" },
  { id: "reading", label: "夜读", swatch: "#2b2834" },
  { id: "green", label: "墨绿", swatch: "#416d5c" },
];

const fontStyles: Array<{ id: FontStyleName; label: string }> = [
  { id: "clear", label: "清晰" },
  { id: "bookish", label: "书卷" },
  { id: "compact", label: "紧凑" },
];

const paperOpacities: Array<{ id: PaperOpacityName; label: string }> = [
  { id: "clear", label: "清透" },
  { id: "soft", label: "柔和" },
  { id: "solid", label: "实色" },
];

export function ThemeMenu({
  theme,
  onThemeChange,
  fontStyle,
  onFontStyleChange,
  paperOpacity,
  onPaperOpacityChange,
}: ThemeMenuProps) {
  return (
    <div className="appearance-menu absolute right-3 top-11 z-20 grid w-56 gap-3 rounded-md border border-[var(--menu-border)] bg-[var(--menu-bg)] p-3 text-xs shadow-[var(--surface-shadow)]">
      <div className="grid gap-2">
        <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
          <Palette size={14} />
          <span>主题</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {themes.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`theme-choice ${theme === item.id ? "is-active" : ""}`}
              onClick={() => onThemeChange(item.id)}
            >
              <span className="h-3 w-3 rounded-full border border-black/10" style={{ background: item.swatch }} />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-2">
        <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
          <Type size={14} />
          <span>字感</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {fontStyles.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`setting-chip ${fontStyle === item.id ? "is-active" : ""}`}
              onClick={() => onFontStyleChange(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-2">
        <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
          <Droplets size={14} />
          <span>纸色</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {paperOpacities.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`setting-chip ${paperOpacity === item.id ? "is-active" : ""}`}
              onClick={() => onPaperOpacityChange(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
