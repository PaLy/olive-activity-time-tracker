import { ReactNode, useEffect, useState } from "react";
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
  const key = useDrawerKey();

  return (
    <>
      <SwipeableDrawer
        key={key}
        anchor={"left"}
        open={pathname.endsWith("/drawer")}
        onClose={() => {
          // it does not end with drawer when it was just partially open
          if (pathname.endsWith("/drawer")) {
            navigate(-1);
          }
        }}
        // used when opening by swipe
        onOpen={() => navigate(`${pathname}/drawer`, { viewTransition: true })}
      >
        <Box
          sx={{
            width: 250,
            paddingTop: "env(safe-area-inset-top)",
            height: "100%",
            display: "flex",
            flexDirection: "column",
          }}
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
          {/*<Box sx={{ flexGrow: 1 }} />*/}
          {/*<Divider />*/}
          {/*<List>*/}
          {/*  <DrawerItem*/}
          {/*    text={"Debug"}*/}
          {/*    routePath={"/debug"}*/}
          {/*    absoluteRoutePath={true}*/}
          {/*    icon={<BugReportIcon />}*/}
          {/*  />*/}
          {/*</List>*/}
        </Box>
      </SwipeableDrawer>
      <SettingsModal />
    </>
  );
};

export const useDrawerKey = () => {
  const [key, setKey] = useState(0);

  useEffect(() => {
    const onTouchCancel = () => {
      // fixes drawer stays partially open
      // - after app reopen after it was closed by swiping from left
      // - after swiping from left to navigate back and then swipe back to left to cancel it
      setKey((prev) => prev + 1);
    };

    document.addEventListener("touchcancel", onTouchCancel);
    return () => {
      // document.removeEventListener("visibilitychange", onVisibilityChange);
      document.removeEventListener("touchcancel", onTouchCancel);
    };
  }, []);

  return key;
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
          navigate(`${mainScreenPath}${routePath}`, {
            replace: true,
            viewTransition: true,
          });
          event.stopPropagation();
        }}
      >
        <ListItemIcon>{icon}</ListItemIcon>
        <ListItemText primary={text} />
      </ListItemButton>
    </ListItem>
  );
};
