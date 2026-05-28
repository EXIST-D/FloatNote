import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { searchAll } from "../../data/searchRepository";
import type { DashboardTab, SearchResult } from "../../types/domain";

interface SearchViewProps {
  onNavigate: (tab: DashboardTab) => void;
}

type SearchGroupKey = "today" | "week" | "note" | "review" | "focus";

const groupMeta: Record<SearchGroupKey, { label: string; emptyLabel: string }> = {
  today: { label: "今日任务", emptyLabel: "今日" },
  week: { label: "本周任务", emptyLabel: "本周" },
  note: { label: "灵感记录", emptyLabel: "灵感" },
  review: { label: "历史复盘", emptyLabel: "历史" },
  focus: { label: "专注摘要", emptyLabel: "专注" },
};

const groupOrder: SearchGroupKey[] = ["today", "week", "note", "review", "focus"];

function getGroupKey(result: SearchResult): SearchGroupKey {
  if (result.type === "task") return result.targetTab === "week" ? "week" : "today";
  return result.type;
}

export function SearchView({ onNavigate }: SearchViewProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const groupedResults = useMemo(() => {
    const groups: Record<SearchGroupKey, SearchResult[]> = {
      today: [],
      week: [],
      note: [],
      review: [],
      focus: [],
    };
    for (const result of results) {
      groups[getGroupKey(result)].push(result);
    }
    return groupOrder
      .map((key) => ({ key, label: groupMeta[key].label, results: groups[key] }))
      .filter((group) => group.results.length > 0);
  }, [results]);

  async function runSearch(nextQuery = query) {
    setQuery(nextQuery);
    if (!nextQuery.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      setResults(await searchAll(nextQuery));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="dashboard-page">
      <div className="dashboard-page-title">
        <p>全局检索</p>
        <h1>搜索浮笺中的任务、灵感和历史</h1>
      </div>
      <label className="search-box">
        <Search size={18} />
        <input
          value={query}
          onChange={(event) => void runSearch(event.currentTarget.value)}
          placeholder="输入关键词"
          autoFocus
        />
      </label>
      <section className="search-results">
        {loading && <p className="dashboard-empty">正在搜索...</p>}
        {!loading && query.trim() && results.length === 0 && <p className="dashboard-empty">没有找到相关记录</p>}
        {!loading &&
          groupedResults.map((group) => (
            <section key={group.key} className="search-result-group" aria-label={group.label}>
              <header>
                <strong>{group.label}</strong>
                <span>{group.results.length} 条</span>
              </header>
              <div className="search-result-group-list">
                {group.results.map((result) => (
                  <button key={`${result.type}-${result.id}`} type="button" className="search-result" onClick={() => onNavigate(result.targetTab)}>
                    <span>{groupMeta[getGroupKey(result)].emptyLabel}</span>
                    <strong>{result.title}</strong>
                    <small>{result.snippet}</small>
                  </button>
                ))}
              </div>
            </section>
          ))}
      </section>
    </main>
  );
}
