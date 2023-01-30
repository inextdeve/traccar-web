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
} from "@mui/material";
import MapIcon from "@mui/icons-material/Map";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import ImageIcon from "@mui/icons-material/Image";
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

const BinsReports = () => {
  const classes = useReportStyles();
  const t = useTranslation();
  const dispatch = useDispatch();
  const TableRef = useRef(null);
  const theme = useTheme();
  const url = "https://bins.rcj.care/api";

  const countTotal = (array, prop) =>
    array.map((item) => parseFloat(item[prop])).reduce((n, c) => n + c, 0);

  const countRate = (total, n) => (n * 100) / total;

  const token = useSelector((state) => state.session.user.attributes.apitoken);
  const loading = useSelector((state) => state.analytics.loading);
  const setIsLoading = (state) =>
    dispatch(analyticsActions.updateLoading(state));
  const [mapLoading, setMapLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(false);

  const generateMessage = async (tag, id, driverName, routeName) => {
    const url = `${URL}/?token=${token}&bins&limit=0;10&${tag}=${id}&status=unempty`;

    const data = await fetch(url);
    const unemptyBins = await data.json();

    const bins = unemptyBins
      .map(
        (item, index) => `${index} - 
              Bin Code: ${item.id_bin}
              Bin Type: ${item.bintype}
              https://www.google.com/maps/place/${item.longitude},${item.latitude}
              ** `
      )
      .join("\n");

    return `
          Hello! ${driverName}
          JCR Cleaning Project 
          
          Alarm Bins Not Empty 
          DateTime ${moment().format("MMMM Do YYYY, h:mm:ss a")}
          RoutNo: ${routeName}
          
          ${bins}
          `;
  };
  // MAP Proceessing
  const mapButtonClick = useCallback(async ({ id, tag }) => {
    setSelectedItem(true);
    setMapLoading(null);
    const url = `${URL}/?token=${token}&${tag}=${id}`;
    const data = await fetch(url);

    setMapLoading(false);
    const positions = await data.json();
    dispatch(
      analyticsActions.updatePositions(
        [positions[0]].map(
          ({ id_bin, status, latitude, longitude, bintype }) => ({
            id: id_bin,
            category: `${
              status === "unempty" ? "trashNegative" : "trashPositive"
            }`,
            latitude,
            longitude,
            binType: bintype,
          })
        )
      )
    );
  });

  // Table Data Processing
  const columnsHead = [
    "reportID",
    "date",
    "binName",
    "reportType",
    "area",
    "reporterName",
    "reporterPhone",
    "status",
    "actions",
  ];
  const keys = [
    "reportId",
    "time",
    "description_bin",
    "reportType",
    "area",
    "username",
    "phone",
    "status",
    "actions",
  ];
  const data = useSelector((state) => state.analytics.items);
  const [tableData, setTableData] = useState(data);

  const items = tableData.map((item) => {
    const requestParams = {
      id: item.id_bin,
      tag: "bin",
    };

    return {
      ...item,
      actions: (
        <>
          <IconButton color="secondary" onClick={() => {}} disabled={false}>
            <ImageIcon />
          </IconButton>
          <IconButton onClick={() => mapButtonClick(requestParams)}>
            <MapIcon />
          </IconButton>
        </>
      ),
    };
  });

  useEffect(() => {
    setIsLoading(true);
    fetch(
      `${url}/?token=${token}&report_bins&time_f=00%3A00&date_f=2023-01-26&time_t=23%3A59&date_t=2023-01-26`
    )
      .then((data) => {
        setIsLoading(false);
        return data.json();
      })
      .then((data) => {
        setTableData(data);
        dispatch(analyticsActions.updateItems(data));
      })
      .catch(() => setIsLoading(false));
  }, []);

  const onClose = () => {
    dispatch(analyticsActions.updatePopup(false));
    dispatch(analyticsActions.updateBinData(null));
  };
  return (
    <PageLayout menu={<ReportsMenu />} breadcrumbs={["analytics", "reportBin"]}>
      <div className={classes.container}>
        <Popup
          desktopPadding={theme.dimensions.drawerWidthDesktop}
          onClose={onClose}
        />
        {selectedItem && (
          <div className={classes.containerMap}>
            <MapAnalytics />
          </div>
        )}
        {mapLoading ?? <LinearProgress sx={{ padding: "0.1rem" }} />}
        <Box className={classes.containerMain} sx={{ p: 2 }}>
          <Box
            sx={{
              display: "flex",
              gap: "0.5rem",
              margin: "1rem 0",
            }}
          >
            <ReportFilter tag="report_bins" altURL={url} />
            <ExcelExport excelData={items} fileName="ReportSheet" />
            <Print
              target={TableRef.current}
              button={
                <Button
                  variant="contained"
                  color="secondary"
                  className={classes.filterButton}
                >
                  {t("print")}
                </Button>
              }
            />
          </Box>
          <Box ref={TableRef}>
            <PrintingHeader />
            <AnalyticsTable
              columnsHead={columnsHead}
              items={items}
              keys={keys}
            />
          </Box>
        </Box>
      </div>
    </PageLayout>
  );
};

export default BinsReports;
