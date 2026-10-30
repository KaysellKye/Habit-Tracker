import React from 'react';
import { Calendar as CalendarIcon, Flame, Search, Clock } from 'lucide-react';

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
  currentTimeText?: string;
  greetingText?: string;
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
  currentTimeText,
  greetingText = 'Selamat datang',
}) => {
  // SVG calculation for circular ring (radius = 26, circumference = 2 * PI * 26 = 163.36)
  const radius = 26;
  const circumference = 2 * Math.PI * radius; // ~163.36
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <section className="flex flex-col gap-3.5 pt-2">
      {/* Greeting & Date Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
            <span>{greetingText}, {userName}</span>
            <span className="inline-block animate-wiggle">👋</span>
          </h2>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1">
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium flex items-center gap-1.5">
              <CalendarIcon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>{currentDateText}</span>
            </p>

            {currentTimeText && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60 text-xs font-mono font-semibold">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <Clock className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                <span>{currentTimeText}</span>
              </div>
            )}
          </div>
        </div>

        {/* Streak Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1 self-start sm:self-auto rounded-full bg-purple-100 dark:bg-purple-950/40 text-purple-900 dark:text-purple-300 shadow-2xs border border-purple-200/50 dark:border-purple-800/50">
          <span className="text-xs">🔥</span>
          <span className="text-xs font-semibold tracking-normal">{streakCount} Hari Streak</span>
        </div>
      </div>

      {/* Daily Progress Summary Card */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl shadow-card border border-slate-100 dark:border-slate-800 flex items-center gap-4 transition-all hover:shadow-cardHover">
        {/* Circular Progress Ring */}
        <div className="relative w-16 h-16 flex-shrink-0 flex items-center justify-center">
          <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
            {/* Background track circle */}
            <circle
              className="text-slate-100 dark:text-slate-800"
              cx="32"
              cy="32"
              fill="transparent"
              r={radius}
              stroke="currentColor"
              strokeWidth="5.5"
            />
            {/* Animated progress circle */}
            <circle
              className="text-blue-600 dark:text-blue-500 transition-all duration-700 ease-out"
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
          <span className="absolute font-mono text-sm font-bold text-blue-600 dark:text-blue-400">
            {percentage}%
          </span>
        </div>

        {/* Detail Metric */}
        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">
              Daily Progress
            </span>
            <span className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400">
              {completedCount}/{totalCount} Selesai
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
            {totalCount === 0
              ? 'Belum ada tugas hari ini. Tambahkan tugas baru untuk memulai!'
              : percentage >= 100
              ? '🎉 Luar biasa! Semua tugas hari ini telah selesai.'
              : `${totalCount - completedCount} tugas lagi untuk menyelesaikan target hari ini.`}
          </p>

          {/* Horizontal Micro Progress Bar */}
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-2.5 overflow-hidden">
            <div
              className="bg-blue-600 dark:bg-blue-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Quick Search / Command Input Bar */}
      <div className="relative flex items-center">
        <Search className="w-4 h-4 absolute left-3.5 text-slate-400 dark:text-slate-500" />
        <input
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cari tugas atau ketik perintah waktu (mis. '14:00')..."
          className="w-full bg-white dark:bg-slate-900 rounded-xl py-2.5 pl-10 pr-24 text-slate-900 dark:text-white text-xs sm:text-sm border border-slate-200/80 dark:border-slate-800 shadow-2xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          type="text"
        />
        <div
          onClick={onOpenCommandPalette}
          className="absolute right-2.5 flex items-center gap-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/70 dark:hover:bg-slate-700/70 cursor-pointer px-2 py-0.5 rounded text-[11px] font-mono text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 transition-colors"
        >
          <span>⌘K</span>
        </div>
      </div>
    </section>
  );
};
