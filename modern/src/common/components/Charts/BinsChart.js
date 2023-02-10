import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Box, Typography, CircularProgress } from "@mui/material";
import ShowChartIcon from "@mui/icons-material/ShowChart";

import PieChart from "../PieChart";

const VehicleChart = () => {
  const chartData = useSelector((state) => state.analytics.chartData);

  const [item, setItem] = useState(null);

  useEffect(() => {
    if (chartData !== null) {
      setItem({
        name: "Bins",
        done: chartData.bins.empty_bin,
        undone: chartData.bins.un_empty_bin,
        total: chartData.bins.totla,
        rate: chartData.bins.rate,
      });
    }
  }, [chartData]);

  return item ? (
    <>
      <Typography variant="h5">
        {item.name}
        {" "}
        Status
      </Typography>
      <Box
        sx={{
          display: "flex",
          gap: "1rem",
          my: 1,
          flexWrap: "wrap",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <Typography variant="subtitle2">Total: </Typography>
          <Typography variant="body2">{item.total}</Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <Typography variant="subtitle2">Completed: </Typography>
          <Typography variant="body2">{item.done}</Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <Typography variant="subtitle2">Uncompleted: </Typography>
          <Typography variant="body2">{item.undone}</Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <Typography variant="subtitle2">Rate: </Typography>
          <Typography variant="body2">{item.rate}</Typography>
          <ShowChartIcon
            color={`${parseInt(item.rate) < 50 ? "negative" : "positive"}`}
          />
        </Box>
      </Box>
      <Box>
        <PieChart
          data={[
            { name: "Empted", value: item.done },
            { name: "Unempted", value: item.undone },
          ]}
        />
      </Box>
    </>
  ) : (
    <CircularProgress />
  );
};
export default VehicleChart;
