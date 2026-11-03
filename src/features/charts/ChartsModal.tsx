import Box from "@mui/material/Box";
import GlobalStyles from "@mui/material/GlobalStyles";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { FullScreenModal } from "../../components/FullScreenModal";
import { FullScreenModalHeader } from "../../components/FullScreenModalHeader";
import { useLocation } from "../../router/hooks";
import { useCoversPreviousPage } from "../../utils/useCoversPreviousPage";
import { ActivityPicker } from "../../components/ActivityPicker";
import { useActivityPicker } from "./useActivityPicker";
import { Period } from "./periods";
import { useChartsStore } from "./Store";
import { SessionLengthHistogram } from "./SessionLengthHistogram";
import { StackedTimeChart } from "./StackedTimeChart";
import { SwitchCountChart } from "./SwitchCountChart";
import { TimePerActivityChart } from "./TimePerActivityChart";
import { WeekdayHourHeatmap } from "./WeekdayHourHeatmap";

export const ChartsModal = () => {
  const { pathname } = useLocation();
  useCoversPreviousPage();
  return (
    <>
      {/* Clicking a chart focuses Recharts' SVG or its internal bar layer,
          which makes the browser draw a focus outline around it. Only hide
          the outline for pointer focus so keyboard focus stays visible. */}
      <GlobalStyles
        styles={{
          ".recharts-wrapper :is(svg, g):focus:not(:focus-visible)": {
            outline: "none",
          },
        }}
      />
      <FullScreenModal open={pathname.endsWith("/charts")}>
        <Content />
      </FullScreenModal>
    </>
  );
};

const Content = () => {
  const period = useChartsStore((state) => state.period);
  const setPeriod = useChartsStore((state) => state.setPeriod);
  const { options, selected, setSelectedId } = useActivityPicker();
  return (
    <Box>
      <FullScreenModalHeader headline={"Charts"} />
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 1,
          bgcolor: "background.paper",
          px: 2,
          pt: 1,
          pb: 1,
        }}
      >
        <ToggleButtonGroup
          exclusive
          size="small"
          value={period}
          onChange={(_, value: Period | null) => value && setPeriod(value)}
        >
          <ToggleButton value="week">Week</ToggleButton>
          <ToggleButton value="month">Month</ToggleButton>
          <ToggleButton value="year">Year</ToggleButton>
        </ToggleButtonGroup>
        {options && selected && (
          <ActivityPicker
            options={options}
            selected={selected}
            onChange={setSelectedId}
          />
        )}
      </Box>
      {selected && (
        <Box sx={{ px: 2, pb: 2 }}>
          <StackedTimeChart activityId={selected.id} period={period} />
          <TimePerActivityChart activityId={selected.id} period={period} />
          <WeekdayHourHeatmap activityId={selected.id} period={period} />
          <SessionLengthHistogram activityId={selected.id} period={period} />
          <SwitchCountChart activityId={selected.id} />
        </Box>
      )}
    </Box>
  );
};
