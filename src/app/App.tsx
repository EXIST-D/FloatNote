import { useEffect, useState } from "react";
import { initializeSchema } from "../data/schema";
import { AppShell } from "./AppShell";

export default function App() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.dataset.theme = "paper";
  }, []);

  useEffect(() => {
    initializeSchema()
      .then(() => setReady(true))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "数据库初始化失败"));
  }, []);

  if (error) {
    return <main className="p-4 text-sm text-red-700">{error}</main>;
  }

  if (!ready) {
    return <main className="p-4 text-sm text-[var(--text-muted)]">正在打开...</main>;
  }

  return <AppShell />;
}
