import { db } from "../db";

const DAY_MS = 24 * 60 * 60 * 1000;
const HISTORY_DAYS = 60;
const RECENCY_HALF_LIFE_DAYS = 3;
const HOUR_KERNEL_WIDTH = 1.5;

const WEIGHTS = { recency: 0.3, frequency: 0.2, timeOfDay: 0.3, followUp: 0.2 };

type IntervalStart = { activityId: number; start: number };

const hourOfDay = (ms: number) => {
  const date = new Date(ms);
  return date.getHours() + date.getMinutes() / 60;
};

const isWeekend = (ms: number) => [0, 6].includes(new Date(ms).getDay());

const normalize = (values: Map<number, number>) => {
  const max = Math.max(0, ...values.values());
  return (id: number) => (max > 0 ? (values.get(id) ?? 0) / max : 0);
};

/**
 * Scores how likely each activity is to be picked next (higher = more likely).
 * Combines recency, frequency, similarity of the time of day / weekday type
 * to now, and how often the activity followed the most recently started one.
 */
export function scoreActivities(
  intervals: IntervalStart[],
  now: number,
): Map<number, number> {
  const since = now - HISTORY_DAYS * DAY_MS;
  const history = intervals
    .filter((interval) => interval.start >= since)
    .sort((a, b) => a.start - b.start);

  const lastStart = new Map<number, number>();
  const counts = new Map<number, number>();
  const timeAffinity = new Map<number, number>();
  const followUps = new Map<number, number>();

  const nowHour = hourOfDay(now);
  const nowWeekend = isWeekend(now);
  const lastActivityId = history.at(-1)?.activityId;

  history.forEach((interval, index) => {
    const { activityId, start } = interval;
    lastStart.set(activityId, start);
    counts.set(activityId, (counts.get(activityId) ?? 0) + 1);

    const diff = Math.abs(hourOfDay(start) - nowHour);
    const circularDiff = Math.min(diff, 24 - diff);
    const kernel = Math.exp(
      -(circularDiff ** 2) / (2 * HOUR_KERNEL_WIDTH ** 2),
    );
    const dayTypeFactor = isWeekend(start) === nowWeekend ? 1 : 0.4;
    timeAffinity.set(
      activityId,
      (timeAffinity.get(activityId) ?? 0) + kernel * dayTypeFactor,
    );

    if (index > 0 && history[index - 1].activityId === lastActivityId) {
      followUps.set(activityId, (followUps.get(activityId) ?? 0) + 1);
    }
  });

  const frequency = normalize(
    new Map([...counts].map(([id, count]) => [id, Math.log1p(count)])),
  );
  const time = normalize(timeAffinity);
  const followUp = normalize(followUps);

  const scores = new Map<number, number>();
  for (const [id, last] of lastStart) {
    const ageDays = Math.max(0, now - last) / DAY_MS;
    const recency = 0.5 ** (ageDays / RECENCY_HALF_LIFE_DAYS);
    scores.set(
      id,
      WEIGHTS.recency * recency +
        WEIGHTS.frequency * frequency(id) +
        WEIGHTS.timeOfDay * time(id) +
        WEIGHTS.followUp * followUp(id),
    );
  }
  return scores;
}

export async function getActivityScores(
  now = Date.now(),
): Promise<Map<number, number>> {
  const since = now - HISTORY_DAYS * DAY_MS;
  const intervals = await db.intervals
    .where("start")
    .aboveOrEqual(since)
    .toArray();
  return scoreActivities(intervals, now);
}

/** Sorts by score descending; ties (e.g. never used activities) are ordered by the given key ascending. */
export function sortByScore<T>(
  items: T[],
  scores: Map<number, number>,
  getId: (item: T) => number,
  getName: (item: T) => string,
): T[] {
  return [...items].sort(
    (a, b) =>
      (scores.get(getId(b)) ?? 0) - (scores.get(getId(a)) ?? 0) ||
      getName(a).localeCompare(getName(b)),
  );
}
