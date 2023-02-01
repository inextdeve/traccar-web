import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Grid,
  Typography,
  Box,
  Skeleton,
  Button,
  LinearProgress,
  IconButton,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import MapIcon from "@mui/icons-material/Map";
import { useTheme } from "@mui/material/styles";
import Print from "../common/Print";
import PageLayout from "../../common/components/PageLayout";
import useReportStyles from "../common/useReportStyles";
import ReportsMenu from "../components/ReportsMenu";
import { useTranslation } from "../../common/components/LocalizationProvider";
import ReportFilter from "../components/ReportFilter";
import { analyticsActions } from "../../store";
import AnalyticsTable from "../components/AnalyticsTable";
import BinsChart from "../components/Charts/BinsChart";
import BinsPercentageChart from "../components/Charts/BinsPercentageChart";
import BinsStatusChart from "../components/Charts/BinsStatusChart";
import ExcelExport from "../components/ExcelExport";
import PrintingHeader from "../../common/components/PrintingHeader";

// MAP IMPORTS
import Popup from "../../common/components/Popup";

import MapAnalytics from "../../map/MapAnalytics";
import { URL } from "../../common/util/constant";

const ByType = () => {
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

  // Map Processing
  const [mapLoading, setMapLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(false);

  const mapButtonClick = useCallback(async ({ id, tag }) => {
    setSelectedItem(true);
    setMapLoading(null);
    const url = `${URL}/?token=${token}&bins&limit=0;10000&${tag}=${id}`;
    console.log(url);

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
        }))
      )
    );
  });

  // Table Data Processing
  const columnsHead = [
    "binType",
    "numberOfBins",
    "empted",
    "notEmpted",
    "completionRate",
    "maps",
  ];
  const data = useSelector((state) => state.analytics.items);
  const keys = [
    "bintype",
    "total",
    "empty_bin",
    "un_empty_bin",
    "rate",
    "mapButton",
  ];
  const items = data.map((item) => {
    const requestParams = {
      id: item.id_type,
      tag: "bintypeid",
    };

    return {
      ...item,
      rate: `${countRate(item.total, item.empty_bin).toFixed(2)}%`,
      mapButton: (
        <IconButton onClick={() => mapButtonClick(requestParams)}>
          <MapIcon />
        </IconButton>
      ),
    };
  });
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
    fetch(`${URL}/?token=${token}&binstype`)
      .then((data) => {
        setIsLoading(false);
        return data.json();
      })
      .then((data) => {
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
                  {t("print")}
                </Button>
              }
            />
          </Box>
          <Box ref={TableRef}>
            <PrintingHeader />
            <div className="print-mt">
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
                        title={t("binsStatus")}
                        subtitle={t(
                          "theProportionOfTheEmptedBinsAndTheUnempted"
                        )}
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
                            empted: countRate(
                              item.total,
                              item.empty_bin
                            ).toFixed(2),
                            unempted: 100 - empted,
                            amt: 100,
                          };
                        })}
                      />
                    </Grid>
                  </>
                ) : null}
              </Grid>
            </div>
          </Box>
        </Box>
      </div>
    </PageLayout>
  );
};

export default ByType;
