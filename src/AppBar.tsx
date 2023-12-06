import { AppBar, Toolbar, Typography } from "@mui/material";
import { AppMenu } from "./AppMenu";

export const AppAppBar = () => {
  return (
    <AppBar position="sticky" enableColorOnDark>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Activity Time Tracker
        </Typography>
        <AppMenu />
      </Toolbar>
    </AppBar>
  );
};
