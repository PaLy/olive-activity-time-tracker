import dayjs from "./dayjs";
import { useEffect } from "react";
import { create } from "zustand";
import { produce } from "immer";

type ClockStore = {
  time: dayjs.Dayjs;
  frozen: boolean;
  freeze: () => void;
  unfreeze: () => void;
  tick: () => void;
};

export const useClockStore = create<ClockStore>((set) => ({
  time: dayjs(),
  frozen: false,
  freeze: () => set({ frozen: true }),
  unfreeze: () => set({ frozen: false, time: dayjs() }),
  tick: () =>
    set(
      produce((state) => {
        if (!state.frozen) {
          state.time = dayjs();
        }
      }),
    ),
}));

export const useTickingClock = () => {
  const tick = useClockStore((state) => state.tick);

  useEffect(() => {
    const intervalID = window.setInterval(tick, 1000);
    return () => clearInterval(intervalID);
  }, [tick]);
};
