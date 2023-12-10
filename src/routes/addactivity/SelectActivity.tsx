import { Autocomplete, createFilterOptions, TextField } from "@mui/material";
import { Signal } from "@preact/signals-react";
import { Activity } from "../../data/activity/Storage";
import {
  activityFullNames,
  nonRootActivities,
} from "../../data/activity/Signals";

type Props = {
  activity: Signal<Activity | null>;
  label: string;
  autoFocus?: boolean;
  error?: Signal<string>;
};

export const SelectActivity = (props: Props) => {
  const { activity, label, error, autoFocus } = props;
  return (
    <Autocomplete
      sx={{ m: 1 }}
      value={activity.value}
      onChange={(event, newValue) => {
        activity.value = newValue;
        if (error) {
          error.value = "";
        }
      }}
      filterOptions={filter}
      handleHomeEndKeys
      options={nonRootActivities.value}
      getOptionLabel={(option) => activityFullNames.value.get(option.id)!}
      renderOption={(props, option) => (
        <li {...props}>{activityFullNames.value.get(option.id)}</li>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          autoFocus={autoFocus}
          label={label}
          error={!!error?.value}
          helperText={error?.value ?? ""}
        />
      )}
    />
  );
};

const filter = createFilterOptions<Activity>();
