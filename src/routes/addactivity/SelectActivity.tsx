import { Autocomplete, createFilterOptions, TextField } from "@mui/material";
import { computed, Signal } from "@preact/signals-react";
import { Activity } from "../../data/activity/Storage";
import {
  activityFullNames,
  nonRootActivities,
} from "../../data/activity/Signals";
import { chain } from "lodash";

type Props = {
  activity: Signal<Activity | null>;
  label: string;
  autoFocus?: boolean;
  error?: Signal<string>;
  getOptionDisabled?: (activity: Activity) => boolean;
};

export const SelectActivity = (props: Props) => {
  const { activity, label, error, autoFocus, getOptionDisabled } = props;
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
      options={options.value}
      getOptionDisabled={getOptionDisabled}
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

const options = computed(() =>
  chain(nonRootActivities.value)
    .map((signal) => signal.value)
    .sortBy((activity) => activityFullNames.value.get(activity.id))
    .value(),
);
