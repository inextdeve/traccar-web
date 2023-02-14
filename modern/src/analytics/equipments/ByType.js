import React, { useRef, useEffect } from "react";
import { Box, Button } from "@mui/material";
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

const ByType = () => {
  const classes = useReportStyles();
  const t = useTranslation();
  const TableRef = useRef(null);
  const dispatch = useDispatch();

  const from = useSelector((state) => state.reports.from);
  const to = useSelector((state) => state.reports.to);

  const events = useSelector((state) => [...state.analytics.events]);
  const equipments = useSelector((state) => state.devices.equipments);

  const countTotal = (array, prop) => array.map((item) => parseFloat(item[prop])).reduce((n, c) => n + c, 0);

  const countRate = (total, n) => (n * 100) / total;

  // Table Data Processing
  const columnsHead = [
    "binType",
    "total",
    "exited",
    "deviceStatusOnline",
    "deviceStatusOffline",
    "rate",
  ];
  const keys = ["type", "total", "totalExited", "online", "offline", "rate"];

  const handleSubmit = useCatch(async ({ from, to }) => {
    dispatch(analyticsActions.updateLoading(true));
    const query = new URLSearchParams({ from, to });

    [...new Set(equipments.map((item) => item.groupId))].forEach((id) => query.append("groupId", id));

    try {
      const response = await fetch(
        `/api/reports/events?${query.toString()}&type=geofenceExit`,
        {
          headers: { Accept: "application/json" },
        },
      );
      if (response.ok) {
        const data = await response.json();
        const events = data.filter((item) => (item.geofenceId = 2));

        const eventsObj = {};

        events.forEach((item) => {
          if (eventsObj[item.deviceId]) {
            eventsObj[item.deviceId].push(item);
          } else {
            eventsObj[item.deviceId] = [item];
          }
        });

        const eventsList = [];
        const groupedByType = {};

        Object.keys(eventsObj)
          .map((key) => ({
            // Get just devices with registred events
            ...equipments[key],
            eventTime: eventsObj[key][0].eventTime,
          }))
          .forEach((item) => {
            let type = item.model;
            if (!type) type = "No Type Registred";

            if (groupedByType[type]) {
              groupedByType[type].push(item);
              return;
            }

            groupedByType[type] = [item];
          });

        for (const equipmentModel in groupedByType) {
          const formatData = {
            type: equipmentModel,
            online: groupedByType[equipmentModel].filter(
              (item) => item.status === "online",
            ).length,
            offline: groupedByType[equipmentModel].filter(
              (item) => item.status === "offline",
            ).length,
            totalExited: groupedByType[equipmentModel].length,
            total: equipments.filter((item) => item.model === equipmentModel)
              .length,
          };
          formatData.rate = `${(
            (formatData.totalExited * 100) /
            formatData.total
          ).toFixed(2)}%`;

          eventsList.push(formatData);
        }
        dispatch(analyticsActions.updateEvents(eventsList));
      } else {
        throw Error(await response.text());
      }
    } finally {
      dispatch(analyticsActions.updateLoading(false));
    }
  });

  useEffect(() => {
    handleSubmit({
      from: moment(from, moment.HTML5_FMT.DATETIME_LOCAL).toISOString(),
      to: moment(to, moment.HTML5_FMT.DATETIME_LOCAL).toISOString(),
    });
  }, []);

  events.push({
    type: t("total"),
    total: countTotal(events, "total"),
    totalExited: countTotal(events, "totalExited"),
    online: countTotal(events, "online"),
    offline: countTotal(events, "offline"),
    rate: `${countRate(
      countTotal(events, "total"),
      countTotal(events, "totalExited"),
    ).toFixed(2)}%`,
  });

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
            <ReportFilter tag="binstype" handleSubmit={handleSubmit} />
            <ExcelExport excelData={equipments} fileName="ReportSheet" />
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
                items={events}
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
