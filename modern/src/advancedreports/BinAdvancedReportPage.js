import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Grid,
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
      "http://med-reports.almajal.co/al/api/?token=fb329817e3ca2132d39134dd26d894b2&bintype"
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
        <div className={classes.containerMain}>
          <ReportFilter />
          <div className={classes.header} />
          <Table>
            <TableHead>
              <TableRow>
                <TableCell className={classes.columnAction} />
                {headColumns.map((name) => (
                  <TableCell key={name}>{t(name)}</TableCell>
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
                  <TableRow className={classes.totalRow}>
                    <TableCell />
                    <TableCell>Total</TableCell>
                    <TableCell>{countTotal(items, "total")}</TableCell>
                    <TableCell>{countTotal(items, "empty_bin")}</TableCell>
                    <TableCell>{countTotal(items, "un_empty_bin")}</TableCell>
                    <TableCell>
                      {`${countTotal(items, "rate") / items.length}%`}
                    </TableCell>
                  </TableRow>
                </>
              ) : (
                <TableShimmer columns={headColumns.length + 1} startAction />
              )}
            </TableBody>
          </Table>
          <Grid container spacing={2} className={classes.charts}>
            {!loading ? (
              <>
                <Grid item xs={4}>
                  <BinsChart
                    empted={countTotal(items, "empty_bin")}
                    unempted={countTotal(items, "un_empty_bin")}
                  />
                </Grid>
                <Grid item xs={8}>
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
        </div>
      </div>
    </PageLayout>
  );
};

export default BinAdvancedReportPage;
