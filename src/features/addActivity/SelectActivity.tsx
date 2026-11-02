import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { useTheme } from "@mui/material/styles";
import { useLiveQuery } from "dexie-react-hooks";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { MouseEvent } from "react";
import {
  getActivityScores,
  sortByScore,
} from "../../db/queries/activityRanking";
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
  openOnMount?: boolean;
  prioritizeParents?: boolean;
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
    openOnMount,
    prioritizeParents,
    getOptionDisabled,
    onUserInputChange,
  } = props;

  const addActivityData = useCreateActivityStore(
    (state) => state.addActivityData,
  );

  const activityFullNames = useActivityFullNames(addActivityData);
  const options = useOptions(addActivityData, prioritizeParents);

  // Open the options without focusing the input, so the soft keyboard stays
  // closed until the user taps the selector. Delay the initial opening until
  // the modal's slide-in view transition (225ms) has finished.
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const skipNextMouseDown = useRef(false);
  const autoOpenTimeout = useRef<number | undefined>(undefined);

  const cancelAutoOpen = useCallback(() => {
    if (autoOpenTimeout.current !== undefined) {
      window.clearTimeout(autoOpenTimeout.current);
      autoOpenTimeout.current = undefined;
    }
  }, []);

  useEffect(() => {
    if (!openOnMount) {
      return;
    }
    autoOpenTimeout.current = window.setTimeout(() => {
      autoOpenTimeout.current = undefined;
      skipNextMouseDown.current = true;
      setOpen(true);
    }, theme.transitions.duration.enteringScreen);
    return cancelAutoOpen;
  }, [openOnMount, theme.transitions.duration.enteringScreen, cancelAutoOpen]);

  // Don't auto-open the options if the user starts interacting elsewhere.
  useEffect(() => {
    if (!openOnMount) {
      return;
    }
    const handlePointerDown = (event: globalThis.PointerEvent) => {
      const target = event.target;
      if (target instanceof Node && rootRef.current?.contains(target)) {
        return;
      }
      cancelAutoOpen();
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [openOnMount, cancelAutoOpen]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const handlePointerDown = (event: globalThis.PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }
      if (rootRef.current?.contains(target)) {
        return;
      }
      if (target instanceof Element && target.closest('[role="listbox"]')) {
        return;
      }
      setOpen(false);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  return (
    <Autocomplete
      ref={rootRef}
      sx={{ m: 1 }}
      open={open}
      onOpen={() => {
        cancelAutoOpen();
        setOpen(true);
      }}
      onClose={() => setOpen(false)}
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
      // Close the soft keyboard after picking an activity.
      blurOnSelect
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
      openOnFocus
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
          slotProps={{
            ...params.slotProps,
            htmlInput: {
              ...params.slotProps.htmlInput,
              onMouseDown: (event: MouseEvent<HTMLInputElement>) => {
                // MUI toggles the popup on mousedown when the input is empty.
                // Skip that once so the initially open options stay visible
                // when the user taps the selector.
                if (skipNextMouseDown.current) {
                  skipNextMouseDown.current = false;
                  return;
                }
                params.slotProps.htmlInput.onMouseDown?.(event);
              },
            },
          }}
          label={label}
          error={!!error}
          helperText={error ?? ""}
        />
      )}
    />
  );
};

const filter = createFilterOptions<AddActivityDataActivity>({ trim: true });

const useOptions = (
  addActivityData: AddActivityData | undefined,
  prioritizeParents = false,
) => {
  const { activities = new Map() } = addActivityData ?? {};
  const activityFullNames = useActivityFullNames(addActivityData);
  const scores = useLiveQuery(() => getActivityScores(), []);
  return useMemo(() => {
    const sorted = sortByScore(
      [...activities.values()].filter((a) => a.id !== -1), // Exclude root activity
      scores ?? new Map(),
      (activity) => activity.id,
      (activity) => activityFullNames.get(activity.id) ?? activity.name,
    );
    if (!prioritizeParents) {
      return sorted;
    }
    // Activities that already have children are more likely to be picked as
    // a parent again, so show them before leaf activities.
    const parents = sorted.filter((activity) => activity.children.length > 0);
    const leaves = sorted.filter((activity) => activity.children.length === 0);
    return [...parents, ...leaves];
  }, [activityFullNames, activities, prioritizeParents, scores]);
};
