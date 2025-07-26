import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { SelectActivity } from "./SelectActivity";
import { useCreateActivityStore } from "./Store";
import { capitalize } from "../../utils/strings";

type NameProps = {
  activityNameExists: boolean;
};

export const Name = (props: NameProps) => {
  const { activityNameExists } = props;
  const intervalToggle = useCreateActivityStore(
    (state) => state.intervalToggle,
  );
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
  const anyActivityLogged = useCreateActivityStore((state) =>
    state.getAnyActivityLogged(),
  );

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
            error={!!nameError || activityNameExists}
            helperText={
              nameError || (activityNameExists && "Name already exists")
            }
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
            getOptionDisabled={(activity) =>
              activity.inProgress && intervalToggle !== "finished"
            }
            onUserInputChange={(newInputValue) => {
              setName(capitalize(newInputValue));
            }}
          />
        </Box>
      )}
    </>
  );
};
