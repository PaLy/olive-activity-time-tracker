import moment from "moment/moment";
import { humanize } from "./Algorithms";
import { useEffect, useMemo } from "react";
import { create } from "zustand";
import { produce } from "immer";
import { MAX_DATE_MS } from "../../utils/Date";

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

export const useHumanizedDuration = (duration: number, inProgress: boolean) => {
  return useMemo(() => humanize(duration, inProgress), [duration, inProgress]);
};

export const useIntervalDuration = (
  start: number,
  end: number,
  full: boolean,
) => {
  const time = useClockStore((state) => state.time);
  return useMemo(() => {
    const inProgress = end === MAX_DATE_MS;
    const effectiveEnd = inProgress ? +time : end;
    const duration = effectiveEnd - start;
    return humanize(duration, inProgress, full);
  }, [full, start, end, time]);
};
