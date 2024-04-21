import moment from "moment/moment";
import { humanize, intervalsGroupedByDay } from "./Algorithms";
import { Interval, toSimpleClosedInterval } from "./Interval";
import { Activity } from "../activity/Storage";
import { useEffect, useMemo } from "react";
import { create } from "zustand";
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

export const useHumanizedDuration = (duration: number, inProgress: boolean) => {
  return useMemo(() => humanize(duration, inProgress), [duration, inProgress]);
};

export const useIntervalDuration = (
  interval: Omit<Interval, "id">,
  full: boolean,
) => {
  const time = useClockStore((state) => state.time);
  return useMemo(() => {
    const inProgress = !interval.end;
    const { start, end } = toSimpleClosedInterval(interval, time);
    const duration = end - start;
    return humanize(duration, inProgress, full);
  }, [full, interval, time]);
};

export const useIntervalsGroupedByDay = (
  activity: Activity,
  activities: Map<string, Activity>,
) => {
  const groupedIntervals = useMemo(
    () => intervalsGroupedByDay(activity, activities),
    [activities, activity],
  );
  return { groupedIntervals };
};
