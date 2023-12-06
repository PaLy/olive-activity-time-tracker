import { Signal, useSignal } from "@preact/signals-react";
import {
  Interval,
  rootActivity,
  useChildActivities,
} from "../../data/Activity";
import { List, ListSubheader, Paper } from "@mui/material";
import { AppBarActions } from "./AppBarActions";
import { ActivityItem } from "./ActivityItem";

type Props = {
  interval: Signal<Interval>;
  subHeader: string;
};

export const ActivityList = (props: Props) => {
  const { interval, subHeader } = props;
  const childActivities = useChildActivities(useSignal(rootActivity), interval);
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
              key={activity.value.id}
              activity={activity}
              interval={interval}
            />
          ))}
        </List>
      </Paper>
    </>
  );
};
