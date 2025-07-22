import { IconButton, Menu, MenuItem } from "@mui/material";
import MoreIcon from "@mui/icons-material/MoreVert";
import { create } from "zustand";
import {
  collapseAllActivities,
  expandAllActivities,
} from "../../db/queries/activities";
import { openErrorSnackbar } from "../../components/AppSnackbarStore";

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
          expandAllActivities().catch((e) => {
            console.error(e);
            openErrorSnackbar("Failed to expand all activities");
          });
          closeMenu();
        }}
      >
        Expand All
      </MenuItem>
      <MenuItem
        onClick={() => {
          collapseAllActivities().catch((e) => {
            console.error(e);
            openErrorSnackbar("Failed to collapse all activities");
          });
          closeMenu();
        }}
      >
        Collapse All
      </MenuItem>
    </Menu>
  );
};
