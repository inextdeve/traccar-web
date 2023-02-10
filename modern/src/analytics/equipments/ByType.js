import React, { useRef } from "react";
import { Box, Button } from "@mui/material";
import { useSelector } from "react-redux";
import Print from "../common/Print";
import PageLayout from "../../common/components/PageLayout";
import useReportStyles from "../common/useReportStyles";
import ReportsMenu from "../components/ReportsMenu";
import { useTranslation } from "../../common/components/LocalizationProvider";
import ReportFilter from "../components/ReportFilter";
import AnalyticsTable from "../components/AnalyticsTable";
import ExcelExport from "../components/ExcelExport";
import PrintingHeader from "../../common/components/PrintingHeader";

const ByType = () => {
  const classes = useReportStyles();
  const t = useTranslation();
  const TableRef = useRef(null);
  const countTotal = (array, prop) => array.map((item) => parseFloat(item[prop])).reduce((n, c) => n + c, 0);

  const countRate = (total, n) => (n * 100) / total;

  const equipments = useSelector((state) => {
    const data = {};
    const dataArray = [];

    state.devices.equipments.forEach((item) => {
      const type = item.model;
      if (!type) return;

      if (data[type]) {
        data[type].push(item);
        return;
      }

      data[type] = [item];
    });

    for (const equipmentModel in data) {
      const formatData = {
        type: equipmentModel,
        online: data[equipmentModel].filter((item) => item.status === "online")
          .length,
        offline: data[equipmentModel].filter(
          (item) => item.status === "offline",
        ).length,
        total: data[equipmentModel].length,
      };
      formatData.rate =
        `${Math.round((formatData.online * 100) / formatData.total)}%`;

      dataArray.push(formatData);
    }

    return dataArray;
  });

  // Table Data Processing
  const columnsHead = [
    "binType",
    "total",
    "deviceStatusOnline",
    "deviceStatusOffline",
    "rate",
  ];
  const keys = ["type", "total", "online", "offline", "rate"];

  equipments.push({
    type: t("total"),
    total: countTotal(equipments, "total"),
    online: countTotal(equipments, "online"),
    offline: countTotal(equipments, "offline"),
    rate: `${countRate(
      countTotal(equipments, "total"),
      countTotal(equipments, "online"),
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
          <Box ref={TableRef}>
            <PrintingHeader />
            <div className="print-mt">
              <AnalyticsTable
                columnsHead={columnsHead}
                items={equipments}
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
