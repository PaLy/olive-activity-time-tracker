import { Autocomplete, createFilterOptions, TextField } from "@mui/material";
import { Signal } from "@preact/signals-react";
import { Activity } from "../../data/activity/Storage";
import { chain } from "lodash";
import {
  useActivityFullNames,
  useNonRootActivities,
} from "../../data/activity/Signals";
import { useMemo } from "react";

type Props = {
  activity: Signal<Activity | null>;
  label: string;
  autoFocus?: boolean;
  error?: Signal<string>;
  getOptionDisabled?: (activity: Activity) => boolean;
};

export const SelectActivity = (props: Props) => {
  const { activity, label, error, autoFocus, getOptionDisabled } = props;

  const activityFullNames = useActivityFullNames();
  const options = useOptions();

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
      options={options}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      getOptionDisabled={getOptionDisabled}
      getOptionLabel={(option) =>
        activityFullNames.get(option.id) ?? option.name
      }
      renderOption={(props, option) => (
        <li {...props}>{activityFullNames.get(option.id) ?? option.name}</li>
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

const filter = createFilterOptions<Activity>({ trim: true });

const useOptions = () => {
  const nonRootActivities = useNonRootActivities();
  const activityFullNames = useActivityFullNames();
  return useMemo(
    () =>
      chain([...nonRootActivities.values()])
        .sortBy((activity) => activityFullNames.get(activity.id))
        .value(),
    [activityFullNames, nonRootActivities],
  );
};
