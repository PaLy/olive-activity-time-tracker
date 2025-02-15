import { Autocomplete, createFilterOptions, TextField } from "@mui/material";
import { Activity } from "../../data/activity/Storage";
import { chain } from "lodash";
import {
  useActivityFullNames,
  useNonRootActivities,
} from "../../data/activity/Signals";
import { useMemo } from "react";

type Props = {
  activity: Activity | null;
  setActivity: (activity: Activity | null) => void;
  label: string;
  autoFocus?: boolean;
  error?: {
    value: string;
    set: (error: string) => void;
  };
  getOptionDisabled?: (activity: Activity) => boolean;
  onUserInputChange?: (newInputValue: string) => void;
};

export const SelectActivity = (props: Props) => {
  const {
    activity,
    setActivity,
    label,
    error: { value: error, set: setError } = {},
    autoFocus,
    getOptionDisabled,
    onUserInputChange,
  } = props;

  const activityFullNames = useActivityFullNames();
  const options = useOptions();

  return (
    <Autocomplete
      sx={{ m: 1 }}
      value={activity}
      onChange={(_, newValue) => {
        setActivity(newValue);
        if (error) {
          setError?.("");
        }
        if (activity) {
          onUserInputChange?.("");
        }
      }}
      onInputChange={(_, newInputValue, reason) => {
        switch (reason) {
          case "input":
            onUserInputChange?.(newInputValue);
            break;
          case "clear":
            onUserInputChange?.("");
            break;
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
      renderOption={({ key, ...props }, option) => (
        <li key={key} {...props}>
          {activityFullNames.get(option.id) ?? option.name}
        </li>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          autoFocus={autoFocus}
          label={label}
          error={!!error}
          helperText={error ?? ""}
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
