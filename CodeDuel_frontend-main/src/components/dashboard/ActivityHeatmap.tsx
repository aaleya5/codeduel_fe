import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ActivityData } from "@/types";
import { cn } from "@/lib/utils";

interface ActivityHeatmapProps {
  data: ActivityData[];
  title?: string;
}

const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({
  data,
  title = "Activity",
}) => {
  const getIntensityClass = (count: number) => {
    if (count <= 0) return "bg-transparent border border-slate-200";
    if (count === 1) return "bg-green-100 border border-green-100";
    if (count === 2) return "bg-green-200 border border-green-200";
    if (count === 3) return "bg-green-400 border border-green-400";
    return "bg-green-600 border border-green-600";
  };

  const formatDate = (dateStr: number | string) => {
    if (!dateStr) return "";
    const date = typeof dateStr === "number" ? new Date(dateStr * 1000) : new Date(dateStr);

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Group data by weeks (columns) and pad to align like LeetCode/GitHub heatmap
  const weeks: ActivityData[][] = [];
  let currentWeek: ActivityData[] = [];

  data.forEach((day, index) => {
    const date = day.date ? new Date(day.date) : null;
    if (index === 0 && date) {
      const dayOfWeek = date.getDay();
      for (let i = 0; i < dayOfWeek; i++) {
        currentWeek.push({ date: "", count: 0 });
      }
    }

    currentWeek.push(day);

    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push({ date: "", count: 0 });
    }
    weeks.push(currentWeek);
  }

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <Card className="hover-lift">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          {title}
          <span className="text-sm font-normal text-muted-foreground">
            {data.filter((d) => d.count > 0).length} active days
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-[750px]">
            {/* Month labels */}
            <div className="flex mb-2 text-xs text-muted-foreground ml-8">
              {months.map((month, i) => (
                <span key={month} className="flex-1 first:pl-0">
                  {month}
                </span>
              ))}
            </div>

            <div className="flex gap-[3px]">
              {/* Day labels */}
              <div className="flex flex-col gap-[3px] text-xs text-muted-foreground pr-2">
                {days.map((day, i) => (
                  <div key={day} className="h-3 flex items-center">
                    {i % 2 === 1 && <span>{day}</span>}
                  </div>
                ))}
              </div>

              {/* Grid */}
              <div className="flex gap-[3px]">
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-[3px]">
                    {week.map((day, dayIndex) => (
                      <Tooltip key={`${weekIndex}-${dayIndex}`}>
                        <TooltipTrigger asChild>
                          <div
                            role="button"
                            tabIndex={0}
                            className={cn(
                              "h-3 w-3 rounded-sm transition-all duration-150 cursor-pointer",
                              getIntensityClass(day.count),
                              "hover:scale-105"
                            )}
                          />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs">
                          <p>
                            {day.count > 0
                              ? `${day.count} submission${day.count > 1 ? 's' : ''} on ${formatDate(day.date)}`
                              : day.date
                              ? `No submissions on ${formatDate(day.date)}`
                              : 'Empty'}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-end gap-2 mt-4 text-xs text-muted-foreground">
              <span>Less</span>
              <div className="flex gap-1">
                {[0, 1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={cn(
                      "h-3 w-3 rounded-sm",
                      getIntensityClass(level)
                    )}
                  />
                ))}
              </div>
              <span>More</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityHeatmap;
