import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { alpha, useTheme } from "@mui/material/styles";
import { useLiveQuery } from "dexie-react-hooks";
import { openErrorSnackbar } from "../../components/AppSnackbarStore";
import { getTimeByWeekdayHour } from "../../db/queries/charts";
import { getPeriodRange, Period } from "./periods";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
// Monday first
const ROW_ORDER = [1, 2, 3, 4, 5, 6, 0];

export const WeekdayHourHeatmap = ({
  activityId,
  period,
}: {
  activityId: number;
  period: Period;
}) => (
  <Box sx={{ mt: 3 }}>
    <Typography variant="subtitle1">When you track time</Typography>
    <Heatmap activityId={activityId} period={period} />
  </Box>
);

const Heatmap = ({
  activityId,
  period,
}: {
  activityId: number;
  period: Period;
}) => {
  const theme = useTheme();
  const data = useLiveQuery(
    () =>
      getTimeByWeekdayHour(getPeriodRange(period), activityId).catch(
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
  const max = Math.max(...data.flat());
  if (max === 0) {
    return (
      <Typography sx={{ mt: 2 }} color="text.secondary">
        No tracked time in this period.
      </Typography>
    );
  }

  return (
    <Box
      sx={{
        mt: 2,
        display: "grid",
        gridTemplateColumns: "32px repeat(24, 1fr)",
        gap: "2px",
        alignItems: "center",
      }}
    >
      {ROW_ORDER.map((day) => (
        <HeatmapRow
          key={day}
          label={WEEKDAYS[day]}
          hours={data[day]}
          max={max}
          color={theme.palette.primary.main}
        />
      ))}
      <span />
      {Array.from({ length: 24 }, (_, hour) => (
        <Typography
          key={hour}
          variant="caption"
          color="text.secondary"
          sx={{ fontSize: 9, textAlign: "center" }}
        >
          {hour % 6 === 0 ? hour : ""}
        </Typography>
      ))}
    </Box>
  );
};

const HeatmapRow = (props: {
  label: string;
  hours: number[];
  max: number;
  color: string;
}) => (
  <>
    <Typography variant="caption" color="text.secondary">
      {props.label}
    </Typography>
    {props.hours.map((ms, hour) => (
      <Box
        key={hour}
        title={`${props.label} ${hour}:00 – ${Math.round(ms / 60_000)} min`}
        sx={{
          aspectRatio: "1",
          borderRadius: "2px",
          bgcolor:
            ms === 0
              ? "action.hover"
              : alpha(props.color, 0.2 + 0.8 * (ms / props.max)),
        }}
      />
    ))}
  </>
);
