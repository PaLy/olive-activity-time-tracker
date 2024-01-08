import { Signal } from "@preact/signals-react";
import { Box, Fab, Grid, List, Paper } from "@mui/material";
import { AppBarActions } from "./AppBarActions";
import { ActivityItem } from "./ActivityItem";
import {
  rootActivity,
  useActivitiesOrderKey,
  useChildActivitiesByDuration,
} from "../../data/activity/Signals";
import { ClosedInterval } from "../../data/interval/ClosedInterval";
import { AppAppBar } from "../../AppBar";
import { AppBottomNavigation } from "./BottomNavigation";
import { Flipper } from "react-flip-toolkit";
import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "../Router";
import AddIcon from "@mui/icons-material/Add";
import { AddActivityModal } from "../addactivity/AddActivityModal";

type Props = {
  interval: Signal<ClosedInterval>;
  header: string;
  filterComponent?: ReactNode;
};

export const ActivityList = (props: Props) => {
  const { interval, header, filterComponent } = props;
  const childActivities = useChildActivitiesByDuration(rootActivity, interval);
  const flipKey = useActivitiesOrderKey(interval);

  return (
    <Grid container direction={"column"} minHeight={"100%"}>
      <AppAppBar header={header} actions={<AppBarActions />} />
      <Paper square sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {filterComponent && (
          <Grid container sx={{ p: 2, pb: 0 }} justifyContent={"center"}>
            {filterComponent}
          </Grid>
        )}
        <Box sx={{ flex: 1 }}>
          <Flipper flipKey={flipKey.value}>
            <List sx={{ mb: 2, pt: 0 }}>
              {childActivities.value.map((activity) => (
                <ActivityItem
                  key={activity.value.id}
                  activity={activity}
                  interval={interval}
                />
              ))}
            </List>
          </Flipper>
        </Box>
        <Box
          sx={{
            position: "sticky",
            bottom: 80,
            mr: 3,
            alignSelf: "end",
          }}
        >
          <AddActivityOpener />
          <AddActivityModal />
        </Box>
      </Paper>
      <AppBottomNavigation />
    </Grid>
  );
};

const AddActivityOpener = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  return (
    <Fab
      color="primary"
      variant={"extended"}
      aria-label="start new activity"
      onClick={() => navigate(`${pathname}/activity/add`)}
    >
      <AddIcon sx={{ mr: 1 }} />
      Add
    </Fab>
  );
};
