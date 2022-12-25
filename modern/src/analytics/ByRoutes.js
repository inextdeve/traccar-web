import React, { useEffect, useRef } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Grid,
  Typography,
  TableContainer,
  Paper,
  Box,
  Skeleton,
  Button,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import ReactToPrint from "react-to-print";
import PageLayout from "../common/components/PageLayout";
import useReportStyles from "./common/useReportStyles";
import ReportsMenu from "./components/ReportsMenu";
import { useTranslation } from "../common/components/LocalizationProvider";
import TableShimmer from "../common/components/TableShimmer";
import ReportFilter from "./components/ReportFilter";
import { analyticsActions } from "../store";

import BinsChart from "./components/Charts/BinsChart";
import BinsPercentageChart from "./components/Charts/BinsPercentageChart";
import BinsStatusChart from "./components/Charts/BinsStatusChart";
import ExcelExport from "./components/ExcelExport";
import PrintingHeader from "../common/components/PrintingHeader";

const BinAdvancedReportPage = () => {
  const classes = useReportStyles();
  const t = useTranslation();
  const dispatch = useDispatch();
  const TableRef = useRef(null);

  const countTotal = (array, prop) =>
    array.map((item) => parseFloat(item[prop])).reduce((n, c) => n + c, 0);

  const countRate = (total, n) => (n * 100) / total;

  const headColumns = [
    "binType",
    "numberOfBins",
    "empted",
    "notEmpted",
    "completionRate",
  ];
  const token = useSelector((state) => state.session.user.attributes.apitoken);
  const loading = useSelector((state) => state.analytics.loading);
  const setIsLoading = (state) =>
    dispatch(analyticsActions.updateLoading(state));
  const items = useSelector((state) => state.analytics.items);

  useEffect(() => {
    setIsLoading(true);
    fetch(
      `https://med-reports.almajal.co/al/api/?token=${token}&bins_routes&date_f=2022-12-14&time_f=00:00&date_t=2022-12-14&time_t=23:59`
    )
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
            <ReportFilter />
            <ExcelExport excelData={items} fileName="ReportSheet" />
            <ReactToPrint
              bodyClass="print"
              trigger={() => (
                <Button
                  variant="contained"
                  color="secondary"
                  className={classes.filterButton}
                >
                  {t("advancedReportPrint")}
                </Button>
              )}
              content={() => TableRef.current}
            />
          </Box>
          <Box ref={TableRef}>
            <PrintingHeader />
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow className={classes.greyRow}>
                    <TableCell className={classes.columnAction} />
                    {headColumns.map((name, index, { length }) => (
                      <TableCell
                        sx={{
                          color: "#fff",
                          textAlign: index === length - 1 ? "center" : "auto",
                        }}
                        key={name}
                      >
                        {t(name)}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {!loading ? (
                    <>
                      {items.map((item) => (
                        <TableRow key={item.id_type} hover>
                          <TableCell />
                          <TableCell>{item.bintype}</TableCell>
                          <TableCell>{item.total}</TableCell>
                          <TableCell className={classes.emptyBin}>
                            {item.empty_bin}
                          </TableCell>
                          <TableCell className={classes.unEmptyBin}>
                            {item.un_empty_bin}
                          </TableCell>
                          <TableCell align="center">
                            {countRate(item.total, item.empty_bin).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className={classes.greyRow}>
                        <TableCell sx={{ border: 0 }} />
                        <TableCell sx={{ border: 0 }}>
                          <Typography sx={{ fontWeight: "500", color: "#fff" }}>
                            {t("total")}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ border: 0 }}>
                          <Typography sx={{ fontWeight: "500", color: "#fff" }}>
                            {countTotal(items, "total")}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ border: 0 }}>
                          <Typography sx={{ fontWeight: "500", color: "#fff" }}>
                            {countTotal(items, "empty_bin")}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ border: 0 }}>
                          <Typography sx={{ fontWeight: "500", color: "#fff" }}>
                            {countTotal(items, "un_empty_bin")}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ border: 0 }}>
                          <Typography
                            sx={{ fontWeight: "500", color: "#fff" }}
                            align="center"
                          >
                            {`${(
                              countTotal(items, "rate") / items.length
                            ).toFixed(2)}%`}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </>
                  ) : (
                    <TableShimmer
                      columns={headColumns.length + 1}
                      startAction
                    />
                  )}
                </TableBody>
              </Table>
            </TableContainer>
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
                      bins={[
                        {
                          name: "Empted",
                          value: countTotal(items, "rate") / items.length,
                        },
                        {
                          name: "Unempted",
                          value: 100 - countTotal(items, "rate") / items.length,
                        },
                      ]}
                    />
                  </Grid>
                  <Grid xs={12} lg={6} item className={classes.chart}>
                    <BinsPercentageChart
                      data={items.map((item) => ({
                        name: item.bintype,
                        value: parseInt(item.total, 10),
                      }))}
                    />
                  </Grid>
                  <Grid xs={12} item className={classes.chart}>
                    <BinsStatusChart
                      bins={items.map((item) => {
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

export default BinAdvancedReportPage;
