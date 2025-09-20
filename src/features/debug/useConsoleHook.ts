import { useEffect } from "react";
import { Hook, Unhook } from "console-feed";
import { useDebugStore } from "./DebugStore";

export const useConsoleHook = () => {
  const addLog = useDebugStore((state) => state.addLog);

  useEffect(() => {
    // @ts-expect-error Console.Message is not assignable to Component.Message
    const hookedConsole = Hook(window.console, (log) => addLog(log), false);

    return () => {
      Unhook(hookedConsole);
    };
  }, [addLog]);
};
