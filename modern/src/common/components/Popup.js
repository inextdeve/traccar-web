import React, { useState } from "react";
import { useSelector } from "react-redux";
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
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import ControlPointIcon from "@mui/icons-material/ControlPoint";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import { green, red } from "@mui/material/colors";
import moment from "moment";
import sendMessage from "../util/sendMessage";
import { useTranslation } from "./LocalizationProvider";

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
  const t = useTranslation();

  const popup = useSelector((state) => state.analytics.popup);
  const binData = useSelector((state) => state.analytics.binData);
  const [showMore, setShowMore] = useState(false);

  const toggleDetails = () => {
    setShowMore((prev) => !prev);
  };

  const lastOperation = () => {
    const last7days = binData[1].last7days.filter((item) => item.datetime);

    return last7days[last7days.length - 1]?.datetime || "-";
  };

  const generateMessage = () => {
    return `Hello! ${binData[0].driver}
                JCR Cleaning Project 
                Alarm Bin Not Empty 
                DateTime: ${moment().format("MMMM Do YYYY, h:mm:ss a")}
                Bin no: ${popup.id}
                RoutNo: ${binData[0].route}
                Area: ${binData[0].center}
                Bin Type: ${popup.binType}
                Last Time Emptied: ${lastOperation()}
                https://www.google.com/maps/place/${binData[0].latitude},${
      binData[0].longitude
    }`;
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
                    <StatusRow
                      name={t("sharedDescription")}
                      content={binData[0].description}
                    />
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
                    <StatusRow
                      name={t("emptiedBy")}
                      content={binData[0].emptied_by}
                    />
                    <StatusRow
                      name={t("sharedDriver")}
                      content={binData[0].driver}
                    />
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
                        {[...binData[1].last7days]
                          .reverse()
                          .map((item, index) => (
                            <TableRow key={index}>
                              <TableCell className={classes.cell}>
                                <Typography
                                  variant="body2"
                                  style={{
                                    color: `${
                                      item.status === "empty"
                                        ? "#4caf50"
                                        : "#f44336"
                                    }`,
                                  }}
                                >
                                  {item.status}
                                </Typography>
                              </TableCell>
                              <TableCell className={classes.cell}>
                                <Typography
                                  variant="body2"
                                  style={{
                                    color: `${
                                      item.status === "empty"
                                        ? "#4caf50"
                                        : "#f44336"
                                    }`,
                                  }}
                                >
                                  {item.datetime
                                    ? moment(item.datetime).format(
                                        "MMM Do YY, H:mm"
                                      )
                                    : "-"}
                                </Typography>
                              </TableCell>
                              <TableCell className={classes.cell}>
                                <Typography
                                  variant="body2"
                                  style={{
                                    color: `${
                                      item.status === "empty"
                                        ? "#4caf50"
                                        : "#f44336"
                                    }`,
                                  }}
                                >
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
                onClick={() =>
                  sendMessage(generateMessage(), binData[0].driver_phone)
                }
                disabled={binData ? !binData[0]?.driver_phone : true}
              >
                <WhatsAppIcon />
              </IconButton>
            </CardActions>
          </Card>
        </Draggable>
      )}
    </div>
  );
};

export default Popup;
