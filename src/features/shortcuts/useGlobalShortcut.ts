import { isRegistered, register, unregister } from "@tauri-apps/plugin-global-shortcut";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useEffect, useState } from "react";

const SHORTCUT_ACCELERATOR = "CommandOrControl+Shift+O";

export function useGlobalShortcut() {
  const [shortcutError, setShortcutError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function setup() {
      try {
        if (await isRegistered(SHORTCUT_ACCELERATOR)) {
          await unregister(SHORTCUT_ACCELERATOR);
        }

        await register(SHORTCUT_ACCELERATOR, async (event) => {
          if (event.state !== "Pressed") return;

          const appWindow = getCurrentWindow();
          const visible = await appWindow.isVisible();
          const focused = visible ? await appWindow.isFocused() : false;

          if (!visible) {
            await appWindow.show();
            await appWindow.setFocus();
            return;
          }

          if (focused) {
            await appWindow.hide();
            return;
          }

          await appWindow.setFocus();
        });

        if (active) setShortcutError(null);
      } catch {
        if (active) setShortcutError("快捷键 Ctrl+Shift+O 注册失败，可能已被其他软件占用");
      }
    }

    void setup();

    return () => {
      active = false;
      void unregister(SHORTCUT_ACCELERATOR);
    };
  }, []);

  return { shortcutError };
}
