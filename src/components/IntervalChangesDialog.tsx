import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import { useState } from "react";
import Box from "@mui/material/Box";
import dayjs from "../utils/dayjs";
import { MAX_DATE_MS } from "../utils/date";
import { IntervalChange, TimeRange } from "../db/queries/intervalOverlaps";

const format = (range: TimeRange) =>
  `${dayjs(range.start).format("lll")} – ${
    range.end === MAX_DATE_MS ? "now" : dayjs(range.end).format("lll")
  }`;

const describe = (change: IntervalChange) => {
  if (change.merged) return "Merged into the new interval";
  if (change.after.length === 0) return "Removed entirely";
  if (change.after.length > 1) return `Split into ${change.after.length} parts`;
  return "Shortened";
};

type Props = {
  changes: IntervalChange[] | undefined;
  onConfirm: () => void;
  onCancel: () => void;
};

export const IntervalChangesDialog = ({
  changes,
  onConfirm,
  onCancel,
}: Props) => {
  // keep the content while the closing animation runs
  const [lastChanges, setLastChanges] = useState(changes);
  if (changes && changes !== lastChanges) {
    setLastChanges(changes);
  }
  const shown = changes ?? lastChanges;
  const blocked = !!shown?.some((c) => c.isModified && c.after.length === 0);
  return (
    <Dialog open={!!changes} onClose={onCancel} scroll="paper">
      <DialogTitle>
        {blocked
          ? "Interval cannot be saved"
          : "Overlapping intervals will change"}
      </DialogTitle>
      <DialogContent dividers>
        {blocked && (
          <DialogContentText sx={{ mb: 1 }}>
            This interval is fully covered by other intervals of the same
            activity or its sub-activities, so it cannot be saved.
          </DialogContentText>
        )}
        <List dense disablePadding>
          {shown?.map((change, i) => (
            <ListItem key={i} disableGutters>
              <ListItemText
                primary={
                  change.isModified ? "This interval" : change.activityFullName
                }
                secondary={
                  <>
                    <Box component="span" sx={{ display: "block" }}>
                      {describe(change)}
                    </Box>
                    {change.before && (
                      <Box
                        component="span"
                        sx={{
                          display: "block",
                          textDecoration: "line-through",
                        }}
                      >
                        {format(change.before)}
                      </Box>
                    )}
                    {change.overlapping?.map((c, k) => (
                      <Box
                        key={`overlap-${k}`}
                        component="span"
                        sx={{ display: "block" }}
                      >
                        Overlaps {c.activityFullName}: {format(c.range)}
                      </Box>
                    ))}
                    {change.after.map((range, j) => (
                      <Box key={j} component="span" sx={{ display: "block" }}>
                        {format(range)}
                      </Box>
                    ))}
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button autoFocus aria-label="cancel" onClick={onCancel}>
          {blocked ? "Close" : "Cancel"}
        </Button>
        {!blocked && (
          <Button aria-label="confirm" onClick={onConfirm}>
            Confirm
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
