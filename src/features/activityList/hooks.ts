import { ActivityTreeNode } from "../../db/queries/activitiesTree";
import { useMemo } from "react";

export const useActivitiesOrderKey = (activities: ActivityTreeNode[]) => {
  return useMemo(
    () =>
      // Should be joined by a character which is not used in any ID.
      activities.map((a) => a.id).join("$"),
    [activities],
  );
};
