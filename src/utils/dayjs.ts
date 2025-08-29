import dayjs from "dayjs";
import calendar from "dayjs/plugin/calendar";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import minMax from "dayjs/plugin/minMax";

// Extend dayjs with required plugins
dayjs.extend(calendar);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(minMax);

export default dayjs;
