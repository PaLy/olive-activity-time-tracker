import { Activity, activityStore } from "./Storage";
import { Interval } from "../interval/Interval";
import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { openErrorSnackbar } from "../../routes/activity/AppSnackbar";

type RemoveActivityIntervalOptions = {
  onSuccess?: () => void;
};

export const useRemoveActivityInterval = (
  options?: RemoveActivityIntervalOptions,
) => {
  return useMutation({
    mutationFn: async (variables: {
      activity: Activity;
      interval: Interval;
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
  const invalidateActivities = useInvalidateActivities();
  return useMutation({
    mutationFn: async (variables: { activity: Activity }) => {
      const { activity } = variables;
      await activityStore.start(activity);
      await invalidateActivities();
    },
    onError: openErrorSnackbar,
  });
};

function useInvalidateActivities() {
  const queryClient = useQueryClient();
  return async () => {
    await queryClient.invalidateQueries({ queryKey: ["activities"] });
    await queryClient.invalidateQueries({ queryKey: ["activityByInterval"] });
    await queryClient.invalidateQueries({ queryKey: ["activity"] });
  };
}

export const useStopActivity = (options?: StartStopActivityOptions) => {
  const invalidateActivities = useInvalidateActivities();
  return useMutation({
    mutationFn: async (variables: { activity: Activity }) => {
      const { activity } = variables;
      await activityStore.stop(activity);
      await invalidateActivities();
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
      await activityStore.addInterval(activity, interval);
      await invalidateActivities();
    },
    onError: openErrorSnackbar,
  });
};

export const useActivities = () => {
  return useQuery({
    queryKey: ["activities"],
    queryFn: () => activityStore.load(),
  });
};

export const fetchActivity = (client: QueryClient, activityID: string) => {
  return client.fetchQuery({
    queryKey: ["activity", activityID],
    queryFn: () => activityStore.get(activityID),
  });
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