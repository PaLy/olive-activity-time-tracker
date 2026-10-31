import Box from "@mui/material/Box";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import dayjs from "dayjs";
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
import {
  getFirstIntervalStart,
  getSwitchCounts,
} from "../../db/queries/charts";
import { Granularity, useChartsStore } from "./Store";

const GRANULARITIES: Record<
  Granularity,
  { unit: "day" | "month" | "year"; label: string; format: string }
> = {
  day: { unit: "day", label: "last 30 days", format: "D MMM" },
  month: { unit: "month", label: "last 12 months", format: "MMM YY" },
  year: { unit: "year", label: "all years", format: "YYYY" },
};

export const SwitchCountChart = ({ activityId }: { activityId: number }) => {
  const theme = useTheme();
  const granularity = useChartsStore((state) => state.switchGranularity);
  const setGranularity = useChartsStore((state) => state.setSwitchGranularity);
  const { unit, label, format } = GRANULARITIES[granularity];

  const data = useLiveQuery(async () => {
    try {
      let first: dayjs.Dayjs;
      if (granularity === "day") {
        first = dayjs().subtract(29, "day").startOf("day");
      } else if (granularity === "month") {
        first = dayjs().subtract(11, "month").startOf("month");
      } else {
        const firstStart = await getFirstIntervalStart();
        first = dayjs(firstStart ?? Date.now()).startOf("year");
      }

      const buckets = [];
      const end = dayjs().endOf(unit);
      for (
        let cursor = first;
        cursor.isBefore(end);
        cursor = cursor.add(1, unit)
      ) {
        buckets.push({
          start: cursor.valueOf(),
          end: cursor.add(1, unit).valueOf(),
        });
      }
      const counts = await getSwitchCounts(activityId, buckets);
      return buckets.map((bucket, index) => ({
        label: dayjs(bucket.start).format(format),
        count: counts[index],
      }));
    } catch (error) {
      openErrorSnackbar(error as Error);
      return [];
    }
  }, [activityId, granularity]);

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="subtitle1">Switches per {unit}</Typography>
      <Typography variant="caption" color="text.secondary">
        Changes to another activity, {label}
      </Typography>
      <Box sx={{ mt: 1 }}>
        <ToggleButtonGroup
          exclusive
          size="small"
          value={granularity}
          onChange={(_, value: Granularity | null) =>
            value && setGranularity(value)
          }
        >
          <ToggleButton value="day">Days</ToggleButton>
          <ToggleButton value="month">Months</ToggleButton>
          <ToggleButton value="year">Years</ToggleButton>
        </ToggleButtonGroup>
      </Box>
      {data && data.some((item) => item.count > 0) ? (
        <Box sx={{ height: 200, mt: 2 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="label" interval="preserveStartEnd" />
              <YAxis width="auto" allowDecimals={false} />
              <Tooltip
                formatter={(value) => [value, "Switches"]}
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
      ) : (
        data && (
          <Typography sx={{ mt: 2 }} color="text.secondary">
            No switches in this range.
          </Typography>
        )
      )}
    </Box>
  );
};
