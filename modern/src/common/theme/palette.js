import {
  amber, grey, green, indigo, red, common,
} from "@mui/material/colors";

const colors = {
  white: common.white,
  background: grey[50],
  primary: indigo[900],
  secondary: green[500],
  positive: green[500],
  medium: amber[700],
  negative: red[500],
  neutral: grey[500],
  geometry: "#3bb2d0",
  bsDanger: "#dc3545",
  bsSuccess: "#28a745",
  bsWarning: "#ffc107",
};

export default {
  background: {
    default: colors.background,
  },
  primary: {
    main: colors.primary,
  },
  secondary: {
    main: colors.secondary,
    contrastText: colors.white,
  },
  colors,
};
