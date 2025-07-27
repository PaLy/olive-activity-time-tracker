import { useState } from "react";
import Box from "@mui/material/Box";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import Typography from "@mui/material/Typography";
import { useParams } from "react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { FullScreenModalHeader } from "../../components/FullScreenModalHeader";
import {
  openErrorSnackbar,
  openSuccessSnackbar,
} from "../../components/AppSnackbarStore";
import { db } from "../../db/db";
import { FullScreenModal } from "../../components/FullScreenModal";
import { useLocation } from "../../router/hooks";

export const ActivitySettingsModal = () => {
  const { pathname } = useLocation();
  return (
    <FullScreenModal open={pathname.endsWith("/settings")}>
      <Content />
    </FullScreenModal>
  );
};

const Content = () => {
  const params = useParams<{ activityID: string }>();
  const activityId = parseInt(params.activityID ?? "");
  const [saving, setSaving] = useState(false);

  const activity = useLiveQuery(
    () => db.activities.get(activityId),
    [activityId],
  );

  const handleNotificationToggle = async (enabled: boolean) => {
    if (!activity) return;

    setSaving(true);
    try {
      await db.activities.update(activityId, {
        notificationsEnabled: enabled ? 1 : 0,
      });
      openSuccessSnackbar("Notification settings updated");
    } catch (error) {
      console.error("Failed to update notification settings:", error);
      openErrorSnackbar("Failed to update notification settings");
    } finally {
      setSaving(false);
    }
  };

  if (!activity) {
    return (
      <>
        <FullScreenModalHeader headline="Activity Settings" />
        <Box sx={{ p: 2 }}>
          <Typography>Activity not found</Typography>
        </Box>
      </>
    );
  }

  return (
    <>
      <FullScreenModalHeader headline="Activity Settings" />

      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 3 }}>
          {activity.name}
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Notifications
          </Typography>

          <FormControlLabel
            control={
              <Switch
                checked={!!activity.notificationsEnabled}
                onChange={(e) => handleNotificationToggle(e.target.checked)}
                disabled={saving}
                role={"switch"}
              />
            }
            label="Show notifications when this activity is in progress"
          />

          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            When enabled, you&apos;ll receive notifications while this activity
            is active.
          </Typography>
        </Box>
      </Box>
    </>
  );
};
