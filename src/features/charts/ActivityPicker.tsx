import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { useLiveQuery } from "dexie-react-hooks";
import { ActivityOption, getActivityOptions } from "../../db/queries/charts";
import { useChartsStore } from "./Store";

/**
 * Activity selection state, kept in the charts store so it survives
 * leaving and returning to the screen. Falls back to the root
 * ("All activities") when the remembered activity no longer exists.
 */
export const useActivityPicker = () => {
  const options = useLiveQuery(() => getActivityOptions(), []);
  const selectedId = useChartsStore((state) => state.activityId);
  const setSelectedId = useChartsStore((state) => state.setActivityId);
  const selected =
    options?.find((option) => option.id === selectedId) ?? options?.[0] ?? null;
  return { options, selected, setSelectedId };
};

type Props = {
  options: ActivityOption[];
  selected: ActivityOption;
  onChange: (id: number) => void;
};

export const ActivityPicker = ({ options, selected, onChange }: Props) => (
  <Autocomplete<ActivityOption, false, true>
    size="small"
    sx={{ mt: 2 }}
    options={options}
    value={selected}
    disableClearable
    getOptionLabel={(option) => option.fullName}
    isOptionEqualToValue={(a, b) => a.id === b.id}
    onChange={(_, option) => onChange(option.id)}
    renderInput={(params) => <TextField {...params} label="Activity" />}
  />
);
