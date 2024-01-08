import { AppBar, IconButton, Toolbar, Typography } from "@mui/material";
import { ReactNode } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import { useNavigate } from "react-router-dom";
import { useLocation } from "./routes/Router";
import { AppDrawer } from "./AppDrawer";

type AppAppBarProps = {
  header?: string;
  actions?: ReactNode;
};

export const AppAppBar = (props: AppAppBarProps) => {
  const { actions, header } = props;
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <AppBar
      position="relative"
      enableColorOnDark
      // removes lightening
      sx={{ backgroundImage: "initial" }}
    >
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
