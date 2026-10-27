import React from 'react';
import { CalendarRange, GraduationCap, ShoppingBag, Briefcase, MoreVertical } from 'lucide-react';
import { UpcomingTaskItem } from '../../types';

interface UpcomingSectionProps {
  upcomingTasks: UpcomingTaskItem[];
  dateBadgeText?: string;
}

export const UpcomingSection: React.FC<UpcomingSectionProps> = ({
  upcomingTasks,
  dateBadgeText = 'Rabu, 25 Okt',
}) => {
  return (
    <section className="flex flex-col gap-3 mb-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarRange className="w-5 h-5 text-slate-500" />
          <h3 className="text-base sm:text-lg font-bold text-slate-900">
            Besok & Mendatang
          </h3>
        </div>
        <span className="text-[11px] font-medium bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full border border-slate-200/60">
          {dateBadgeText}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        {upcomingTasks.map((task) => {
          return (
            <div
              key={task.id}
              className="bg-white p-3.5 rounded-2xl shadow-card border border-slate-100 flex items-center justify-between hover:bg-slate-50/80 transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Category Icon Box */}
                {task.iconType === 'school' && (
                  <div className="w-9 h-9 rounded-xl bg-cyan-100 flex items-center justify-center text-cyan-800 flex-shrink-0">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                )}
                {task.iconType === 'shopping' && (
                  <div className="w-9 h-9 rounded-xl bg-pink-100 flex items-center justify-center text-pink-800 flex-shrink-0">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                )}
                {task.iconType === 'work' && (
                  <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center text-purple-800 flex-shrink-0">
                    <Briefcase className="w-5 h-5" />
                  </div>
                )}

                <div className="truncate">
                  <h4 className="text-sm font-semibold text-slate-900 truncate leading-snug">
                    {task.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] text-slate-500 font-medium">
                      {task.category}
                    </span>
                    <span className="text-slate-300 text-[10px]">•</span>
                    <span className="text-[11px] font-mono text-slate-500">
                      {task.timeStr}
                    </span>
                  </div>
                </div>
              </div>

              <button
                aria-label="Opsi"
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors flex-shrink-0"
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
