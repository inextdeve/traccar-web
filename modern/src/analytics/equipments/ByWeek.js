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

  const countTotal = (array, prop) =>
    array.map((item) => parseFloat(item[prop])).reduce((n, c) => n + c, 0);

  const countRate = (total, n) => (n * 100) / total;

  // Table Data Processing
  const columnsHead = [
    "date",
    "total",
    "exited",
    "deviceStatusOnline",
    "deviceStatusOffline",
    "rate",
  ];
  const keys = ["date", "total", "totalExited", "on", "off", "rate"];

  const handleSubmit = useCatch(async ({ from, to }) => {
    dispatch(analyticsActions.updateLoading(true));

    const date_f = formatPHPDate(from).date;
    const date_t = formatPHPDate(to).date;
    const time_t = "23:59";
    const time_f = "00:00";

    const query = new URLSearchParams({ date_f, time_f, date_t, time_t });

    const url = `${ALTURL}/?token=${token}&device_daily&${query.toString()}`;

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        const summary = data.map((item) => ({
          ...item,
          totalExited: item.on,
          date: (
            <Stack direction="row" spacing={1}>
              <Chip
                label={`${
                  moment(item.date_from).format().split("T")[0]
                } - ${moment(item.date_from)
                  .format()
                  .split("T")[1]
                  .split("+")[0]
                  .split(":")
                  .slice(0, 2)
                  .join(":")}`}
                color="positive"
              />
              <Chip
                label={`${
                  moment(item.date_to).format().split("T")[0]
                } - ${moment(item.date_to)
                  .format()
                  .split("T")[1]
                  .split("+")[0]
                  .split(":")
                  .slice(0, 2)
                  .join(":")}`}
                color="positive"
              />
            </Stack>
          ),
        }));
        dispatch(analyticsActions.updateEvents(summary));
      })
      .finally(() => dispatch(analyticsActions.updateLoading(false)));
  });

  useEffect(() => {
    handleSubmit({ from, to });
  }, []);

  // events.push({
  //   type: t("total"),
  //   total: countTotal(equipments, "total"),
  //   online: countTotal(equipments, "online"),
  //   offline: countTotal(equipments, "offline"),
  //   rate: `${countRate(
  //     countTotal(equipments, "total"),
  //     countTotal(equipments, "online")
  //   ).toFixed(2)}%`,
  // });

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
