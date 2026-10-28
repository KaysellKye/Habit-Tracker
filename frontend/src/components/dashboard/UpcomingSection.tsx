import React from 'react';
import { CalendarRange, GraduationCap, ShoppingBag, Briefcase, MoreVertical } from 'lucide-react';
import { UpcomingTaskItem } from '../../types';
import { getTomorrowDateLabel } from '../../utils/dateUtils';

interface UpcomingSectionProps {
  upcomingTasks: UpcomingTaskItem[];
  dateBadgeText?: string;
}

export const UpcomingSection: React.FC<UpcomingSectionProps> = ({
  upcomingTasks,
  dateBadgeText,
}) => {
  const displayDateBadge = dateBadgeText || getTomorrowDateLabel();
  return (
    <section className="flex flex-col gap-3 mb-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarRange className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            Besok & Mendatang
          </h3>
        </div>
        <span className="text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-0.5 rounded-full border border-slate-200/60 dark:border-slate-700">
          {displayDateBadge}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        {upcomingTasks.map((task) => {
          return (
            <div
              key={task.id}
              className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl shadow-card border border-slate-100 dark:border-slate-800 flex items-center justify-between hover:bg-slate-50/80 dark:hover:bg-slate-800/80 transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Category Icon Box */}
                {task.iconType === 'school' && (
                  <div className="w-9 h-9 rounded-xl bg-cyan-100 dark:bg-cyan-950/60 flex items-center justify-center text-cyan-800 dark:text-cyan-300 flex-shrink-0">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                )}
                {task.iconType === 'shopping' && (
                  <div className="w-9 h-9 rounded-xl bg-pink-100 dark:bg-pink-950/60 flex items-center justify-center text-pink-800 dark:text-pink-300 flex-shrink-0">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                )}
                {task.iconType === 'work' && (
                  <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950/60 flex items-center justify-center text-purple-800 dark:text-purple-300 flex-shrink-0">
                    <Briefcase className="w-5 h-5" />
                  </div>
                )}

                <div className="truncate">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate leading-snug">
                    {task.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      {task.category}
                    </span>
                    <span className="text-slate-300 dark:text-slate-600 text-[10px]">•</span>
                    <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                      {task.timeStr}
                    </span>
                  </div>
                </div>
              </div>

              <button
                aria-label="Opsi"
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex-shrink-0"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
};
