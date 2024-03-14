import React, { useEffect, useRef, useState } from "react";
import {
  Grid, Typography, Box, Skeleton, Button, Slider,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";
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
import { URL } from "../common/util/constant";

const marks = [
  {
    value: 0,
    label: '0%',
  },
  {
    value: 85,
    label: '85%',
  },

  {
    value: 100,
    label: '100%',
  },
];

function valuetext(value) {
return `${value}%`;
}

const Supervisor = () => {
  const classes = useReportStyles();
  const t = useTranslation();
  const dispatch = useDispatch();
  const TableRef = useRef(null);
  const defaultRange = [0, 100];

  const countTotal = (array, prop) => array.map((item) => parseFloat(item[prop])).reduce((n, c) => n + c, 0);

  const countRate = (total, n) => (n * 100) / total;

  const token = useSelector((state) => state.session.user.attributes.apitoken);
  const loading = useSelector((state) => state.analytics.loading);
  const setIsLoading = (state) => dispatch(analyticsActions.updateLoading(state));

  const [rateRange, setRateRange] = useState(defaultRange);
  const [tableItems, setTableItems] = useState([]);



  // Table Data Processing
  const columnsHead = [
    "id",
    "sharedName",
    "bins",
    "empted",
    "rate",
  ];
  const data = useSelector((state) => state.analytics.items);
  const keys = ["driverid", "name", "bins", "emptedBins","rate"];

  useEffect(() => {
    //On datachange set tableItems
  },[])

  const items = data.map((item, index) => ({
    ...item,
    rate: `${countRate(item.bins, item.emptedBins).toFixed(2)}%`,
    total: countRate(item.bins, item.emptedBins),
  })).sort((a,b) => b.total - a.total);
  items.push({
    driverid: t("total"),
    name: "-",
    bins: countTotal(items, "bins"),
    emptedBins: countTotal(items, "emptedBins"),
    rate: `${countRate(
      countTotal(items, "bins"),
      countTotal(items, "emptedBins"),
    ).toFixed(2)}%`,
  });
  // Data for charts drop Total item
  const chartData = items;

  useEffect(() => {
    setIsLoading(true);
    fetch(`${URL}/api/supervisors/statistics`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((data) => {
        setIsLoading(false);
        return data.json();
      })
      .then((data) => dispatch(analyticsActions.updateSupervisors(data)))
      .catch(() => setIsLoading(false));
  }, []);

  const handleSubmit = ({ from, to }) => {
    const query = new URLSearchParams({
      from,
      to,
    });

    const url = `${URL}/api/supervisors/statistics?${query.toString()}`;

    setIsLoading(true);
    fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((data) => data.json())
      .then((data) => {
        dispatch(analyticsActions.updateSupervisors(data));
        setIsLoading(false);
      });
  };

  useEffect(() => {
    dispatch(analyticsActions.updateSupervisors(items.filter((i) => i.total > rateRange[0] && i.total < rateRange[1])))
  }, [rateRange])

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
            <ReportFilter handleSubmit={handleSubmit} />
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
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              margin: "auto",
              marginTop: "2rem",
              marginBottom: "1rem",
              maxWidth: "400px"
            }}
          >
            <Slider
              track="normal"
              aria-labelledby="track-inverted-range-slider"
              getAriaValueText={valuetext}
              defaultValue={defaultRange}
              marks={marks}
              onChange={(e) => {
                setRateRange(e.target.value)
              }}
            />
          </Box>
          <Box ref={TableRef}>
            <PrintingHeader />
            <AnalyticsTable
              columnsHead={columnsHead}
              items={items}
              keys={keys}
              supervisor={true}
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
                  {/* <Grid item xs={12} lg={5} className={classes.chart}>
                    <BinsChart
                      key1="Empted"
                      key2="Unempted"
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
                  </Grid> */}
                  {/* <Grid xs={12} lg={6} item className={classes.chart}>
                    <BinsPercentageChart
                      title={t("theProportionOfEachBinsType")}
                      subtitle={t("theProportionOfEachBinType")}
                      data={chartData.map((item) => ({
                        name: `id: ${item.id}`,
                        value: parseInt(item.total, 10),
                      }))}
                    />
                  </Grid> */}
                  <Grid xs={12} item className={classes.chart}>
                    <BinsStatusChart
                      key1="empted"
                      key2="unempted"
                      title={t("supervisorCompletionRate")}
                      subtitle={t(
                        "theProportionOfEmptedAndUnemptedBinsBySupervisors",
                      )}
                      bins={chartData.map((item) => {
                        
                        const empted = (item.emptedBins * 100) / item.bins;

                        return {
                          name: item.name?.split(" ").shift() === "-" ? "Total" : item.name?.split(" ").shift(),
                          empted: countRate(item.bins, item.emptedBins).toFixed(
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

export default Supervisor;
