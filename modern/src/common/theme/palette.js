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
  // primary: indigo[900],
  primary: "#1876d2",
  secondary: green[500],
  positive: green[500],
  medium: amber[700],
  negative: red[600],
  neutral: grey[500],
  warning: amber[500],
  info: blue[500],
  geometry: "#3bb2d0",
  bsDanger: "rgb(211, 47, 47)",
  bsSuccess: "rgb(46, 125, 50)",
  bsWarning: "#ffc107",
  solidBlue: blue[300],
  grey: blueGrey[500],
  blueSky: "#1d90fe",
};

export default {
  background: {
    default: colors.background,
  },
  primary: {
    default: colors.primary,
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
  negative: {
    main: colors.negative,
    contrastText: colors.white,
  },
  positive: {
    main: colors.positive,
    contrastText: colors.white,
  },
  blueSky: {
    main: colors.blueSky,
    dark: "#2a56ca",
    contrastText: colors.white,
  },
  colors,
};
