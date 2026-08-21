import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartData } from "@/types";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { RawData } from "@/types";

interface ProgressChartProps {
  data: ChartData[];
  title?: string;
}

const ProgressChart: React.FC<ProgressChartProps> = ({
  data,
  title = "Daily Progress",
}) => {
  // normalize incoming data to chart shape: { date, displayDate, solved, target }
  const normalized = (data || []).map((d: RawData) => {
  const dateObj = new Date(d.date || d.displayDate || "");
  const displayDate = isNaN(dateObj.getTime())
    ? String(d.date || "")
    : dateObj.toLocaleDateString(undefined, { month: "short", day: "numeric" });

  const solved = d.solved ?? d.passed ?? d.submissions ?? 0;
  const target = d.target ?? d.dailyTarget ?? 2;

  return { ...d, displayDate, solved, target };
});


  const averageTarget = normalized.length > 0 ? normalized[0].target : 2;

  // compute Y max, ensure non-zero span so chart is visible when all values are 0
  const maxSolved = normalized.reduce((m, x) => Math.max(m, x.solved ?? 0), 0);
  const yMax = Math.max(averageTarget || 0, maxSolved, 1);
  return (
    <Card className="hover-lift">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={normalized}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="solvedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="displayDate"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                axisLine={{ stroke: "hsl(var(--border))" }}
                tickLine={{ stroke: "hsl(var(--border))" }}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                axisLine={{ stroke: "hsl(var(--border))" }}
                tickLine={{ stroke: "hsl(var(--border))" }}
                domain={[0, yMax]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  color: "hsl(var(--popover-foreground))",
                }}
              />
              <ReferenceLine
                y={averageTarget}
                stroke="hsl(var(--success))"
                strokeDasharray="5 5"
                label={{
                  value: "Target",
                  fill: "hsl(var(--success))",
                  fontSize: 12,
                  position: "right",
                }}
              />
              <Area
                type="monotone"
                dataKey="solved"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#solvedGradient)"
                dot={{ fill: "hsl(var(--primary))", strokeWidth: 0, r: 3 }}
                activeDot={{ r: 5, fill: "hsl(var(--primary))" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgressChart;
