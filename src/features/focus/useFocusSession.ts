import { useCallback, useEffect, useMemo, useState } from "react";
import {
  completeFocusSession,
  getActiveFocusSession,
  pauseFocusSession,
  resumeFocusSession,
  startFocusSession,
} from "../../data/focusRepository";
import { formatDuration } from "../../lib/time";
import type { FocusSession } from "../../types/domain";

function computeElapsedSeconds(session: FocusSession | null) {
  if (!session) return 0;
  if (session.status !== "running") return session.durationSeconds;

  const lastTick = new Date(session.updatedAt).getTime();
  return session.durationSeconds + Math.max(0, Math.floor((Date.now() - lastTick) / 1000));
}

export function useFocusSession() {
  const [session, setSession] = useState<FocusSession | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const active = await getActiveFocusSession();
      if (active?.status === "running") {
        const elapsed = computeElapsedSeconds(active);
        const updatedAt = new Date().toISOString();
        await pauseFocusSession(active.id, elapsed);
        const paused = { ...active, status: "paused" as const, durationSeconds: elapsed, updatedAt };
        setSession(paused);
        setElapsedSeconds(elapsed);
      } else {
        setSession(active);
        setElapsedSeconds(computeElapsedSeconds(active));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "读取专注计时失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    if (!session || session.status !== "running") return;

    const intervalId = window.setInterval(() => {
      setElapsedSeconds(computeElapsedSeconds(session));
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [session]);

  async function start(title: string) {
    const nextTitle = title.trim() || "自由专注";
    const next = await startFocusSession(nextTitle);
    setSession(next);
    setElapsedSeconds(0);
  }

  async function pause() {
    if (!session) return;
    const elapsed = computeElapsedSeconds(session);
    await pauseFocusSession(session.id, elapsed);
    setSession({ ...session, status: "paused", durationSeconds: elapsed, updatedAt: new Date().toISOString() });
    setElapsedSeconds(elapsed);
  }

  async function resume() {
    if (!session) return;
    await resumeFocusSession(session.id);
    setSession({ ...session, status: "running", updatedAt: new Date().toISOString() });
  }

  async function complete() {
    if (!session) return;
    const elapsed = computeElapsedSeconds(session);
    await completeFocusSession(session.id, elapsed);
    setSession(null);
    setElapsedSeconds(0);
  }

  const elapsedText = useMemo(() => formatDuration(elapsedSeconds), [elapsedSeconds]);

  return {
    session,
    elapsedSeconds,
    elapsedText,
    loading,
    error,
    start,
    pause,
    resume,
    complete,
    reload,
  };
}
