import React from 'react';
import { AlertTriangle, Check, RefreshCw, Clock, Trash2 } from 'lucide-react';
import { Task } from '../../types';

interface OverdueSectionProps {
  tasks: Task[];
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string, taskTitle: string) => void;
  onOpenTaskDetail?: (task: Task) => void;
}

export const OverdueSection: React.FC<OverdueSectionProps> = ({
  tasks,
  onToggleTask,
  onDeleteTask,
  onOpenTaskDetail,
}) => {
  const overdueTasks = tasks.filter((t) => t.isOverdue && !t.completed);

  if (overdueTasks.length === 0) return null;

  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <h3 className="text-xs font-bold text-red-600 uppercase tracking-wider">
            Perlu Diselesaikan Segera
          </h3>
        </div>
        <span className="text-[11px] font-semibold bg-red-100 text-red-700 px-2 py-0.5 rounded-full border border-red-200">
          {overdueTasks.length} Tertunda
        </span>
      </div>

      {overdueTasks.map((task) => (
        <div
          key={task.id}
          className="bg-red-50/70 hover:bg-red-50 border border-red-100 rounded-2xl p-3.5 sm:p-4 shadow-2xs flex items-start gap-3 transition-all group"
        >
          {/* Checkbox */}
          <button
            onClick={() => onToggleTask(task.id)}
            aria-label="Tandai selesai"
            className="mt-0.5 w-5 h-5 rounded-md flex items-center justify-center bg-white border border-red-300 text-transparent hover:text-red-600 hover:border-red-500 active:scale-95 transition-all shadow-2xs flex-shrink-0"
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </button>

          {/* Task Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <p
                onClick={() => onOpenTaskDetail?.(task)}
                className="text-sm font-semibold text-slate-900 truncate leading-snug cursor-pointer hover:text-blue-600 transition-colors"
              >
                {task.title}
              </p>

              {/* Google Sync Indicator */}
              {task.isGoogleSync && (
                <div
                  className="flex items-center text-amber-600 flex-shrink-0"
                  title="Tersinkronisasi Google Calendar"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </div>
              )}

              {/* Delete Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteTask(task.id, task.title);
                }}
                className="flex items-center justify-center w-6 h-6 rounded-md text-slate-400 opacity-0 group-hover:opacity-100 hover:text-red-600 hover:bg-red-50 transition-all flex-shrink-0"
                aria-label="Hapus tugas"
                title="Hapus tugas"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Badges Row */}
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {/* Priority Pill */}
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-red-600 text-white">
                {task.priority}
              </span>

              {/* Category Pill */}
              <span
                className={`text-[11px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1 ${
                  task.category === 'Kerja'
                    ? 'bg-amber-100 text-amber-900 border border-amber-200'
                    : task.category === 'Produktif'
                    ? 'bg-blue-100 text-blue-900 border border-blue-200'
                    : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    task.category === 'Kerja'
                      ? 'bg-amber-500'
                      : task.category === 'Produktif'
                      ? 'bg-blue-600'
                      : 'bg-emerald-500'
                  }`}
                />
                {task.category}
              </span>

              {/* Deadline */}
              <span className="text-[11px] font-mono font-medium text-red-600 flex items-center gap-1 ml-auto">
                <Clock className="w-3 h-3" />
                <span>{task.dueDate}, {task.dueTime}</span>
              </span>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
};
