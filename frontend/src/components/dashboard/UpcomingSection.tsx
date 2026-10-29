import React, { useState } from 'react';
import {
  CalendarRange,
  Plus,
  Clock,
  MoreVertical,
  Trash2,
  Sparkles,
  CheckCircle2,
  CalendarPlus,
} from 'lucide-react';
import { Task, CategoryItem } from '../../types';
import { getTomorrowDateLabel } from '../../utils/dateUtils';
import { getCategoryStyle } from '../../utils/categoryUtils';

interface UpcomingSectionProps {
  tasks: Task[];
  dateBadgeText?: string;
  onToggleTask?: (taskId: string) => void;
  onDeleteTask?: (taskId: string, title: string) => void;
  onAddTomorrowTask?: () => void;
  categories?: CategoryItem[];
}

export const UpcomingSection: React.FC<UpcomingSectionProps> = ({
  tasks,
  dateBadgeText,
  onToggleTask,
  onDeleteTask,
  onAddTomorrowTask,
  categories,
}) => {
  const displayDateBadge = dateBadgeText || getTomorrowDateLabel();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  return (
    <section className="flex flex-col gap-3 mb-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarRange className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            Besok & Mendatang
          </h3>
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
            ({tasks.length})
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-0.5 rounded-full border border-slate-200/60 dark:border-slate-700">
            {displayDateBadge}
          </span>
          {onAddTomorrowTask && (
            <button
              onClick={onAddTomorrowTask}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800/60 transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tambah Tugas Besok</span>
              <span className="sm:hidden">+ Besok</span>
            </button>
          )}
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <CalendarPlus className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Belum ada tugas untuk esok hari
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-0.5">
              Siapkan rencana kegiatan besok lebih awal agar hari Anda berjalan lebih teratur dan produktif.
            </p>
          </div>
          {onAddTomorrowTask && (
            <button
              onClick={onAddTomorrowTask}
              className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Tambah Tugas Esok Hari</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2.5">
          {tasks.map((task) => {
            const style = getCategoryStyle(task.category, categories);
            const isCompleted = task.completed;

            return (
              <div
                key={task.id}
                className={`group bg-white dark:bg-slate-900 p-3 sm:p-3.5 rounded-2xl shadow-card border transition-all flex items-center justify-between ${
                  isCompleted
                    ? 'border-emerald-100 dark:border-emerald-950/40 bg-emerald-50/20 dark:bg-emerald-950/10'
                    : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50/70 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {onToggleTask && (
                    <input
                      type="checkbox"
                      checked={isCompleted}
                      onChange={() => onToggleTask(task.id)}
                      className="w-4 h-4 rounded text-blue-600 bg-slate-100 dark:bg-slate-800 accent-blue-600 cursor-pointer flex-shrink-0"
                      aria-label="Tandai selesai"
                    />
                  )}

                  <div className="truncate flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4
                        className={`text-sm font-semibold truncate leading-snug ${
                          isCompleted
                            ? 'line-through text-slate-400 dark:text-slate-500'
                            : 'text-slate-900 dark:text-slate-100'
                        }`}
                      >
                        {task.title}
                      </h4>
                      {task.isGoogleSync && (
                        <span
                          className="hidden sm:inline-flex items-center gap-0.5 text-[10px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded font-mono border border-amber-200/60 dark:border-amber-800/40 flex-shrink-0"
                          title="Tersinkronisasi Google Calendar"
                        >
                          <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                          <span>G-Cal</span>
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      {/* Dynamic Category Pill */}
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-full border flex items-center gap-1 ${style.badgeClass}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${style.dotClass}`} />
                        <span>{task.category}</span>
                      </span>

                      {/* Priority */}
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {task.priority}
                      </span>

                      {/* Time Range */}
                      {task.timeRange && (
                        <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                          <span>{task.timeRange}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions / Menu */}
                <div className="relative ml-2 flex-shrink-0">
                  <button
                    onClick={() => setOpenMenuId(openMenuId === task.id ? null : task.id)}
                    aria-label="Opsi tugas"
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {openMenuId === task.id && onDeleteTask && (
                    <div className="absolute right-0 top-full mt-1 w-32 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 py-1 z-30">
                      <button
                        onClick={() => {
                          setOpenMenuId(null);
                          onDeleteTask(task.id, task.title);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2 font-medium"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
