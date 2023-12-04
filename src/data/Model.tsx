import { Signal, signal } from "@preact/signals-react";
import moment, { Moment } from "moment";

export const MAX_ACTIVITY_DEPTH = 4;

export type Activity = {
  id: string;
  name: Signal<string>;
  intervals: Signal<Array<Signal<ActivityInterval>>>;
  parentActivityID: string;
  childActivityIDs: Signal<string[]>;
};

export type ActivityInterval = {
  start: Moment;
  end?: Moment;
};

export const activities = signal<Map<string, Signal<Activity>>>(
  new Map([
    [
      "root",
      signal({
        id: "root",
        name: signal(""),
        intervals: signal([
          signal({
            start: moment()
              .subtract(2, "hours")
              .subtract(20, "minutes")
              .subtract(35, "seconds"),
          }),
        ]),
        parentActivityID: "root",
        childActivityIDs: signal(["work", "personal"]),
      }),
    ],
    [
      "work",
      signal({
        id: "work",
        name: signal("Work"),
        intervals: signal([
          signal({
            start: moment()
              .subtract(2, "hours")
              .subtract(10, "minutes")
              .subtract(35, "seconds"),
          }),
        ]),
        parentActivityID: "root",
        childActivityIDs: signal([
          "code-review",
          "meetings",
          "helping",
          "tasks",
        ]),
      }),
    ],
    [
      "code-review",
      signal({
        id: "code-review",
        name: signal("Code Review"),
        intervals: signal([
          signal({
            start: moment()
              .subtract(1, "hours")
              .subtract(23, "minutes")
              .subtract(14, "seconds"),
            end: moment(),
          }),
        ]),
        parentActivityID: "work",
        childActivityIDs: signal(["cr-ml", "cr-kj"]),
      }),
    ],
    [
      "cr-ml",
      signal({
        id: "cr-ml",
        name: signal("Mark Zuckerberg"),
        intervals: signal([
          signal({
            start: moment()
              .subtract(0, "hours")
              .subtract(23, "minutes")
              .subtract(14, "seconds"),
            end: moment(),
          }),
        ]),
        parentActivityID: "code-review",
        childActivityIDs: signal([]),
      }),
    ],
    [
      "cr-kj",
      signal({
        id: "cr-kj",
        name: signal("Bill Gates"),
        intervals: signal([
          signal({
            start: moment()
              .subtract(1, "hours")
              .subtract(3, "minutes")
              .subtract(17, "seconds"),
            end: moment(),
          }),
        ]),
        parentActivityID: "code-review",
        childActivityIDs: signal([]),
      }),
    ],
    [
      "meetings",
      signal({
        id: "meetings",
        name: signal("Meetings"),
        intervals: signal([
          signal({
            start: moment().subtract(15, "minutes"),
            end: moment(),
          }),
        ]),
        parentActivityID: "work",
        childActivityIDs: signal([]),
      }),
    ],
    [
      "helping",
      signal({
        id: "helping",
        name: signal("Helping"),
        intervals: signal([
          signal({
            start: moment()
              .subtract(1, "hours")
              .subtract(23, "minutes")
              .subtract(14, "seconds"),
            end: moment(),
          }),
        ]),
        parentActivityID: "work",
        childActivityIDs: signal(["h-lv"]),
      }),
    ],
    [
      "h-lv",
      signal({
        id: "h-lv",
        name: signal("Steve Jobs"),
        intervals: signal([
          signal({
            start: moment()
              .subtract(1, "hours")
              .subtract(23, "minutes")
              .subtract(14, "seconds"),
            end: moment(),
          }),
        ]),
        parentActivityID: "helping",
        childActivityIDs: signal([]),
      }),
    ],
    [
      "tasks",
      signal({
        id: "tasks",
        name: signal("Tasks"),
        intervals: signal([
          signal({
            start: moment()
              .subtract(1, "hours")
              .subtract(23, "minutes")
              .subtract(14, "seconds"),
          }),
        ]),
        parentActivityID: "work",
        childActivityIDs: signal(["table-component"]),
      }),
    ],
    [
      "table-component",
      signal({
        id: "table-component",
        name: signal("Table Component"),
        intervals: signal([
          signal({
            start: moment()
              .subtract(1, "hours")
              .subtract(23, "minutes")
              .subtract(14, "seconds"),
          }),
        ]),
        parentActivityID: "tasks",
        childActivityIDs: signal([]),
      }),
    ],
    [
      "personal",
      signal({
        id: "personal",
        name: signal("Personal"),
        intervals: signal([
          signal({
            start: moment().subtract(2, "days").subtract(20, "minutes"),
            end: moment().subtract(2, "days"),
          }),
          signal({
            start: moment().subtract(30, "minutes"),
            end: moment(),
          }),
        ]),
        parentActivityID: "root",
        childActivityIDs: signal(["cooking", "commute"]),
      }),
    ],
    [
      "cooking",
      signal({
        id: "cooking",
        name: signal("Cooking"),
        intervals: signal([
          signal({
            start: moment().subtract(2, "days").subtract(20, "minutes"),
            end: moment().subtract(2, "days"),
          }),
        ]),
        parentActivityID: "personal",
        childActivityIDs: signal([]),
      }),
    ],
    [
      "commute",
      signal({
        id: "commute",
        name: signal("Commute"),
        intervals: signal([
          signal({
            start: moment().subtract(30, "minutes"),
            end: moment(),
          }),
        ]),
        parentActivityID: "personal",
        childActivityIDs: signal([]),
      }),
    ],
  ]),
);
