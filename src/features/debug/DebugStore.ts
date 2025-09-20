import { create } from "zustand";
import { Message } from "console-feed/lib/definitions/Component";

type DebugState = {
  logs: Message[];
  totalLogs: number;
  addLog: (log: Message) => void;
  clearLogs: () => void;
};

export const useDebugStore = create<DebugState>((set, get) => ({
  logs: [],
  totalLogs: 0,
  addLog: (log: Message) => {
    const currentLogs = get().logs;
    set({
      logs: [...currentLogs, log].slice(-1000),
      totalLogs: get().totalLogs + 1,
    });
  },
  clearLogs: () => set({ logs: [], totalLogs: 0 }),
}));
