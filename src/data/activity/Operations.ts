import { useAppSnackbarStore } from "../../components/AppSnackbarStore";
import { stopActivity } from "../../db/queries/stopActivity";
import { resumeActivity } from "../../db/queries/resumeActivity";
import { useState } from "react";
import { ActivityTreeNode } from "../../db/queries/activitiesTree";

export const useStartActivity = () => {
  const openErrorSnackbar = useAppSnackbarStore((state) => state.openError);
  const [isPending, setIsPending] = useState(false);
  return {
    mutate: (variables: { activity: ActivityTreeNode }) => {
      const { activity } = variables;
      setIsPending(true);
      resumeActivity({
        activityId: activity.id,
        startTime: new Date().getTime(),
      })
        .finally(() => setIsPending(false))
        .catch(openErrorSnackbar);
    },
    isPending,
  };
};

export const useStopActivity = () => {
  const openErrorSnackbar = useAppSnackbarStore((state) => state.openError);
  const [isPending, setIsPending] = useState(false);
  return {
    mutate: (variables: { activity: ActivityTreeNode }) => {
      const { activity } = variables;
      setIsPending(true);
      stopActivity({
        activityId: activity.id,
        end: new Date().getTime(),
      })
        .finally(() => setIsPending(false))
        .catch(openErrorSnackbar);
    },
    isPending,
  };
};
