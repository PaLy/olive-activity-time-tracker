import { useLiveQuery } from "dexie-react-hooks";
import { getChartActivityOptions } from "../../db/queries/charts";
import { useChartsStore } from "./Store";

/**
 * Activity selection state, kept in the charts store so it survives
 * leaving and returning to the screen. Falls back to the root
 * ("All activities") when the remembered activity no longer exists.
 */
export const useActivityPicker = () => {
  const options = useLiveQuery(() => getChartActivityOptions(), []);
  const selectedId = useChartsStore((state) => state.activityId);
  const setSelectedId = useChartsStore((state) => state.setActivityId);
  const selected =
    options?.find((option) => option.id === selectedId) ?? options?.[0] ?? null;
  return { options, selected, setSelectedId };
};
