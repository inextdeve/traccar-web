import React, { useRef, useEffect } from "react";
import { Box, Button, Stack, Chip } from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import moment from "moment";
import Print from "../common/Print";
import PageLayout from "../../common/components/PageLayout";
import useReportStyles from "../common/useReportStyles";
import ReportsMenu from "../components/ReportsMenu";
import { useTranslation } from "../../common/components/LocalizationProvider";
import ReportFilter from "../components/ReportFilter";
import AnalyticsTable from "../components/AnalyticsTable";
import ExcelExport from "../components/ExcelExport";
import PrintingHeader from "../../common/components/PrintingHeader";
import { useCatch } from "../../reactHelper";
import { analyticsActions } from "../../store";
import { countRate } from "../../common/util/converter";
import { formatPHPDate } from "../../common/util/formatter";
import { ALTURL } from "../../common/util/constant";

const ByWeek = () => {
  const classes = useReportStyles();
  const t = useTranslation();
  const TableRef = useRef(null);
  const dispatch = useDispatch();

  const token = useSelector((state) => state.session.user.attributes.apitoken);

  const { from, to } = useSelector((state) => state.analytics);

  const events = useSelector((state) => [...state.analytics.events]);
  const equipments = useSelector((state) => state.devices.equipments);

  // Table Data Processing
  const columnsHead = ["date", "total", "exited", "notExited", "rate"];
  const keys = ["date", "total", "exited", "notExited", "rate"];

  const handleSubmit = useCatch(async ({ from, to }) => {
    dispatch(analyticsActions.updateLoading(true));

    const query = new URLSearchParams({ from, to });

    const url = `http://localhost:3003/api/devices/summary?${query.toString()}`;

    fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => response.json())
      .then((data) => {
        const summary = data.map((item) => ({
          ...item,
          date: (
            <Stack direction="row" spacing={1}>
              <Chip
                label={`${item.eventTime.split("T")[0]} - 00:00`}
                color="positive"
              />
              <Chip
                label={`${item.eventTime.split("T")[0]} - 23:00`}
                color="positive"
              />
            </Stack>
          ),
          rate: countRate(item.total, item.exited).toFixed(2) + "%",
        }));
        dispatch(analyticsActions.updateEvents(summary));
      })
      .finally(() => dispatch(analyticsActions.updateLoading(false)));
  });

  useEffect(() => {
    handleSubmit({ from, to });
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
            <ReportFilter handleSubmit={handleSubmit} />
            <ExcelExport excelData={equipments} fileName="ReportSheet" />
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
                items={events}
                keys={keys}
                excludeTotal
              />
            </div>
          </Box>
        </Box>
      </div>
    </PageLayout>
  );
};

export default ByWeek;
