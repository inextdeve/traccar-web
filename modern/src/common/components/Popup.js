import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Draggable from "react-draggable";
import {
  Card,
  CardContent,
  Typography,
  CardActions,
  IconButton,
  Table,
  TableBody,
  TableRow,
  TableCell,
  CircularProgress,
  Box,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import CloseIcon from "@mui/icons-material/Close";

import DeleteIcon from "@mui/icons-material/Delete";
import PendingIcon from "@mui/icons-material/Pending";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";

import { useTranslation } from "./LocalizationProvider";
import RemoveDialog from "./RemoveDialog";

import { devicesActions } from "../../store";
import { useCatch } from "../../reactHelper";
import moment from "moment";
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
    padding: theme.spacing(1, 1, 0, 2),
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
    position: "fixed",
    zIndex: 5,
    left: "50%",
    [theme.breakpoints.up("md")]: {
      left: `calc(50% + ${desktopPadding} / 2)`,
      top: theme.spacing(3),
    },
    [theme.breakpoints.down("md")]: {
      left: "50%",
      top: `calc(${theme.spacing(3)} + ${theme.dimensions.bottomBarHeight}px)`,
    },
    transform: "translateX(-50%)",
  }),
}));

const StatusRow = ({ name, content }) => {
  const classes = useStyles();

  return (
    <TableRow>
      <TableCell className={classes.cell}>
        <Typography variant="body2">{name}</Typography>
      </TableCell>
      <TableCell className={classes.cell}>
        <Typography variant="body2" color="textSecondary">
          {content}
        </Typography>
      </TableCell>
    </TableRow>
  );
};

const Popup = ({
  deviceId,
  position,
  onClose,
  disableActions,
  desktopPadding = 0,
  bin,
}) => {
  const classes = useStyles({ desktopPadding });
  const dispatch = useDispatch();
  const t = useTranslation();

  const [removing, setRemoving] = useState(false);

  const handleRemove = useCatch(async (removed) => {
    if (removed) {
      const response = await fetch("/api/devices");
      if (response.ok) {
        dispatch(devicesActions.refresh(await response.json()));
      } else {
        throw Error(await response.text());
      }
    }
    setRemoving(false);
  });

  //MY Code
  const popup = useSelector((state) => state.analytics.popup);
  const binData = useSelector((state) => state.analytics.binData);

  console.log("BIN DATA", binData);
  return (
    <div className={classes.root}>
      {popup.show && (
        <Draggable handle={`.${classes.media}, .${classes.header}`}>
          <Card elevation={3} className={classes.card}>
            <div className={classes.header}>
              <Typography variant="body2" color="textSecondary">
                {popup.binType} - {popup.id}
              </Typography>
              <IconButton size="small" onClick={onClose} onTouchStart={onClose}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </div>
            {binData ? (
              <CardContent className={classes.content}>
                <Table size="small" classes={{ root: classes.table }}>
                  <TableBody>
                    <StatusRow name="status" content={binData[0].status} />
                    <StatusRow
                      name="Last Emptied Time"
                      content={moment(binData[0].datetime).format("MMM Do YY")}
                    />
                  </TableBody>
                </Table>
              </CardContent>
            ) : (
              <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
                <CircularProgress />
              </Box>
            )}
            <CardActions classes={{ root: classes.actions }} disableSpacing>
              <IconButton color="secondary">
                <PendingIcon />
              </IconButton>
              <IconButton color="secondary">
                <WhatsAppIcon />
              </IconButton>
              <IconButton className={classes.negative}>
                <DeleteIcon />
              </IconButton>
            </CardActions>
          </Card>
        </Draggable>
      )}
      {/* <RemoveDialog
        open={removing}
        endpoint="devices"
        itemId={deviceId}
        onResult={(removed) => handleRemove(removed)}
      /> */}
    </div>
  );
};

export default Popup;
