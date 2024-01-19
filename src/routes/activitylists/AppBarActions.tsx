import { IconButton, Menu, MenuItem } from "@mui/material";
import MoreIcon from "@mui/icons-material/MoreVert";
import { computed, signal } from "@preact/signals-react";
import { useCollapseAll, useExpandAll } from "./state/Expanded";

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
  const expandAll = useExpandAll();
  const collapseAll = useCollapseAll();

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
      <MenuItem
        onClick={() => {
          expandAll().then();
          onClose();
        }}
      >
        Expand All
      </MenuItem>
      <MenuItem
        onClick={() => {
          collapseAll().then();
          onClose();
        }}
      >
        Collapse All
      </MenuItem>
    </Menu>
  );
};
