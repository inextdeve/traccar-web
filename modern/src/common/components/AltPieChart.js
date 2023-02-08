import React, { useEffect, useRef, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import onSizeChange from "../util/onSizeChange";

const COLORS = ["#00C49F", "#D32F2F"];
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
      {`${(percent * 100).toFixed(2)}%`}
    </text>
  );
};

const AltPieChart = ({ data }) => {
  const container = useRef(null);
  const [CX, setCX] = useState(80);

  useEffect(() => {
    const containerWidth = container.current.current.offsetWidth;
    const cx = parseInt(containerWidth, 10) / 2;
    setCX(cx);
    onSizeChange(container.current.current, (width) => {
      setCX(width / 2);
    });
  }, []);

  return (
    <ResponsiveContainer
      ref={container}
      width="100%"
      height={150 * 2 + 20} //300
      debounce={50}
    >
      <PieChart>
        <Pie
          data={data}
          cx={CX}
          cy={150}
          labelLine={false}
          label={renderCustomizedLabel}
          outerRadius={CX - 20 < 140 ? CX - 20 : 140}
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
  );
};
export default AltPieChart;
