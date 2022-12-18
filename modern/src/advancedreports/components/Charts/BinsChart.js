import React from "react";
import { Typography } from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const BinsChart = ({ empted, unempted }) => {
  const data = [
    {
      name: "Bins",
      empted,
      unempted,
    },
  ];

  return (
    <div>
      <Typography variant="h6" component="h6">
        Bins Chart
      </Typography>
      <div className="chart">
        <BarChart
          width={250}
          height={350}
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
          barSize={20}
        >
          <XAxis
            dataKey="name"
            scale="point"
            padding={{ left: 20, right: 20 }}
          />
          <YAxis />
          <Tooltip />
          <Legend />
          <CartesianGrid strokeDasharray="3 3" />
          <Bar dataKey="empted" fill="#000" background={{ fill: "#eee" }} />
          <Bar dataKey="unempted" fill="#f00" background={{ fill: "#eee" }} />
        </BarChart>
      </div>
    </div>
  );
};

export default BinsChart;
