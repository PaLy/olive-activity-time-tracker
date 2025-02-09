import { Activity, activityStore } from "./Storage";
import { Interval } from "../interval/Interval";
import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  openErrorSnackbar,
  useOpenErrorSnackbar,
} from "../../components/AppSnackbar";
import { useInvalidateExpanded } from "../../routes/activitylists/state/Expanded";
import { IntervalEdit } from "../interval/Storage";

type RemoveActivityIntervalOptions = {
  onSuccess?: () => void;
};

export const useRemoveActivityInterval = (
  options?: RemoveActivityIntervalOptions,
) => {
  const invalidateActivities = useInvalidateActivities();
  return useMutation({
    mutationFn: async (variables: {
      activity: Activity;
      interval: Interval;
    }) => {
      const { activity, interval } = variables;
      await activityStore.removeInterval(activity, interval);
      await invalidateActivities();
    },
    onSuccess: options?.onSuccess,
    onError: openErrorSnackbar,
  });
};

export const useStartActivity = () => {
  const invalidateActivities = useInvalidateActivities();
  const invalidateExpanded = useInvalidateExpanded();
  return useMutation({
    mutationFn: async (variables: { activity: Activity }) => {
      const { activity } = variables;
      await activityStore.start(activity);
      await Promise.all([invalidateActivities(), invalidateExpanded()]);
    },
    onError: openErrorSnackbar,
  });
};

function useInvalidateActivities() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ["activities"] }),
      queryClient.invalidateQueries({ queryKey: ["activityByInterval"] }),
    ]).catch((error) => {
      console.error(error);
    });
}

export const useStopActivity = () => {
  const invalidateActivities = useInvalidateActivities();
  const invalidateExpanded = useInvalidateExpanded();
  return useMutation({
    mutationFn: async (variables: { activity: Activity }) => {
      const { activity } = variables;
      await activityStore.stop(activity);
      await Promise.all([invalidateActivities(), invalidateExpanded()]);
    },
    onError: openErrorSnackbar,
  });
};

export const useAddActivity = () => {
  const invalidateActivities = useInvalidateActivities();
  return useMutation({
    mutationFn: async (variables: { activity: Activity }) => {
      const { activity } = variables;
      await activityStore.addActivity(activity);
      await invalidateActivities();
    },
    onError: openErrorSnackbar,
  });
};

export const useAddInterval = () => {
  const invalidateActivities = useInvalidateActivities();
  return useMutation({
    mutationFn: async (variables: {
      activity: Activity;
      interval: Interval;
    }) => {
      const { activity, interval } = variables;
      await activityStore.addInterval(activity.id, interval);
      await invalidateActivities();
    },
    onError: openErrorSnackbar,
  });
};

type EditIntervalOptions = {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
};

export const useEditInterval = (options?: EditIntervalOptions) => {
  const invalidateActivities = useInvalidateActivities();
  return useMutation({
    mutationFn: async (variables: {
      interval: Interval;
      activity: Activity;
      edit: IntervalEdit;
    }) => {
      const { interval, activity, edit } = variables;
      await activityStore.editInterval(activity, interval, edit);
      await invalidateActivities();
    },
    onSuccess: options?.onSuccess,
    onError: openErrorSnackbar,
  });
};

export const useActivities = () => {
  const result = useQuery({
    queryKey: ["activities"],
    queryFn: () => activityStore.load(),
  });
  useOpenErrorSnackbar(result.error);
  return result;
};

export const fetchActivityByInterval = (
  client: QueryClient,
  intervalID: string,
) => {
  return client.fetchQuery({
    queryKey: ["activityByInterval", intervalID],
    queryFn: () => activityStore.getByInterval(intervalID),
  });
};
