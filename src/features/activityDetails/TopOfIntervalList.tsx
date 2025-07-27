import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import SettingsIcon from "@mui/icons-material/Settings";
import { FullScreenModalHeader } from "../../components/FullScreenModalHeader";
import { ActivityName } from "./ActivityName";
import { ActivityDetailsData } from "../../db/queries/activityDetails";
import { useNavigate } from "../../router/hooks";

type TopOfIntervalListProps = {
  activityDetails: ActivityDetailsData;
  editingState: {
    editMode: boolean;
    name: string;
    siblingNames: Set<string>;
    validationError: string;
  };
  onEditStart: () => void;
  onNameChange: (newName: string) => void;
  onSave: () => void;
  onCancel: () => void;
};

export const TopOfIntervalList = (props: TopOfIntervalListProps) => {
  const {
    activityDetails,
    editingState,
    onEditStart,
    onNameChange,
    onSave,
    onCancel,
  } = props;
  const { id, activities } = activityDetails;
  const navigate = useNavigate();

  const handleSettingsClick = () => {
    navigate(`settings`);
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
        validationError={editingState.validationError}
        onEditStart={onEditStart}
        onNameChange={onNameChange}
        onSave={onSave}
        onCancel={onCancel}
      />
      <Typography variant="h6" sx={{ pl: 2, pr: 2 }}>
        Intervals
      </Typography>
    </Box>
  );
};
