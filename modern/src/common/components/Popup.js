import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
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
  TableHead,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import CloseIcon from "@mui/icons-material/Close";

import DeleteIcon from "@mui/icons-material/Delete";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";

import ControlPointIcon from "@mui/icons-material/ControlPoint";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";

import { green, red } from "@mui/material/colors";

import moment from "moment";
import { toast } from "react-toastify";
import { useTranslation } from "./LocalizationProvider";
import RemoveDialog from "./RemoveDialog";

import { devicesActions } from "../../store";
import { useCatch } from "../../reactHelper";

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

const Popup = ({ onClose, desktopPadding = 0 }) => {
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

  // MY Code
  const popup = useSelector((state) => state.analytics.popup);
  const binData = useSelector((state) => state.analytics.binData);
  const [showMore, setShowMore] = useState(false);

  const toggleDetails = () => {
    setShowMore((prev) => !prev);
  };

  const lastOperation = () => {
    console.log("From Last Op", binData[1].last7days);
    const last7days = binData[1].last7days.filter((item) => item.datetime);

    return last7days[last7days.length - 1]?.datetime || "-";
  };
  const sendMessage = () => {
    const msg = `Hello! hisham
                JCR Cleaning Project 
                Alarm Bin Not Empty 
                DateTime: 2022-12-29 20:39:47
                Bin no: ${popup.id}
                RoutNo: QU 1008 S1
                Area: Hijar 1
                Bin Type: ${popup.binType}
                Last Time Emptied: ${lastOperation()}
                https://www.google.com/maps/place/24.4237354,39.6328711`;

    const data = fetch("https://api.ultramsg.com/instance27714/messages/chat", {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
      body: `token=x6lf1axmx0kmiimb&to=+212704866309&body=${msg}&priority=1&referenceId=`,
    });

    toast.promise(data, {
      pending: t("sending"),
      success: t("sent"),
      error: t("sentError"),
    });
  };

  return (
    <div className={classes.root}>
      {popup.show && (
        <Draggable handle={`.${classes.media}, .${classes.header}`}>
          <Card elevation={3} className={classes.card}>
            <Box
              className={classes.header}
              sx={{
                backgroundColor: `${
                  binData &&
                  (binData[0]?.status === "empty" ? green[500] : red[500])
                }`,
                color: "white",
              }}
            >
              <Typography variant="body2">Details</Typography>
              <IconButton size="small" onClick={onClose} onTouchStart={onClose}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
            {binData ? (
              <CardContent className={classes.content}>
                <Table size="small" classes={{ root: classes.table }}>
                  <TableBody>
                    <StatusRow name={t("id")} content={popup.id} />
                    <StatusRow name={t("binType")} content={popup.binType} />
                    <StatusRow
                      name={t("status")}
                      content={
                        <span
                          style={{
                            color: `${
                              binData[0].status === "empty"
                                ? green[500]
                                : red[500]
                            }`,
                          }}
                        >
                          {binData[0].status}
                        </span>
                      }
                    />
                    <StatusRow
                      name={t("lastOperation")}
                      content={moment(lastOperation()).format(
                        "MMM Do YY, H:mm"
                      )}
                    />
                    {binData[0].status === "empty" ? (
                      <>
                        <StatusRow name="Driver" content={binData[0].driver} />
                        <StatusRow
                          name={t("position")}
                          content={`${binData[0].latitude}, ${binData[0].longitude}`}
                        />
                        <StatusRow
                          name={t("position")}
                          content={
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${binData[0].latitude},${binData[0].longitude}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Google Map
                            </a>
                          }
                        />
                      </>
                    ) : null}
                  </TableBody>
                </Table>
                {showMore && (
                  <Box xs={{ mt: "2rem" }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>
                            <Typography variant="body2">Status</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">Last Empted</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">By</Typography>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {binData[1].last7days.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell className={classes.cell}>
                              <Typography variant="body2" color="textSecondary">
                                {item.status}
                              </Typography>
                            </TableCell>
                            <TableCell className={classes.cell}>
                              <Typography variant="body2" color="textSecondary">
                                {item.datetime
                                  ? moment(item.datetime).format(
                                      "MMM Do YY, H:mm"
                                    )
                                  : "-"}
                              </Typography>
                            </TableCell>
                            <TableCell className={classes.cell}>
                              <Typography variant="body2" color="textSecondary">
                                {item.emptied_by}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Box>
                )}
              </CardContent>
            ) : (
              <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
                <CircularProgress />
              </Box>
            )}

            <CardActions classes={{ root: classes.actions }} disableSpacing>
              <IconButton color="secondary" onClick={toggleDetails}>
                {showMore ? <RemoveCircleOutlineIcon /> : <ControlPointIcon />}
              </IconButton>
              <IconButton
                color="secondary"
                onClick={sendMessage}
                disabled={binData ? binData[0]?.status !== "empty" : true}
              >
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
