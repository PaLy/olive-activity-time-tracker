import { IconButton } from "@mui/material";
import { anchorEl } from "../../AppMenu";
import MoreIcon from "@mui/icons-material/MoreVert";

export const AppBarActions = () => {
  return (
    <IconButton
      sx={{
        position: "absolute",
        top: "-56px",
        right: "24px",
        zIndex: "1101", // AppBar has 1100
      }}
      id={"app-menu-actions"}
      size="large"
      aria-label="display more actions"
      edge="end"
      color="inherit"
      onClick={(event) => (anchorEl.value = event.currentTarget)}
    >
      <MoreIcon />
    </IconButton>
  );
};
