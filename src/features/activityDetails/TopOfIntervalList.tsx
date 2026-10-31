import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import SettingsIcon from "@mui/icons-material/Settings";
import { FullScreenModalHeader } from "../../components/FullScreenModalHeader";
import { ActivityName } from "./ActivityName";
import { ActivityDetailsData } from "../../db/queries/activityDetails";
import { useNavigate } from "../../router/hooks";
import { EditingState } from "./useActivityNameEditing";

type TopOfIntervalListProps = {
  activityDetails: ActivityDetailsData;
  editingState: EditingState;
  onEditStart: () => void;
  onNameChange: (newName: string) => void;
  onParentChange: (parentId: number) => void;
  onSave: () => void;
  onCancel: () => void;
};

export const TopOfIntervalList = (props: TopOfIntervalListProps) => {
  const {
    activityDetails,
    editingState,
    onEditStart,
    onNameChange,
    onParentChange,
    onSave,
    onCancel,
  } = props;
  const { id, activities } = activityDetails;
  const navigate = useNavigate();

  const handleSettingsClick = () => {
    navigate(`settings`, { viewTransition: true });
  };

  return (
    <Box sx={{ pt: 1, pb: 1 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <FullScreenModalHeader headline="Activity Details" />
        <IconButton
          aria-label="Activity settings"
          onClick={handleSettingsClick}
          sx={{ mr: 2 }}
        >
          <SettingsIcon />
        </IconButton>
      </Box>
      <ActivityName
        activityId={id}
        activities={activities}
        editMode={editingState.editMode}
        name={editingState.name}
        parentId={editingState.parentId}
        parentOptions={editingState.parentOptions}
        validationError={editingState.validationError}
        onEditStart={onEditStart}
        onNameChange={onNameChange}
        onParentChange={onParentChange}
        onSave={onSave}
        onCancel={onCancel}
      />
      <Typography variant="h6" sx={{ pl: 2, pr: 2 }}>
        Intervals
      </Typography>
    </Box>
  );
};
