import type { ReviewPeriodType, ReviewSummary, ReviewSummarySnapshot } from "../types/domain";
import { getDb } from "./db";

interface ReviewSummaryRow {
  id: string;
  period_type: ReviewPeriodType;
  period_key: string;
  title: string;
  summary_json: string;
  created_at: string;
  updated_at: string;
}

function parseSnapshot(value: string): ReviewSummarySnapshot {
  try {
    const parsed = JSON.parse(value) as Partial<ReviewSummarySnapshot>;
    return {
      completedTasks: Array.isArray(parsed.completedTasks) ? parsed.completedTasks : [],
      unfinishedTasks: Array.isArray(parsed.unfinishedTasks) ? parsed.unfinishedTasks : [],
      noteCount: typeof parsed.noteCount === "number" ? parsed.noteCount : 0,
      notePreviews: Array.isArray(parsed.notePreviews) ? parsed.notePreviews.filter((item): item is string => typeof item === "string") : [],
      focusSeconds: typeof parsed.focusSeconds === "number" ? parsed.focusSeconds : 0,
    };
  } catch {
    return { completedTasks: [], unfinishedTasks: [], noteCount: 0, notePreviews: [], focusSeconds: 0 };
  }
}

function mapReview(row: ReviewSummaryRow): ReviewSummary {
  return {
    id: row.id,
    periodType: row.period_type,
    periodKey: row.period_key,
    title: row.title,
    snapshot: parseSnapshot(row.summary_json),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listReviewSummaries() {
  const db = await getDb();
  const rows = await db.select<ReviewSummaryRow[]>("SELECT * FROM review_summaries ORDER BY updated_at DESC");
  return rows.map(mapReview);
}

export async function getReviewSummary(periodType: ReviewPeriodType, periodKey: string) {
  const db = await getDb();
  const rows = await db.select<ReviewSummaryRow[]>(
    "SELECT * FROM review_summaries WHERE period_type = $1 AND period_key = $2 LIMIT 1",
    [periodType, periodKey],
  );
  return rows[0] ? mapReview(rows[0]) : null;
}

export async function upsertReviewSummary(input: {
  periodType: ReviewPeriodType;
  periodKey: string;
  title: string;
  snapshot: ReviewSummarySnapshot;
}) {
  const db = await getDb();
  const now = new Date().toISOString();
  const existing = await getReviewSummary(input.periodType, input.periodKey);
  const id = existing?.id ?? crypto.randomUUID();
  await db.execute(
    `INSERT INTO review_summaries (id, period_type, period_key, title, summary_json, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $6)
     ON CONFLICT(period_type, period_key) DO UPDATE SET
       title = excluded.title,
       summary_json = excluded.summary_json,
       updated_at = excluded.updated_at`,
    [id, input.periodType, input.periodKey, input.title, JSON.stringify(input.snapshot), now],
  );
}

export async function deleteReviewSummary(id: string) {
  const db = await getDb();
  await db.execute("DELETE FROM review_summaries WHERE id = $1", [id]);
}
