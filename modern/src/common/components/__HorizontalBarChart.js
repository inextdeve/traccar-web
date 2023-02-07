import React from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";

let arr = [];
let i = 0;
let data = [];
const CustomizedLabel = ({ x, y, value }) => {
  console.log({ x, y, value });
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
      {value < 5 ? Math.ceil(value) : value.toFixed(2)}%
    </text>
  );

  return text;
};

const HorizontalBarChart = ({ data, key1, key2 }) => {
  return (
    <ResponsiveContainer width="100%" height={30 * data.length} debounce={50}>
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
          dataKey={key1}
          minPointSize={2}
          barSize={32}
          fill="#0088FE"
          label={<CustomizedLabel />}
        />
        <Bar
          stackId="a"
          dataKey={key2}
          minPointSize={2}
          barSize={32}
          fill="#FF8042"
          label={<CustomizedLabel />}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};
export default HorizontalBarChart;
