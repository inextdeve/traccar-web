import React, {
  useState, useCallback, useRef, useEffect,
} from "react";
import {
  Cell, PieChart, Pie, Sector, ResponsiveContainer,
} from "recharts";
import { Typography } from "@mui/material";
import useReportStyles from "../../common/useReportStyles";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const renderActiveShape = (props) => {
  const RADIAN = Math.PI / 180;
  const {
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    percent,
    value,
  } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? "start" : "end";

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path
        d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
        stroke={fill}
        fill="none"
      />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        textAnchor={textAnchor}
        fill="#333"
      >
        {value}
      </text>
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        dy={18}
        textAnchor={textAnchor}
        fill="#999"
      >
        {`(Rate ${(percent * 100).toFixed(2)}%)`}
      </text>
    </g>
  );
};

const BinsPercentageChart = ({ data, title, subtitle }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const onPieEnter = useCallback(
    (_, index) => setActiveIndex(index),
    [setActiveIndex],
  );
  const classes = useReportStyles();

  const [CX, setCX] = useState(200);

  const container = useRef(null);

  useEffect(() => {
    const containerWidth = container.current.current.offsetWidth;
    const cx = parseInt(containerWidth, 10) / 2;
    setCX(cx, 10);
  }, []);

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
        ref={container}
        width="100%"
        height={150 * 2 + 30}
        debounce={50}
        className={classes.chartContainer}
      >
        <PieChart>
          <Pie
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
            data={data}
            cx={CX}
            cy={150}
            innerRadius={90}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
            onMouseEnter={onPieEnter}
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
    </>
  );
};
export default BinsPercentageChart;
