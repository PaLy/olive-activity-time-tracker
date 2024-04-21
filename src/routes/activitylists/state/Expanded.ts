import { Activity } from "../../../data/activity/Storage";
import { ReadonlySignal, signal } from "@preact/signals-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAllExpanded,
  getExpanded,
  setExpanded,
} from "../../../data/activity/ActivityInListExpanded";
import { useActivities } from "../../../data/activity/Operations";
import { useParentActivities } from "../../../data/activity/Signals";

export function useExpanded(activity: Activity) {
  const { id } = activity;
  const { data } = useQuery({
    queryKey: ["activityInListExpanded", { id }],
    queryFn: () => getExpanded(id),
    initialData: false,
  });

  return data;
}

export function useExpandedAll() {
  const { data } = useQuery({
    queryKey: ["activitiesInListExpanded"],
    queryFn: async () => {
      expandedAllSignal.value = new Set(
        ["root"].concat(await getAllExpanded()),
      );
      return expandedAllSignal.value;
    },
    initialData: new Set(["root"]),
  });
  return data;
}

const expandedAllSignal = signal(new Set<string>());

export function useExpandedAllSignal(): ReadonlySignal<Set<string>> {
  useExpandedAll();
  return expandedAllSignal;
}

type SetExpandedVariables = {
  activity: Activity;
  expanded: boolean;
};

export function useSetExpanded() {
  const queryClient = useQueryClient();

  const { mutate } = useMutation({
    mutationFn: async (variables: SetExpandedVariables) => {
      const { activity, expanded } = variables;
      const { id } = activity;
      queryClient.setQueryData(["activityInListExpanded", { id }], expanded);
      await setExpanded(id, expanded);
      await queryClient.invalidateQueries({
        queryKey: ["activitiesInListExpanded"],
        exact: true,
      });
    },
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
    ]);
}
