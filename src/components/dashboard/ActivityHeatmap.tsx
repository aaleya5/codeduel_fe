import React, { useMemo } from "react";
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
  onDayClick?: (date: string) => void;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKDAY_LABELS: Record<number, string> = {
  0: "Mon",
  2: "Wed",
  4: "Fri",
};

const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({
  data,
  title = "Activity",
  onDayClick,
}) => {
  const getIntensityClass = (count: number) => {
    if (count <= 0) return "bg-[#ebeff0] border border-[#dde3e5]";
    if (count === 1) return "bg-[#bfdfe0] border border-[#bfdfe0]";
    if (count === 2) return "bg-[#85c7cb] border border-[#85c7cb]";
    if (count === 3) return "bg-[#4bb0b8] border border-[#4bb0b8]";
    return "bg-[#1f8a99] border border-[#1f8a99]";
  };

  const formatDate = (dateStr: number | string) => {
    if (!dateStr) return "";
    const date =
      typeof dateStr === "number" ? new Date(dateStr * 1000) : new Date(dateStr);

    return date.toLocaleDateString("en-US", {
      timeZone: "UTC",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const weeks = useMemo(() => {
    const normalized = new Map<string, number>();

    data.forEach((entry) => {
      if (!entry.date) return;

      const parsed = new Date(entry.date);
      if (Number.isNaN(parsed.getTime())) return;

      const key = parsed.toISOString().split("T")[0];
      normalized.set(key, Math.max(normalized.get(key) ?? 0, entry.count ?? 0));
    });

    const now = new Date();
    const end = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
    );
    const start = new Date(end);
    start.setUTCDate(end.getUTCDate() - 364);
    const gridStart = new Date(start);
    gridStart.setUTCDate(
      gridStart.getUTCDate() - ((gridStart.getUTCDay() + 6) % 7)
    );
    const gridEnd = new Date(end);
    gridEnd.setUTCDate(
      gridEnd.getUTCDate() + ((7 - gridEnd.getUTCDay()) % 7)
    );

    const days: Array<{ date: Date | null; count: number }> = [];
    for (
      let cursor = new Date(gridStart);
      cursor <= gridEnd;
      cursor.setUTCDate(cursor.getUTCDate() + 1)
    ) {
      const iso = cursor.toISOString().split("T")[0];
      const isInRange = cursor >= start && cursor <= end;
      days.push({
        date: isInRange ? new Date(cursor) : null,
        count: isInRange ? normalized.get(iso) ?? 0 : 0,
      });
    }

    const grouped: Array<Array<{ date: Date | null; count: number }>> = [];
    for (let i = 0; i < days.length; i += 7) {
      grouped.push(days.slice(i, i + 7));
    }

    return grouped;
  }, [data]);

  const monthLabels = useMemo(() => {
    const labels: Array<{ month: string; index: number }> = [];
    let previousMonth = -1;

    weeks.forEach((week, index) => {
      const firstDay = week.find((day) => day.date)?.date;
      if (!firstDay) return;

      const monthIndex = firstDay.getUTCMonth();
      if (monthIndex !== previousMonth) {
        labels.push({ month: MONTHS[monthIndex], index });
        previousMonth = monthIndex;
      }
    });

    return labels;
  }, [weeks]);
  const activeDays = weeks
    .flat()
    .filter((day) => day.date && day.count > 0).length;

  return (
    <div className="rounded-md border border-[#c9d2d6] bg-[#dfe5e8] p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2 text-[15px] font-medium text-slate-900">
        <span>{title}</span>
        <span className="text-xs font-normal text-slate-500">
          {activeDays} active days
        </span>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[760px]">
          <div className="ml-9 mb-2 grid" style={{ gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))`, gap: "3px" }}>
            {weeks.map((week, weekIndex) => {
              const firstDay = week[0]?.date;
              const visibleMonth = firstDay ? MONTHS[firstDay.getUTCMonth()] : "";
              const monthLabel = monthLabels.some((label) => label.index === weekIndex)
                ? visibleMonth
                : "";

              return (
                <span
                  key={`month-${weekIndex}`}
                  className="text-[10px] leading-none text-slate-500"
                >
                  {monthLabel}
                </span>
              );
            })}
          </div>

          <div className="flex items-start gap-2">
            <div className="grid grid-rows-7 gap-[3px] pt-[2px] pr-2 text-[10px] text-slate-500">
              {Array.from({ length: 7 }, (_, index) => (
                <div key={index} className="h-[11px] leading-none">
                  {WEEKDAY_LABELS[index] ?? ""}
                </div>
              ))}
            </div>

            <div
              className="grid flex-1 min-w-0 gap-[3px]"
              style={{ gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))` }}
            >
              {weeks.map((week, weekIndex) => (
                <div
                  key={`week-${weekIndex}`}
                  className="grid grid-rows-7 justify-items-center gap-[3px]"
                >
                  {week.map((day, dayIndex) => (
                    <Tooltip key={`${weekIndex}-${dayIndex}`}>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          aria-label={`${day.count} submissions on ${formatDate(day.date ?? "")}`}
                          disabled={!onDayClick || day.count <= 0 || !day.date}
                          onClick={() => {
                            if (day.date) {
                              onDayClick?.(day.date.toISOString().slice(0, 10));
                            }
                          }}
                          className={cn(
                            "h-[11px] w-[11px] rounded-[2px] transition-transform duration-150 disabled:cursor-default",
                            getIntensityClass(day.count),
                            onDayClick && day.count > 0 && "cursor-pointer hover:scale-125"
                          )}
                        />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs">
                        <p>
                          {day.count > 0
                            ? `${day.count} submission${day.count > 1 ? "s" : ""} on ${formatDate(day.date ?? "")}`
                            : day.date
                              ? `No submissions on ${formatDate(day.date)}`
                              : "Empty"}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-end gap-2 text-[10px] text-slate-500">
            <span>Less</span>
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className={cn("h-[11px] w-[11px] rounded-[2px]", getIntensityClass(level))}
                />
              ))}
            </div>
            <span>More</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityHeatmap;
