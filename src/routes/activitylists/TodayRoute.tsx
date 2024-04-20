import { ActivityList } from "./ActivityList";
import { OrderBy } from "../../data/activity/Algorithms";
import { useClockStore } from "../../data/interval/Signals";

export const TodayRoute = () => {
  const start = useClockStore((state) =>
    state.time.clone().startOf("day").valueOf(),
  );
  const end = useClockStore((state) =>
    state.time.clone().endOf("day").valueOf(),
  );
  return (
    <ActivityList
      interval={{ start, end }}
      header={"Today"}
      orderBy={OrderBy.LastEndTime}
    />
  );
};
