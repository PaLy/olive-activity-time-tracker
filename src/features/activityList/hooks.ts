import { ActivityTreeNode } from "../../db/queries/activitiesTree";
import { useMemo, useState } from "react";

export const useFlipKey = (activities: ActivityTreeNode[]) => {
  const [forceUpdate, setForceUpdate] = useState(0);

  const flipKey =
    useMemo(
      () =>
        // Should be joined by a character which is not used in any ID.
        activities.map((a) => a.id).join("$"),
      [activities],
    ) + `-$${forceUpdate}`;

  return { flipKey, forceUpdate: () => setForceUpdate((prev) => prev + 1) };
};
