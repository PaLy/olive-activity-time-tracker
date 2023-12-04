import { AppBar, IconButton, Toolbar, Typography } from "@mui/material";
import { anchorEl, AppMenu } from "./AppMenu";
import MoreIcon from "@mui/icons-material/MoreVert";

export const AppAppBar = () => {
  return (
    <AppBar position="sticky" enableColorOnDark>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Activity Time Tracker
        </Typography>
        <IconButton
          id={"app-menu-actions"}
          size="large"
          aria-label="display more actions"
          edge="end"
          color="inherit"
          onClick={(event) => {
            anchorEl.value = event.currentTarget;
          }}
        >
          <MoreIcon />
        </IconButton>
        <AppMenu />
      </Toolbar>
    </AppBar>
  );
};
