import { Moment } from "moment/moment";

export type Interval = {
  id: string;
  start: Moment;
  end?: Moment;
};
