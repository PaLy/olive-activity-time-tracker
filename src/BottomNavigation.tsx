import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import TodayIcon from "@mui/icons-material/Today";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ArchiveIcon from "@mui/icons-material/Archive";
import { Badge, Paper } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { inProgressActivitiesCount } from "./data/activity/Signals";

export const AppBottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname === "/" ? "/today" : location.pathname;

  return (
    <Paper
      sx={{ position: "absolute", bottom: 0, left: 0, right: 0 }}
      elevation={3}
    >
      <BottomNavigation
        showLabels
        value={pathname}
        onChange={(event, destination) => {
          if (pathname !== destination) {
            navigate(`${destination}`);
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
              invisible={inProgressActivitiesCount.value === 0}
            >
              <TodayIcon />
            </Badge>
          }
        />
        {/* TODO yesterday icon */}
        <BottomNavigationAction
          label="Yesterday"
          value={"/yesterday"}
          icon={<TodayIcon />}
        />
        <BottomNavigationAction
          label="This Month"
          value={"/month"}
          icon={<CalendarMonthIcon />}
        />
        <BottomNavigationAction
          label="All Time"
          value={"/all"}
          icon={<ArchiveIcon />}
        />
      </BottomNavigation>
    </Paper>
  );
};
