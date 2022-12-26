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

const AnalyticsTable = ({ columnsHead, items, keys }) => {
  const classes = useReportStyles();
  const t = useTranslation();
  const loading = useSelector((state) => state.analytics.loading);
  console.log(items);
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
                <TableRow key={item.id_type} hover={itemsIndex !== items.length - 1} className={itemsIndex === items.length - 1 ? classes.greyRow : null}>
                  <TableCell sx={itemsIndex === items.length - 1 ? { border: 0 } : null} />
                  {keys.map((key, index) => (
                    <TableCell
                      className={itemsIndex === items.length - 1 ? classes.lastCell : key === "empty_bin" ? classes.emptyBin : key === "un_empty_bin" ? classes.unEmptyBin : null}
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
