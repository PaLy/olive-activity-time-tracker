import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { openErrorSnackbar } from "../../components/AppSnackbarStore";
import { getSessionLengthHistogram } from "../../db/queries/charts";
import { getPeriodRange, Period } from "./periods";

const MINUTE_MS = 60_000;
const GAP_OPTIONS = [
  { label: "No gap", value: 0 },
  { label: "1 min", value: MINUTE_MS },
  { label: "5 min", value: 5 * MINUTE_MS },
  { label: "15 min", value: 15 * MINUTE_MS },
];

export const SessionLengthHistogram = ({
  activityId,
  period,
}: {
  activityId: number;
  period: Period;
}) => {
  const [maxGapMs, setMaxGapMs] = useState(MINUTE_MS);

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="subtitle1">Session lengths</Typography>
      <TextField
        select
        size="small"
        fullWidth
        sx={{ mt: 1 }}
        label="Merge sessions separated by less than"
        value={maxGapMs}
        onChange={(event) => setMaxGapMs(Number(event.target.value))}
      >
        {GAP_OPTIONS.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>
      <Histogram activityId={activityId} period={period} maxGapMs={maxGapMs} />
    </Box>
  );
};

const Histogram = ({
  activityId,
  period,
  maxGapMs,
}: {
  activityId: number;
  period: Period;
  maxGapMs: number;
}) => {
  const theme = useTheme();
  const data = useLiveQuery(
    () =>
      getSessionLengthHistogram(
        activityId,
        getPeriodRange(period),
        maxGapMs,
      ).catch((error) => {
        openErrorSnackbar(error);
        return [];
      }),
    [activityId, period, maxGapMs],
  );

  if (!data) {
    return null;
  }
  if (data.every((bin) => bin.count === 0)) {
    return (
      <Typography sx={{ mt: 2 }} color="text.secondary">
        No sessions in this period.
      </Typography>
    );
  }

  return (
    <Box sx={{ height: 200, mt: 2 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="label" />
          <YAxis width="auto" allowDecimals={false} />
          <Tooltip
            formatter={(value) => [value, "Sessions"]}
            cursor={{ fill: theme.palette.action.hover }}
            contentStyle={{
              background: theme.palette.background.paper,
              color: theme.palette.text.primary,
            }}
          />
          <Bar
            dataKey="count"
            fill={theme.palette.primary.main}
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};
