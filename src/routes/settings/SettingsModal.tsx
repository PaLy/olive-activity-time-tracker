import { FullScreenModal } from "../../components/FullScreenModal";
import { FullScreenModalHeader } from "../../components/FullScreenModalHeader";
import { useLocation } from "../Router";
import {
  Box,
  Collapse,
  Grid,
  MenuItem,
  Select,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { produce } from "immer";
import { useSignal } from "@preact/signals-react";
import {
  useActivityListSettings,
  useSetActivityListSettings,
} from "../../asyncState/ActivityList";
import { Currency } from "../../data/settings/Settings";

export const SettingsModal = () => {
  const { pathname } = useLocation();
  return (
    <FullScreenModal open={pathname.endsWith("/settings")}>
      <Content />
    </FullScreenModal>
  );
};

const Content = () => {
  const settings = useSettings();
  const { activityListSettings, setShowPercentage, setShowDuration } = settings;

  return (
    <>
      <FullScreenModalHeader headline={"Settings"} />
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ pb: 2 }}>
          Activity list
        </Typography>
        <Box sx={{ pl: 2 }}>
          <SettingsSwitch
            label={"Show percentage"}
            checked={activityListSettings.showPercentage}
            onChange={setShowPercentage}
          />
          <CostSettings {...settings} />
          <SettingsSwitch
            label={"Show duration"}
            checked={activityListSettings.showDuration}
            onChange={setShowDuration}
          />
        </Box>
      </Box>
    </>
  );
};

type Settings = ReturnType<typeof useSettings>;

const CostSettings = (props: Settings) => {
  const { activityListSettings, setShowCost, setPerHour, setCurrency } = props;
  const costError = useSignal("");
  const costErrorValue = useSignal<string | undefined>(undefined);

  return (
    <>
      <SettingsSwitch
        label={"Show cost"}
        checked={activityListSettings.showCost.show}
        onChange={setShowCost}
      />
      <Collapse
        in={activityListSettings.showCost.show}
        timeout="auto"
        unmountOnExit
        sx={{ width: "100%" }}
      >
        <Grid container sx={{ pb: 1, pl: 2, gap: 2 }}>
          <TextField
            id="standard-basic"
            label="Per hour"
            variant="standard"
            value={
              costErrorValue.value ?? activityListSettings.showCost.perHour
            }
            onChange={(event) => {
              const { value } = event.target;
              if (!value || !isFinite(Number(value))) {
                costError.value = "Please set a number";
                costErrorValue.value = value;
              } else {
                costError.value = "";
                costErrorValue.value = undefined;
                setPerHour(value);
              }
            }}
            error={!!costError.value}
            helperText={costError.value}
          />
          <Select
            value={activityListSettings.showCost.currency}
            label="Currency"
            variant="standard"
            onChange={(event) => setCurrency(event.target.value as Currency)}
          >
            {Object.values(Currency).map((currency) => (
              <MenuItem value={currency} key={currency}>
                {currency}
              </MenuItem>
            ))}
          </Select>
        </Grid>
      </Collapse>
    </>
  );
};

type SettingsSwitchProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

const SettingsSwitch = (props: SettingsSwitchProps) => {
  return (
    <Grid
      container
      justifyContent={"space-between"}
      alignItems={"center"}
      sx={{ pb: 1 }}
    >
      <div>{props.label}</div>
      <Switch
        color="primary"
        checked={props.checked}
        onChange={(event, checked) => props.onChange(checked)}
      />
    </Grid>
  );
};

const useSettings = () => {
  const activityListSettings = useActivityListSettings();
  const setActivityListSettings = useSetActivityListSettings();

  const setShowPercentage = (showPercentage: boolean) =>
    setActivityListSettings(
      produce(activityListSettings, (draft) => {
        draft.showPercentage = showPercentage;
      }),
    );

  const setShowDuration = (showDuration: boolean) =>
    setActivityListSettings(
      produce(activityListSettings, (draft) => {
        draft.showDuration = showDuration;
      }),
    );

  const setShowCost = (showCost: boolean) =>
    setActivityListSettings(
      produce(activityListSettings, (draft) => {
        draft.showCost.show = showCost;
      }),
    );

  const setPerHour = (perHour: string) =>
    setActivityListSettings(
      produce(activityListSettings, (draft) => {
        draft.showCost.perHour = perHour;
      }),
    );

  const setCurrency = (currency: Currency) =>
    setActivityListSettings(
      produce(activityListSettings, (draft) => {
        draft.showCost.currency = currency;
      }),
    );

  return {
    activityListSettings,
    setShowPercentage,
    setShowDuration,
    setShowCost,
    setPerHour,
    setCurrency,
  };
};
