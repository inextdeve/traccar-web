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
  Divider,
} from "@mui/material";
import ImageIcon from "@mui/icons-material/Image";
import makeStyles from "@mui/styles/makeStyles";
import CloseIcon from "@mui/icons-material/Close";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import ControlPointIcon from "@mui/icons-material/ControlPoint";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import FlagIcon from "@mui/icons-material/Flag";
import { green, red } from "@mui/material/colors";
import moment from "moment";
import Carousel from "react-material-ui-carousel";
import ArrowBack from "@mui/icons-material/ArrowBack";
import LaunchIcon from "@mui/icons-material/Launch";
import { useTranslation } from "./LocalizationProvider";
import sendMessage from "../util/sendMessage";

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
  imageReportTag: {
    borderRadius: "0.5rem",
    color: "white",
    padding: "0 8px",
    fontSize: "0.99rem",
    lineHeight: "32px",
  },
  tagNegative: {
    background: theme.palette.colors.negative,
  },
  tagPositive: {
    background: theme.palette.colors.positive,
  },
  repImgContainer: {
    position: "relative",
  },
  launchLink: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    width: "100%",
    backgroundColor: "#00000099",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    opacity: 0,
    color: "#FFF",
    "&:hover": {
      opacity: 1,
    },
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
const Item = (props) => {
  const classes = useStyles();
  return (
    <div className={classes.repImgContainer}>
      {props.launchLink && (
        <a
          href={props.item}
          target="_blank"
          className={classes.launchLink}
          rel="noreferrer"
        >
          <LaunchIcon />
        </a>
      )}
      <img
        style={{ objectFit: "contain", maxHeight: "300px" }}
        width="100%"
        src={props.item}
        alt="report-image"
      />
    </div>
  );
};
const Popup = ({ onClose, desktopPadding = 0 }) => {
  const classes = useStyles({ desktopPadding });
  const t = useTranslation();

  const popup = useSelector((state) => state.analytics.popup);
  const binData = useSelector((state) => state.analytics.binData);
  const [showMore, setShowMore] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showImages, setShowImages] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const toggleDetails = () => {
    setShowReport(false);
    setShowMore((prev) => !prev);
  };
  const toggleReport = () => {
    setShowMore(false);
    setShowReport((prev) => !prev);
  };
  const lastOperation = () => {
    const last7Days = binData[1].last7Days.filter((item) => item.emptedTime);

    return last7Days[last7Days.length - 1]?.emptedTime || "-";
  };

  const generateMessage = () => `Hello! ${binData[0].driverName}
                JCR Cleaning Project 
                Alarm Bin Not Empty 
                DateTime: ${moment(
    new Intl.DateTimeFormat("sv-SE", {
      timeZone: "Asia/Riyadh",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(new Date()),
  ).format("MMMM Do YYYY, h:mm:ss a")}
                Bin no: ${binData[0].description}
                RoutNo: ${binData[0].route}
                Area: ${binData[0].center}
                Bin Type: ${popup.binType}
                Last Time Emptied: ${lastOperation()}
                https://www.google.com/maps/place/${binData[0].latitude},${
  binData[0].longitude
}`;

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
                      content={(
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
                      )}
                    />
                    <StatusRow
                      name={t("lastOperation")}
                      content={moment(lastOperation()).format(
                        "MMM Do YY, H:mm",
                      )}
                    />
                    <StatusRow
                      name={t("emptiedBy")}
                      content={binData[0].emptied_by}
                    />
                    <StatusRow
                      name={t("sharedDriver")}
                      content={binData[0].driverName}
                    />
                    <StatusRow
                      name={t("position")}
                      content={`${binData[0].latitude}, ${binData[0].longitude}`}
                    />
                    <StatusRow
                      name={t("position")}
                      content={(
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${binData[0].latitude},${binData[0].longitude}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Google Map
                        </a>
                      )}
                    />
                  </TableBody>
                </Table>
                {showReport && (
                  <Box xs={{ mt: "2rem" }}>
                    {showImages ? (
                      <Box>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            my: 1,
                          }}
                        >
                          <IconButton onClick={() => setShowImages(false)}>
                            <ArrowBack />
                          </IconButton>
                          {selectedImage ? (
                            <span
                              className={`${classes.tagPositive} ${classes.imageReportTag}`}
                            >
                              After
                            </span>
                          ) : (
                            <span
                              className={`${classes.tagNegative} ${classes.imageReportTag}`}
                            >
                              Before
                            </span>
                          )}
                        </Box>
                        <Carousel
                          indicators={false}
                          navButtonsAlwaysVisible
                          autoPlay={false}
                          height={300}
                          onChange={(e) => setSelectedImage(e)}
                        >
                          {[binData[2].img, binData[2].imgafter].map(
                            (item, i) => {
                              if (!item) {
                                return (
                                  <Item
                                    key={i}
                                    title={i === 0 ? "Report Image" : "After"}
                                    item="https://panthertech.fiu.edu/scs/extensions/SC/Manor/3.3.0/img/no_image_available.jpeg"
                                    launchLink={false}
                                  />
                                );
                              }
                              return (
                                <Item
                                  key={i}
                                  title={i === 0 ? "Report Image" : "After"}
                                  item={item}
                                  launchLink
                                />
                              );
                            },
                          )}
                        </Carousel>
                      </Box>
                    ) : (
                      <>
                        <Divider />
                        <Table size="small">
                          <TableBody>
                            <TableRow>
                              <TableCell className={classes.cell}>
                                <Typography variant="subtitle2">
                                  {t("reportType")}
                                </Typography>
                              </TableCell>
                              <TableCell className={classes.cell}>
                                <Typography variant="body2">
                                  {binData[2].type}
                                </Typography>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className={classes.cell}>
                                <Typography variant="subtitle2">
                                  {t("sharedDescription")}
                                </Typography>
                              </TableCell>
                              <TableCell className={classes.cell}>
                                <Typography variant="body2">
                                  {binData[2].description}
                                </Typography>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className={classes.cell}>
                                <Typography variant="subtitle2">
                                  {t("status")}
                                </Typography>
                              </TableCell>
                              <TableCell className={classes.cell}>
                                <Typography variant="body2">
                                  {parseInt(binData[2].status)
                                    ? t("done")
                                    : t("processing")}
                                </Typography>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className={classes.cell}>
                                <Typography variant="subtitle2">
                                  {t("reporterName")}
                                </Typography>
                              </TableCell>
                              <TableCell className={classes.cell}>
                                <Typography variant="body2">
                                  {binData[2].username}
                                </Typography>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className={classes.cell}>
                                <Typography variant="subtitle2">
                                  {t("reporterPhone")}
                                </Typography>
                              </TableCell>
                              <TableCell className={classes.cell}>
                                <Typography variant="body2">
                                  {binData[2].phone}
                                </Typography>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className={classes.cell}>
                                <Typography variant="subtitle2">
                                  {t("images")}
                                </Typography>
                              </TableCell>
                              <TableCell className={classes.cell}>
                                <IconButton
                                  color="solidBlue"
                                  onClick={() => setShowImages(true)}
                                >
                                  <ImageIcon />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </>
                    )}
                  </Box>
                )}
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
                        {[...binData[1].last7Days]
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
                                  {item.emptedTime
                                    ? moment(item.emptedTime).format(
                                      "MMM Do YY, H:mm",
                                    )
                                    : moment(item.date).format("MMM Do YY")}
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
                                  {item.emptiedBy}
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
              <Box>
                {binData && binData[2] ? (
                  <IconButton color="negative" onClick={toggleReport}>
                    <FlagIcon />
                  </IconButton>
                ) : null}
                <IconButton
                  color="secondary"
                  onClick={() => sendMessage(generateMessage(), binData[0].driver_phone)}
                  disabled={binData ? !binData[0]?.driver_phone : true}
                >
                  <WhatsAppIcon />
                </IconButton>
              </Box>
            </CardActions>
          </Card>
        </Draggable>
      )}
    </div>
  );
};

export default Popup;
