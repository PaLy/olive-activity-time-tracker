import { Menu, MenuItem } from "@mui/material";
import { computed, signal } from "@preact/signals-react";

export const anchorEl = signal<Element | null>(null);
const open = computed(() => anchorEl.value !== null);
const onClose = () => (anchorEl.value = null);

export const AppMenu = () => {
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
