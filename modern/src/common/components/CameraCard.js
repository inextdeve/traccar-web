import React from "react";
import { Box, Tab, Tabs } from "@mui/material";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import { makeStyles } from "@mui/styles";
import { useDispatch } from "react-redux";

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

const CameraCard = () => {
  const classes = useStyles();

  const [value, setValue] = React.useState("1");

  const handleTabChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <>
      <Box>
        <TabContext value={value}>
          <Box
            sx={{ maxWidth: { xs: 320, sm: 480 }, bgcolor: "background.paper" }}
          >
            <Tabs
              value={value}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              aria-label="scrollable auto tabs example"
            >
              <Tab value="1" label="Front" />
              <Tab value="2" label="Back" />
              <Tab value="3" label="Driver" />
              <Tab value="4" label="All" />
            </Tabs>
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
    </>
  );
};

export default CameraCard;
