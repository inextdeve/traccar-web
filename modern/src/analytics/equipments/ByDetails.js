import React, { useEffect, useRef, useState } from "react";
import { Box, Button, Tab, Tabs } from "@mui/material";
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
import { analyticsActions } from "../../store";
import { useCatch } from "../../reactHelper";

const ByDetails = () => {
  const classes = useReportStyles();
  const t = useTranslation();
  const TableRef = useRef(null);
  const dispatch = useDispatch();

  const from = useSelector((state) => state.reports.from);
  const to = useSelector((state) => state.reports.to);

  const [tableData, setTableData] = useState([]);

  const events = useSelector((state) => state.analytics.events);
  const equipments = useSelector((state) => state.devices.equipments);
  const groups = useSelector((state) => state.groups.items);

  // Table Data Processing
  const columnsHead = [
    "sharedName",
    "binType",
    "service",
    "positionStatus",
    "exitTime",
  ];
  const keys = ["name", "model", "group", "htmlStatus", "eventTime"];

  const filterRoutes = (filter) => {
    if (filter === 1) {
      setTableData(events.filter((item) => item.status === "online"));
    } else if (filter === 2) {
      setTableData(events.filter((item) => item.status === "offline"));
    } else {
      setTableData(events);
    }
  };

  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    filterRoutes(newValue);
    setValue(newValue);
  };

  const handleSubmit = useCatch(async ({ from, to }) => {
    dispatch(analyticsActions.updateLoading(true));
    const query = new URLSearchParams({ from, to });

    [...new Set(equipments.map((item) => item.groupId))].forEach((id) =>
      query.append("groupId", id)
    );

    try {
      const response = await fetch(
        `/api/reports/events?${query.toString()}&type=geofenceExit`,
        {
          headers: { Accept: "application/json" },
        }
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

        const eventsList = Object.keys(eventsObj).map((key) => ({
          ...equipments[key],
          eventTime: eventsObj[key][0].eventTime,
        }));

        const eventListWStatus = eventsList.map((item) => ({
          ...item,
          group: groups[item.groupId] ? groups[item.groupId].name : "General",
          eventTime: moment(item.eventTime).format("lll"),
          eventStandardTime: item.eventTime, //For sorting by time in the future
          htmlStatus:
            item.status === "offline" ? (
              <span style={{ color: "#f44336" }}>
                {moment(item.lastUpdate).fromNow()}
              </span>
            ) : (
              <span style={{ color: "#4caf50" }}>Online</span>
            ),
        }));
        setTableData(
          eventListWStatus.sort((a, b) => {
            if (a.name < b.name) {
              return 1;
            }
            if (a.name > b.name) {
              return -1;
            }
            return 0;
          })
        );
        dispatch(analyticsActions.updateEvents(eventListWStatus));
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
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              marginTop: "2rem",
              marginBottom: "1rem",
            }}
          >
            <Tabs
              value={value}
              onChange={handleChange}
              indicator={{ height: 0 }}
              className="filterTab"
              indicatorColor="transparent"
              centered
              sx={{ display: "flex", justifyContent: "center", mt: "2rem" }}
            >
              <Tab label="All" />
              <Tab label="Online" />
              <Tab label="Offline" />
            </Tabs>
          </Box>
          <Box ref={TableRef}>
            <PrintingHeader />
            <div className="print-mt">
              <AnalyticsTable
                columnsHead={columnsHead}
                items={tableData}
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

export default ByDetails;
