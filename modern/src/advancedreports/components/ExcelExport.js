import React from "react";
import * as FileSaver from "file-saver";
import XLSX from "sheetjs-style";
import { Button } from "@mui/material";
import useReportStyles from "../common/useReportStyles";
import { useTranslation } from "../../common/components/LocalizationProvider";

const ExcelExport = ({ excelData, fileName }) => {
  const classes = useReportStyles();
  const t = useTranslation();
  const fileType =
    "application/vnd.openxm]formats-officedocument. spreadsheetal. sheet ;charset-UTF-8";
  const fileExtention = ".xlsx";

  const exportToExcel = async () => {
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: fileType });
    FileSaver.saveAs(data, fileName + fileExtention);
  };

  return (
    <Button
      variant="contained"
      color="secondary"
      className={classes.filterButton}
      onClick={() => exportToExcel(fileName)}
    >
      {t("reportExport")}
    </Button>
  );
};
export default ExcelExport;
