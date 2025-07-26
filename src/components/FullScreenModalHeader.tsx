import Button, { ButtonProps } from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "../router/hooks";

type Props = {
  headline?: string;
  finishButtonProps?: ButtonProps;
};

export const FullScreenModalHeader = (props: Props) => {
  const { finishButtonProps, headline } = props;
  const navigate = useNavigate();
  return (
    <>
      <Grid
        container
        justifyContent={"space-between"}
        direction="row"
        sx={{ pb: 1, pt: 1, pl: 0.5, pr: 1 }}
      >
        <Grid
          container
          alignItems={"start"}
          width={"fit-content"}
          flexWrap={"nowrap"}
        >
          <IconButton aria-label={"back"} onClick={() => navigate(-1)}>
            <ArrowBackIcon />
          </IconButton>
          {headline && (
            <Typography variant="h6" component="span" sx={{ ml: 1, mt: 0.5 }}>
              {headline}
            </Typography>
          )}
        </Grid>
        {finishButtonProps && (
          <Button variant="text" aria-label="finish" {...finishButtonProps} />
        )}
      </Grid>
    </>
  );
};
