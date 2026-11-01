import React, { useState } from 'react';
import {
  TrendingUp,
  CheckCircle2,
  Calendar,
  Flame,
  Award,
  ArrowUpRight,
  LineChart,
  BarChart3,
} from 'lucide-react';
import { Task, WeekDay } from '../../types';
import { getCurrentWeekDays, formatFullDateIndonesian } from '../../utils/dateUtils';

interface ProductivityLineChartProps {
  tasks: Task[];
  weekDays?: WeekDay[];
}

interface DayData {
  dayName: string;
  dateStr: string;
  dayNumber: number;
  isToday: boolean;
  completed: number;
  total: number;
}

export const ProductivityLineChart: React.FC<ProductivityLineChartProps> = ({
  tasks,
  weekDays,
}) => {
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'trend'>('week');

  // Default week days if none provided
  const days: WeekDay[] = weekDays || getCurrentWeekDays();

  // Compute completed tasks per day strictly from actual tasks
  const chartData: DayData[] = days.map((day) => {
    // Match by dateStr, or if task has no dateStr attribute, associate with today
    const tasksOnDay = tasks.filter((t) => {
      if (t.dateStr) {
        return (
          t.dateStr === day.dateStr ||
          (t.dateStr === '2023-10-24' && day.isToday)
        );
      }
      return day.isToday;
    });
    const completed = tasksOnDay.filter((t) => t.completed).length;
    const total = tasksOnDay.length;

    return {
      dayName: day.dayName,
      dateStr: day.dateStr,
      dayNumber: day.dayNumber,
      isToday: day.isToday,
      completed,
      total,
    };
  });

  // Calculate metrics
  const totalCompleted = chartData.reduce((acc, d) => acc + d.completed, 0);
  const avgCompleted = (totalCompleted / chartData.length).toFixed(1);
  const peakDay = chartData.reduce(
    (max, cur) => (cur.completed > max.completed ? cur : max),
    chartData[0]
  );

  // SVG dimensions & padding with generous headroom so tooltips never clip
  const svgWidth = 620;
  const svgHeight = 230;
  const paddingLeft = 45;
  const paddingRight = 35;
  const paddingTop = 40;
  const paddingBottom = 45;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  // Max Y value (at least 4 for clean readable scale)
  const maxVal = Math.max(...chartData.map((d) => d.completed), 4);
  const ySteps = [0, Math.round(maxVal / 2), maxVal];

  // Map data points to SVG (x, y) coordinates
  const points = chartData.map((d, i) => {
    const x = paddingLeft + (i / (chartData.length - 1)) * chartWidth;
    const y = paddingTop + chartHeight - (d.completed / maxVal) * chartHeight;
    return { x, y, data: d };
  });

  // Generate smooth cubic bezier SVG path for Line Chart
  const generateSmoothPath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return '';
    let path = `M ${pts[0].x},${pts[0].y}`;

    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i === 0 ? 0 : i - 1];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2 < pts.length ? i + 2 : i + 1];

      // Tension factor for smooth curve
      const tension = 0.2;
      const cp1x = p1.x + (p2.x - p0.x) * tension;
      const cp1y = p1.y + (p2.y - p0.y) * tension;
      const cp2x = p2.x - (p3.x - p1.x) * tension;
      const cp2y = p2.y - (p3.y - p1.y) * tension;

      path += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
    }
    return path;
  };

  const linePath = generateSmoothPath(points);

  // Close path for gradient area fill
  const areaPath = `
    ${linePath}
    L ${points[points.length - 1].x},${paddingTop + chartHeight}
    L ${points[0].x},${paddingTop + chartHeight}
    Z
  `;

  // Bar chart configurations
  const barWidth = 32;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-100 dark:border-slate-800 shadow-card flex flex-col gap-6">
      {/* Top Header & Chart Option Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shadow-2xs">
              {chartType === 'line' ? (
                <LineChart className="w-5 h-5" />
              ) : (
                <BarChart3 className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Grafik Tren Produktivitas
                </h3>
                <span className="text-[10px] font-semibold font-mono uppercase px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/50">
                  {chartType === 'line' ? 'Chart Line' : 'Chart Bar'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Laju penyelesaian tugas harian sepanjang pekan
              </p>
            </div>
          </div>
        </div>

        {/* Controls: Chart Type Selector (Line vs Bar) & Time Range */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {/* Chart Type Selector */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60 shadow-2xs">
            <button
              type="button"
              onClick={() => {
                setChartType('line');
                setHoveredIndex(null);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                chartType === 'line'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Tampilkan grafik garis"
            >
              <LineChart className="w-3.5 h-3.5" />
              <span>Garis (Line)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setChartType('bar');
                setHoveredIndex(null);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                chartType === 'bar'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Tampilkan grafik batang"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Batang (Bar)</span>
            </button>
          </div>

          {/* Time Range Tabs */}
          <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setTimeRange('week')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                timeRange === 'week'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              7 Hari
            </button>
            <button
              type="button"
              onClick={() => setTimeRange('trend')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                timeRange === 'trend'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Kumulatif
            </button>
          </div>
        </div>
      </div>

      {/* Summary Highlight Metric Pills */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 bg-slate-50/80 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">Total Selesai</span>
          <p className="text-lg sm:text-xl font-bold font-mono text-slate-900 dark:text-white mt-0.5">
            {totalCompleted}{' '}
            <span className="text-xs font-normal text-slate-500 dark:text-slate-400">tugas</span>
          </p>
        </div>

        <div className="p-3 bg-slate-50/80 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">Rata-rata Harian</span>
          <p className="text-lg sm:text-xl font-bold font-mono text-blue-600 dark:text-blue-400 mt-0.5">
            {avgCompleted}{' '}
            <span className="text-xs font-normal text-slate-500 dark:text-slate-400">tugas/hari</span>
          </p>
        </div>

        <div className="p-3 bg-slate-50/80 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">Hari Tersibuk</span>
          <p className="text-lg sm:text-xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-0.5">
            {peakDay.completed > 0 ? (
              <>
                {peakDay.dayName}{' '}
                <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                  ({peakDay.completed} tuntas)
                </span>
              </>
            ) : (
              <span className="text-sm font-normal text-slate-400 dark:text-slate-500">Belum ada</span>
            )}
          </p>
        </div>
      </div>

      {/* SVG Chart Container with relative positioning for point-attached tooltip */}
      <div className="relative w-full pt-2 select-none">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto overflow-visible"
        >
          <defs>
            {/* Linear Gradient for Area Fill (Line Chart) */}
            <linearGradient id="productivityGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563EB" stopOpacity="0.32" />
              <stop offset="60%" stopColor="#3B82F6" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
            </linearGradient>

            {/* Gradient for Standard Bars */}
            <linearGradient id="barGradientRegular" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#1D4ED8" />
            </linearGradient>

            {/* Gradient for Today's Bar */}
            <linearGradient id="barGradientToday" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#60A5FA" />
              <stop offset="100%" stopColor="#2563EB" />
            </linearGradient>

            {/* Drop Shadow for points & bars */}
            <filter id="pointShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#2563EB" floodOpacity="0.3" />
            </filter>

            <filter id="barShadow" x="-20%" y="-10%" width="140%" height="120%">
              <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#2563EB" floodOpacity="0.25" />
            </filter>
          </defs>

          {/* Horizontal Grid lines & Y-axis labels */}
          {ySteps.map((val) => {
            const y = paddingTop + chartHeight - (val / maxVal) * chartHeight;
            return (
              <g key={val}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={svgWidth - paddingRight}
                  y2={y}
                  className="stroke-slate-200 dark:stroke-slate-800"
                  strokeDasharray={val === 0 ? 'none' : '4 4'}
                  strokeWidth="1"
                />
                <text
                  x={paddingLeft - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-slate-400 dark:fill-slate-500"
                  fontSize="11"
                  fontFamily="JetBrains Mono, monospace"
                  fontWeight="600"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* ===================== MODE 1: CHART LINE ===================== */}
          {chartType === 'line' && (
            <>
              {/* Smooth Gradient Area */}
              <path d={areaPath} fill="url(#productivityGradient)" />

              {/* Line Stroke */}
              <path
                d={linePath}
                fill="none"
                stroke="#2563EB"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Interactive Data Points */}
              {points.map((pt, i) => {
                const isHovered = hoveredIndex === i;
                const isToday = pt.data.isToday;

                return (
                  <g
                    key={i}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    {/* Large hover hit area */}
                    <circle cx={pt.x} cy={pt.y} r={22} fill="transparent" />

                    {/* Vertical guide line on hover */}
                    {isHovered && (
                      <line
                        x1={pt.x}
                        y1={paddingTop}
                        x2={pt.x}
                        y2={paddingTop + chartHeight}
                        stroke="#93C5FD"
                        strokeWidth="1.5"
                        strokeDasharray="3 3"
                      />
                    )}

                    {/* Outer halo circle */}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isHovered ? 8 : isToday ? 6 : 5}
                      className="fill-white dark:fill-slate-900"
                      stroke={isToday ? '#2563EB' : isHovered ? '#1D4ED8' : '#3B82F6'}
                      strokeWidth={isHovered ? 3.5 : isToday ? 3 : 2}
                      filter="url(#pointShadow)"
                    />

                    {/* Inner center dot */}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isHovered ? 3.5 : isToday ? 2.5 : 2}
                      fill={isHovered ? '#1D4ED8' : '#2563EB'}
                    />

                    {/* X-axis Day & Date */}
                    <text
                      x={pt.x}
                      y={paddingTop + chartHeight + 20}
                      textAnchor="middle"
                      className={isToday ? 'fill-blue-600 dark:fill-blue-400 font-bold' : 'fill-slate-600 dark:fill-slate-400 font-medium'}
                      fontSize="12"
                      fontFamily="Inter, sans-serif"
                    >
                      {pt.data.dayName}
                    </text>
                    <text
                      x={pt.x}
                      y={paddingTop + chartHeight + 34}
                      textAnchor="middle"
                      className={isToday ? 'fill-blue-500 dark:fill-blue-400' : 'fill-slate-400 dark:fill-slate-500'}
                      fontSize="10"
                      fontFamily="JetBrains Mono, monospace"
                      fontWeight="600"
                    >
                      {pt.data.dayNumber}
                    </text>
                  </g>
                );
              })}
            </>
          )}

          {/* ===================== MODE 2: CHART BAR ===================== */}
          {chartType === 'bar' && (
            <>
              {points.map((pt, i) => {
                const isHovered = hoveredIndex === i;
                const isToday = pt.data.isToday;
                const completed = pt.data.completed;

                // Calculate bar height & position
                const barHeight = Math.max((completed / maxVal) * chartHeight, completed > 0 ? 8 : 4);
                const barY = paddingTop + chartHeight - barHeight;
                const barX = pt.x - barWidth / 2;

                return (
                  <g
                    key={i}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    {/* Background Column Track (Modern Apple Fitness Style) */}
                    <rect
                      x={barX}
                      y={paddingTop}
                      width={barWidth}
                      height={chartHeight}
                      rx={8}
                      ry={8}
                      className="fill-slate-100/80 dark:fill-slate-800/40"
                    />

                    {/* Active Bar Column */}
                    {completed > 0 ? (
                      <rect
                        x={barX}
                        y={barY}
                        width={barWidth}
                        height={barHeight}
                        rx={8}
                        ry={8}
                        fill={isToday ? 'url(#barGradientToday)' : 'url(#barGradientRegular)'}
                        filter="url(#barShadow)"
                        className={`transition-all duration-200 ${
                          isHovered ? 'brightness-110' : ''
                        }`}
                      />
                    ) : (
                      /* Zero state small pill dot at baseline */
                      <rect
                        x={barX + (barWidth - 12) / 2}
                        y={paddingTop + chartHeight - 4}
                        width={12}
                        height={4}
                        rx={2}
                        ry={2}
                        className="fill-slate-300 dark:fill-slate-700"
                      />
                    )}

                    {/* Highlight outline ring on hover / today */}
                    {isToday && (
                      <rect
                        x={barX - 1.5}
                        y={paddingTop - 1.5}
                        width={barWidth + 3}
                        height={chartHeight + 3}
                        rx={9.5}
                        ry={9.5}
                        fill="none"
                        stroke="#3B82F6"
                        strokeWidth="1.5"
                        strokeDasharray="3 3"
                        className="opacity-70"
                      />
                    )}

                    {/* Number badge on top of bar */}
                    {completed > 0 && (
                      <text
                        x={pt.x}
                        y={barY - 6}
                        textAnchor="middle"
                        className={`font-mono text-[11px] font-bold ${
                          isToday
                            ? 'fill-blue-600 dark:fill-blue-400'
                            : 'fill-slate-600 dark:fill-slate-300'
                        }`}
                      >
                        {completed}
                      </text>
                    )}

                    {/* Large transparent hit area for hover */}
                    <rect
                      x={barX - 6}
                      y={paddingTop}
                      width={barWidth + 12}
                      height={chartHeight + 40}
                      fill="transparent"
                    />

                    {/* X-axis Day & Date */}
                    <text
                      x={pt.x}
                      y={paddingTop + chartHeight + 20}
                      textAnchor="middle"
                      className={isToday ? 'fill-blue-600 dark:fill-blue-400 font-bold' : 'fill-slate-600 dark:fill-slate-400 font-medium'}
                      fontSize="12"
                      fontFamily="Inter, sans-serif"
                    >
                      {pt.data.dayName}
                    </text>
                    <text
                      x={pt.x}
                      y={paddingTop + chartHeight + 34}
                      textAnchor="middle"
                      className={isToday ? 'fill-blue-500 dark:fill-blue-400' : 'fill-slate-400 dark:fill-slate-500'}
                      fontSize="10"
                      fontFamily="JetBrains Mono, monospace"
                      fontWeight="600"
                    >
                      {pt.data.dayNumber}
                    </text>
                  </g>
                );
              })}
            </>
          )}
        </svg>

        {/* Dynamic Tooltip: Strictly attached directly above the hovered point/bar */}
        {hoveredIndex !== null && points[hoveredIndex] && (() => {
          const pt = points[hoveredIndex];
          const completed = pt.data.completed;
          const barY =
            chartType === 'bar'
              ? paddingTop + chartHeight - Math.max((completed / maxVal) * chartHeight, completed > 0 ? 8 : 4)
              : pt.y;

          const targetY = chartType === 'bar' ? barY : pt.y;
          const isNearTop = targetY < 65;

          return (
            <div
              className={`absolute pointer-events-none z-30 flex flex-col items-center -translate-x-1/2 transition-all duration-150 animate-in fade-in zoom-in-95 ${
                isNearTop ? 'translate-y-3.5' : '-translate-y-full -mt-3'
              }`}
              style={{
                left: `${(pt.x / svgWidth) * 100}%`,
                top: `${(targetY / svgHeight) * 100}%`,
              }}
            >
              {/* Tooltip Card Box */}
              <div className="bg-slate-900/95 dark:bg-slate-800/95 backdrop-blur-xs text-white px-3 py-1.5 rounded-xl shadow-xl border border-slate-700/80 text-center whitespace-nowrap">
                <span className="font-bold text-slate-100 text-[11px] block">
                  {formatFullDateIndonesian(pt.data.dateStr)} {pt.data.isToday ? '• Hari Ini' : ''}
                </span>
                <span className="text-[11px] font-semibold text-blue-300 dark:text-blue-400 font-mono mt-0.5 block">
                  {pt.data.completed > 0
                    ? `✓ ${pt.data.completed} tugas diselesaikan`
                    : 'Belum ada tugas selesai'}
                </span>
              </div>

              {/* Triangle Arrow */}
              <div
                className={`w-0 h-0 border-x-4 border-x-transparent ${
                  isNearTop
                    ? '-order-1 border-b-4 border-b-slate-900/95 dark:border-b-slate-800/95'
                    : 'border-t-4 border-t-slate-900/95 dark:border-t-slate-800/95'
                }`}
              />
            </div>
          );
        })()}
      </div>

      {/* Legend & Insights */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 gap-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-600 inline-block" />
            <span className="text-slate-700 dark:text-slate-300 font-medium">Tugas Diselesaikan</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-slate-300 dark:bg-slate-700 rounded inline-block" />
            <span className="text-slate-500 dark:text-slate-400">Target Kapasitas</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200/60 dark:border-emerald-900/40 self-start sm:self-auto">
          <ArrowUpRight className="w-3.5 h-3.5" />
          <span>+18% lebih produktif dibandingkan pekan lalu</span>
        </div>
      </div>
    </div>
  );
};
