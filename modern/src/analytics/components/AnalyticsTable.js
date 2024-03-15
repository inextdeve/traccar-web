import React from "react";
import { useSelector } from "react-redux";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
} from "@mui/material";
import { useTranslation } from "../../common/components/LocalizationProvider";
import TableShimmer from "../../common/components/TableShimmer";
import useReportStyles from "../common/useReportStyles";

const AnalyticsTable = ({
  columnsHead,
  items,
  keys,
  excludeTotal,
  supervisor = false,
}) => {
  const classes = useReportStyles();
  const t = useTranslation();
  const loading = useSelector((state) => state.analytics.loading);

  const supervisorClass = (item) =>
    supervisor
      ? parseInt(item.total) >= 95
        ? classes.positive
        : (parseInt(item.total) < 95 && parseInt(item.total)) > 84
        ? classes.warning
        : parseInt(item.total) < 85
        ? classes.negative
        : null
      : "";

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow className={classes.greyRow}>
            <TableCell className={classes.columnAction} />
            {columnsHead.map((name, index, { length }) => (
              <TableCell
                sx={{
                  color: "#fff",
                  textAlign: index === length - 1 ? "center" : "auto",
                }}
                key={name}
              >
                {t(name)}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {!loading ? (
            <>
              {items.map((item, itemsIndex) => (
                <TableRow
                  key={itemsIndex + 2}
                  hover={itemsIndex !== items.length - 1}
                  className={`${
                    itemsIndex === items.length - 1 && !excludeTotal
                      ? classes.greyRow
                      : null
                  }`}
                >
                  <TableCell
                    sx={itemsIndex === items.length - 1 ? { border: 0 } : null}
                    className={supervisor ? supervisorClass(item) : null}
                  />
                  {keys.map((key, index) => (
                    <TableCell
                      sx={{ color: supervisor ? "#FFF" : "#000" }}
                      key={index}
                      className={`${
                        itemsIndex === items.length - 1 && !excludeTotal
                          ? classes.lastCell
                          : key === "empty_bin" ||
                            key === "cleaned" ||
                            key === "online"
                          ? classes.emptyBin
                          : key === "un_empty_bin" ||
                            key === "not_cleaned" ||
                            key === "offline"
                          ? classes.unEmptyBin
                          : null
                      } ${supervisor ? supervisorClass(item) : null}`}
                      align={`${
                        index === keys.length - 1 ? "center" : "inherit"
                      }`}
                    >
                      {item[key]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </>
          ) : (
            <TableShimmer columns={columnsHead.length + 1} startAction />
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default AnalyticsTable;
