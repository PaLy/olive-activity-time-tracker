import { CreateActivityState } from "./AddActivityModal";
import { Box, TextField, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { SelectActivity } from "./SelectActivity";
import {
  useAnyActivityLogged,
  useInProgressActivities,
} from "../../data/activity/Signals";

type Props = {
  state: CreateActivityState;
};
export const Name = (props: Props) => {
  const { state } = props;
  const {
    nameToggle: toggle,
    parentActivity,
    existingActivity,
    existingActivityError,
    name,
    nameError,
  } = state;

  const inProgressActivities = useInProgressActivities();
  const anyActivityLogged = useAnyActivityLogged();

  return (
    <>
      {anyActivityLogged && (
        <Box sx={{ m: 1 }}>
          <ToggleButtonGroup
            sx={{ mt: 1 }}
            color="primary"
            value={toggle.value}
            exclusive
            onChange={(event, newValue) => {
              if (newValue) {
                toggle.value = newValue;
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
      {toggle.value === "new" && (
        <>
          <TextField
            autoFocus
            label="Name"
            sx={{ m: 1 }}
            value={name.value}
            onChange={(event) => {
              name.value = event.target.value;
              nameError.value = "";
            }}
            error={!!nameError.value}
            helperText={nameError.value}
          />
          {anyActivityLogged && (
            <SelectActivity
              activity={parentActivity}
              label={"As subactivity of..."}
            />
          )}
        </>
      )}
      {toggle.value === "existing" && (
        <Box sx={{ mt: 2 }}>
          <SelectActivity
            autoFocus
            activity={existingActivity}
            label={"Activity"}
            error={existingActivityError}
            getOptionDisabled={(activity) => inProgressActivities.has(activity)}
            onUserInputChange={(newInputValue) => {
              name.value = newInputValue;
            }}
          />
        </Box>
      )}
    </>
  );
};
