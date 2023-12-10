import { Signal, signal } from "@preact/signals-react";
import { List, ListSubheader, Paper } from "@mui/material";
import { AppBarActions } from "./AppBarActions";
import { ActivityItem } from "./ActivityItem";
import { rootActivity, useChildActivities } from "../../data/activity/Signals";
import { ClosedInterval } from "../../data/interval/ClosedInterval";

type Props = {
  interval: Signal<ClosedInterval>;
  subHeader: string;
};

export const ActivityList = (props: Props) => {
  const { interval, subHeader } = props;
  const childActivities = useChildActivities(rootActivity, interval);
  return (
    <>
      <AppBarActions />
      {/* pb because of the fab button */}
      <Paper square sx={{ pb: "48px" }}>
        <List sx={{ mb: 2, pt: 0 }}>
          <ListSubheader sx={{ bgcolor: "background.paper", top: "64px" }}>
            {subHeader}
          </ListSubheader>
          {childActivities.value.map((activity) => (
            <ActivityItem
              key={activity.id}
              activity={signal(activity)}
              interval={interval}
            />
          ))}
        </List>
      </Paper>
    </>
  );
};
