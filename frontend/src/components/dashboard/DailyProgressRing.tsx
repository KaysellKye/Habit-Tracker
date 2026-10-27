import React from 'react';
import { Calendar as CalendarIcon, Flame, Search } from 'lucide-react';

interface DailyProgressRingProps {
  completedCount: number;
  totalCount: number;
  percentage: number;
  streakCount: number;
  currentDateText: string;
  userName: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenCommandPalette?: () => void;
}

export const DailyProgressRing: React.FC<DailyProgressRingProps> = ({
  completedCount,
  totalCount,
  percentage,
  streakCount,
  currentDateText,
  userName,
  searchQuery,
  onSearchChange,
  onOpenCommandPalette,
}) => {
  // SVG calculation for circular ring (radius = 26, circumference = 2 * PI * 26 = 163.36)
  const radius = 26;
  const circumference = 2 * Math.PI * radius; // ~163.36
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <section className="flex flex-col gap-3.5 pt-2">
      {/* Greeting & Date Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
            <span>Selamat pagi, {userName}</span>
            <span className="inline-block animate-wiggle">👋</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 flex items-center gap-1.5 mt-0.5">
            <CalendarIcon className="w-3.5 h-3.5 text-blue-600" />
            <span>{currentDateText}</span>
          </p>
        </div>

        {/* Streak Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-900 shadow-2xs border border-purple-200/50">
          <span className="text-xs">🔥</span>
          <span className="text-xs font-semibold tracking-normal">{streakCount} Hari Streak</span>
        </div>
      </div>

      {/* Daily Progress Summary Card */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-card border border-slate-100 flex items-center gap-4 transition-all hover:shadow-cardHover">
        {/* Circular Progress Ring */}
        <div className="relative w-16 h-16 flex-shrink-0 flex items-center justify-center">
          <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
            {/* Background track circle */}
            <circle
              className="text-slate-100"
              cx="32"
              cy="32"
              fill="transparent"
              r={radius}
              stroke="currentColor"
              strokeWidth="5.5"
            />
            {/* Animated progress circle */}
            <circle
              className="text-blue-600 transition-all duration-700 ease-out"
              cx="32"
              cy="32"
              fill="transparent"
              r={radius}
              stroke="currentColor"
              strokeWidth="5.5"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute font-mono text-sm font-bold text-blue-600">
            {percentage}%
          </span>
        </div>

        {/* Detail Metric */}
        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-semibold text-slate-900 truncate">
              Target Produktivitas
            </span>
            <span className="text-xs font-mono font-medium text-slate-500">
              {completedCount}/{totalCount} Selesai
            </span>
          </div>

          <p className="text-xs text-slate-500 line-clamp-1">
            {percentage >= 100
              ? '🎉 Luar biasa! Semua target hari ini telah selesai.'
              : `${totalCount - completedCount} blok fokus lagi untuk menyelesaikan rencana hari ini.`}
          </p>

          {/* Horizontal Micro Progress Bar */}
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2.5 overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Quick Search / Command Input Bar */}
      <div className="relative flex items-center">
        <Search className="w-4 h-4 absolute left-3.5 text-slate-400" />
        <input
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cari tugas atau ketik perintah waktu (mis. '14:00')..."
          className="w-full bg-white rounded-xl py-2.5 pl-10 pr-24 text-slate-900 text-xs sm:text-sm border border-slate-200/80 shadow-2xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          type="text"
        />
        <div
          onClick={onOpenCommandPalette}
          className="absolute right-2.5 flex items-center gap-1 bg-slate-100 hover:bg-slate-200/70 cursor-pointer px-2 py-0.5 rounded text-[11px] font-mono text-slate-500 border border-slate-200 transition-colors"
        >
          <span>⌘K</span>
        </div>
      </div>
    </section>
  );
};
