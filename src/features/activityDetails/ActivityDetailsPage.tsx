import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import { Outlet, useParams } from "react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { getActivityDetails } from "../../db/queries/activityDetails";
import { openErrorSnackbar } from "../../components/AppSnackbarStore";
import { DeleteIntervalConfirmation } from "./DeleteIntervalConfirmation";
import { ActivityDetailsContent } from "./ActivityDetailsContent";
import { useActivityNameEditing } from "./useActivityNameEditing";

export const ActivityDetailsPage = () => {
  const params = useParams<{ activityID: string }>();
  const activityId = parseInt(params.activityID ?? "");

  const {
    editingState,
    handleEditStart,
    handleNameChange,
    handleSave,
    handleCancel,
  } = useActivityNameEditing(activityId);

  const activityDetailsData = useLiveQuery(
    () =>
      getActivityDetails(activityId).catch((e) => {
        console.error(e);
        openErrorSnackbar("Activity not found");
        return undefined;
      }),
    [activityId],
  );

  return (
    <>
      <Paper square sx={{ height: "100%" }}>
        {activityDetailsData ? (
          <ActivityDetailsContent
            activityDetails={activityDetailsData}
            editingState={editingState}
            onEditStart={() => handleEditStart(activityDetailsData)}
            onNameChange={handleNameChange}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        ) : (
          <Loading />
        )}
      </Paper>
      <Outlet />
      <DeleteIntervalConfirmation />
    </>
  );
};

function Loading() {
  return (
    <Box
      sx={{
        display: "flex",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <CircularProgress />
    </Box>
  );
}
