import React, {
  useEffect, useRef, useState, useCallback,
} from "react";
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
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";
import Print from "./common/Print";
import PageLayout from "../common/components/PageLayout";
import useReportStyles from "./common/useReportStyles";
import ReportsMenu from "./components/ReportsMenu";
import AnalyticsTable from "./components/AnalyticsTable";
import { useTranslation } from "../common/components/LocalizationProvider";
import ReportFilter from "./components/ReportFilter";
import { analyticsActions } from "../store";
import sendMessage from "../common/util/sendMessage";
import BinsChart from "./components/Charts/BinsChart";
import BinsPercentageChart from "./components/Charts/BinsPercentageChart";
import BinsStatusChart from "./components/Charts/BinsStatusChart";
import ExcelExport from "./components/ExcelExport";
import PrintingHeader from "../common/components/PrintingHeader";

// MAP IMPORTS
import MapView from "../map/core/MapView";
import MapCamera from "../map/MapCamera";
import MapGeofence from "../map/MapGeofence";
import MapMarkersAnalytics from "../map/MapMarkersAnalytics";
import Popup from "../common/components/Popup";

const ByRoutes = () => {
  const classes = useReportStyles();
  const t = useTranslation();
  const dispatch = useDispatch();
  const TableRef = useRef(null);
  const theme = useTheme();

  const countTotal = (array, prop) => array.map((item) => parseFloat(item[prop])).reduce((n, c) => n + c, 0);

  const countRate = (total, n) => (n * 100) / total;

  const token = useSelector((state) => state.session.user.attributes.apitoken);
  const loading = useSelector((state) => state.analytics.loading);
  const setIsLoading = (state) => dispatch(analyticsActions.updateLoading(state));

  const positions = useSelector((state) => state.analytics.positions);
  const [mapLoading, setMapLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(false);

  const generateMessage = async (tag, id, driverName, routeName) => {
    const url = `https://med-reports.almajal.co/al/api/?token=${token}&bins&limit=0;10&${tag}=${id}&status=unempty`;
    console.log("URL,", url);
    const data = await fetch(url);
    const unemptyBins = await data.json();
    console.log("Data,", unemptyBins);
    const bins = unemptyBins
      .map(
        (item, index) => `${index} - 
              Bin Code: ${item.id_bin}
              Bin Type: ${item.bintype}
              https://www.google.com/maps/place/${item.longitude},${item.latitude}
              ** `,
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
    const url = `https://med-reports.almajal.co/al/api/?token=${token}&bins&limit=0;10&${tag}=${id}`;

    const data = await fetch(url);

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
        })),
      ),
    );
  });

  const onMarkClick = async (bin) => {
    const { id, binType } = JSON.parse(bin);

    dispatch(
      analyticsActions.updatePopup({
        show: true,
        id,
        binType,
      }),
    );
    dispatch(analyticsActions.updateBinData(null));

    const data = await fetch(
      `https://med-reports.almajal.co/al/api/?token=${token}&bin=${id}`,
    );

    const binData = await data.json();

    dispatch(analyticsActions.updateBinData(binData));
  };
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
    "route_name",
    "total",
    "shift",
    "empty_bin",
    "un_empty_bin",
    "rate",
    "actions",
  ];
  const data = useSelector((state) => state.analytics.items);
  const [tableData, setTableData] = useState(data);

  const items = tableData.map((item) => {
    const requestParams = {
      id: item.route_id,
      tag: "routid",
    };

    return {
      ...item,
      rate: `${countRate(item.total, item.empty_bin).toFixed(2)}%`,
      actions: (
        <>
          <IconButton
            color="secondary"
            onClick={() => sendMessage(
              generateMessage(
                "routid",
                item.route_id,
                item.driver,
                item.route_name,
              ),
              item.phone,
            )}
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
    route_name: t("total"),
    total: countTotal(items, "total"),
    empty_bin: countTotal(items, "empty_bin"),
    un_empty_bin: countTotal(items, "un_empty_bin"),
    rate: `${(countTotal(items, "rate") / items.length).toFixed(2)}%`,
  });

  // Data for charts drop Total item
  const chartData = items.slice(0, -1);

  useEffect(() => {
    setIsLoading(true);
    fetch(`https://med-reports.almajal.co/al/api/?token=${token}&bins_routes`)
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
            <MapView>
              <MapGeofence />
              <MapMarkersAnalytics
                positions={positions}
                onClick={onMarkClick}
              />
            </MapView>
            <MapCamera positions={positions} />
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
            <ReportFilter tag="bins_routes" />
            <ExcelExport excelData={items} fileName="ReportSheet" />
            <Print
              target={TableRef.current}
              button={(
                <Button
                  variant="contained"
                  color="secondary"
                  className={classes.filterButton}
                >
                  {t("advancedReportPrint")}
                </Button>
              )}
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
                Overview
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
                      title={t("binsStatus")}
                      subtitle={t("theProportionOfTheEmptedBinsAndTheUnempted")}
                      bins={[
                        {
                          name: "Empted",
                          value:
                            countTotal(chartData, "rate") / chartData.length,
                        },
                        {
                          name: "Unempted",
                          value:
                            100 -
                            countTotal(chartData, "rate") / chartData.length,
                        },
                      ]}
                    />
                  </Grid>
                  <Grid xs={12} lg={6} item className={classes.chart}>
                    <BinsPercentageChart
                      title={t("theProportionOfTracksCode")}
                      subtitle={t("theProportionOfEachTrackCode")}
                      data={chartData.map((item) => ({
                        name: item.route_name,
                        value: parseInt(item.total, 10),
                      }))}
                    />
                  </Grid>
                  <Grid xs={12} item className={classes.chart}>
                    <BinsStatusChart
                      title={t("binsStatusByTrack")}
                      subtitle={t(
                        "theProportionOfEmptedAndUnemptedBinsByTypes",
                      )}
                      bins={chartData.map((item) => {
                        const empted = (item.empty_bin * 100) / item.total;

                        return {
                          name: item.route_name,
                          empted: countRate(item.total, item.empty_bin).toFixed(
                            2,
                          ),
                          unempted: 100 - empted,
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

export default ByRoutes;
