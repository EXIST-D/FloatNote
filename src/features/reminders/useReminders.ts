import { listen } from "@tauri-apps/api/event";
import { useCallback, useEffect, useState } from "react";
import { deleteReminder, dismissReminder, listReminders } from "../../data/remindersRepository";
import type { Reminder } from "../../types/domain";

export function useReminders() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setReminders(await listReminders());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    let unlisten: (() => void) | undefined;
    listen("reminders:changed", () => {
      void reload();
    }).then((fn) => {
      unlisten = fn;
    });
    return () => unlisten?.();
  }, [reload]);

  async function dismiss(id: string) {
    await dismissReminder(id);
    await reload();
  }

  async function remove(id: string) {
    await deleteReminder(id);
    await reload();
  }

  return { reminders, loading, reload, dismiss, remove };
}
