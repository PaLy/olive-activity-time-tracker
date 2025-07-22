import { ActivityListSettingValue, Currency } from "../../db/entities";

export const DEFAULT_ACTIVITY_LIST_SETTINGS: ActivityListSettingValue = {
  showPercentage: true,
  showCost: {
    show: false,
    perHour: "10",
    currency: Currency.EUR,
  },
  showDuration: true,
};
