import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { ChangeEvent, KeyboardEvent } from "react";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { Activity } from "../../db/entities";
import { useActivityFullName } from "./hooks";

type ActivityNameProps = {
  activityId: number;
  activities: Map<number, Activity>;
  editMode: boolean;
  name: string;
  validationError: string;
  onEditStart: () => void;
  onNameChange: (name: string) => void;
  onSave: () => void;
  onCancel: () => void;
};

export const ActivityName = (props: ActivityNameProps) => {
  const {
    activityId,
    activities,
    editMode,
    name,
    validationError,
    onEditStart,
    onNameChange,
    onSave,
    onCancel,
  } = props;
  const fullName = useActivityFullName(activityId, activities);

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    onNameChange(newName);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      onSave();
    } else if (e.key === "Escape") {
      onCancel();
    }
  };

  return (
    <Box
      sx={{ display: "flex", alignItems: "flex-start", pl: 2, pr: 2, mb: 1 }}
    >
      {editMode ? (
        <Box sx={{ flexGrow: 1, mr: 1 }}>
          <TextField
            label={"Name"}
            value={name}
            onChange={handleNameChange}
            onKeyDown={handleKeyDown}
            variant="outlined"
            size="small"
            placeholder="Activity name"
            sx={{ width: "100%" }}
            autoFocus
            error={!!validationError}
            helperText={validationError}
          />
        </Box>
      ) : (
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          {fullName}
        </Typography>
      )}
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          mt: editMode ? 0.5 : 0,
        }}
      >
        {editMode ? (
          <>
            <IconButton aria-label="save activity" onClick={onSave}>
              <CheckIcon />
            </IconButton>
            <IconButton aria-label="cancel edit" onClick={onCancel}>
              <CloseIcon />
            </IconButton>
          </>
        ) : (
          <IconButton aria-label="edit activity" onClick={onEditStart}>
            <EditIcon />
          </IconButton>
        )}
      </Box>
    </Box>
  );
};
