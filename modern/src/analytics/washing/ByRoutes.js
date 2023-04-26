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
import { useTheme } from "@mui/material/styles";
import { analyticsActions } from "../../store";

import Print from "../common/Print";
import PageLayout from "../../common/components/PageLayout";
import useReportStyles from "../common/useReportStyles";
import ReportsMenu from "../components/ReportsMenu";
import AnalyticsTable from "../components/AnalyticsTable";
import { useTranslation } from "../../common/components/LocalizationProvider";
import ReportFilter from "../components/ReportFilter";

import sendMessage from "../../common/util/sendMessage";
import BinsChart from "../components/Charts/BinsChart";
import BinsPercentageChart from "../components/Charts/BinsPercentageChart";
import BinsStatusChart from "../components/Charts/BinsStatusChart";
import ExcelExport from "../components/ExcelExport";
import PrintingHeader from "../../common/components/PrintingHeader";

import MapAnalytics from "../../map/MapAnalytics";
import Popup from "../../common/components/Popup";

import { URL } from "../../common/util/constant";

const WashingRoutes = () => {
  const classes = useReportStyles();
  const t = useTranslation();
  const dispatch = useDispatch();
  const TableRef = useRef(null);
  const theme = useTheme();

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
    const url = `${URL}/api/bins?${tag}=${id}&status=unempted`;

    const data = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const unemptyBins = await data.json();

    const bins = unemptyBins
      .map(
        (item, index) => `${index} - 
              Bin Code: ${item.id_bin}
              Bin Type: ${item.bintype}
              https://www.google.com/maps/place/${item.latitude},${item.longitude}
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
    const url = `${URL}/api/bins?${tag}=${id}`;
    const data = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setMapLoading(false);
    const positions = await data.json();
    dispatch(
      analyticsActions.updatePositions(
        positions.map(({ id_bin, status, latitude, longitude, bintype }) => ({
          id: id_bin,
          category: `${
            status === "unempty" ? "trashNegative" : "trashPositive"
          }`,
          latitude,
          longitude,
          binType: bintype,
        }))
      )
    );
  });

  // Table Data Processing
  const columnsHead = [
    "trackCode",
    "numberOfBins",
    "time",
    "cleaned",
    "notCleaned",
    "completionRate",
    "actions",
  ];
  const keys = [
    "route",
    "total",
    "shift",
    "cleaned",
    "not_cleaned",
    "rate",
    "actions",
  ];
  const data = useSelector((state) => state.analytics.items);
  const [tableData, setTableData] = useState(data);

  const items = tableData.map((item) => {
    const requestParams = {
      id: item.routeId,
      tag: "routid",
    };

    return {
      ...item,
      rate: `${countRate(item.total, item.cleaned).toFixed(2)}%`,
      actions: (
        <>
          <IconButton
            color="secondary"
            onClick={() =>
              sendMessage(
                generateMessage(
                  "routeId",
                  item.routeId,
                  item.driver,
                  item.route
                ),
                item.phone
              )
            }
            disabled={false}
          >
            <WhatsAppIcon />
          </IconButton>
          <IconButton onClick={() => mapButtonClick(requestParams)}>
            <MapIcon />
          </IconButton>
        </>
      ),
    };
  });
  items.push({
    route: t("total"),
    total: countTotal(items, "total"),
    cleaned: countTotal(items, "cleaned"),
    not_cleaned: countTotal(items, "not_cleaned"),
    rate: `${(countTotal(items, "rate") / items.length).toFixed(2)}%`,
  });

  // Data for charts drop Total item
  const chartData = items.slice(0, -1);

  useEffect(() => {
    setIsLoading(true);

    fetch(`${URL}/api/washing/by/route`, {
      headers: { Authorization: `Bearer ${token}` },
    })
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

  const handleSubmit = ({ from, to }) => {
    const query = new URLSearchParams({
      from,
      to,
    });

    const url = `${URL}/api/washing/by/route?${query.toString()}`;

    setIsLoading(true);
    fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((data) => data.json())
      .then((data) => {
        dispatch(analyticsActions.updateItems(data));
        setIsLoading(false);
      });
  };

  const filterRoutes = (filter) => {
    if (filter === 1) {
      setTableData(data.filter((item) => item.shift === "morning"));
    } else if (filter === 2) {
      setTableData(data.filter((item) => item.shift === "night"));
    } else {
      setTableData(data);
    }
  };

  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    filterRoutes(newValue);
    setValue(newValue);
  };

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
            <ReportFilter handleSubmit={handleSubmit} />
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
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              marginTop: "2rem",
              marginBottom: "1rem",
            }}
          >
            <Tabs
              value={value}
              onChange={handleChange}
              indicator={{ height: 0 }}
              className="filterTab"
              indicatorColor="transparent"
              centered
              sx={{ display: "flex", justifyContent: "center", mt: "2rem" }}
            >
              <Tab label="All" />
              <Tab label="Morning" />
              <Tab label="Night" />
            </Tabs>
          </Box>
          <Box ref={TableRef}>
            <PrintingHeader />
            <AnalyticsTable
              columnsHead={columnsHead}
              items={items}
              keys={keys}
            />
            {!loading ? (
              <Typography
                component="h3"
                variant="h3"
                sx={{ textAlign: "center", p: 3 }}
              >
                {t("overview")}
              </Typography>
            ) : (
              <Skeleton
                animation="wave"
                variant="rounded"
                width={210}
                height={60}
                sx={{ textAlign: "center", my: 3, mx: "auto" }}
              />
            )}
            <Grid container className={classes.charts}>
              {!loading ? (
                <>
                  <Grid item xs={12} lg={5} className={classes.chart}>
                    <BinsChart
                      key1="Cleaned"
                      key2="Uncleaned"
                      title={t("binsStatus")}
                      subtitle={t(
                        "theProportionOfTheCleanedBinsAndTheUncleaned"
                      )}
                      bins={[
                        {
                          name: "Cleaned",
                          value:
                            countTotal(chartData, "rate") / chartData.length,
                        },
                        {
                          name: "Uncleaned",
                          value:
                            100 -
                            countTotal(chartData, "rate") / chartData.length,
                        },
                      ]}
                    />
                  </Grid>
                  <Grid xs={12} lg={6} item className={classes.chart}>
                    <BinsPercentageChart
                      title={t("theProportionOfEachBinsType")}
                      subtitle={t("theProportionOfEachBinType")}
                      data={chartData.map((item) => ({
                        name: item.bintype,
                        value: parseInt(item.total, 10),
                      }))}
                    />
                  </Grid>
                  <Grid xs={12} item className={classes.chart}>
                    <BinsStatusChart
                      key1="cleaned"
                      key2="uncleaned"
                      title={t("binsStatusByTrack")}
                      subtitle={t(
                        "theProportionOfTheCleanedBinsAndTheUncleaned"
                      )}
                      bins={chartData.map((item) => {
                        const cleaned = (item.cleaned * 100) / item.total;

                        return {
                          name: item.route,
                          cleaned: countRate(item.total, item.cleaned).toFixed(
                            2
                          ),
                          uncleaned: 100 - cleaned,
                          amt: 100,
                        };
                      })}
                    />
                  </Grid>
                </>
              ) : null}
            </Grid>
          </Box>
        </Box>
      </div>
    </PageLayout>
  );
};

export default WashingRoutes;
