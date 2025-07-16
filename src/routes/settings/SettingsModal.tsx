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
import { useActivityListSettings } from "../../asyncState/ActivityList";
import { Currency } from "../../db/entities";
import { useState } from "react";
import { updateActivityListSettings } from "../../db/queries/settings";

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
  const [costError, setCostError] = useState("");
  const [costErrorValue, setCostErrorValue] = useState<string>();

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
            value={costErrorValue ?? activityListSettings.showCost.perHour}
            onChange={(event) => {
              const { value } = event.target;
              if (!value || !isFinite(Number(value))) {
                setCostError("Please set a number");
                setCostErrorValue(value);
              } else {
                setCostError("");
                setCostErrorValue(undefined);
                setPerHour(value);
              }
            }}
            error={!!costError}
            helperText={costError}
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
  const { onChange, label, checked } = props;
  return (
    <Grid
      container
      justifyContent={"space-between"}
      alignItems={"center"}
      sx={{ pb: 1 }}
    >
      <div>{label}</div>
      <Switch
        aria-label={label}
        role={"switch"}
        color="primary"
        checked={checked}
        onChange={(event, checked) => onChange(checked)}
      />
    </Grid>
  );
};

const useSettings = () => {
  const activityListSettings = useActivityListSettings();

  const setShowPercentage = (showPercentage: boolean) =>
    updateActivityListSettings(
      produce(activityListSettings, (draft) => {
        draft.showPercentage = showPercentage;
      }),
    );

  const setShowDuration = (showDuration: boolean) =>
    updateActivityListSettings(
      produce(activityListSettings, (draft) => {
        draft.showDuration = showDuration;
      }),
    );

  const setShowCost = (showCost: boolean) =>
    updateActivityListSettings(
      produce(activityListSettings, (draft) => {
        draft.showCost.show = showCost;
      }),
    );

  const setPerHour = (perHour: string) =>
    updateActivityListSettings(
      produce(activityListSettings, (draft) => {
        draft.showCost.perHour = perHour;
      }),
    );

  const setCurrency = (currency: Currency) =>
    updateActivityListSettings(
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
