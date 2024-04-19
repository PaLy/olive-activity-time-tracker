import { Activity, activityStore } from "./Storage";
import { Signal } from "@preact/signals-react";
import { Interval } from "../interval/Interval";
import { useMutation } from "@tanstack/react-query";
import { openErrorSnackbar } from "../../routes/activity/AppSnackbar";

type RemoveActivityIntervalOptions = {
  onSuccess?: () => void;
};

export const useRemoveActivityInterval = (
  options?: RemoveActivityIntervalOptions,
) => {
  return useMutation({
    mutationFn: async (variables: {
      activity: Signal<Activity>;
      interval: Signal<Interval>;
    }) => {
      const { activity, interval } = variables;
      await activityStore.removeInterval(activity, interval);
    },
    onSuccess: options?.onSuccess,
    onError: openErrorSnackbar,
  });
};

type StartStopActivityOptions = {};

export const useStartActivity = (options?: StartStopActivityOptions) => {
  return useMutation({
    mutationFn: async (variables: { activity: Signal<Activity> }) => {
      const { activity } = variables;
      await activityStore.start(activity.value);
    },
    onError: openErrorSnackbar,
  });
};

export const useStopActivity = (options?: StartStopActivityOptions) => {
  return useMutation({
    mutationFn: async (variables: { activity: Signal<Activity> }) => {
      const { activity } = variables;
      await activityStore.stop(activity);
    },
    onError: openErrorSnackbar,
  });
};
