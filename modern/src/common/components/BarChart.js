import React, { useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
const SimpleBarChart = ({ data, key1, key2 }) => {
  return (
    <ResponsiveContainer width="100%" height={280} debounce={50}>
      <BarChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey={key1} fill="#4caf50" />
        <Bar dataKey={key2} fill="#f44336" />
      </BarChart>
    </ResponsiveContainer>
  );
};
export default SimpleBarChart;
