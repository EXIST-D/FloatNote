import { useEffect } from "react";
import { AppShell } from "./AppShell";

export default function App() {
  useEffect(() => {
    document.documentElement.dataset.theme = "paper";
  }, []);

  return <AppShell />;
}
