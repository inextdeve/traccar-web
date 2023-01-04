import React, { useEffect, useRef } from "react";
import { Grid, Typography, Box, Skeleton, Button } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";

import PageLayout from "../common/components/PageLayout";
import useReportStyles from "./common/useReportStyles";
import ReportsMenu from "./components/ReportsMenu";
import AnalyticsTable from "./components/AnalyticsTable";
import { useTranslation } from "../common/components/LocalizationProvider";
import ReportFilter from "./components/ReportFilter";
import { analyticsActions } from "../store";
import Print from "./common/Print";
import BinsChart from "./components/Charts/BinsChart";
import BinsPercentageChart from "./components/Charts/BinsPercentageChart";
import BinsStatusChart from "./components/Charts/BinsStatusChart";
import ExcelExport from "./components/ExcelExport";
import PrintingHeader from "../common/components/PrintingHeader";

const ByArea = () => {
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
    "area",
    "numberOfBins",
    "empted",
    "notEmpted",
    "completionRate",
  ];
  const keys = ["center_name", "total", "empty_bin", "un_empty_bin", "rate"];
  const data = useSelector((state) => state.analytics.items);
  const items = data.map((item) => ({
    ...item,
    rate: `${countRate(item.total, item.empty_bin).toFixed(2)}%`,
  }));
  items.push({
    center_name: t("total"),
    total: countTotal(items, "total"),
    empty_bin: countTotal(items, "empty_bin"),
    un_empty_bin: countTotal(items, "un_empty_bin"),
    rate: `${(countTotal(items, "rate") / items.length).toFixed(2)}%`,
  });

  // Data for charts drop Total item
  const chartData = items.slice(0, -1);

  useEffect(() => {
    setIsLoading(true);
    fetch(`https://med-reports.almajal.co/al/api/?token=${token}&bins_centers`)
      .then((data) => {
        setIsLoading(false);
        return data.json();
      })
      .then((data) => dispatch(analyticsActions.updateItems(data)))
      .catch(() => setIsLoading(false));
  }, []);

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
            <ReportFilter tag="bins_centers" />
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
                        title={t("theProportionOfArea")}
                        subtitle={t("theProportionOfEachArea")}
                        data={chartData.map((item) => ({
                          name: item.center_name,
                          value: parseInt(item.total, 10),
                        }))}
                      />
                    </Grid>
                    <Grid xs={12} item className={classes.chart}>
                      <BinsStatusChart
                        title={t("binsStatusByArea")}
                        subtitle={t(
                          "theProportionOfEmptedAndUnemptedBinsByArea"
                        )}
                        bins={chartData.map((item) => {
                          const empted = (item.empty_bin * 100) / item.total;

                          return {
                            name: item.center_name,
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

export default ByArea;
