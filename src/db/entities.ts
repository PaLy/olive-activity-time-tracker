import { Entity } from "dexie";
import { OliveDB } from "./OliveDB";
import { MAX_DATE_MS } from "../utils/Date";

export class Activity extends Entity<OliveDB> {
  id!: number;
  name!: string;
  parentId!: number; // ID of the parent activity, -1 if no parent
  expanded!: 1 | 0; // Whether the activity is expanded in the UI
}

export class Interval extends Entity<OliveDB> {
  id!: number;
  activityId!: number; // ID of the associated activity
  start!: number; // Timestamp in milliseconds
  end!: number; // Timestamp in milliseconds, MAX_DATE_MS for ongoing intervals

  /**
   * Returns the duration of the interval in milliseconds.
   * If the interval is ongoing (end is MAX_DATE_MS), it returns the duration
   * from start to the current time.
   */
  duration(currentTime = Date.now()): number {
    const endTime = this.end === MAX_DATE_MS ? currentTime : this.end;
    return endTime - this.start;
  }
}

export class Setting<
  T extends SettingKey = SettingKey,
> extends Entity<OliveDB> {
  id!: number;
  key!: T;
  value!: SettingValue<T>;
}

export type SettingValue<K extends SettingKey> =
  K extends SettingKey.ACTIVITY_LIST ? ActivityListSettingValue : never;

export enum SettingKey {
  ACTIVITY_LIST = "activityList",
}

export type ShowCost = {
  show: boolean;
  perHour: string;
  currency: Currency;
};

export type ActivityListSettingValue = {
  showPercentage: boolean;
  showCost: ShowCost;
  showDuration: boolean;
};

// https://en.wikipedia.org/wiki/ISO_4217
export enum Currency {
  EUR = "EUR",
  USD = "USD",
  JPY = "JPY",
  GBP = "GBP",
  AUD = "AUD",
  CAD = "CAD",
  CHF = "CHF",
  CNH = "CNH",
  HKD = "HKD",
  NZD = "NZD",
}
