import { Activity } from "../../../data/activity/Storage";
import { ReadonlySignal, signal, Signal } from "@preact/signals-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  activities,
  parentActivities,
  rootActivity,
  useActivityID,
} from "../../../data/activity/Signals";
import {
  getAllExpanded,
  getExpanded,
  setExpanded,
} from "../../../data/activity/ActivityInListExpanded";

export function useExpanded(activity: Signal<Activity>) {
  const id = useActivityID(activity).value;

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
        [rootActivity.value.id].concat(await getAllExpanded()),
      );
      return expandedAllSignal.value;
    },
    initialData: new Set([rootActivity.value.id]),
  });
  return data;
}

const expandedAllSignal = signal(new Set<string>());

export function useExpandedAllSignal(): ReadonlySignal<Set<string>> {
  useExpandedAll();
  return expandedAllSignal;
}

type SetExpandedVariables = {
  activity: Signal<Activity>;
  expanded: boolean;
};

export function useSetExpanded() {
  const queryClient = useQueryClient();

  const { mutate } = useMutation({
    mutationFn: async (variables: SetExpandedVariables) => {
      const { activity, expanded } = variables;
      const { id } = activity.value;
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
  return (expanded: boolean) =>
    Promise.all(
      parentActivities.value.map((activity) =>
        setExpanded({ activity, expanded }),
      ),
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
  return (activity: Signal<Activity>) => {
    let currentActivity = activity;
    while (currentActivity.value !== rootActivity.value) {
      setExpanded({ activity: currentActivity, expanded: true });
      currentActivity = activities.value.get(
        currentActivity.value.parentID.value,
      )!;
    }
  };
}
