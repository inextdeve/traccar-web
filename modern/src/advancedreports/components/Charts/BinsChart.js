import React, { useEffect, useRef, useState } from "react";
import { Typography, Box } from "@mui/material";
import {
  PieChart, Pie, Cell, ResponsiveContainer,
} from "recharts";
import useReportStyles from "../../common/useReportStyles";
import Rect from "../../common/Rect";

const COLORS = ["#00C49F", "#D32F2F"];
let data;
const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};
const BinsChart = ({ bins }) => {
  data = bins;

  const classes = useReportStyles();
  const container = useRef(null);
  const [CX, setCX] = useState(80);
  useEffect(() => {
    const containerWidth = container.current.current.offsetWidth;
    const cx = parseInt(containerWidth, 10) / 2;
    setCX(cx);
  }, []);
  return (
    <>
      <Typography variant="h6" component="h6" sx={{ fontWeight: "regular" }}>
        Bins Chart
      </Typography>
      <Typography
        className={classes.chartSubtitle}
        sx={{ typography: "subtitle2", fontWeight: "light" }}
      >
        The rate of the empted bins and the unempted one&apos;s
      </Typography>
      <div className="chart">
        <ResponsiveContainer
          ref={container}
          width="100%"
          height={150 * 2 + 20}
          debounce={50}
          className={classes.chartContainer}
        >
          <PieChart>
            <Pie
              data={data}
              cx={CX}
              cy={150}
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={140}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${entry.name}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className={classes.indicators}>
        <Box sx={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <Rect w={10} h={10} c="#00C49F" />
          <Typography
            component="span"
            sx={{ typography: "subtitle2", fontWeight: "light" }}
          >
            Empted
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <Rect w={10} h={10} c="rgb(211, 47, 47)" />
          <Typography
            component="span"
            sx={{ typography: "subtitle2", fontWeight: "light" }}
          >
            Unempted
          </Typography>
        </Box>
      </div>
    </>
  );
};

export default BinsChart;
