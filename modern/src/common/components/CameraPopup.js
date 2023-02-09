import React from "react";
import Draggable from "react-draggable";
import { Card, Box, Typography, IconButton, CardContent } from "@mui/material";
import { green } from "@mui/material/colors";
import makeStyles from "@mui/styles/makeStyles";
import CloseIcon from "@mui/icons-material/Close";
import CameraCard from "./CameraCard";

const CameraPopup = ({ camera, onClose }) => {
  const useStyles = makeStyles((theme) => ({
    card: {
      width: theme.dimensions.popupMaxWidth,
    },
    media: {
      height: theme.dimensions.popupImageHeight,
      display: "flex",
      justifyContent: "flex-end",
      alignItems: "flex-start",
    },
    mediaButton: {
      color: theme.palette.colors.white,
      mixBlendMode: "difference",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: theme.spacing(1, 1, 1, 2),
    },
    content: {
      paddingTop: theme.spacing(1),
      paddingBottom: theme.spacing(1),
    },
    negative: {
      color: theme.palette.colors.negative,
    },
    icon: {
      width: "25px",
      height: "25px",
      filter: "brightness(0) invert(1)",
    },
    table: {
      "& .MuiTableCell-sizeSmall": {
        paddingLeft: 0,
        paddingRight: 0,
      },
    },
    cell: {
      borderBottom: "none",
    },
    actions: {
      justifyContent: "space-between",
    },
    root: ({ desktopPadding }) => ({
      resize: "both",
      position: "fixed",
      zIndex: 5,
      left: `${camera.left}%`,
      [theme.breakpoints.up("md")]: {
        left: `calc(30% + ${desktopPadding} / 2)`,
        top: `${camera.top}%`,
      },
      [theme.breakpoints.down("md")]: {
        left: "30%",

        top: `${camera.top}%`,
      },
      transform: "translateX(-50%)",
    }),
  }));
  const classes = useStyles();

  if (camera.removed) {
    return;
  }

  return (
    <Draggable handle={`.${classes.media}, .${classes.header}`}>
      <Card elevation={3} className={`${classes.card} ${classes.root}`}>
        <Box
          className={classes.header}
          sx={{
            backgroundColor: `${green[500]}`,
            color: "white",
          }}
        >
          <Typography variant="body2">{camera.name}</Typography>
          <IconButton size="small" onClick={onClose} onTouchStart={onClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <CardContent className={classes.content}>
          <CameraCard mdvrid={camera.attributes.mdvrID} />
        </CardContent>
      </Card>
    </Draggable>
  );
};
export default CameraPopup;
