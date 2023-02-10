import React, { useEffect, useRef, useState } from "react";
import {
  Box, Button, Tab, Tabs,
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
import { analyticsActions } from "../../store";

const ByDetails = () => {
  const classes = useReportStyles();
  const t = useTranslation();
  const TableRef = useRef(null);
  const dispatch = useDispatch();

  const [tableData, setTableData] = useState([]);

  const equipments = useSelector((state) => state.analytics.equipments.map((item) => ({
    ...item,
    htmlStatus:
          item.status === "offline" ? (
            <span style={{ color: "#f44336" }}>
              {moment(item.lastUpdate).fromNow()}
            </span>
          ) : (
            <span style={{ color: "#4caf50" }}>Online</span>
          ),
  })));

  // Table Data Processing
  const columnsHead = ["sharedName", "binType", "service", "positionStatus"];
  const keys = ["name", "model", "category", "htmlStatus"];

  const filterRoutes = (filter) => {
    if (filter === 1) {
      setTableData(equipments.filter((item) => item.status === "online"));
    } else if (filter === 2) {
      setTableData(equipments.filter((item) => item.status === "offline"));
    } else {
      setTableData(equipments);
    }
  };

  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    filterRoutes(newValue);
    setValue(newValue);
  };

  useEffect(() => {
    fetch("/api/devices")
      .then((reponse) => reponse.json())
      .then((data) => {
        const equipmentsData = data.map((item) => ({
          ...item,
          htmlStatus:
              item.status === "offline" ? (
                <span style={{ color: "#f44336" }}>
                  {moment(item.lastUpdate).fromNow()}
                </span>
              ) : (
                <span style={{ color: "#4caf50" }}>Online</span>
              ),
        }));
        setTableData(equipmentsData);
        dispatch(analyticsActions.updateEquipments(data));
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
            {/* <ReportFilter tag="binstype" /> */}
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
