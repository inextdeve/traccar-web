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
  const apiKey = useSelector((state) => state.session.user.attributes.apitoken);

  // Table Data Processing
  const columnsHead = [
    "trackCode",
    "numberOfBins",
    "time",
    "empted",
    "notEmpted",
    "completionRate",
    "actions",
  ];
  const keys = [
    "route",
    "total",
    "shift",
    "empty_bin",
    "un_empty_bin",
    "rate",
    "actions",
  ];
  const token = useSelector((state) => state.session.user.attributes.apitoken);

  useEffect(() => {
    // setIsLoading(true);
    fetch(`${URL}/api/bins/by/route`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((data) => {
        // setIsLoading(false);
        return data.json();
      })
      .then((data) => {
        // setTableData(data);
        dispatch(analyticsActions.updateItems(data));
      })
      .catch(() => setIsLoading(false));
  }, []);

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
          Content
        </Box>
      </div>
    </PageLayout>
  );
};

export default Simulator;
