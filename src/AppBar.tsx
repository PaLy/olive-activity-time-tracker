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
import SettingsIcon from "@mui/icons-material/Settings";
import { useNavigate } from "react-router-dom";
import { useLocation } from "./routes/Router";

type AppAppBarProps = {
  header?: string;
  actions?: ReactNode;
};

export const AppAppBar = (props: AppAppBarProps) => {
  const { actions, header } = props;
  const navigate = useNavigate();
  const { pathname } = useLocation();

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
          onClick={() => navigate(`${pathname}/drawer`)}
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
  const navigate = useNavigate();
  const { pathname } = useLocation();
  return (
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
