import { Activity } from "../../../data/activity/Storage";
import { Signal } from "@preact/signals-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useActivityID } from "../../../data/activity/Signals";
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
export function useSetExpanded(activity: Signal<Activity>) {
  const queryClient = useQueryClient();
  const id = useActivityID(activity).value;

  const { mutate } = useMutation({
    mutationFn: (expanded: boolean) => {
      queryClient.setQueryData(["activityInListExpanded", { id }], expanded);
      return setExpanded(id, expanded);
    },
  });

  return mutate;
}
