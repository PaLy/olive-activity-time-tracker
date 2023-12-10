import { ActivityList } from "./ActivityList";
import { computed } from "@preact/signals-react";
import moment from "moment";
import { Fab } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";
import { CreateActivityDialog } from "../createactivity/CreateActivityDialog";
import { durationRefreshTime } from "../../data/interval/Signals";

export const TodayRoute = () => {
  return (
    <>
      <ActivityList interval={interval} subHeader={"Today"} />
      <CreateActivityDialogOpener />
      <CreateActivityDialog />
    </>
  );
};

const CreateActivityDialogOpener = () => {
  const navigate = useNavigate();
  return (
    <Fab
      color="primary"
      variant={"extended"}
      aria-label="start new activity"
      sx={{
        position: "sticky",
        bottom: "72px",
        float: "right",
        mr: 2,
      }}
      onClick={() => navigate("/today/create")}
    >
      <AddIcon sx={{ mr: 1 }} />
      Add
    </Fab>
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
