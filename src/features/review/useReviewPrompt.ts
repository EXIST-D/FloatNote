import { useEffect, useState } from "react";
import { getReviewSummary } from "../../data/reviewRepository";
import { getReviewMode } from "../../data/settingsRepository";
import { addDays, getWeekKey, toLocalDateKey } from "./reviewSummary";

export interface ReviewPromptState {
  kind: "yesterday" | "last_week";
  label: string;
  periodKey: string;
}

export function useReviewPrompt() {
  const [prompt, setPrompt] = useState<ReviewPromptState | null>(null);

  useEffect(() => {
    async function check() {
      const mode = await getReviewMode();
      if (mode === "manual_only") return;

      const yesterdayKey = toLocalDateKey(addDays(new Date(), -1));
      const yesterdayReview = await getReviewSummary("day", yesterdayKey);
      if (!yesterdayReview) {
        setPrompt({ kind: "yesterday", label: "是否补记昨日总结", periodKey: yesterdayKey });
        return;
      }

      const lastWeekKey = getWeekKey(addDays(new Date(), -7));
      const lastWeekReview = await getReviewSummary("week", lastWeekKey);
      if (!lastWeekReview) {
        setPrompt({ kind: "last_week", label: "是否补记上周总结", periodKey: lastWeekKey });
      }
    }

    void check();
  }, []);

  return { prompt, dismissPrompt: () => setPrompt(null) };
}
