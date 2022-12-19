import React, { useEffect } from "react";
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
} from "@mui/material";
import PageLayout from "../common/components/PageLayout";
import useReportStyles from "./common/useReportStyles";
import ReportsMenu from "./components/ReportsMenu";
import { useTranslation } from "../common/components/LocalizationProvider";
import TableShimmer from "../common/components/TableShimmer";
import ReportFilter from "./components/ReportFilter";
import { useDispatch, useSelector } from "react-redux";
import { advancedReportsActions } from "../store";
import BinsChart from "./components/Charts/BinsChart";
import BinsPercentageChart from "./components/Charts/BinsPercentageChart";
const BinAdvancedReportPage = () => {
  const classes = useReportStyles();
  const t = useTranslation();
  const dispatch = useDispatch();

  const countTotal = (array, prop) => {
    return array
      .map((item) => parseInt(item[prop]))
      .reduce((n, c) => {
        return n + c;
      }, 0);
  };

  const headColumns = [
    "binType",
    "numberOfBins",
    "empted",
    "notEmpted",
    "completionRate",
  ];

  const loading = useSelector((state) => state.advancedReports.loading);
  const setIsLoading = (state) =>
    dispatch(advancedReportsActions.updateLoading(state));
  const items = useSelector((state) => state.advancedReports.items);

  useEffect(() => {
    setIsLoading(true);
    fetch(
      "https://med-reports.almajal.co/al/api/?token=fb329817e3ca2132d39134dd26d894b2&bintype"
    )
      .then((data) => {
        setIsLoading(false);
        return data.json();
      })
      .then((data) => dispatch(advancedReportsActions.updateItems(data)))
      .catch(() => setIsLoading(false));
  }, []);

  return (
    <PageLayout
      menu={<ReportsMenu />}
      breadcrumbs={["advancedReportTitle", "reportBin"]}
    >
      <div className={classes.container}>
        <Box className={classes.containerMain} sx={{ p: 2 }}>
          <ReportFilter />
          <div className={classes.header} />
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow className={classes.greyRow}>
                  <TableCell className={classes.columnAction} />
                  {headColumns.map((name) => (
                    <TableCell sx={{ color: "#fff" }} key={name}>
                      {t(name)}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {!loading ? (
                  <>
                    {items.map((item) => (
                      <TableRow key={item.id_type} hover={true}>
                        <TableCell />
                        <TableCell>{item.bintype}</TableCell>
                        <TableCell>{item.total}</TableCell>
                        <TableCell className={classes.emptyBin}>
                          {item.empty_bin}
                        </TableCell>
                        <TableCell className={classes.unEmptyBin}>
                          {item.un_empty_bin}
                        </TableCell>
                        <TableCell>{item.rate}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow className={classes.greyRow}>
                      <TableCell sx={{ border: 0 }} />
                      <TableCell sx={{ border: 0 }}>
                        <Typography sx={{ fontWeight: "500", color: "#fff" }}>
                          Total
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
                        >{`${
                          countTotal(items, "rate") / items.length
                        }%`}</Typography>
                      </TableCell>
                    </TableRow>
                  </>
                ) : (
                  <TableShimmer columns={headColumns.length + 1} startAction />
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
                <Grid item className={classes.chart}>
                  <BinsChart
                    bins={[
                      { name: "Empted", value: countTotal(items, "empty_bin") },
                      {
                        name: "Unempted",
                        value: countTotal(items, "un_empty_bin"),
                      },
                    ]}
                  />
                </Grid>
                <Grid item className={classes.chart}>
                  <BinsPercentageChart
                    data={items.map((item) => ({
                      name: item.bintype,
                      value: parseInt(item.total),
                    }))}
                  />
                </Grid>
              </>
            ) : null}
          </Grid>
        </Box>
      </div>
    </PageLayout>
  );
};

export default BinAdvancedReportPage;
