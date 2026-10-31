import Autocomplete from "@mui/material/Autocomplete";
import { SxProps, Theme } from "@mui/material/styles";
import TextField from "@mui/material/TextField";
import { ActivityOption } from "../db/queries/activities";

type Props = {
  options: ActivityOption[];
  selected: ActivityOption;
  onChange: (id: number) => void;
  label?: string;
  size?: "small" | "medium";
  sx?: SxProps<Theme>;
};

export const ActivityPicker = ({
  options,
  selected,
  onChange,
  label = "Activity",
  size = "small",
  sx = { mt: 2 },
}: Props) => (
  <Autocomplete<ActivityOption, false, true>
    size={size}
    sx={sx}
    options={options}
    value={selected}
    disableClearable
    getOptionLabel={(option) => option.fullName}
    isOptionEqualToValue={(a, b) => a.id === b.id}
    onChange={(_, option) => onChange(option.id)}
    renderInput={(params) => <TextField {...params} label={label} />}
  />
);
