import React, { useRef, useEffect } from "react";
import {
  Box, Button, Stack, Chip,
} from "@mui/material";
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

const ByWeek = () => {
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
    "date",
    "total",
    "exited",
    "deviceStatusOnline",
    "deviceStatusOffline",
    "rate",
  ];
  const keys = ["date", "total", "totalExited", "online", "offline", "rate"];

  const handleSubmit = useCatch(async () => {
    dispatch(analyticsActions.updateLoading(true));

    const fetchList = [];

    for (let i = 0; i < 7; i++) {
      const from = moment().subtract(i, "day").startOf("day").toISOString();
      const to = moment().subtract(i, "day").endOf("day").toISOString();
      const query = new URLSearchParams({ from, to });
      [...new Set(equipments.map((item) => item.groupId))].forEach((id) => query.append("groupId", id));
      const url = `/api/reports/events?${query.toString()}&type=geofenceExit`;
      fetchList.push(fetch(url).then((response) => response.json()));
    }

    Promise.all(fetchList)
      .then((data) => {
        const mappedEquipments = [];
        data.forEach((list) => {
          mappedEquipments.push(
            list.map((item) => ({
              ...equipments[item.deviceId],
            })),
          );
        });
        const summary = mappedEquipments.map((item, index) => {
          const summaryObj = {
            totalExited: item.length,
            total: equipments.length,
            online: 0,
            offline: 0,
            date: (
              <Stack direction="row" spacing={1}>
                <Chip
                  label={
                    moment()
                      .subtract(index, "day")
                      .startOf("day")
                      .toISOString()
                      .split("T")[0]
                  }
                  color="positive"
                />
                <Chip
                  label={
                    moment()
                      .subtract(index, "day")
                      .endOf("day")
                      .toISOString()
                      .split("T")[0]
                  }
                  color="positive"
                />
              </Stack>
            ),

            rate: `${(
              (item.length * 100) /
              Object.keys(equipments).length
            ).toFixed(2)}%`,
          };

          item.forEach((equipment) => {
            if (equipment.status === "online") {
              summaryObj.online += 1;
            } else {
              summaryObj.offline += 1;
            }
          });
          return summaryObj;
        });
        dispatch(analyticsActions.updateEvents(summary));
      })
      .finally(() => dispatch(analyticsActions.updateLoading(false)));
  });

  useEffect(() => {
    handleSubmit();
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
            {/* <ReportFilter tag="binstype" handleSubmit={handleSubmit} /> */}
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
