import React, { useState } from 'react';
import {
  CheckSquare,
  PlusCircle,
  Clock,
  Tag,
  Calendar,
  Check,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Trash2,
  MoreVertical,
} from 'lucide-react';
import { Task, Category, Priority } from '../../types';

interface TodayTasksSectionProps {
  tasks: Task[];
  onToggleTask: (taskId: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onAddTask: (task: Partial<Task>) => void;
  onDeleteTask: (taskId: string, taskTitle: string) => void;
  onOpenTaskDetail?: (task: Task) => void;
}

export const TodayTasksSection: React.FC<TodayTasksSectionProps> = ({
  tasks,
  onToggleTask,
  onToggleSubtask,
  onAddTask,
  onDeleteTask,
  onOpenTaskDetail,
}) => {
  const [quickInput, setQuickInput] = useState('');
  const [selectedTag, setSelectedTag] = useState<Category>('Kerja');
  const [selectedTime, setSelectedTime] = useState<string>('09:00 - 10:00');
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const todayTasks = tasks.filter((t) => !t.isOverdue && (!t.dateStr || t.dateStr === '2023-10-24'));

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) return;

    onAddTask({
      title: quickInput.trim(),
      category: selectedTag,
      timeRange: selectedTime,
      priority: 'Medium',
      completed: false,
      subtasks: [],
      isGoogleSync: true,
    });

    setQuickInput('');
  };

  const toggleExpand = (taskId: string) => {
    setExpandedTaskId((prev) => (prev === taskId ? null : taskId));
  };

  return (
    <section className="flex flex-col gap-3">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-blue-600" />
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            Tugas Hari Ini
          </h3>
        </div>
        <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
          {todayTasks.length} Rencana
        </span>
      </div>

      {/* Quick Add Inline Field */}
      <form
        onSubmit={handleQuickSubmit}
        className="bg-white dark:bg-slate-900 rounded-2xl p-2.5 sm:p-3 shadow-card border border-slate-100 dark:border-slate-800 flex items-center gap-2 transition-all focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-400 dark:focus-within:border-blue-500"
      >
        <PlusCircle className="w-5 h-5 text-blue-600 ml-1 flex-shrink-0" />
        <input
          value={quickInput}
          onChange={(e) => setQuickInput(e.target.value)}
          placeholder="Tambah tugas cepat... tekan Enter"
          className="flex-1 min-w-0 bg-transparent text-slate-900 dark:text-slate-100 text-xs sm:text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
        />

        {/* Time button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              const newTime = prompt('Masukkan rentang jam (mis. 14:00 - 15:30):', selectedTime);
              if (newTime) setSelectedTime(newTime);
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium border border-slate-200/60 dark:border-slate-700 transition-colors"
          >
            <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            <span className="hidden sm:inline">{selectedTime || 'Waktu'}</span>
            <span className="sm:hidden">Waktu</span>
          </button>
        </div>

        {/* Tag button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowTagDropdown(!showTagDropdown)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium border border-slate-200/60 dark:border-slate-700 transition-colors"
          >
            <Tag className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            <span>{selectedTag}</span>
          </button>

          {showTagDropdown && (
            <div className="absolute right-0 top-full mt-1.5 w-32 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 py-1 z-30">
              {(['Kerja', 'Produktif', 'Hiburan'] as Category[]).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setSelectedTag(cat);
                    setShowTagDropdown(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 flex items-center justify-between"
                >
                  <span>{cat}</span>
                  {selectedTag === cat && <Check className="w-3 h-3 text-blue-600 dark:text-blue-400" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </form>

      {/* Task List */}
      <div className="flex flex-col gap-2.5">
        {todayTasks.map((task) => {
          const totalSubtasks = task.subtasks.length;
          const completedSubtasks = task.subtasks.filter((s) => s.completed).length;
          const progressPercent = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;
          const isExpanded = expandedTaskId === task.id;

          // Completed Task Styling
          if (task.completed) {
            return (
              <div
                key={task.id}
                className="bg-slate-50/80 dark:bg-slate-900/60 rounded-2xl p-3.5 sm:p-4 shadow-2xs border border-slate-200/60 dark:border-slate-800 flex items-start gap-3 opacity-75 transition-all group"
              >
                <input
                  type="checkbox"
                  checked={true}
                  onChange={() => onToggleTask(task.id)}
                  className="mt-1 w-4 h-4 rounded text-blue-600 bg-slate-100 dark:bg-slate-800 accent-blue-600 cursor-pointer"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      onClick={() => onToggleTask(task.id)}
                      className="text-sm font-medium text-slate-500 dark:text-slate-400 line-through cursor-pointer"
                    >
                      {task.title}
                    </span>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        Selesai
                      </span>
                      {/* Delete Button on Completed Task */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteTask(task.id, task.title);
                        }}
                        className="w-6 h-6 flex items-center justify-center rounded-md text-slate-400 dark:text-slate-500 opacity-0 group-hover:opacity-100 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
                        aria-label="Hapus tugas"
                        title="Hapus tugas"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {task.category}
                    </span>
                    {task.timeRange && (
                      <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                        {task.timeRange}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          }

          // Active Task Card
          return (
            <div
              key={task.id}
              className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 sm:p-4 shadow-card border border-slate-100 dark:border-slate-800 flex flex-col gap-2 transition-all hover:shadow-cardHover group"
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={false}
                  onChange={() => onToggleTask(task.id)}
                  id={`task-${task.id}`}
                  className="mt-1 w-4 h-4 rounded text-blue-600 bg-slate-100 dark:bg-slate-800 accent-blue-600 cursor-pointer"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1.5">
                    <label
                      htmlFor={`task-${task.id}`}
                      className="text-sm font-semibold text-slate-900 dark:text-slate-100 cursor-pointer leading-snug hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {task.title}
                    </label>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      {/* Google Calendar Sync Badge */}
                      {task.isGoogleSync && (
                        <span
                          className="flex items-center gap-1 text-[11px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md font-mono border border-amber-200/60 dark:border-amber-800/40"
                          title="Tersinkronisasi dengan Google Calendar"
                        >
                          <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                          <span>G-Cal</span>
                        </span>
                      )}

                      {/* Context Menu (⋮) */}
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(openMenuId === task.id ? null : task.id);
                          }}
                          className="w-6 h-6 flex items-center justify-center rounded-md text-slate-400 dark:text-slate-500 opacity-0 group-hover:opacity-100 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                          aria-label="Menu opsi tugas"
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>

                        {/* Dropdown Context Menu */}
                        {openMenuId === task.id && (
                          <div className="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 py-1 z-30">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuId(null);
                                onDeleteTask(task.id, task.title);
                              }}
                              className="w-full text-left px-3 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2 font-medium"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Hapus Tugas</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Meta badges */}
                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    {/* Category */}
                    {task.category === 'Kerja' && (
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-900 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/40 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        Kerja
                      </span>
                    )}
                    {task.category === 'Produktif' && (
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/50 text-blue-900 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/40 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                        Produktif
                      </span>
                    )}
                    {task.category === 'Hiburan' && (
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/40 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Hiburan
                      </span>
                    )}

                    {/* Priority */}
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {task.priority}
                    </span>

                    {/* Time Range */}
                    {task.timeRange && (
                      <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                        {task.timeRange}
                      </span>
                    )}
                  </div>

                  {/* Subtask Progress & Expand Button */}
                  {totalSubtasks > 0 && (
                    <div className="mt-2.5 pt-1.5 border-t border-slate-50 dark:border-slate-800 flex flex-col gap-1.5">
                      <div
                        onClick={() => toggleExpand(task.id)}
                        className="flex items-center justify-between cursor-pointer group"
                      >
                        <div className="flex items-center gap-2 flex-1 max-w-xs">
                          <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                progressPercent === 100 ? 'bg-emerald-500' : 'bg-blue-600'
                              }`}
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex-shrink-0 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                            {completedSubtasks}/{totalSubtasks} Subtask
                          </span>
                        </div>

                        <button
                          type="button"
                          className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 p-0.5"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                      {/* Expanded Subtasks checklist */}
                      {isExpanded && (
                        <div className="flex flex-col gap-1.5 pt-1.5 pl-1">
                          {task.subtasks.map((sub) => (
                            <div
                              key={sub.id}
                              onClick={() => onToggleSubtask(task.id, sub.id)}
                              className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                            >
                              <div
                                className={`w-3.5 h-3.5 rounded flex items-center justify-center border transition-all ${
                                  sub.completed
                                    ? 'bg-blue-600 border-blue-600 text-white'
                                    : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                                }`}
                              >
                                {sub.completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                              </div>
                              <span className={sub.completed ? 'line-through text-slate-400 dark:text-slate-500' : ''}>
                                {sub.title}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
