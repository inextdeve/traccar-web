import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer,
} from "recharts";
import { Typography } from "@mui/material";
import useReportStyles from "../../common/useReportStyles";

let arr = [];
let i = 0;
let data = [];
const CustomizedLabel = ({ x, y, value }) => {
  if (arr.length < data.length) {
    arr.push(value);
  } else {
    value = 100 - arr[i];
    i += 1;
    if (i === arr.length) {
      i = 0;
      arr = [];
    }
  }

  const text = (
    <text
      x={x + 10}
      y={y + 22}
      fontSize="14"
      fontFamily="sans-serif"
      fill="#fff"
      textAnchor="start"
    >
      {value}
      %
    </text>
  );

  return text;
};

const BinsStatusChart = ({ bins }) => {
  const classes = useReportStyles();
  data = bins;
  return (
    <>
      <Typography variant="h6" component="h6" sx={{ fontWeight: "regular" }}>
        Bins Status
      </Typography>
      <Typography
        className={classes.chartSubtitle}
        sx={{ typography: "subtitle2", fontWeight: "light" }}
      >
        The rate of empted and unempted bins by types
      </Typography>
      <ResponsiveContainer
        width="100%"
        height={50 * data.length}
        debounce={50}
        className={classes.chartContainer}
      >
        <BarChart
          data={data}
          layout="vertical"
          margin={{ left: 19, right: 10 + (30 - 8) }}
        >
          <XAxis hide dataKey="amt" axisLine={false} type="number" />
          <YAxis
            yAxisId={0}
            dataKey="name"
            type="category"
            axisLine={false}
            tickLine={false}
          />

          <Bar
            stackId="a"
            dataKey="empted"
            minPointSize={2}
            barSize={32}
            fill="#00C49F"
            label={<CustomizedLabel />}
          />
          <Bar
            stackId="a"
            dataKey="unempted"
            minPointSize={2}
            barSize={32}
            fill="#D32F2F"
            label={<CustomizedLabel />}
          />
        </BarChart>
      </ResponsiveContainer>
    </>
  );
};

export default BinsStatusChart;
