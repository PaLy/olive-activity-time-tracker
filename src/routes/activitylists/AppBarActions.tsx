import { IconButton, Menu, MenuItem } from "@mui/material";
import MoreIcon from "@mui/icons-material/MoreVert";
import { useCollapseAll, useExpandAll } from "./state/Expanded";
import { create } from "zustand";

type AppBarStore = {
  menuAnchorEl: Element | null;
  menuOpen: boolean;
  closeMenu: () => void;
  openMenu: (anchorEl: Element) => void;
};

const useAppBarStore = create<AppBarStore>((set) => ({
  menuAnchorEl: null,
  menuOpen: false,
  closeMenu: () => set({ menuAnchorEl: null, menuOpen: false }),
  openMenu: (anchorEl: Element) =>
    set({ menuAnchorEl: anchorEl, menuOpen: true }),
}));

export const AppBarActions = () => {
  const openMenu = useAppBarStore((state) => state.openMenu);
  return (
    <>
      <AppBarMenu />
      <IconButton
        id={"app-menu-actions"}
        size="large"
        aria-label="display more actions"
        edge="end"
        color="inherit"
        onClick={(event) => openMenu(event.currentTarget)}
      >
        <MoreIcon />
      </IconButton>
    </>
  );
};

export const AppBarMenu = () => {
  const anchorEl = useAppBarStore((state) => state.menuAnchorEl);
  const open = useAppBarStore((state) => state.menuOpen);
  const closeMenu = useAppBarStore((state) => state.closeMenu);

  const expandAll = useExpandAll();
  const collapseAll = useCollapseAll();

  return (
    <Menu
      id="app-menu"
      anchorEl={anchorEl}
      open={open}
      onClose={closeMenu}
      MenuListProps={{
        "aria-labelledby": "app-menu-actions",
      }}
    >
      <MenuItem
        onClick={() => {
          expandAll().then();
          closeMenu();
        }}
      >
        Expand All
      </MenuItem>
      <MenuItem
        onClick={() => {
          collapseAll().then();
          closeMenu();
        }}
      >
        Collapse All
      </MenuItem>
    </Menu>
  );
};
