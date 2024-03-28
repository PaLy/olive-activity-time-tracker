import { signal } from "@preact/signals-react";
import moment from "moment";
import { Interval } from "./Interval";
import { SignalStore } from "../SignalStore";
import { dateTimeSchema } from "../JsonSchema";
import { JTDSchemaType } from "ajv/dist/jtd";

export const STORE_NAME_INTERVALS = "intervals";

class IntervalStore extends SignalStore<
  StoredInterval,
  Interval,
  ExportedInterval
> {
  constructor() {
    super({ name: STORE_NAME_INTERVALS });
  }

  asValue = (interval: StoredInterval): Interval => {
    return {
      id: interval.id,
      start: signal(moment(interval.start)),
      end: signal(interval.end === null ? null : moment(interval.end)),
    };
  };

  valueJsonSchema: JTDSchemaType<ExportedInterval[]> = {
    elements: {
      properties: {
        id: { type: "string" },
        start: dateTimeSchema,
        end: dateTimeSchema,
      },
    },
  };

  asStoredValue = (interval: Interval): StoredInterval => {
    return {
      id: interval.id,
      start: interval.start.value.valueOf(),
      end: interval.end.value?.valueOf() ?? null,
    };
  };

  override asExportedValue = (interval: StoredInterval): ExportedInterval => {
    const { id, start, end } = interval;
    return {
      id,
      start: moment(start).toJSON(),
      end: (end ? moment(end) : moment()).toJSON(),
    };
  };

  override fromExportedValue = (
    interval: ExportedInterval,
  ): [string, StoredInterval] => {
    const { id, start, end } = interval;
    return [
      id,
      {
        id,
        start: moment(start).valueOf(),
        end: moment(end).valueOf(),
      },
    ];
  };
}

export const intervalStore = new IntervalStore();

type StoredInterval = {
  id: string;
  start: number;
  end: number | null;
};

export type ExportedInterval = {
  id: string;
  start: string;
  end: string;
};
