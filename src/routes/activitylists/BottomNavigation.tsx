import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import TodayIcon from "@mui/icons-material/Today";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import DateRangeIcon from "@mui/icons-material/DateRange";
import { Badge, Paper } from "@mui/material";
import { useLocation, useNavigate } from "../Router";
import { useInProgressActivitiesCount } from "../../data/activity/Hooks";

export const AppBottomNavigation = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const currentPagePathnameEndIndex = pathname.indexOf("/", 1);
  const currentPagePathname =
    currentPagePathnameEndIndex === -1
      ? pathname
      : pathname.substring(0, currentPagePathnameEndIndex);

  const inProgressActivitiesCount = useInProgressActivitiesCount();

  return (
    <Paper elevation={3} sx={{ position: "sticky", bottom: 0 }}>
      <BottomNavigation
        showLabels
        value={currentPagePathname}
        onChange={(event, destination) => {
          if (currentPagePathname !== destination) {
            if (destination === "/today") {
              navigate(-1);
            } else {
              navigate(`${destination}`, {
                replace: currentPagePathname !== "/today",
              });
            }
          }
        }}
      >
        <BottomNavigationAction
          label="Today"
          value={"/today"}
          icon={
            <Badge
              badgeContent={inProgressActivitiesCount}
              color="primary"
              invisible={inProgressActivitiesCount === 0}
            >
              <TodayIcon />
            </Badge>
          }
        />
        <BottomNavigationAction
          label="Day"
          value={"/day"}
          icon={<TodayIcon />}
        />
        <BottomNavigationAction
          label="Month"
          value={"/month"}
          icon={<CalendarMonthIcon />}
        />
        <BottomNavigationAction
          label="Date Range"
          value={"/range"}
          icon={<DateRangeIcon />}
        />
      </BottomNavigation>
    </Paper>
  );
};
