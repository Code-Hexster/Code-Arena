"use client";

import { useMemo } from "react";
import GameCard from "@/components/ui/GameCard";

interface ActivityData {
  date: string; // ISO string
  xp_earned: number;
}

interface ActivityHeatmapProps {
  activityData: ActivityData[];
}

export default function ActivityHeatmap({ activityData }: ActivityHeatmapProps) {
  // Generate the last 18 weeks of dates (126 days)
  const { days, maxActivity } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Build a frequency map of date string (YYYY-MM-DD) to total XP
    const activityMap: Record<string, { xp: number }> = {};
    let max = 0;

    activityData.forEach((item) => {
      const d = new Date(item.date);
      // Format to YYYY-MM-DD
      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      
      if (!activityMap[dateKey]) {
        activityMap[dateKey] = { xp: 0 };
      }
      
      activityMap[dateKey].xp += item.xp_earned;
      
      if (activityMap[dateKey].xp > max) max = activityMap[dateKey].xp;
    });

    const daysArray = [];
    const totalDays = 18 * 7; // 126 days (18 weeks)

    for (let i = totalDays - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      
      const dayData = activityMap[dateKey] || { xp: 0 };
      
      daysArray.push({
        date: d,
        dateKey,
        xp: dayData.xp,
      });
    }

    return { days: daysArray, maxActivity: max || 1 };
  }, [activityData]);

  // Color intensities based on XP earned (dynamic energy variables)
  const getColor = (xp: number) => {
    if (xp === 0) return "bg-void border-energy/10 hover:border-energy/40";
    if (xp <= 25) return "bg-energy/20 border-energy/30";
    if (xp <= 75) return "bg-energy/50 border-energy/60";
    return "bg-energy border-energy shadow-glow-sm";
  };

  // Group by weeks for columns (18 weeks)
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return (
    <GameCard glowColor="purple">
      <div className="flex items-center justify-between border-b border-energy/25 pb-2 mb-4">
        <h3 className="font-display text-lg text-energy rune-glow">Spellcasting Activity</h3>
        <span className="text-mist text-xs font-display tracking-widest uppercase">{activityData.length} spells cast in total</span>
      </div>

      <div className="flex items-end justify-center gap-1.5 pb-2">
        {/* Day Labels */}
        <div className="flex flex-col gap-1 text-[10px] text-smoke font-mono pr-2 mt-5">
          <div className="h-6"></div>
          <div className="h-6 leading-6">Mon</div>
          <div className="h-6"></div>
          <div className="h-6 leading-6">Wed</div>
          <div className="h-6"></div>
          <div className="h-6 leading-6">Fri</div>
          <div className="h-6"></div>
        </div>

        {/* Heatmap Columns */}
        {weeks.map((week, weekIdx) => (
          <div key={weekIdx} className="flex flex-col gap-1">
            {/* Month Label (only show if it's the first week of the month) */}
            <div className="text-[9px] text-smoke font-mono h-4 flex items-end">
              {week[0].date.getDate() <= 7 ? week[0].date.toLocaleDateString("en-US", { month: "short" }) : ""}
            </div>
            
            {week.map((day, dayIdx) => {
              const tooltipText = day.xp === 0 
                ? `No XP earned on ${day.dateKey}`
                : `${day.xp} XP earned on ${day.dateKey}`;

              return (
                <div
                  key={`${weekIdx}-${dayIdx}`}
                  className={`group relative w-6 h-6 rounded border ${getColor(day.xp)} transition-all hover:scale-115 hover:z-20 cursor-pointer`}
                >
                  {/* Custom Instant Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-void border border-energy/35 text-parchment text-[9px] font-display uppercase font-bold tracking-wider rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-card-hover flex items-center justify-center">
                    {tooltipText}
                    {/* Tooltip Arrow */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-energy/35"></div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </GameCard>
  );
}
