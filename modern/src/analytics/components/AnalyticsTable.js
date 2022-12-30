import React, { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
  Button
} from "@mui/material";
import MapIcon from '@mui/icons-material/Map';
import { useTranslation } from "../../common/components/LocalizationProvider";
import TableShimmer from "../../common/components/TableShimmer";
import useReportStyles from "../common/useReportStyles";
import { analyticsActions } from "../../store";

const AnalyticsTable = ({ columnsHead, items, keys }) => {
  const classes = useReportStyles();
  const t = useTranslation();
  const dispatch = useDispatch();
  const loading = useSelector((state) => state.analytics.loading);
  const token = useSelector((state) => state.session.user.attributes.apitoken);
  const mapClick = useCallback(async ({from, to, id, tag}) => {
    const data = await fetch(`https://med-reports.almajal.co/al/api/?token=${token}&${tag}&limit=0;100&bintypeid=${id}&date_f=${from.date}&time_f=${from.time}&date_t=${to.date}&time_t=${to.time}`);
    const positions = await data.json();
    dispatch(analyticsActions.updatePositions(positions.map(({id_bin, status, latitude,longitude}) => ({
      id: id_bin,
      color: `${status === "empty" ? "positive" : "negative"}`,
      category: "trash",
      latitude,
      longitude,
    }))))

    

  })
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
                  className={
                    itemsIndex === items.length - 1 ? classes.greyRow : null
                  }
                >
                  <TableCell
                    sx={itemsIndex === items.length - 1 ? { border: 0 } : null}
                  />
                  {keys.map((key, index) => (
                    <TableCell
                      key={index}
                      className={
                        itemsIndex === items.length - 1
                          ? classes.lastCell
                          : key === "empty_bin"
                            ? classes.emptyBin
                            : key === "un_empty_bin"
                              ? classes.unEmptyBin
                              : null
                      }
                      align={`${
                        index === keys.length - 1 ? "center" : "inherit"
                      }`}
                    >
                      {(key === "maps" && itemsIndex < items.length - 1) ? <Button onClick={() => mapClick(item[key])}><MapIcon/></Button> : item[key]}
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
