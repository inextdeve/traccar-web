import React, { useState } from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  TextField,
} from "@mui/material";
import moment from "moment";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "../../common/components/LocalizationProvider";
import useReportStyles from "../common/useReportStyles";
import { analyticsActions } from "../../store";

const ReportFilter = ({ handleSubmit }) => {
  const t = useTranslation();
  const classes = useReportStyles();
  const [period, setPeriod] = useState("");

  const dispatch = useDispatch();
  const from = useSelector((state) => state.analytics.from);
  const to = useSelector((state) => state.analytics.to);

  const handleClick = () => {
    let selectedFrom;
    let selectedTo;
    switch (period) {
      case "today":
        selectedFrom = moment().startOf("day");
        selectedTo = moment().endOf("day");
        break;
      case "yesterday":
        selectedFrom = moment().subtract(1, "day").startOf("day");
        selectedTo = moment().subtract(1, "day").endOf("day");
        break;
      case "thisWeek":
        selectedFrom = moment().startOf("week");
        selectedTo = moment().endOf("week");
        break;
      case "previousWeek":
        selectedFrom = moment().subtract(1, "week").startOf("week");
        selectedTo = moment().subtract(1, "week").endOf("week");
        break;
      case "thisMonth":
        selectedFrom = moment().startOf("month");
        selectedTo = moment().endOf("month");
        break;
      case "previousMonth":
        selectedFrom = moment().subtract(1, "month").startOf("month");
        selectedTo = moment().subtract(1, "month").endOf("month");
        break;
      default:
        selectedFrom = moment(from, moment.HTML5_FMT.DATETIME_LOCAL);
        selectedTo = moment(to, moment.HTML5_FMT.DATETIME_LOCAL);
        break;
    }

    handleSubmit({
      from: moment(selectedFrom).format("YYYY-MM-DDTHH:mm"),
      to: moment(selectedTo).format("YYYY-MM-DDTHH:mm"),
    });
  };

  return (
    <>
      <FormControl sx={{ width: 1 / 4 }}>
        <InputLabel>{t("reportPeriod")}</InputLabel>
        <Select
          label={t("reportPeriod")}
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
        >
          <MenuItem value="today">{t("reportToday")}</MenuItem>
          <MenuItem value="yesterday">{t("reportYesterday")}</MenuItem>
          <MenuItem value="thisWeek">{t("reportThisWeek")}</MenuItem>
          <MenuItem value="previousWeek">{t("reportPreviousWeek")}</MenuItem>
          <MenuItem value="thisMonth">{t("reportThisMonth")}</MenuItem>
          <MenuItem value="previousMonth">{t("reportPreviousMonth")}</MenuItem>
          <MenuItem value="custom">{t("reportCustom")}</MenuItem>
        </Select>
      </FormControl>
      {period === "custom" && (
        <div className={classes.filterItem}>
          <TextField
            label={t("reportFrom")}
            type="datetime-local"
            value={from}
            onChange={(e) =>
              dispatch(analyticsActions.updateFrom(e.target.value))
            }
            fullWidth
          />
        </div>
      )}
      {period === "custom" && (
        <div className={classes.filterItem}>
          <TextField
            label={t("reportTo")}
            type="datetime-local"
            value={to}
            onChange={(e) =>
              dispatch(analyticsActions.updateTo(e.target.value))
            }
            fullWidth
          />
        </div>
      )}
      <Button
        variant="contained"
        color="secondary"
        className={classes.filterButton}
        onClick={handleClick}
      >
        {t("reportShow")}
      </Button>
    </>
  );
};

export default ReportFilter;
