import React, { useEffect, useRef } from "react";
import { Box, Button } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import Print from "../common/Print";
import PageLayout from "../../common/components/PageLayout";
import useReportStyles from "../common/useReportStyles";
import ReportsMenu from "../components/ReportsMenu";
import { useTranslation } from "../../common/components/LocalizationProvider";
import ReportFilter from "../components/ReportFilter";
import { analyticsActions } from "../../store";
import AnalyticsTable from "../components/AnalyticsTable";
import ExcelExport from "../components/ExcelExport";
import PrintingHeader from "../../common/components/PrintingHeader";

import { URL } from "../../common/util/constant";

const ByType = () => {
  const classes = useReportStyles();
  const t = useTranslation();
  const dispatch = useDispatch();
  const TableRef = useRef(null);
  const countTotal = (array, prop) => array.map((item) => parseFloat(item[prop])).reduce((n, c) => n + c, 0);

  const countRate = (total, n) => (n * 100) / total;

  const token = useSelector((state) => state.session.user.attributes.apitoken);
  const setIsLoading = (state) => dispatch(analyticsActions.updateLoading(state));

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
  const items = data.map((item) => ({
    ...item,
    rate: `${countRate(item.total, item.empty_bin).toFixed(2)}%`,
  }));
  items.push({
    bintype: t("total"),
    total: countTotal(items, "total"),
    empty_bin: countTotal(items, "empty_bin"),
    un_empty_bin: countTotal(items, "un_empty_bin"),
    rate: `${countRate(
      countTotal(items, "total"),
      countTotal(items, "empty_bin"),
    ).toFixed(2)}%`,
  });

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
            <ReportFilter tag="binstype" />
            <ExcelExport excelData={items} fileName="ReportSheet" />
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
            <div className="print-mt">
              <AnalyticsTable
                columnsHead={columnsHead}
                items={items}
                keys={keys}
              />
            </div>
          </Box>
        </Box>
      </div>
    </PageLayout>
  );
};

export default ByType;
