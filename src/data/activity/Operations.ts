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
      invalidateActivities().catch((error) => {
        console.error(error);
      });
    },
    onSuccess: options?.onSuccess,
    onError: openErrorSnackbar,
  });
};

type StartStopActivityOptions = {};

export const useStartActivity = (options?: StartStopActivityOptions) => {
  const invalidateActivities = useInvalidateActivities();
  const invalidateExpanded = useInvalidateExpanded();
  return useMutation({
    mutationFn: async (variables: { activity: Activity }) => {
      const { activity } = variables;
      await activityStore.start(activity);
      Promise.all([invalidateActivities(), invalidateExpanded()]).catch(
        (error) => {
          console.error(error);
        },
      );
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
    ]);
}

export const useStopActivity = (options?: StartStopActivityOptions) => {
  const invalidateActivities = useInvalidateActivities();
  const invalidateExpanded = useInvalidateExpanded();
  return useMutation({
    mutationFn: async (variables: { activity: Activity }) => {
      const { activity } = variables;
      await activityStore.stop(activity);
      Promise.all([invalidateActivities(), invalidateExpanded()]).catch(
        (error) => {
          console.error(error);
        },
      );
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
