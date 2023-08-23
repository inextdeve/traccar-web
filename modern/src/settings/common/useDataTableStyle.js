import { makeStyles } from "@mui/styles";

export default makeStyles((theme) => ({
  addButton: {
    background: theme.palette.colors.primary,
    color: theme.palette.colors.white,
    "&:hover": {
      background: "#002984",
    },
  },
}));
