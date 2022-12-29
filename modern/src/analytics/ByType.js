import React, {
  useEffect,
  useRef,
  Fragment,
  useState,
  useCallback,
} from "react";
import { Grid, Typography, Box, Skeleton, Button } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import Print from "./common/Print";
import PageLayout from "../common/components/PageLayout";
import useReportStyles from "./common/useReportStyles";
import ReportsMenu from "./components/ReportsMenu";
import { useTranslation } from "../common/components/LocalizationProvider";
import ReportFilter from "./components/ReportFilter";
import { analyticsActions } from "../store";
import AnalyticsTable from "./components/AnalyticsTable";
import BinsChart from "./components/Charts/BinsChart";
import BinsPercentageChart from "./components/Charts/BinsPercentageChart";
import BinsStatusChart from "./components/Charts/BinsStatusChart";
import ExcelExport from "./components/ExcelExport";
import PrintingHeader from "../common/components/PrintingHeader";
// MAP IMPORTS
import MapView, { map } from "../map/core/MapView";
import MapRoutePath from "../map/MapRoutePath";
import MapRoutePoints from "../map/MapRoutePoints";
import MapPositions from "../map/MapPositions";
import MapCamera from "../map/MapCamera";
import MapGeofence from "../map/MapGeofence";
import { Popup } from "maplibre-gl";

const ByType = () => {
  const classes = useReportStyles();
  const t = useTranslation();
  const dispatch = useDispatch();
  const TableRef = useRef(null);

  const countTotal = (array, prop) =>
    array.map((item) => parseFloat(item[prop])).reduce((n, c) => n + c, 0);

  const countRate = (total, n) => (n * 100) / total;

  const token = useSelector((state) => state.session.user.attributes.apitoken);
  const loading = useSelector((state) => state.analytics.loading);
  const setIsLoading = (state) =>
    dispatch(analyticsActions.updateLoading(state));

  // Table Data Processing
  const columnsHead = [
    "binType",
    "numberOfBins",
    "empted",
    "notEmpted",
    "completionRate",
  ];
  const data = useSelector((state) => state.analytics.items);
  const keys = ["bintype", "total", "empty_bin", "un_empty_bin", "rate"];
  const items = data.map((item) => ({
    ...item,
    rate: `${countRate(item.total, item.empty_bin).toFixed(2)}%`,
  }));
  items.push({
    bintype: t("total"),
    total: countTotal(items, "total"),
    empty_bin: countTotal(items, "empty_bin"),
    un_empty_bin: countTotal(items, "un_empty_bin"),
    rate: `${(countTotal(items, "rate") / items.length).toFixed(2)}%`,
  });
  // Data for charts drop Total item
  const chartData = items.slice(0, -1);

  useEffect(() => {
    setIsLoading(true);
    fetch(`https://med-reports.almajal.co/al/api/?token=${token}&binstype`)
      .then((data) => {
        setIsLoading(false);
        return data.json();
      })
      .then((data) => {
        console.log(JSON.stringify(data));
        dispatch(analyticsActions.updateItems(data));
      })
      .catch(() => setIsLoading(false));
  }, []);

  // MAP TESTING
  const test_bins = [
    {
      id: "1",
      bintype: "200 liters",
      total: 398,
      empty_bin: 16,
      un_empty_bin: 382,
      latitude: 27.06757,
      longitude: 49.60385,
    },
    {
      id: "2",
      bintype: "90 liters",
      total: 98,
      empty_bin: 7,
      un_empty_bin: 87,
      latitude: 32.06757,
      longitude: 49.60385,
    },
  ];

  const [selectedItem, setSelectedItem] = useState(true);
  const onMapPointClick = useCallback(
    (positionId) => {
      setSelectedItem(items.find((it) => it.id === positionId));
    },
    [items, setSelectedItem]
  );

  useEffect(() => {
    var popup = new Popup({ closeOnClick: false })
      .setLngLat([test_bins[0].longitude, test_bins[0].latitude])
      .setHTML("<h1>Hello World!</h1>")
      .addTo(map);
  });

  return (
    <PageLayout menu={<ReportsMenu />} breadcrumbs={["analytics", "reportBin"]}>
      <div className={classes.container}>
        {selectedItem && (
          <div className={classes.containerMap}>
            <MapView>
              <MapGeofence />

              <MapPositions positions={[test_bins[0]]} titleField="fixTime" />
            </MapView>
            <MapCamera positions={test_bins} />
          </div>
        )}
        <Box className={classes.containerMain} sx={{ p: 2 }}>
          <Box
            sx={{
              display: "flex",
              gap: "0.5rem",
              margin: "1rem 0",
            }}
          >
            <ReportFilter tag="binstype" />
            <ExcelExport excelData={items} fileName="ReportSheet" />
            <Print
              target={TableRef.current}
              button={
                <Button
                  variant="contained"
                  color="secondary"
                  className={classes.filterButton}
                >
                  {t("advancedReportPrint")}
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
                      title={t("binsStatusByType")}
                      subtitle={t(
                        "theProportionOfEmptedAndUnemptedBinsByTypes"
                      )}
                      bins={chartData.map((item) => {
                        const empted = (item.empty_bin * 100) / item.total;

                        return {
                          name: item.bintype,
                          empted: countRate(item.total, item.empty_bin).toFixed(
                            2
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

export default ByType;
