import moment from "moment";
import { Interval } from "./Interval";
import { Store } from "../Store";
import { dateTimeSchema } from "../JsonSchema";
import { JTDSchemaType } from "ajv/dist/jtd";

export const STORE_NAME_INTERVALS = "intervals";

class IntervalStore extends Store<StoredInterval, Interval, ExportedInterval> {
  constructor() {
    super({ name: STORE_NAME_INTERVALS });
  }

  asValue = async (interval: StoredInterval): Promise<Interval> => {
    return {
      id: interval.id,
      start: moment(interval.start),
      end: interval.end === null ? undefined : moment(interval.end),
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
      start: interval.start.valueOf(),
      end: interval.end?.valueOf() ?? null,
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

  editInterval = async (interval: Interval, edit: IntervalEdit) => {
    await intervalStore
      .set(interval.id, { ...interval, ...edit })
      .catch((error) => {
        throw new Error(`Failed to edit interval: ${error}`);
      });
  };

  stopIntervals = (intervals: Interval[]) =>
    Promise.allSettled(
      intervals.map((interval) =>
        this.editInterval(interval, { end: moment() }),
      ),
    ).catch((error) => {
      throw new Error(`Failed to stop interval: ${error}`);
    });
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

export type IntervalEdit = Partial<Pick<Interval, "start" | "end">>;
