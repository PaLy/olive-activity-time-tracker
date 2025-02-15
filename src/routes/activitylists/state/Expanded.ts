import { Activity } from "../../../data/activity/Storage";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAllExpanded,
  getExpanded,
  setExpanded,
} from "../../../data/activity/ActivityInListExpanded";
import { useActivities } from "../../../data/activity/Operations";
import { useParentActivities } from "../../../data/activity/Signals";
import { produce } from "immer";
import {
  useAppSnackbarStore,
  useOpenErrorSnackbar,
} from "../../../components/AppSnackbarStore";

export function useExpanded(activity: Activity) {
  const { id } = activity;
  const { data, error } = useQuery({
    queryKey: ["activityInListExpanded", { id }],
    queryFn: () => getExpanded(id),
    initialData: false,
  });
  useOpenErrorSnackbar(error);
  return data;
}

export function useExpandedAll() {
  const { data, error } = useQuery({
    queryKey: ["activitiesInListExpanded"],
    queryFn: async () => {
      return new Set(["root"].concat(await getAllExpanded()));
    },
    initialData: new Set(["root"]),
  });
  useOpenErrorSnackbar(error);
  return data;
}

type SetExpandedVariables = {
  activity: Activity;
  expanded: boolean;
};

export function useSetExpanded() {
  const openErrorSnackbar = useAppSnackbarStore((state) => state.openError);
  const queryClient = useQueryClient();

  const { mutate } = useMutation({
    mutationFn: async (variables: SetExpandedVariables) => {
      const { activity, expanded } = variables;
      const { id } = activity;
      queryClient.setQueryData(["activityInListExpanded", { id }], expanded);
      queryClient.setQueryData<Set<string>>(
        ["activitiesInListExpanded"],
        (previous = new Set()) =>
          produce(previous, (draft) => {
            if (expanded) {
              draft.add(id);
            } else {
              draft.delete(id);
            }
          }),
      );
      await setExpanded(id, expanded);
    },
    onError: openErrorSnackbar,
  });

  return mutate;
}

function useSetExpandedAll() {
  const setExpanded = useSetExpanded();
  const parentActivities = useParentActivities();
  return (expanded: boolean) =>
    Promise.all(
      parentActivities.map((activity) => setExpanded({ activity, expanded })),
    );
}

export function useExpandAll() {
  const setExpandedAll = useSetExpandedAll();
  return () => setExpandedAll(true);
}

export function useCollapseAll() {
  const setExpandedAll = useSetExpandedAll();
  return () => setExpandedAll(false);
}

export function useExpandChildrenPathToRoot() {
  const setExpanded = useSetExpanded();
  const { data: activities } = useActivities();

  return (activity: Activity) => {
    let currentActivity: Activity | undefined = activity;

    while (currentActivity && currentActivity.id !== "root") {
      setExpanded({ activity: currentActivity, expanded: true });
      currentActivity = activities?.get(currentActivity.parentID);
    }
  };
}

export function useInvalidateExpanded() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ["activitiesInListExpanded"] }),
      queryClient.invalidateQueries({ queryKey: ["activityInListExpanded"] }),
    ]).catch((error) => {
      console.error(error);
    });
}
