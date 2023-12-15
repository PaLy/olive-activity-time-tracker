import { Signal, signal } from "@preact/signals-react";
import { Grid, List, Paper } from "@mui/material";
import { AppBarActions } from "./AppBarActions";
import { ActivityItem } from "./ActivityItem";
import { rootActivity, useChildActivities } from "../../data/activity/Signals";
import { ClosedInterval } from "../../data/interval/ClosedInterval";
import { AppAppBar } from "../../AppBar";
import { AppBottomNavigation } from "./BottomNavigation";

type Props = {
  interval: Signal<ClosedInterval>;
  header: string;
};

export const ActivityList = (props: Props) => {
  const { interval, header } = props;
  const childActivities = useChildActivities(rootActivity, interval);
  return (
    <Grid container direction={"column"} height={"100%"}>
      <AppAppBar header={header} actions={<AppBarActions />} />
      <Paper
        square
        sx={{
          overflowY: "auto",
          // https://stackoverflow.com/a/31867656/7946803
          flex: "1 1 0",
          minHeight: 0,
        }}
      >
        <List sx={{ mb: 8, pt: 0 }}>
          {childActivities.value.map((activity) => (
            <ActivityItem
              key={activity.id}
              activity={signal(activity)}
              interval={interval}
            />
          ))}
        </List>
      </Paper>
      <AppBottomNavigation />
    </Grid>
  );
};
