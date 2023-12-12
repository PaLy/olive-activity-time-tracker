import { Button, ButtonProps, Grid, IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

type Props = {
  finishButtonProps?: ButtonProps;
  children: ReactNode;
};

export const FullScreenModalContent = (props: Props) => {
  const { children, finishButtonProps } = props;
  const navigate = useNavigate();
  return (
    <>
      <Grid
        container
        justifyContent={"space-between"}
        direction="row"
        sx={{ mb: 1, mt: 1 }}
      >
        <IconButton aria-label={"back"} onClick={() => navigate(-1)}>
          <ArrowBackIcon />
        </IconButton>
        {finishButtonProps && <Button variant="text" {...finishButtonProps} />}
      </Grid>
      {children}
    </>
  );
};
