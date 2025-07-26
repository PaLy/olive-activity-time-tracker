import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { chain } from "lodash";
import { useMemo } from "react";
import {
  AddActivityData,
  AddActivityDataActivity,
} from "../../db/queries/getAddActivityData";
import { useCreateActivityStore } from "./Store";
import { useActivityFullNames } from "./hooks";

type Props = {
  activity: AddActivityDataActivity | null;
  setActivity: (activity: AddActivityDataActivity | null) => void;
  label: string;
  autoFocus?: boolean;
  error?: {
    value: string;
    set: (error: string) => void;
  };
  getOptionDisabled?: (activity: AddActivityDataActivity) => boolean;
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

  const addActivityData = useCreateActivityStore(
    (state) => state.addActivityData,
  );

  const activityFullNames = useActivityFullNames(addActivityData);
  const options = useOptions(addActivityData);

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

const filter = createFilterOptions<AddActivityDataActivity>({ trim: true });

const useOptions = (addActivityData: AddActivityData | undefined) => {
  const { activities = new Map() } = addActivityData ?? {};
  const activityFullNames = useActivityFullNames(addActivityData);
  return useMemo(
    () =>
      chain([...activities.values()])
        .filter((a) => a.id !== -1) // Exclude root activity
        .sortBy((activity) => activityFullNames.get(activity.id))
        .value(),
    [activityFullNames, activities],
  );
};
