import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "./routes/Router";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import StorageIcon from "@mui/icons-material/Storage";
import { StorageModal } from "./routes/storage/StorageModal";
import { SettingsModal } from "./routes/settings/SettingsModal";

export const AppDrawer = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <>
      <Drawer
        anchor={"left"}
        open={pathname.endsWith("/drawer")}
        onClose={() => navigate(-1)}
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
              icon={<StorageIcon />}
            />
          </List>
        </Box>
      </Drawer>
      <SettingsModal />
      <StorageModal />
    </>
  );
};

type DrawerItemProps = {
  text: string;
  routePath: string;
  icon: ReactNode;
};

const DrawerItem = (props: DrawerItemProps) => {
  const { routePath, text, icon } = props;
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const mainScreenPath = pathname.substring(0, pathname.indexOf("/drawer"));
  return (
    <ListItem disablePadding>
      <ListItemButton
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
