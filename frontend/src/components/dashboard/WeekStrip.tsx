import React from 'react';
import { WeekDay } from '../../types';
import { getMonthYearLabel } from '../../utils/dateUtils';

interface WeekStripProps {
  days: WeekDay[];
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
  monthYearLabel?: string;
}

export const WeekStrip: React.FC<WeekStripProps> = ({
  days,
  selectedDate,
  onSelectDate,
  monthYearLabel,
}) => {
  const displayMonthYear = monthYearLabel || getMonthYearLabel();

  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center justify-between px-0.5">
        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Pekan Ini</span>
        <span className="text-xs font-mono font-semibold text-blue-600 dark:text-blue-400">
          {displayMonthYear}
        </span>
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-2 bg-white dark:bg-slate-900 p-2 sm:p-2.5 rounded-2xl shadow-card border border-slate-100 dark:border-slate-800 text-center transition-colors">
        {days.map((day) => {
          const isSelected = selectedDate === day.dateStr || (day.isToday && !selectedDate);
          return (
            <button
              key={day.dateStr}
              onClick={() => onSelectDate(day.dateStr)}
              className={`flex flex-col items-center py-2 sm:py-2.5 rounded-xl transition-all ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 font-semibold'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <span
                className={`text-[11px] font-medium ${
                  isSelected ? 'text-white/90' : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                {day.dayName}
              </span>
              <span
                className={`text-sm sm:text-base font-mono font-bold mt-0.5 ${
                  isSelected ? 'text-white' : 'text-slate-800 dark:text-slate-100'
                }`}
              >
                {day.dayNumber}
              </span>
              {isSelected ? (
                <span className="w-1.5 h-1.5 rounded-full bg-white mt-1" />
              ) : (
                day.hasTasks && (
                  <span className="w-1 h-1 rounded-full bg-blue-500 dark:bg-blue-400 mt-1" />
                )
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
};
