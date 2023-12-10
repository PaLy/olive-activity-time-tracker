import { ActivityList } from "./ActivityList";
import { computed } from "@preact/signals-react";
import moment from "moment";
import { Box, Fab } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";
import { durationRefreshTime } from "../../data/interval/Signals";

export const TodayRoute = () => {
  return (
    <>
      <ActivityList interval={interval} header={"Today"} />
      <AddActivityOpener />
    </>
  );
};

const AddActivityOpener = () => {
  const navigate = useNavigate();
  return (
    <Box
      sx={{
        position: "absolute",
        bottom: 0,
        right: 0,
        mr: 3,
        mb: 10,
      }}
    >
      <Fab
        color="primary"
        variant={"extended"}
        aria-label="start new activity"
        onClick={() => navigate("/activity/add")}
      >
        <AddIcon sx={{ mr: 1 }} />
        Add
      </Fab>
    </Box>
  );
};

const interval = computed(() => ({
  start: startOfDay,
  end: endOfDay,
}));

const startOfDay = computed(() =>
  moment(durationRefreshTime.value).startOf("day").valueOf(),
);

const endOfDay = computed(() =>
  moment(durationRefreshTime.value).endOf("day").valueOf(),
);
