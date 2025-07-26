import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { ChangeEvent, KeyboardEvent, useState } from "react";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { Activity } from "../../db/entities";
import { useActivityFullName } from "./hooks";
import {
  editActivityName,
  getSiblingActivities,
} from "../../db/queries/activities";
import { openErrorSnackbar } from "../../components/AppSnackbarStore";

type ActivityNameProps = {
  activityId: number;
  activities: Map<number, Activity>;
};

export const ActivityName = (props: ActivityNameProps) => {
  const { activityId, activities } = props;
  const fullName = useActivityFullName(activityId, activities);
  const currentActivity = activities.get(activityId);
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(currentActivity?.name || "");
  const [siblingNames, setSiblingNames] = useState<Set<string>>(new Set());
  const [validationError, setValidationError] = useState<string>("");

  const validateName = (nameToValidate: string) => {
    if (nameToValidate.trim() === "") {
      setValidationError("Activity name cannot be empty");
      return false;
    }
    if (siblingNames.has(nameToValidate.trim().toLowerCase())) {
      setValidationError(
        "An activity with this name already exists in the same parent",
      );
      return false;
    }
    setValidationError("");
    return true;
  };

  const handleSave = () => {
    const trimmedName = name.trim();
    if (!validateName(trimmedName)) {
      return;
    }

    editActivityName(activityId, trimmedName)
      .then(() => {
        setEditMode(false);
        setValidationError("");
      })
      .catch((err) => {
        console.error(err);
        openErrorSnackbar("Failed to save activity name");
      });
  };

  const handleCancel = () => {
    setName(currentActivity?.name || "");
    setEditMode(false);
    setValidationError("");
  };

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    validateName(newName);
  };

  const handleEditMode = async () => {
    try {
      const siblings = await getSiblingActivities(activityId);
      const names = new Set(
        siblings.map((sibling) => sibling.name.toLowerCase()),
      );
      setSiblingNames(names);
      setEditMode(true);
    } catch (err) {
      console.error(err);
      openErrorSnackbar("Failed to load activity data");
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", pl: 2, pr: 2, mb: 1 }}>
      {editMode ? (
        <TextField
          label={"Name"}
          value={name}
          onChange={handleNameChange}
          onKeyDown={handleKeyDown}
          variant="outlined"
          size="small"
          placeholder="Activity name"
          sx={{ flexGrow: 1, mr: 1 }}
          autoFocus
          error={!!validationError}
          helperText={validationError}
        />
      ) : (
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          {fullName}
        </Typography>
      )}
      {editMode ? (
        <>
          <IconButton aria-label="save activity" onClick={handleSave}>
            <CheckIcon />
          </IconButton>
          <IconButton aria-label="cancel edit" onClick={handleCancel}>
            <CloseIcon />
          </IconButton>
        </>
      ) : (
        <IconButton aria-label="edit activity" onClick={handleEditMode}>
          <EditIcon />
        </IconButton>
      )}
    </Box>
  );
};
