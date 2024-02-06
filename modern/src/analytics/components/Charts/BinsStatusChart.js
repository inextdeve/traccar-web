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
      x={value < 4 ? x + 3 : x + 10}
      y={y + 18}
      fontSize="14"
      fontFamily="sans-serif"
      fill="#fff"
      textAnchor="start"
    >
      {value < 5 ? Math.ceil(value) : value.toFixed(2)}
      %
    </text>
  );

  return text;
};

const BinsStatusChart = ({ bins, title, subtitle, key1, key2 }) => {
  const classes = useReportStyles();
  data = bins;
  return (
    <>
      <Typography variant="h6" component="h6" sx={{ fontWeight: "regular" }}>
        {title}
      </Typography>
      <Typography
        className={classes.chartSubtitle}
        sx={{ typography: "subtitle2", fontWeight: "light" }}
      >
        {subtitle}
      </Typography>
      <ResponsiveContainer
        width="100%"
        height={30 * data.length}
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
            width={185}
          />

          <Bar
            stackId="a"
            dataKey={key1}
            minPointSize={2}
            barSize={32}
            fill="#00C49F"
            label={<CustomizedLabel />}
          />
          <Bar
            stackId="a"
            dataKey={key2}
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
