import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ActivityList,
  DEFAULT_SETTINGS,
  getActivityList,
  setActivityList,
} from "../data/settings/Settings";
import { useOpenErrorSnackbar } from "../components/AppSnackbarStore";

export const useActivityListSettings = () => {
  const { data, error } = useQuery({
    queryKey: ["activityListSettings"],
    queryFn: () => getActivityList(),
    initialData: DEFAULT_SETTINGS.activityList,
  });
  useOpenErrorSnackbar(error);
  return data;
};

export const useSetActivityListSettings = () => {
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: (activityList: ActivityList) => {
      queryClient.setQueryData(["activityListSettings"], activityList);
      return setActivityList(activityList);
    },
  });
  return mutate;
};
