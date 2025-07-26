import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { FullScreenModalHeader } from "../../components/FullScreenModalHeader";
import { ActivityName } from "./ActivityName";
import { ActivityDetailsData } from "../../db/queries/activityDetails";

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

  return (
    <Box sx={{ pt: 1, pb: 1 }}>
      <FullScreenModalHeader headline="Activity details" />
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
