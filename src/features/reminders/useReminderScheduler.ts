import { isPermissionGranted, requestPermission, sendNotification } from "@tauri-apps/plugin-notification";
import { useEffect } from "react";
import { listDueReminders, markReminderSent } from "../../data/remindersRepository";

async function ensureNotificationPermission() {
  if (await isPermissionGranted()) return true;
  return (await requestPermission()) === "granted";
}

export function useReminderScheduler(onTriggered?: () => void) {
  useEffect(() => {
    let stopped = false;

    async function tick() {
      const due = await listDueReminders();
      if (due.length === 0 || stopped) return;
      const canNotify = await ensureNotificationPermission();
      for (const reminder of due) {
        if (canNotify) {
          sendNotification({ title: "浮笺提醒", body: reminder.taskTitle });
        }
        await markReminderSent(reminder.id);
      }
      onTriggered?.();
    }

    void tick();
    const intervalId = window.setInterval(() => void tick(), 30000);
    return () => {
      stopped = true;
      window.clearInterval(intervalId);
    };
  }, [onTriggered]);
}
