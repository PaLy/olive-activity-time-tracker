import { db } from "../db";
import { MAX_DATE_MS } from "../../utils/date";

export function getInProgressIntervals() {
  return db.intervals.where("end").equals(MAX_DATE_MS);
}

export async function getInProgressIntervalIds(activityId: number) {
  const intervals = await getInProgressIntervals()
    .and((interval) => interval.activityId === activityId)
    .toArray();
  return intervals.map((interval) => interval.id);
}
