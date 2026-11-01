import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import { useLiveQuery } from "dexie-react-hooks";
import { openErrorSnackbar } from "../../components/AppSnackbarStore";
import { getActivityBreakdown } from "../../db/queries/charts";
import { getPeriodRange, Period } from "./periods";

export const TimePerActivityChart = ({
  activityId,
  period,
}: {
  activityId: number;
  period: Period;
}) => (
  <Box sx={{ mt: 3 }}>
    <Typography variant="subtitle1">Time per activity</Typography>
    <Breakdown activityId={activityId} period={period} />
  </Box>
);

const Breakdown = ({
  activityId,
  period,
}: {
  activityId: number;
  period: Period;
}) => {
  const data = useLiveQuery(
    () =>
      getActivityBreakdown(getPeriodRange(period), activityId).catch(
        (error) => {
          openErrorSnackbar(error);
          return null;
        },
      ),
    [activityId, period],
  );

  if (!data) {
    return null;
  }
  if (data.total === 0) {
    return (
      <Typography sx={{ mt: 2 }} color="text.secondary">
        No tracked time in this period.
      </Typography>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="body2">
        Total: <b>{formatDuration(data.total)}</b>
      </Typography>
      {data.items.map((item) => (
        <Box key={item.id} sx={{ mt: 1.5 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="body2">{item.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {formatDuration(item.duration)} (
              {Math.round((item.duration / data.total) * 100)}%)
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={(item.duration / data.total) * 100}
          />
        </Box>
      ))}
    </Box>
  );
};

const formatDuration = (ms: number) => {
  const minutes = Math.round(ms / 60_000);
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
};
