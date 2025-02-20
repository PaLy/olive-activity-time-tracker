import { Box, TextField, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { SelectActivity } from "./SelectActivity";
import {
  useAnyActivityLogged,
  useInProgressActivities,
} from "../../data/activity/Hooks";
import { useCreateActivityStore } from "./Store";

export const Name = () => {
  const toggle = useCreateActivityStore((state) => state.nameToggle);
  const setToggle = useCreateActivityStore((state) => state.setNameToggle);
  const name = useCreateActivityStore((state) => state.name);
  const setName = useCreateActivityStore((state) => state.setName);
  const nameError = useCreateActivityStore((state) => state.nameError);
  const setNameError = useCreateActivityStore((state) => state.setNameError);
  const parentActivity = useCreateActivityStore(
    (state) => state.parentActivity,
  );
  const existingActivity = useCreateActivityStore(
    (state) => state.existingActivity,
  );
  const existingActivityError = useCreateActivityStore(
    (state) => state.existingActivityError,
  );
  const setParentActivity = useCreateActivityStore(
    (state) => state.setParentActivity,
  );
  const setExistingActivity = useCreateActivityStore(
    (state) => state.setExistingActivity,
  );
  const setExistingActivityError = useCreateActivityStore(
    (state) => state.setExistingActivityError,
  );

  const inProgressActivities = useInProgressActivities();
  const { anyActivityLogged } = useAnyActivityLogged();

  return (
    <>
      {anyActivityLogged && (
        <Box sx={{ m: 1 }}>
          <ToggleButtonGroup
            sx={{ mt: 1 }}
            color="primary"
            value={toggle}
            exclusive
            onChange={(event, newValue) => {
              if (newValue) {
                setToggle(newValue);
              }
            }}
            aria-label="new or existing name toggle"
          >
            <ToggleButton value="existing">Existing</ToggleButton>
            <ToggleButton value="new" aria-label="new">
              New
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      )}
      {toggle === "new" && (
        <>
          <TextField
            autoFocus
            label="Name"
            sx={{ m: 1 }}
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setNameError("");
            }}
            error={!!nameError}
            helperText={nameError}
          />
          {anyActivityLogged && (
            <SelectActivity
              activity={parentActivity}
              setActivity={setParentActivity}
              label={"As subactivity of..."}
            />
          )}
        </>
      )}
      {toggle === "existing" && (
        <Box sx={{ mt: 2 }}>
          <SelectActivity
            autoFocus
            activity={existingActivity}
            setActivity={setExistingActivity}
            label={"Activity"}
            error={{
              value: existingActivityError,
              set: setExistingActivityError,
            }}
            getOptionDisabled={(activity) => inProgressActivities.has(activity)}
            onUserInputChange={(newInputValue) => {
              setName(newInputValue);
            }}
          />
        </Box>
      )}
    </>
  );
};
