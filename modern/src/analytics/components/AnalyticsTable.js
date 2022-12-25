import React from "react";
import { useSelector } from "react-redux";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
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
  //Provesoir
  const countTotal = (array, prop) =>
    array.map((item) => parseFloat(item[prop])).reduce((n, c) => n + c, 0);
  const countRate = (total, n) => (n * 100) / total;

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
              {items.map((item) => (
                <TableRow key={item.id_type} hover>
                  <TableCell />
                  {keys.map((key, index) => {
                    console.log(items);
                    return (
                      <TableCell
                        align={`${
                          index === keys.length - 1 ? "center" : "inherit"
                        }`}
                      >
                        {item[key]}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
              <TableRow className={classes.greyRow}>
                <TableCell sx={{ border: 0 }} />
                <TableCell sx={{ border: 0 }}>
                  <Typography sx={{ fontWeight: "500", color: "#fff" }}>
                    {t("total")}
                  </Typography>
                </TableCell>
                <TableCell sx={{ border: 0 }}>
                  <Typography sx={{ fontWeight: "500", color: "#fff" }}>
                    {countTotal(items, "total")}
                  </Typography>
                </TableCell>
                <TableCell sx={{ border: 0 }}>
                  <Typography sx={{ fontWeight: "500", color: "#fff" }}>
                    {countTotal(items, "empty_bin")}
                  </Typography>
                </TableCell>
                <TableCell sx={{ border: 0 }}>
                  <Typography sx={{ fontWeight: "500", color: "#fff" }}>
                    {countTotal(items, "un_empty_bin")}
                  </Typography>
                </TableCell>
                <TableCell sx={{ border: 0 }}>
                  <Typography
                    sx={{ fontWeight: "500", color: "#fff" }}
                    align="center"
                  >
                    {`${(countTotal(items, "rate") / items.length).toFixed(
                      2
                    )}%`}
                  </Typography>
                </TableCell>
              </TableRow>
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
