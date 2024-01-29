import { Activity } from "../../../data/activity/Storage";
import { Signal } from "@preact/signals-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  activities,
  parentActivities,
  rootActivity,
  useActivityID,
} from "../../../data/activity/Signals";
import {
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

type SetExpandedVariables = {
  activity: Signal<Activity>;
  expanded: boolean;
};

export function useSetExpanded() {
  const queryClient = useQueryClient();

  const { mutate } = useMutation({
    mutationFn: (variables: SetExpandedVariables) => {
      const { activity, expanded } = variables;
      const { id } = activity.value;
      queryClient.setQueryData(["activityInListExpanded", { id }], expanded);
      return setExpanded(id, expanded);
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

export function useExpandPathToRoot() {
  const setExpanded = useSetExpanded();
  return (activity: Activity) => {
    let currentActivity = activities.value.get(activity.parentID.value)!;
    while (currentActivity.value !== rootActivity.value) {
      setExpanded({ activity: currentActivity, expanded: true });
      currentActivity = activities.value.get(
        currentActivity.value.parentID.value,
      )!;
    }
  };
}
