import {
  amber,
  grey,
  green,
  indigo,
  red,
  common,
  blue,
  blueGrey,
  yellow,
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
  warning: yellow[600],
  info: blue[500],
  geometry: "#3bb2d0",
  bsDanger: "rgb(211, 47, 47)",
  bsSuccess: "rgb(46, 125, 50)",
  bsWarning: "#ffc107",
  solidBlue: blue[300],
  grey: blueGrey[500],
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
  solidBlue: {
    main: colors.solidBlue,
  },
  solidGrey: {
    main: colors.grey,
  },
  warning: {
    main: colors.warning,
    contrastText: colors.white,
  },
  colors,
};
