import moment from "moment";

export type SimpleClosedInterval = {
  start: number;
  end: number;
};

export const join = (intervals: SimpleClosedInterval[]) =>
  intervals.toSorted(byStartAndEnd).reduce((joined, current) => {
    if (joined.length === 0) {
      return [current];
    } else {
      const last = joined.slice(-1)[0];
      if (current.start <= last.end) {
        if (current.end > last.end) {
          // the current partially overlaps the last
          joined.pop();
          joined.push({ start: last.start, end: current.end });
        } else {
          // current is inside the last
        }
      } else {
        // current is after the last
        joined.push({ start: current.start, end: current.end });
      }
      return joined;
    }
  }, [] as SimpleClosedInterval[]);

const byStartAndEnd = (a: SimpleClosedInterval, b: SimpleClosedInterval) => {
  if (a.start < b.start) {
    return -1;
  } else if (a.start > b.start) {
    return 1;
  } else if (a.end < b.end) {
    return -1;
  } else if (a.end > b.end) {
    return 1;
  } else {
    return 0;
  }
};

export const overlaps = (a: SimpleClosedInterval, b: SimpleClosedInterval) => {
  const aStart = moment(a.start);
  const aEnd = moment(a.end);
  const bStart = moment(b.start);
  const bEnd = moment(b.end);
  return bStart.isBefore(aEnd) && aStart.isBefore(bEnd);
};
