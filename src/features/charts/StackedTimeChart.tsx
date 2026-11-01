import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
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
import { getTimePerBucket } from "../../db/queries/charts";
import { getPeriodRange, Period } from "./periods";

const HOUR_MS = 3_600_000;

const LABEL_FORMATS: Record<Period, string> = {
  week: "ddd",
  month: "D",
  year: "MMM",
};

export const StackedTimeChart = ({
  activityId,
  period,
}: {
  activityId: number;
  period: Period;
}) => {
  const theme = useTheme();
  const { bucketUnit: unit } = getPeriodRange(period);

  const data = useLiveQuery(async () => {
    const { start, end, bucketUnit } = getPeriodRange(period);
    const buckets = [];
    for (
      let cursor = dayjs(start);
      cursor.isBefore(end);
      cursor = cursor.add(1, bucketUnit)
    ) {
      buckets.push({
        start: cursor.valueOf(),
        end: cursor.add(1, bucketUnit).valueOf(),
      });
    }
    // The current bucket runs until today, not until the end of the calendar unit.
    buckets[buckets.length - 1].end = end;
    try {
      // Tag the result with its period: useLiveQuery keeps returning the
      // previous result after a dependency change, which would otherwise be
      // rendered with the new period's label format (e.g. day buckets labeled
      // as months) until the new query resolves.
      return {
        period,
        buckets: await getTimePerBucket(buckets, activityId),
      };
    } catch (error) {
      openErrorSnackbar(error as Error);
      return { period, buckets: [] };
    }
  }, [activityId, period]);

  if (!data) {
    return (
      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle1">Time per {unit} (hours)</Typography>
        <Box
          sx={{
            height: 220,
            mt: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress size={24} />
        </Box>
      </Box>
    );
  }

  // useLiveQuery keeps returning the previous result after a dependency
  // change. Keep rendering it with its own labels while the new period loads,
  // so the layout below the chart does not jump.
  const isStale = data.period !== period;
  const { bucketUnit: dataUnit } = getPeriodRange(data.period);

  const totals = new Map<number, { name: string; total: number }>();
  data.buckets.forEach((bucket) =>
    bucket.durations.forEach((item) => {
      const entry = totals.get(item.id) ?? { name: item.name, total: 0 };
      entry.total += item.duration;
      totals.set(item.id, entry);
    }),
  );
  if (totals.size === 0) {
    return null;
  }

  // Only the biggest activities get their own segment; the rest are grouped
  // so that a long legend cannot squeeze the plot.
  const ranked = [...totals].sort((a, b) => b[1].total - a[1].total);
  const shown = ranked.slice(0, MAX_SERIES);
  const shownIds = new Set(shown.map(([id]) => id));
  const hasOther = ranked.length > MAX_SERIES;

  const palette = theme.palette.mode === "dark" ? DARK : LIGHT;
  const series = [
    ...shown.map(([id, { name }], index) => ({
      key: `a${id}`,
      name,
      color: palette[index % palette.length],
    })),
    ...(hasOther
      ? [
          {
            key: OTHER_KEY,
            name: `Other (${ranked.length - MAX_SERIES})`,
            color: theme.palette.grey[500],
          },
        ]
      : []),
  ];

  const rows = data.buckets.map((bucket) => {
    const row: Record<string, number | string> = {
      label: dayjs(bucket.start).format(LABEL_FORMATS[data.period]),
    };
    bucket.durations.forEach((item) => {
      const key = shownIds.has(item.id) ? `a${item.id}` : OTHER_KEY;
      row[key] =
        ((row[key] as number | undefined) ?? 0) + item.duration / HOUR_MS;
    });
    return row;
  });

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="subtitle1">Time per {dataUnit} (hours)</Typography>
      <Box sx={{ height: 220, mt: 1, position: "relative" }}>
        <Box
          sx={{
            height: "100%",
            opacity: isStale ? 0.4 : 1,
            transition: "opacity 150ms",
            pointerEvents: isStale ? "none" : "auto",
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows}>
              <XAxis dataKey="label" interval="preserveStartEnd" />
              <YAxis width="auto" />
              <Tooltip
                formatter={(value) => `${Number(value).toFixed(1)} h`}
                contentStyle={{
                  background: theme.palette.background.paper,
                  color: theme.palette.text.primary,
                }}
              />
              {series.map((item) => (
                <Bar
                  key={item.key}
                  dataKey={item.key}
                  name={item.name}
                  stackId="time"
                  fill={item.color}
                  isAnimationActive={false}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </Box>
        {isStale && (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
            }}
          >
            <CircularProgress size={24} aria-label="Loading chart" />
          </Box>
        )}
      </Box>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 1.5,
          mt: 1,
          opacity: isStale ? 0.4 : 1,
          transition: "opacity 150ms",
        }}
      >
        {series.map((item) => (
          <Box
            key={item.key}
            sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
          >
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: "2px",
                bgcolor: item.color,
              }}
            />
            <Typography variant="caption">{item.name}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

const MAX_SERIES = 10;
const OTHER_KEY = "other";

const LIGHT = [
  "#2e7d32",
  "#1976d2",
  "#ed6c02",
  "#9c27b0",
  "#d32f2f",
  "#0097a7",
  "#795548",
  "#607d8b",
  "#c2185b",
  "#afb42b",
];
const DARK = [
  "#66bb6a",
  "#42a5f5",
  "#ffa726",
  "#ba68c8",
  "#ef5350",
  "#26c6da",
  "#a1887f",
  "#90a4ae",
  "#f06292",
  "#dce775",
];
