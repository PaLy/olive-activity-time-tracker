import { IconButton, Menu, MenuItem } from "@mui/material";
import MoreIcon from "@mui/icons-material/MoreVert";
import { computed, signal } from "@preact/signals-react";

const anchorEl = signal<Element | null>(null);
const open = computed(() => anchorEl.value !== null);
const onClose = () => (anchorEl.value = null);

export const AppBarActions = () => {
  return (
    <>
      <AppBarMenu />
      <IconButton
        id={"app-menu-actions"}
        size="large"
        aria-label="display more actions"
        edge="end"
        color="inherit"
        onClick={(event) => (anchorEl.value = event.currentTarget)}
      >
        <MoreIcon />
      </IconButton>
    </>
  );
};

export const AppBarMenu = () => {
  return (
    <Menu
      id="app-menu"
      anchorEl={anchorEl.value}
      open={open.value}
      onClose={onClose}
      MenuListProps={{
        "aria-labelledby": "app-menu-actions",
      }}
    >
      <MenuItem onClick={onClose}>Expand All</MenuItem>
      <MenuItem onClick={onClose}>Collapse All</MenuItem>
    </Menu>
  );
};
