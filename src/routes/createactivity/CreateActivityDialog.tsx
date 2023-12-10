import { Container, Dialog, IconButton, Paper, Slide } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import CloseIcon from "@mui/icons-material/Close";
import { computed, signal, useSignal } from "@preact/signals-react";
import moment from "moment";
import { IntervalSettings } from "./IntervalSettings";
import { FinishButton } from "./FinishButton";
import { Name } from "./Name";
import { duration } from "moment/moment";
import { forwardRef } from "react";
import { durationRefreshTime } from "../../data/interval/Signals";
import { Activity } from "../../data/activity/Storage";
import { humanize } from "../../data/interval/Algorithms";

export const createCreateActivityState = () => {
  const dialogOpenedTime = signal(moment());
  const intervalToggle = signal<"now" | "earlier" | "finished">("now");
  const startTime = signal(
    moment().subtract(30, "minutes").seconds(0).milliseconds(0),
  );
  const endTime = signal(moment().seconds(0).milliseconds(0));
  const nameToggle = signal<"new" | "existing">("new");
  const name = signal("");
  const nameError = signal("");
  const parentActivity = signal<Activity | null>(null);
  const existingActivity = signal<Activity | null>(null);
  const existingActivityError = signal("");

  const durationMs = computed(() => {
    const inProgress = intervalToggle.value !== "finished";
    const finalEndTime = inProgress ? durationRefreshTime : endTime;

    let diff = 0;
    if (intervalToggle.value === "now") {
      diff = finalEndTime.value.diff(dialogOpenedTime.value);
    } else if (finalEndTime.value.isAfter(startTime.value)) {
      diff = finalEndTime.value.diff(startTime.value);
    }

    return humanize(duration(diff).asMilliseconds(), inProgress);
  });

  return {
    dialogOpenedTime,
    intervalToggle,
    startTime,
    endTime,
    durationMs,
    nameToggle,
    name,
    nameError,
    parentActivity,
    existingActivity,
    existingActivityError,
  };
};

export type CreateActivityState = ReturnType<typeof createCreateActivityState>;

export const CreateActivityDialog = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <Dialog
      PaperComponent={Container}
      PaperProps={{
        sx: { position: "fixed", bottom: 0, m: 0 },
        maxWidth: "sm",
      }}
      open={pathname.endsWith("create")}
      onClose={() => navigate(-1)}
    >
      <Slide direction="up" in={true} mountOnEnter unmountOnExit>
        <Content />
      </Slide>
    </Dialog>
  );
};

const Content = forwardRef<HTMLDivElement>((props, ref) => {
  const state = useSignal(createCreateActivityState()).value;
  const navigate = useNavigate();

  return (
    <Paper square sx={{ p: 1 }} ref={ref}>
      <IconButton
        aria-label={"back"}
        onClick={() => navigate(-1)}
        sx={{ mb: 1 }}
      >
        <CloseIcon />
      </IconButton>
      <IntervalSettings state={state} />
      <Name state={state} />
      <FinishButton state={state} />
    </Paper>
  );
});
