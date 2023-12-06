import { ActivityList } from "./ActivityList";
import { signal } from "@preact/signals-react";

export const AllTimeRoute = () => (
  <ActivityList interval={interval} subHeader={"All Time"} />
);

const interval = signal({
  start: 0,
  // maximum valid time: Sat Sep 13 275760 02:00:00 GMT+0200 (Central European Summer Time)
  end: 8640000000000000,
});
