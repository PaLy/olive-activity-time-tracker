import { scoreActivities, sortByScore } from "../activityRanking";

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const now = new Date(2026, 0, 14, 9, 0).getTime(); // Wednesday morning

const order = (scores: Map<number, number>, ids: number[]) =>
  sortByScore(
    ids,
    scores,
    (id) => id,
    (id) => String(id),
  );

describe("scoreActivities", () => {
  it("ranks recently used activities higher", () => {
    const scores = scoreActivities(
      [
        { activityId: 1, start: now - 30 * DAY },
        { activityId: 2, start: now - HOUR },
      ],
      now,
    );
    expect(order(scores, [1, 2])).toEqual([2, 1]);
  });

  it("ranks frequently used activities higher", () => {
    const scores = scoreActivities(
      [
        { activityId: 1, start: now - 5 * DAY },
        { activityId: 2, start: now - 5 * DAY },
        { activityId: 2, start: now - 6 * DAY },
        { activityId: 2, start: now - 7 * DAY },
      ],
      now,
    );
    expect(order(scores, [1, 2])).toEqual([2, 1]);
  });

  it("prefers activities used at a similar time of day", () => {
    const scores = scoreActivities(
      [
        { activityId: 1, start: now - 2 * DAY + 10 * HOUR }, // evening
        { activityId: 2, start: now - 2 * DAY }, // morning
        { activityId: 3, start: now - HOUR * 40 }, // latest, any time
      ],
      now,
    );
    expect(order(scores, [1, 2])).toEqual([2, 1]);
  });

  it("prefers activities that usually follow the latest one", () => {
    const scores = scoreActivities(
      [
        { activityId: 1, start: now - 10 * DAY },
        { activityId: 2, start: now - 10 * DAY + HOUR },
        { activityId: 1, start: now - 9 * DAY },
        { activityId: 2, start: now - 9 * DAY + HOUR },
        { activityId: 3, start: now - 8 * DAY },
        { activityId: 4, start: now - 8 * DAY + HOUR },
        { activityId: 3, start: now - 7 * DAY },
        { activityId: 5, start: now - 7 * DAY + HOUR },
        { activityId: 1, start: now - 6 * DAY },
      ],
      now,
    );
    const followUpScore = (id: number) => scores.get(id)!;
    expect(followUpScore(2)).toBeGreaterThan(followUpScore(4));
  });

  it("ignores intervals older than the history window", () => {
    expect(
      scoreActivities([{ activityId: 1, start: now - 100 * DAY }], now).size,
    ).toBe(0);
  });
});

describe("sortByScore", () => {
  it("orders unscored items alphabetically", () => {
    expect(
      sortByScore(
        ["b", "a", "c"],
        new Map(),
        () => 0,
        (s) => s,
      ),
    ).toEqual(["a", "b", "c"]);
  });
});
