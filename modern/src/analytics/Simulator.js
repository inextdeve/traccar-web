import React, { useEffect, useRef, useState, useCallback } from "react";
import moment from "moment";
import { useDispatch, useSelector } from "react-redux";

import {
  Grid,
  Typography,
  Box,
  Skeleton,
  Button,
  Tabs,
  Tab,
  LinearProgress,
  IconButton,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import MapIcon from "@mui/icons-material/Map";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import { useTheme } from "@mui/material/styles";
import { analyticsActions } from "../store";

import Print from "./common/Print";
import PageLayout from "../common/components/PageLayout";
import useReportStyles from "./common/useReportStyles";
import ReportsMenu from "./components/ReportsMenu";
import AnalyticsTable from "./components/AnalyticsTable";
import { useTranslation } from "../common/components/LocalizationProvider";
import ReportFilter from "./components/ReportFilter";
import GMap from "./components/GoogleMap";

import sendMessage from "../common/util/sendMessage";
import BinsChart from "./components/Charts/BinsChart";
import BinsPercentageChart from "./components/Charts/BinsPercentageChart";
import BinsStatusChart from "./components/Charts/BinsStatusChart";
import ExcelExport from "./components/ExcelExport";
import PrintingHeader from "../common/components/PrintingHeader";

import MapAnalytics from "../map/MapAnalytics";
import Popup from "../common/components/Popup";
import { URL } from "../common/util/constant";

const Simulator = () => {
  const classes = useReportStyles();
  const t = useTranslation();
  const dispatch = useDispatch();
  const theme = useTheme();

  const [route, setRoute] = useState("");
  const loca = ["33.3754879,-8.0087335", "33.2334864,-8.5242641", "33.0497165,-8.687911", "32.9542232,-8.6994071", "32.8833501,-8.6769667", "32.7673477,-8.7359118", "32.6040652,-8.9143387", "32.2458345,-8.5462353", "31.6347411,-8.0902537", "31.3528488,-7.9559362", "30.9890276,-8.2000208", "30.8805213,-10.4413758", "30.8805213,-10.4413758", "29.7010105,-9.7511263", "29.6103325,-9.8781819", "29.5785859,-10.0623824", "29.3666527,-10.2170285", "28.9653313,-10.6043879", "28.4306906,-11.1191513", "28.4858899,-11.3590052"]
  const [wayPoints, setWayPoints] = useState([{
    location: "33.9693338,-6.9396633"
  },{
    location: "33.909968,-6.9794782"
  },
  {
    location: "33.8439625,-7.0959533"
  }, {
    location: "33.7402036,-7.296381"
  }, {
    location: "33.572037, -7.591169"
  },
{location:"33.4215329,-7.8540586"}]);

  // WayPoints Object
  // location: `${waypoint.latitude},${waypoint.longitude}`

  const apiKey = useSelector((state) => state.session.user.attributes.apitoken);

  const token = useSelector((state) => state.session.user.attributes.apitoken);

  // useEffect(() => {
  //   // setIsLoading(true);
  //   fetch(`${URL}/api/bins/by/route`, {
  //     headers: { Authorization: `Bearer ${token}` },
  //   })
  //     .then((data) => {
  //       // setIsLoading(false);
  //       return data.json();
  //     })
  //     .then((data) => {
  //       // setTableData(data);
  //       dispatch(analyticsActions.updateItems(data));
  //     })
  //     .catch(() => setIsLoading(false));
  // }, []);

  useEffect(() => {
    console.log("render page simulator")
  }, [])

  const handleClick = () => {};

  return (
    <PageLayout menu={<ReportsMenu />} breadcrumbs={["analytics", "reportBin"]}>
      <div className={classes.container}>
        <Box className={classes.containerMain} sx={{ p: 2 }}>
          <Box
            sx={{
              display: "flex",
              gap: "0.5rem",
              margin: "1rem 0",
            }}
          >
            <FormControl sx={{ width: 1 / 4 }}>
              <InputLabel>{t("reportRoute")}</InputLabel>
              <Select
                label={t("reportRoute")}
                value={route}
                onChange={(e) => setRoute(e.target.value)}
              >
                <MenuItem selected value="HCV-23">
                  HCV-32
                </MenuItem>
              </Select>
            </FormControl>
            <Button variant="contained" color="secondary" onClick={handleClick}>
              {t("reportShow")}
            </Button>
          </Box>
          <Box>
            <GMap waypoints={wayPoints}></GMap>
          </Box>
        </Box>
      </div>
    </PageLayout>
  );
};

export default Simulator;
