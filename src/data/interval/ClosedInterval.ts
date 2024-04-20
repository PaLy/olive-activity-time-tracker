import { Signal } from "@preact/signals-react";

export type ClosedInterval = {
  start: Signal<number>;
  end: Signal<number>;
};
