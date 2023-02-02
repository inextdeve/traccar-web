import React, { useEffect, useRef } from "react";
import {
  Grid, Typography, Box, Skeleton, Button,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";
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
import { URL, ALTURL } from "../../common/util/constant";

const WashingSummary = () => {
  const classes = useReportStyles();
  const t = useTranslation();
  const dispatch = useDispatch();
  const TableRef = useRef(null);

  const countTotal = (array, prop) => array.map((item) => parseFloat(item[prop])).reduce((n, c) => n + c, 0);

  const countRate = (total, n) => (n * 100) / total;

  const token = useSelector((state) => state.session.user.attributes.apitoken);
  const loading = useSelector((state) => state.analytics.loading);
  const setIsLoading = (state) => dispatch(analyticsActions.updateLoading(state));

  // Table Data Processing
  const columnsHead = [
    "id",
    "date",
    "numberOfBins",
    "cleaned",
    "notCleaned",
    "completionRate",
  ];
  const data = useSelector((state) => state.analytics.items);
  const keys = ["id", "date_from", "total", "cleaned", "not_cleaned", "rate"];
  const items = data.map((item, index) => ({
    id: index,
    ...item,
    cleaned: item.cleaned,
    not_cleaned: item.not_cleaned,
    date_from: moment(item.date_from).format("MMM Do YY"),
    rate: `${countRate(item.total, item.cleaned).toFixed(2)}%`,
  }));
  items.push({
    id: t("total"),
    total: countTotal(items, "total"),
    date_from: "All",
    cleaned: countTotal(items, "cleaned"),
    not_cleaned: countTotal(items, "not_cleaned"),
    rate: `${(countTotal(items, "rate") / items.length).toFixed(2)}%`,
  });
  // Data for charts drop Total item
  const chartData = items.slice(0, -1);

  useEffect(() => {
    setIsLoading(true);
    fetch(`${URL}/?token=${token}&cn_bins_daily`)
      .then((data) => {
        setIsLoading(false);
        return data.json();
      })
      .then((data) => dispatch(analyticsActions.updateItems(data)))
      .catch(() => setIsLoading(false));
  }, []);

  return (
    <PageLayout menu={<ReportsMenu />} breadcrumbs={["analytics", "summary"]}>
      <div className={classes.container}>
        <Box className={classes.containerMain} sx={{ p: 2 }}>
          <Box
            sx={{
              display: "flex",
              gap: "0.5rem",
              margin: "1rem 0",
            }}
          >
            <ReportFilter tag="cn_bins_daily" altURL={ALTURL} />
            <ExcelExport excelData={items} fileName="SummarySheet" />
            <Print
              target={TableRef.current}
              button={(
                <Button
                  variant="contained"
                  color="secondary"
                  className={classes.filterButton}
                >
                  {t("print")}
                </Button>
              )}
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
                        "theProportionOfTheCleanedBinsAndTheUncleaned",
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
                      title={t("binsStatusByType")}
                      subtitle={t(
                        "theProportionOfTheCleanedBinsAndTheUncleaned",
                      )}
                      bins={chartData.map((item) => {
                        const cleaned = (item.cleaned * 100) / item.total;

                        return {
                          name: item.route_name,
                          cleaned: countRate(item.total, item.cleaned).toFixed(
                            2,
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

export default WashingSummary;
