import moment from "moment";
import { useEffect } from "react";
import { create } from "zustand/index";
import { produce } from "immer";

type ClockStore = {
  time: moment.Moment;
  frozen: boolean;
  freeze: () => void;
  unfreeze: () => void;
  tick: () => void;
};

export const useClockStore = create<ClockStore>((set) => ({
  time: moment(),
  frozen: false,
  freeze: () => set({ frozen: true }),
  unfreeze: () => set({ frozen: false, time: moment() }),
  tick: () =>
    set(
      produce((state) => {
        if (!state.frozen) {
          state.time = moment();
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
