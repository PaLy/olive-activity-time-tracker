import { ReactNode } from "react";
import { useLocation, useNavigate } from "../router/hooks";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import SettingsIcon from "@mui/icons-material/Settings";
import StorageIcon from "@mui/icons-material/Storage";
import { SettingsModal } from "../features/settings/SettingsModal";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";

export const AppDrawer = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <>
      <SwipeableDrawer
        anchor={"left"}
        open={pathname.endsWith("/drawer")}
        onClose={() => navigate(-1)}
        onOpen={() => navigate(`${pathname}/drawer`)} // used when opening by swipe
      >
        <Box
          sx={{ width: 250 }}
          role="presentation"
          onClick={() => navigate(-1)}
          onKeyDown={() => navigate(-1)}
        >
          <Typography variant="h6" component="div" sx={{ m: 2 }}>
            Olive: Activity Time Tracker
          </Typography>
          <List>
            <DrawerItem
              text={"Settings"}
              routePath={"/settings"}
              icon={<SettingsIcon />}
            />
            <DrawerItem
              text={"Storage"}
              routePath={"/storage"}
              absoluteRoutePath={true}
              icon={<StorageIcon />}
            />
          </List>
        </Box>
      </SwipeableDrawer>
      <SettingsModal />
    </>
  );
};

type DrawerItemProps = {
  text: string;
  routePath: string;
  absoluteRoutePath?: boolean;
  icon: ReactNode;
};

const DrawerItem = (props: DrawerItemProps) => {
  const { routePath, text, icon, absoluteRoutePath } = props;
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const mainScreenPath = absoluteRoutePath
    ? ""
    : pathname.substring(0, pathname.indexOf("/drawer"));
  return (
    <ListItem disablePadding>
      <ListItemButton
        aria-label={text}
        onClick={(event) => {
          navigate(`${mainScreenPath}${routePath}`, { replace: true });
          event.stopPropagation();
        }}
      >
        <ListItemIcon>{icon}</ListItemIcon>
        <ListItemText primary={text} />
      </ListItemButton>
    </ListItem>
  );
};
