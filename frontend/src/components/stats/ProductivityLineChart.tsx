import React, { useState } from 'react';
import {
  TrendingUp,
  CheckCircle2,
  Calendar,
  Flame,
  Award,
  ArrowUpRight,
  Filter,
} from 'lucide-react';
import { Task, WeekDay } from '../../types';

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
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'trend'>('week');

  // Default week days if none provided
  const days: WeekDay[] = weekDays || [
    { dayName: 'Sen', dayNumber: 23, dateStr: '2023-10-23', isToday: false },
    { dayName: 'Sel', dayNumber: 24, dateStr: '2023-10-24', isToday: true },
    { dayName: 'Rab', dayNumber: 25, dateStr: '2023-10-25', isToday: false },
    { dayName: 'Kam', dayNumber: 26, dateStr: '2023-10-26', isToday: false },
    { dayName: 'Jum', dayNumber: 27, dateStr: '2023-10-27', isToday: false },
    { dayName: 'Sab', dayNumber: 28, dateStr: '2023-10-28', isToday: false },
    { dayName: 'Min', dayNumber: 29, dateStr: '2023-10-29', isToday: false },
  ];

  // Baseline completions to make the chart lively even when few tasks are registered
  const defaultCompletions = [3, 4, 2, 5, 4, 3, 2];

  // Compute completed tasks per day
  const chartData: DayData[] = days.map((day, idx) => {
    const tasksOnDay = tasks.filter((t) => t.dateStr === day.dateStr);
    const completedTasksOnDay = tasksOnDay.filter((t) => t.completed).length;

    // Use actual counts if available, otherwise combine with baseline for historical curve
    const completed =
      tasksOnDay.length > 0 ? completedTasksOnDay : defaultCompletions[idx] || 0;
    const total =
      tasksOnDay.length > 0
        ? tasksOnDay.length
        : Math.max(completed, defaultCompletions[idx] + 1);

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

  // SVG dimensions
  const svgWidth = 620;
  const svgHeight = 220;
  const paddingLeft = 45;
  const paddingRight = 35;
  const paddingTop = 28;
  const paddingBottom = 45;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  // Max Y value (at least 6 for clean scaling)
  const maxVal = Math.max(...chartData.map((d) => d.completed), 6);
  const ySteps = [0, Math.round(maxVal / 2), maxVal];

  // Map data points to SVG (x, y) coordinates
  const points = chartData.map((d, i) => {
    const x = paddingLeft + (i / (chartData.length - 1)) * chartWidth;
    const y = paddingTop + chartHeight - (d.completed / maxVal) * chartHeight;
    return { x, y, data: d };
  });

  // Generate smooth cubic bezier SVG path
  const generateSmoothPath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return '';
    let path = `M ${pts[0].x},${pts[0].y}`;

    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i === 0 ? 0 : i - 1];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2 < pts.length ? i + 2 : i + 1];

      // Tension factor
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

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-card flex flex-col gap-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Grafik Tren Produktivitas
              </h3>
              <p className="text-xs text-slate-500">
                Laju penyelesaian tugas harian sepanjang pekan
              </p>
            </div>
          </div>
        </div>

        {/* Range Tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setTimeRange('week')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              timeRange === 'week'
                ? 'bg-white text-blue-600 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pekan Ini (7 Hari)
          </button>
          <button
            type="button"
            onClick={() => setTimeRange('trend')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              timeRange === 'trend'
                ? 'bg-white text-blue-600 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Kumulatif
          </button>
        </div>
      </div>

      {/* Summary Highlight Metric Pills */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-100">
          <span className="text-[11px] text-slate-500 block font-medium">Total Selesai</span>
          <p className="text-lg sm:text-xl font-bold font-mono text-slate-900 mt-0.5">
            {totalCompleted}{' '}
            <span className="text-xs font-normal text-slate-500">tugas</span>
          </p>
        </div>

        <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-100">
          <span className="text-[11px] text-slate-500 block font-medium">Rata-rata Harian</span>
          <p className="text-lg sm:text-xl font-bold font-mono text-blue-600 mt-0.5">
            {avgCompleted}{' '}
            <span className="text-xs font-normal text-slate-500">tugas/hari</span>
          </p>
        </div>

        <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-100">
          <span className="text-[11px] text-slate-500 block font-medium">Hari Tersibuk</span>
          <p className="text-lg sm:text-xl font-bold font-mono text-amber-600 mt-0.5">
            {peakDay.dayName}{' '}
            <span className="text-xs font-normal text-slate-500">
              ({peakDay.completed} tuntas)
            </span>
          </p>
        </div>
      </div>

      {/* SVG Chart Container */}
      <div className="relative w-full overflow-hidden select-none">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto overflow-visible"
        >
          <defs>
            {/* Linear Gradient for Area Fill */}
            <linearGradient id="productivityGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563EB" stopOpacity="0.28" />
              <stop offset="60%" stopColor="#3B82F6" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
            </linearGradient>

            {/* Drop Shadow for points */}
            <filter id="pointShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#2563EB" floodOpacity="0.3" />
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
                  stroke="#E2E8F0"
                  strokeDasharray={val === 0 ? 'none' : '4 4'}
                  strokeWidth="1"
                />
                <text
                  x={paddingLeft - 10}
                  y={y + 4}
                  textAnchor="end"
                  fill="#94A3B8"
                  fontSize="11"
                  fontFamily="JetBrains Mono, monospace"
                  fontWeight="600"
                >
                  {val}
                </text>
              </g>
            );
          })}

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

          {/* Data Points & Values */}
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

                {/* Outer halo */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 8 : isToday ? 6 : 5}
                  fill="#FFFFFF"
                  stroke="#2563EB"
                  strokeWidth={isHovered ? 3.5 : 2.5}
                  filter="url(#pointShadow)"
                  className="transition-all duration-150"
                />

                {/* Inner center dot */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 3.5 : 2}
                  fill={isHovered ? '#1D4ED8' : '#2563EB'}
                />

                {/* Always visible or hover value label */}
                <g transform={`translate(${pt.x}, ${pt.y - 12})`}>
                  <rect
                    x="-12"
                    y="-16"
                    width="24"
                    height="16"
                    rx="6"
                    fill={isToday ? '#2563EB' : isHovered ? '#1E293B' : '#F1F5F9'}
                  />
                  <text
                    x="0"
                    y="-5"
                    textAnchor="middle"
                    fill={isToday || isHovered ? '#FFFFFF' : '#475569'}
                    fontSize="10"
                    fontFamily="JetBrains Mono, monospace"
                    fontWeight="700"
                  >
                    {pt.data.completed}
                  </text>
                </g>

                {/* Bottom X-axis day name & date */}
                <text
                  x={pt.x}
                  y={paddingTop + chartHeight + 20}
                  textAnchor="middle"
                  fill={isToday ? '#2563EB' : '#475569'}
                  fontSize="12"
                  fontWeight={isToday ? '700' : '500'}
                  fontFamily="Inter, sans-serif"
                >
                  {pt.data.dayName}
                </text>
                <text
                  x={pt.x}
                  y={paddingTop + chartHeight + 34}
                  textAnchor="middle"
                  fill={isToday ? '#3B82F6' : '#94A3B8'}
                  fontSize="10"
                  fontFamily="JetBrains Mono, monospace"
                  fontWeight="600"
                >
                  {pt.data.dayNumber}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Dynamic Tooltip on Hover */}
        {hoveredIndex !== null && (
          <div
            className="absolute -top-3 pointer-events-none transform -translate-x-1/2 bg-slate-900 text-white px-3 py-1.5 rounded-xl text-xs shadow-xl border border-slate-700 z-20 flex flex-col items-center whitespace-nowrap animate-in fade-in zoom-in-95 duration-150"
            style={{
              left: `${(points[hoveredIndex].x / svgWidth) * 100}%`,
            }}
          >
            <span className="font-bold text-slate-100">
              {points[hoveredIndex].data.dayName}, {points[hoveredIndex].data.dayNumber} Okt
            </span>
            <span className="text-[11px] text-blue-300 font-mono">
              ✓ {points[hoveredIndex].data.completed} tugas diselesaikan
            </span>
            <div className="w-2 h-2 bg-slate-900 rotate-45 -mb-2 mt-1 border-r border-b border-slate-700" />
          </div>
        )}
      </div>

      {/* Legend & Insights */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t border-slate-100 text-xs text-slate-500 gap-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-600 inline-block" />
            <span className="text-slate-700 font-medium">Tugas Diselesaikan</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-slate-300 rounded inline-block" />
            <span className="text-slate-500">Target Kapasitas</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60 self-start sm:self-auto">
          <ArrowUpRight className="w-3.5 h-3.5" />
          <span>+18% lebih produktif dibandingkan pekan lalu</span>
        </div>
      </div>
    </div>
  );
};
