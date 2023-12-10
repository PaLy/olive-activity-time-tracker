import { Signal, signal } from "@preact/signals-react";
import { List, Paper } from "@mui/material";
import { AppBarActions } from "./AppBarActions";
import { ActivityItem } from "./ActivityItem";
import { rootActivity, useChildActivities } from "../../data/activity/Signals";
import { ClosedInterval } from "../../data/interval/ClosedInterval";
import { AppAppBar } from "../../AppBar";

type Props = {
  interval: Signal<ClosedInterval>;
  header: string;
};

export const ActivityList = (props: Props) => {
  const { interval, header } = props;
  const childActivities = useChildActivities(rootActivity, interval);
  return (
    <>
      <AppAppBar header={header} actions={<AppBarActions />} />
      <Paper square sx={{ overflowY: "auto", height: "calc(100% - 64px);" }}>
        <List sx={{ mb: 9, pt: 0 }}>
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
