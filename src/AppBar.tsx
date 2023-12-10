import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import { ReactNode } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import { signal } from "@preact/signals-react";
import SettingsIcon from "@mui/icons-material/Settings";

const drawerOpen = signal(false);

type AppAppBarProps = {
  header?: string;
  actions?: ReactNode;
};

export const AppAppBar = (props: AppAppBarProps) => {
  const { actions, header } = props;
  return (
    <AppBar position="sticky" enableColorOnDark>
      <AppDrawer />
      <Toolbar>
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2 }}
          onClick={() => (drawerOpen.value = true)}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {header}
        </Typography>
        {actions}
      </Toolbar>
    </AppBar>
  );
};

const AppDrawer = () => {
  return (
    <Drawer
      anchor={"left"}
      open={drawerOpen.value}
      onClose={() => (drawerOpen.value = false)}
    >
      <Box
        sx={{ width: 250 }}
        role="presentation"
        onClick={() => (drawerOpen.value = false)}
        onKeyDown={() => (drawerOpen.value = false)}
      >
        <Typography variant="h6" component="div" sx={{ m: 2 }}>
          Olive
        </Typography>
        <List>
          <ListItem disablePadding>
            <ListItemButton>
              <ListItemIcon>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText primary={"Settings"} />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );
};
