import { Search } from "lucide-react";
import { useState } from "react";
import { searchAll } from "../../data/searchRepository";
import type { DashboardTab, SearchResult } from "../../types/domain";

interface SearchViewProps {
  onNavigate: (tab: DashboardTab) => void;
}

const typeLabels: Record<SearchResult["type"], string> = {
  task: "任务",
  note: "灵感",
  review: "历史",
  focus: "专注",
};

export function SearchView({ onNavigate }: SearchViewProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

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
        {results.map((result) => (
          <button key={`${result.type}-${result.id}`} type="button" className="search-result" onClick={() => onNavigate(result.targetTab)}>
            <span>{typeLabels[result.type]}</span>
            <strong>{result.title}</strong>
            <small>{result.snippet}</small>
          </button>
        ))}
      </section>
    </main>
  );
}
