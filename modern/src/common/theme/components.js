import { grey, green } from "@mui/material/colors";

export default {
  MuiUseMediaQuery: {
    defaultProps: {
      noSsr: true,
    },
  },
  MuiOutlinedInput: {
    styleOverrides: {
      root: {
        backgroundColor: grey[50],
      },
    },
  },
  MuiButton: {
    styleOverrides: {
      sizeMedium: {
        height: "40px",
      },
    },
  },
  MuiFormControl: {
    defaultProps: {
      size: "small",
    },
  },
  MuiSnackbar: {
    defaultProps: {
      anchorOrigin: {
        vertical: "bottom",
        horizontal: "center",
      },
    },
  },
  MuiTabs: {
    styleOverrides: {
      root: {
        backgroundColor: green[200],
        borderRadius: "8px",
        width: "fit-content",
        padding: "0.3rem",
      },
    },
  },
  MuiTab: {
    styleOverrides: {
      root: {
        backgroundColor: "transparent",
        borderRadius: 1,
        color: green[700],
      },
    },
  },
};
