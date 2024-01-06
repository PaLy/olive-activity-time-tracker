import {
  Button,
  ButtonProps,
  Grid,
  IconButton,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

type Props = {
  headline?: string;
  finishButtonProps?: ButtonProps;
  children?: ReactNode;
};

export const FullScreenModalContent = (props: Props) => {
  const { children, finishButtonProps, headline } = props;
  const navigate = useNavigate();
  return (
    <>
      <Grid
        container
        justifyContent={"space-between"}
        direction="row"
        sx={{ pb: 1, pt: 1, pl: 0.5, pr: 1 }}
      >
        <Grid container alignItems={"center"} width={"fit-content"}>
          <IconButton aria-label={"back"} onClick={() => navigate(-1)}>
            <ArrowBackIcon />
          </IconButton>
          {headline && (
            <Typography variant="h6" component="span" sx={{ ml: 1 }}>
              {headline}
            </Typography>
          )}
        </Grid>
        {finishButtonProps && <Button variant="text" {...finishButtonProps} />}
      </Grid>
      {children}
    </>
  );
};
