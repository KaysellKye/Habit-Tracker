import React from 'react';
import {
  CheckCircle2,
  Calendar as CalendarIcon,
  Clock,
  Sparkles,
  TrendingUp,
  Award,
  ChevronRight,
  ListTodo
} from 'lucide-react';
import { Task, WeekDay } from '../../types';
import { WeekStrip } from '../dashboard/WeekStrip';

interface DailyCompletedViewProps {
  days: WeekDay[];
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
  tasks: Task[];
  onToggleTask?: (taskId: string) => void;
}

export const DailyCompletedView: React.FC<DailyCompletedViewProps> = ({
  days,
  selectedDate,
  onSelectDate,
  tasks,
  onToggleTask,
}) => {
  // Find selected day info
  const selectedDayObj = days.find((d) => d.dateStr === selectedDate) || days[1];

  // Helper date text
  const getFullDateLabel = (dateStr: string) => {
    switch (dateStr) {
      case '2023-10-23':
        return 'Senin, 23 Oktober 2023';
      case '2023-10-24':
        return 'Selasa, 24 Oktober 2023 (Hari Ini)';
      case '2023-10-25':
        return 'Rabu, 25 Oktober 2023';
      case '2023-10-26':
        return 'Kamis, 26 Oktober 2023';
      case '2023-10-27':
        return 'Jumat, 27 Oktober 2023';
      case '2023-10-28':
        return 'Sabtu, 28 Oktober 2023';
      case '2023-10-29':
        return 'Minggu, 29 Oktober 2023';
      default:
        return selectedDayObj.dateStr;
    }
  };

  // Filter tasks for this selected date
  const tasksForDate = tasks.filter((t) => {
    if (t.dateStr) return t.dateStr === selectedDate;
    // fallback default is today (2023-10-24)
    return selectedDate === '2023-10-24' && !t.isOverdue;
  });

  const completedTasks = tasksForDate.filter((t) => t.completed);
  const totalTasks = tasksForDate.length;
  const completedCount = completedTasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  // Calculate daily completions across the whole week for the summary bar
  const weekStats = days.map((day) => {
    const dayTasks = tasks.filter((t) => {
      if (t.dateStr) return t.dateStr === day.dateStr;
      return day.dateStr === '2023-10-24' && !t.isOverdue;
    });
    const done = dayTasks.filter((t) => t.completed).length;
    return {
      dayName: day.dayName,
      dayNumber: day.dayNumber,
      dateStr: day.dateStr,
      isToday: day.isToday,
      doneCount: done,
      totalCount: dayTasks.length,
    };
  });

  const totalWeeklyDone = weekStats.reduce((acc, curr) => acc + curr.doneCount, 0);

  return (
    <div className="flex flex-col gap-5">
      {/* 1. Week Selector */}
      <WeekStrip
        days={days}
        selectedDate={selectedDate}
        onSelectDate={onSelectDate}
      />

      {/* 2. Highlight Box: Berapa Tugas Diselesaikan Hari Ini */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 rounded-3xl p-6 text-white shadow-xl shadow-blue-500/15 relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-indigo-500/20 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-100 flex items-center gap-1.5">
              <CalendarIcon className="w-4 h-4 text-blue-200" />
              <span>{getFullDateLabel(selectedDate)}</span>
            </span>

            <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-medium text-white flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-300" />
              <span>{completionRate}% Tercapai</span>
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pt-1">
            <div>
              <p className="text-blue-100 text-xs sm:text-sm font-medium">
                Tugas yang Diselesaikan:
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-4xl sm:text-5xl font-mono font-extrabold tracking-tight">
                  {completedCount}
                </span>
                <span className="text-xl sm:text-2xl font-bold text-blue-100">
                  Tugas Selesai
                </span>
              </div>
            </div>

            {totalTasks > 0 && (
              <div className="text-right sm:text-right">
                <span className="text-xs font-mono text-blue-100 block">
                  Dari total {totalTasks} rencana tugas hari ini
                </span>
                <span className="text-[11px] text-blue-200">
                  {totalTasks - completedCount > 0
                    ? `${totalTasks - completedCount} tugas belum selesai`
                    : 'Semua rencana tugas tuntas! 🎯'}
                </span>
              </div>
            )}
          </div>

          {/* Progress bar */}
          <div className="w-full bg-white/20 rounded-full h-2 mt-1 overflow-hidden">
            <div
              className="bg-emerald-400 h-full rounded-full transition-all duration-700 ease-out"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3. Ringkasan Mingguan Cepat (Mini Days Completion Badges) */}
      <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-100 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Pencapaian Pekan Ini
            </h4>
          </div>
          <span className="text-xs font-mono font-semibold text-blue-600">
            Total {totalWeeklyDone} Tugas Selesai
          </span>
        </div>

        <div className="grid grid-cols-7 gap-1.5 pt-1">
          {weekStats.map((stat) => {
            const isSelected = stat.dateStr === selectedDate;
            return (
              <button
                key={stat.dateStr}
                onClick={() => onSelectDate(stat.dateStr)}
                className={`flex flex-col items-center py-2 px-1 rounded-xl transition-all ${
                  isSelected
                    ? 'bg-blue-50 border-2 border-blue-500 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 border border-transparent'
                }`}
              >
                <span className="text-[10px] font-medium text-slate-500">
                  {stat.dayName}
                </span>
                <span className="text-sm font-bold font-mono text-slate-800 mt-0.5">
                  {stat.doneCount}
                </span>
                <span className="text-[9px] text-slate-400 font-medium">
                  selesai
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Rincian Daftar Tugas yang Diselesaikan pada Hari Terpilih */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Daftar Tugas Selesai ({completedCount})
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {selectedDayObj.dayName}, {selectedDayObj.dayNumber} Okt
          </span>
        </div>

        {completedCount === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-dashed border-slate-200 text-center flex flex-col items-center justify-center gap-2.5 shadow-2xs">
            <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
              <ListTodo className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">
                Belum ada tugas yang diselesaikan pada hari ini
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Tandai selesai tugas Anda pada menu <span className="font-semibold text-blue-600">Hari Ini</span> atau <span className="font-semibold text-blue-600">Semua Tugas</span> untuk mencatat pencapaian di sini.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {completedTasks.map((task) => (
              <div
                key={task.id}
                className="bg-white rounded-2xl p-4 shadow-card border border-slate-100 flex items-center justify-between transition-all hover:shadow-cardHover"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => onToggleTask?.(task.id)}
                    className="w-5 h-5 rounded-md bg-emerald-500 text-white flex items-center justify-center shadow-xs flex-shrink-0 cursor-pointer hover:bg-emerald-600 transition-colors"
                    title="Klik untuk membatalkan"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>

                  <div className="truncate">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {/* Category Badge */}
                      <span
                        className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                          task.category === 'Kerja'
                            ? 'bg-amber-100 text-amber-900 border border-amber-200'
                            : task.category === 'Produktif'
                            ? 'bg-blue-100 text-blue-900 border border-blue-200'
                            : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                        }`}
                      >
                        {task.category}
                      </span>

                      {/* Time */}
                      {task.timeRange && (
                        <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {task.timeRange}
                        </span>
                      )}

                      {/* Subtask count */}
                      {task.subtasks.length > 0 && (
                        <span className="text-[11px] font-mono text-emerald-600 font-medium">
                          {task.subtasks.filter((s) => s.completed).length}/
                          {task.subtasks.length} Subtask
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200/60 flex-shrink-0">
                  ✓ Selesai
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
