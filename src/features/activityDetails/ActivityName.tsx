import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { ChangeEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { Activity } from "../../db/entities";
import { ActivityOption } from "../../db/queries/activities";
import { ActivityPicker } from "../../components/ActivityPicker";
import { useActivityFullName } from "./hooks";

const NAME_CHANGE_DEBOUNCE_MS = 300;

type ActivityNameProps = {
  activityId: number;
  activities: Map<number, Activity>;
  editMode: boolean;
  name: string;
  parentId: number;
  parentOptions: ActivityOption[];
  validationError: string;
  onEditStart: () => void;
  onNameChange: (name: string) => void;
  onParentChange: (parentId: number) => void;
  onSave: (latestName?: string) => void;
  onCancel: () => void;
};

export const ActivityName = (props: ActivityNameProps) => {
  const { activityId, activities, editMode, onEditStart } = props;
  const fullName = useActivityFullName(activityId, activities);

  if (editMode) {
    return <ActivityNameEditor {...props} />;
  }

  return (
    <Box
      sx={{ display: "flex", alignItems: "flex-start", pl: 2, pr: 2, mb: 1 }}
    >
      <Typography variant="h6" sx={{ flexGrow: 1 }}>
        {fullName}
      </Typography>
      <IconButton aria-label="edit activity" onClick={onEditStart}>
        <EditIcon />
      </IconButton>
    </Box>
  );
};

const ActivityNameEditor = (props: ActivityNameProps) => {
  const {
    name,
    parentId,
    parentOptions,
    validationError,
    onNameChange,
    onParentChange,
    onSave,
    onCancel,
  } = props;

  // Typing is kept local and propagated with a delay, as updating the whole list on each keystroke is slow.
  const [localName, setLocalName] = useState(name);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setLocalName(newName);
    clearTimeout(timer.current);
    timer.current = setTimeout(
      () => onNameChange(newName),
      NAME_CHANGE_DEBOUNCE_MS,
    );
  };

  const handleSave = () => {
    clearTimeout(timer.current);
    onSave(localName);
  };

  const handleCancel = () => {
    clearTimeout(timer.current);
    onCancel();
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  const selectedParent = parentOptions.find((option) => option.id === parentId);

  return (
    <Box
      sx={{ display: "flex", alignItems: "flex-start", pl: 2, pr: 2, mb: 1 }}
    >
      <Box sx={{ flexGrow: 1, mr: 1 }}>
        <TextField
          label={"Name"}
          value={localName}
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
        {selectedParent && (
          <ActivityPicker
            options={parentOptions}
            selected={selectedParent}
            onChange={onParentChange}
            label="Parent"
            sx={{ mt: 2 }}
          />
        )}
      </Box>
      <Box sx={{ display: "flex", alignItems: "flex-start", mt: 0.5 }}>
        <IconButton aria-label="save activity" onClick={handleSave}>
          <CheckIcon />
        </IconButton>
        <IconButton aria-label="cancel edit" onClick={handleCancel}>
          <CloseIcon />
        </IconButton>
      </Box>
    </Box>
  );
};
