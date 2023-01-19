import React from "react";
import { Dialog, Box, IconButton, Slide, Tab, CardMedia } from "@mui/material";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import { makeStyles } from "@mui/styles";
import CloseIcon from "@mui/icons-material/Close";
import { useDispatch } from "react-redux";
import { devicesActions } from "../../store";

const useStyles = makeStyles((theme) => {
  const appbarHeight = 64;
  return {
    root: { top: `${appbarHeight}px !important` },
    tabs: {
      background: "transparent",
      padding: 0,
    },
    iframe: {
      width: "100%",
      aspectRatio: "4/2",
    },
  };
});

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const CameraCard = () => {
  const classes = useStyles();
  const dispatch = useDispatch();

  const [value, setValue] = React.useState("1");

  const handleTabChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleClose = () => {
    dispatch(devicesActions.updateShowCamera(false));
  };

  return (
    <Dialog
      className={classes.root}
      fullScreen
      open={true}
      TransitionComponent={Transition}
    >
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <IconButton
          edge="start"
          color="inherit"
          onClick={handleClose}
          aria-label="close"
        >
          <CloseIcon />
        </IconButton>
      </Box>
      <Box sx={{ width: "100%", typography: "body1" }}>
        <TabContext value={value}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <TabList
              onChange={handleTabChange}
              aria-label="lab API tabs example"
              className={classes.tabs}
            >
              <Tab label="Camera 1" value="1" />
              <Tab label="Camera 2" value="2" />
              <Tab label="Camera 3" value="3" />
              <Tab label="All" value="4" />
            </TabList>
          </Box>
          <TabPanel value="1">
            <iframe
              className={classes.iframe}
              allowFullScreen={true}
              src="http://stream.rcj.care/808gps/open/player/video.html?lang=en&vehiIdno=361290&account=admin=admin&password=Hqasem13579!&channel=1&chns=0"
            ></iframe>
          </TabPanel>
          <TabPanel value="2">
            <iframe
              className={classes.iframe}
              allowFullScreen={true}
              src="http://stream.rcj.care/808gps/open/player/video.html?lang=en&vehiIdno=361290&account=admin=admin&password=Hqasem13579!&channel=1&chns=0"
            ></iframe>
          </TabPanel>
          <TabPanel value="3">
            <iframe
              className={classes.iframe}
              allowFullScreen={true}
              src="http://stream.rcj.care/808gps/open/player/video.html?lang=en&vehiIdno=361290&account=admin=admin&password=Hqasem13579!&channel=1&chns=0"
            ></iframe>
          </TabPanel>
          <TabPanel className={classes.tabPanelAll} value="4">
            <iframe
              className={classes.iframe}
              allowFullScreen={true}
              src="http://stream.rcj.care/808gps/open/player/video.html?lang=en&vehiIdno=361290&account=admin=admin&password=Hqasem13579!&channel=3&chns=0,1,2"
            />
          </TabPanel>
        </TabContext>
      </Box>
    </Dialog>
  );
};

export default CameraCard;
