import React, { useState, useMemo, useEffect } from 'react';
import { TopBar } from './components/layout/TopBar';
import { Sidebar } from './components/layout/Sidebar';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { DailyProgressRing } from './components/dashboard/DailyProgressRing';
import { OverdueSection } from './components/dashboard/OverdueSection';
import { WeekStrip } from './components/dashboard/WeekStrip';
import { TodayTasksSection } from './components/dashboard/TodayTasksSection';
import { TimeBlockingSection } from './components/dashboard/TimeBlockingSection';
import { UpcomingSection } from './components/dashboard/UpcomingSection';
import { DailyCompletedView } from './components/calendar/DailyCompletedView';
import { QuickAddModal } from './components/modals/QuickAddModal';
import { ConflictResolverModal } from './components/modals/ConflictResolverModal';
import { ConfirmDeleteModal } from './components/modals/ConfirmDeleteModal';
import { AuthModal } from './components/modals/AuthModal';
import { EditProfileModal } from './components/modals/EditProfileModal';
import { TimeBlockModal } from './components/modals/TimeBlockModal';
import { ProductivityLineChart } from './components/stats/ProductivityLineChart';
import { useTheme } from './context/ThemeContext';
import {
  initialTasks,
  initialTimeline,
  initialWeekDays,
  initialUpcomingTasks,
} from './data/mockData';
import { Task, Category, TimelineItem, UserProfile } from './types';
import {
  apiGetMe,
  apiGetTasks,
  apiCreateTask,
  apiUpdateTask,
  apiDeleteTask,
  apiBulkSyncTasks,
  getLocalUser,
  getToken,
  removeToken,
  removeLocalUser,
  getLocalTasks,
  setLocalTasks,
} from './services/api';
import {
  RefreshCw,
  User,
  LogIn,
  CheckCircle2,
  Sparkles,
  Sun,
  Moon,
  Laptop,
} from 'lucide-react';

export const App: React.FC = () => {
  const { theme, setTheme } = useTheme();

  // Navigation & UI state
  const [activeTab, setActiveTab] = useState<string>('hari-ini');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('2023-10-24');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // User Profile & Authentication state
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => getLocalUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  // Modals state
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [activeConflict, setActiveConflict] = useState<TimelineItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [editingTimeBlock, setEditingTimeBlock] = useState<TimelineItem | null>(null);
  const [isTimeBlockModalOpen, setIsTimeBlockModalOpen] = useState(false);

  // Data state
  const [tasks, setTasks] = useState<Task[]>(() => {
    const cached = getLocalTasks();
    return cached && cached.length > 0 ? cached : initialTasks;
  });
  const [timeline, setTimeline] = useState<TimelineItem[]>(() => {
    try {
      const saved = localStorage.getItem('timeblock_timeline');
      if (saved) return JSON.parse(saved);
    } catch {}
    return initialTimeline;
  });
  const [weekDays] = useState(initialWeekDays);
  const [upcomingTasks] = useState(initialUpcomingTasks);

  // Save timeline to localStorage
  useEffect(() => {
    localStorage.setItem('timeblock_timeline', JSON.stringify(timeline));
  }, [timeline]);

  // Sync / verify user session on mount
  useEffect(() => {
    const token = getToken();
    if (token) {
      // Fetch latest profile
      apiGetMe()
        .then((user) => {
          setCurrentUser(user);
          // Fetch synced tasks from server
          return apiGetTasks();
        })
        .then((serverTasks) => {
          if (serverTasks && serverTasks.length > 0) {
            setTasks(serverTasks);
          }
        })
        .catch((err) => {
          console.warn('Backend server offline or token expired. Using local mode.', err);
        });
    }
  }, []);

  // Save to localStorage whenever tasks change
  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  // Filter tasks based on Category & Search Query
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchCategory =
        selectedCategory === 'all' || task.category === selectedCategory;
      const matchSearch =
        searchQuery.trim() === '' ||
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.priority.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [tasks, selectedCategory, searchQuery]);

  // Dynamic Productivity Progress Calculation
  const { completedCount, totalCount, percentage } = useMemo(() => {
    let completed = 0;
    let total = 0;

    tasks.forEach((t) => {
      if (t.subtasks && t.subtasks.length > 0) {
        total += t.subtasks.length;
        completed += t.subtasks.filter((s) => s.completed).length;
      } else {
        total += 1;
        if (t.completed) completed += 1;
      }
    });

    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completedCount: completed, totalCount: total, percentage: percent };
  }, [tasks]);

  // Counts for sidebar badges
  const taskCounts = useMemo(() => {
    const today = tasks.filter((t) => !t.isOverdue && !t.completed).length;
    const overdue = tasks.filter((t) => t.isOverdue && !t.completed).length;
    return { today, all: tasks.length, overdue };
  }, [tasks]);

  // Handlers for Auth
  const handleAuthSuccess = async (user: UserProfile) => {
    setCurrentUser(user);
    try {
      const serverTasks = await apiGetTasks();
      if (serverTasks && serverTasks.length > 0) {
        setTasks(serverTasks);
      } else if (tasks.length > 0) {
        // Sync local tasks up to the new user account
        await apiBulkSyncTasks(tasks);
      }
    } catch (err) {
      console.warn('Could not sync tasks with server:', err);
    }
  };

  const handleLogout = () => {
    removeToken();
    removeLocalUser();
    setCurrentUser(null);
  };

  // Handlers for Tasks
  const handleToggleTask = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const willBeCompleted = !task.completed;
    const updatedSubtasks = (task.subtasks || []).map((s) => ({ ...s, completed: willBeCompleted }));

    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: willBeCompleted, subtasks: updatedSubtasks } : t))
    );

    if (getToken()) {
      apiUpdateTask(taskId, { completed: willBeCompleted, subtasks: updatedSubtasks }).catch((err) =>
        console.warn('Failed to sync task toggle to server', err)
      );
    }
  };

  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const updatedSubtasks = (task.subtasks || []).map((sub) =>
      sub.id === subtaskId ? { ...sub, completed: !sub.completed } : sub
    );
    const allDone = updatedSubtasks.every((s) => s.completed);

    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, subtasks: updatedSubtasks, completed: allDone } : t))
    );

    if (getToken()) {
      apiUpdateTask(taskId, { subtasks: updatedSubtasks, completed: allDone }).catch((err) =>
        console.warn('Failed to sync subtask toggle to server', err)
      );
    }
  };

  const handleAddTask = (newTaskData: Partial<Task>) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: newTaskData.title || 'Tugas Baru',
      category: newTaskData.category || 'Kerja',
      priority: newTaskData.priority || 'Medium',
      completed: false,
      timeRange: newTaskData.timeRange || '10:00 - 11:00',
      dateStr: selectedDate || '2023-10-24',
      isGoogleSync: newTaskData.isGoogleSync ?? true,
      subtasks: newTaskData.subtasks || [],
    };

    setTasks((prev) => [newTask, ...prev]);

    if (getToken()) {
      apiCreateTask(newTask)
        .then((saved) => {
          setTasks((prev) => prev.map((t) => (t.id === newTask.id ? saved : t)));
        })
        .catch((err) => console.warn('Failed to sync task creation to server', err));
    }
  };

  const handleDeleteTask = (taskId: string, taskTitle: string) => {
    setDeleteTarget({ id: taskId, title: taskTitle });
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    const targetId = deleteTarget.id;
    setTasks((prev) => prev.filter((task) => task.id !== targetId));
    setDeleteTarget(null);

    if (getToken()) {
      apiDeleteTask(targetId).catch((err) => console.warn('Failed to delete task on server', err));
    }
  };

  const handleResolveConflictSlot = (newStart: string, newEnd: string) => {
    if (!activeConflict) return;

    setTimeline((prev) =>
      prev.map((item) => {
        if (item.id === activeConflict.id) {
          return {
            ...item,
            startTime: newStart,
            endTime: newEnd,
            type: 'focus',
            badgeText: 'JADWAL DIGESER',
            subtitle: `Dipindahkan ke ${newStart} - ${newEnd} (Bebas Bentrok)`,
            conflictDetails: undefined,
          };
        }
        return item;
      })
    );

    setActiveConflict(null);
  };

  const handleAddTimeBlock = () => {
    setEditingTimeBlock(null);
    setIsTimeBlockModalOpen(true);
  };

  const handleEditTimeBlock = (block: TimelineItem) => {
    setEditingTimeBlock(block);
    setIsTimeBlockModalOpen(true);
  };

  const handleSaveTimeBlock = (savedBlock: TimelineItem) => {
    setTimeline((prev) => {
      const exists = prev.some((b) => b.id === savedBlock.id);
      if (exists) {
        return prev.map((b) => (b.id === savedBlock.id ? savedBlock : b));
      }
      return [...prev, savedBlock].sort((a, b) => a.startTime.localeCompare(b.startTime));
    });
  };

  const handleDeleteTimeBlock = (id: string) => {
    setTimeline((prev) => prev.filter((b) => b.id !== id));
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case 'tugas':
        return 'Semua Tugas';
      case 'kalender':
        return 'Kalender Terpadu';
      case 'analitik':
        return 'Analisa Produktivitas';
      case 'pengaturan':
        return 'Pengaturan';
      default:
        return 'Hari Ini';
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFBFC] dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      {/* 1. TopBar (Fixed) with Auth & Profile state */}
      <TopBar
        onToggleSidebar={() => setIsMobileSidebarOpen(true)}
        onOpenSearch={() => {
          const inputEl = document.querySelector('input[placeholder*="Cari tugas"]') as HTMLInputElement;
          inputEl?.focus();
        }}
        onOpenQuickAdd={() => setIsQuickAddOpen(true)}
        activeTabTitle={getTabTitle()}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenEditProfile={() => setIsEditProfileOpen(true)}
        onLogout={handleLogout}
      />

      <div className="flex flex-1 pt-16">
        {/* 2. Persistent Desktop Sidebar & Mobile Drawer */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          onOpenQuickAdd={() => setIsQuickAddOpen(true)}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          taskCounts={taskCounts}
          currentUser={currentUser}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onOpenEditProfile={() => setIsEditProfileOpen(true)}
        />

        {/* 3. Main Content Area */}
        <main className="flex-1 md:pl-64 flex flex-col min-w-0 pb-24 md:pb-12">
          <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-4 flex flex-col gap-6">
            {/* TAB: HARI INI */}
            {activeTab === 'hari-ini' && (
              <>
                {/* 1. Header & Daily Progress Ring */}
                <DailyProgressRing
                  completedCount={completedCount}
                  totalCount={totalCount}
                  percentage={percentage}
                  streakCount={currentUser?.streakCount || 5}
                  currentDateText="Selasa, 24 Oktober 2023"
                  userName={currentUser ? currentUser.name : 'Tamu'}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  onOpenCommandPalette={() => setIsQuickAddOpen(true)}
                />

                {/* 2. Overdue Section (Perlu Diselesaikan Segera) */}
                <OverdueSection
                  tasks={filteredTasks}
                  onToggleTask={handleToggleTask}
                  onDeleteTask={handleDeleteTask}
                />

                {/* 3. Horizontal Calendar Week Strip */}
                <WeekStrip
                  days={weekDays}
                  selectedDate={selectedDate}
                  onSelectDate={setSelectedDate}
                />

                {/* 4. Today Tasks Section (Tugas Hari Ini) */}
                <TodayTasksSection
                  tasks={filteredTasks}
                  onToggleTask={handleToggleTask}
                  onToggleSubtask={handleToggleSubtask}
                  onAddTask={handleAddTask}
                  onDeleteTask={handleDeleteTask}
                />

                {/* 5. Timeline & Time-Blocking Hari Ini */}
                <TimeBlockingSection
                  timeline={timeline}
                  onOpenFullGrid={() => setActiveTab('kalender')}
                  onResolveConflict={(block) => setActiveConflict(block)}
                  onAddBlock={handleAddTimeBlock}
                  onEditBlock={handleEditTimeBlock}
                  onDeleteBlock={handleDeleteTimeBlock}
                />

                {/* 6. Upcoming Section (Besok & Mendatang) */}
                <UpcomingSection upcomingTasks={upcomingTasks} />
              </>
            )}

            {/* TAB: SEMUA TUGAS */}
            {activeTab === 'tugas' && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Semua Tugas</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Total {tasks.length} tugas terdaftar di seluruh kategori
                    </p>
                  </div>
                  <button
                    onClick={() => setIsQuickAddOpen(true)}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm"
                  >
                    + Tambah Tugas
                  </button>
                </div>

                <TodayTasksSection
                  tasks={filteredTasks}
                  onToggleTask={handleToggleTask}
                  onToggleSubtask={handleToggleSubtask}
                  onAddTask={handleAddTask}
                  onDeleteTask={handleDeleteTask}
                />
              </div>
            )}

            {/* TAB: KALENDER */}
            {activeTab === 'kalender' && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Kalender Terpadu</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Pantau jumlah tugas yang berhasil diselesaikan pada setiap hari
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-900/40">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Auto-Sync Aktif</span>
                  </div>
                </div>

                <DailyCompletedView
                  days={weekDays}
                  selectedDate={selectedDate}
                  onSelectDate={setSelectedDate}
                  tasks={tasks}
                  onToggleTask={handleToggleTask}
                />
              </div>
            )}

            {/* TAB: ANALISA */}
            {activeTab === 'analitik' && (
              <div className="flex flex-col gap-6">
                <div className="pb-2 border-b border-slate-200 dark:border-slate-800">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Analisa Produktivitas</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Evaluasi komprehensif performa, tren pengerjaan tugas, dan konsistensi harian Anda
                  </p>
                </div>

                {/* 4 Stat Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-card">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Tingkat Selesai</span>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 font-mono mt-1">{percentage}%</p>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-card">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Tugas Tuntas</span>
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-1">{completedCount}</p>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-card">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Tertunda</span>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400 font-mono mt-1">{taskCounts.overdue}</p>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-card">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Streak Hari</span>
                    <p className="text-2xl font-bold text-amber-500 font-mono mt-1">
                      🔥 {currentUser?.streakCount || 5}
                    </p>
                  </div>
                </div>

                {/* Line Chart Component */}
                <ProductivityLineChart tasks={tasks} weekDays={weekDays} />
              </div>
            )}

            {/* TAB: PENGATURAN */}
            {activeTab === 'pengaturan' && (
              <div className="flex flex-col gap-4">
                <div className="pb-2 border-b border-slate-200 dark:border-slate-800">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Pengaturan</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Kelola profil, akun multi-perangkat, dan preferensi aplikasi
                  </p>
                </div>

                {/* Profile Card */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={
                        currentUser?.avatarUrl ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces&auto=format&q=80'
                      }
                      alt={currentUser?.name || 'Tamu'}
                      className="w-14 h-14 rounded-full object-cover ring-4 ring-blue-500/20 shadow-xs"
                    />
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {currentUser ? currentUser.name : 'Pengguna Tamu'}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                        {currentUser ? `@${currentUser.username} • ${currentUser.email}` : 'Data tersimpan hanya di browser ini'}
                      </p>
                      {currentUser && (
                        <span className="inline-flex items-center gap-1 mt-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-900/40">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Tersinkronisasi Cloud</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {currentUser ? (
                      <button
                        onClick={() => setIsEditProfileOpen(true)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs active:scale-95 transition-all"
                      >
                        Atur Nama & Foto Profil
                      </button>
                    ) : (
                      <button
                        onClick={() => setIsAuthModalOpen(true)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs flex items-center gap-1.5 active:scale-95 transition-all"
                      >
                        <LogIn className="w-4 h-4" />
                        <span>Masuk / Buat Akun</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Theme Switcher Card (Mode Terang / Mode Gelap / Otomatis Sistem) */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-card flex flex-col gap-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>Tema Tampilan</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/40">
                          {theme === 'light' ? 'Terang' : theme === 'dark' ? 'Gelap' : 'Sistem'}
                        </span>
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Pilih mode tampilan sesuai preferensi kenyamanan mata Anda
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setTheme('light')}
                      className={`flex flex-col items-center justify-center gap-2 p-3.5 rounded-xl border-2 transition-all ${
                        theme === 'light'
                          ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 font-bold shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/60 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${theme === 'light' ? 'bg-amber-100 text-amber-600' : 'bg-slate-200/80 dark:bg-slate-700 text-slate-500'}`}>
                        <Sun className="w-5 h-5" />
                      </div>
                      <div className="text-center">
                        <span className="text-xs block">Terang</span>
                        <span className="text-[10px] text-slate-400 font-normal">Light Mode</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTheme('dark')}
                      className={`flex flex-col items-center justify-center gap-2 p-3.5 rounded-xl border-2 transition-all ${
                        theme === 'dark'
                          ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 font-bold shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/60 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-slate-200/80 dark:bg-slate-700 text-slate-500'}`}>
                        <Moon className="w-5 h-5" />
                      </div>
                      <div className="text-center">
                        <span className="text-xs block">Gelap</span>
                        <span className="text-[10px] text-slate-400 font-normal">Dark Mode</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTheme('system')}
                      className={`flex flex-col items-center justify-center gap-2 p-3.5 rounded-xl border-2 transition-all ${
                        theme === 'system'
                          ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 font-bold shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/60 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${theme === 'system' ? 'bg-indigo-600 text-white' : 'bg-slate-200/80 dark:bg-slate-700 text-slate-500'}`}>
                        <Laptop className="w-5 h-5" />
                      </div>
                      <div className="text-center">
                        <span className="text-xs block">Sistem</span>
                        <span className="text-[10px] text-slate-400 font-normal">Otomatis OS</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Cloud Sync & Google Calendar Card */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-card flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Sinkronisasi Multi-Perangkat</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Masuk dengan akun yang sama di HP atau laptop untuk mengakses semua tugas & progres.
                      </p>
                    </div>
                    <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded-full border border-blue-200 dark:border-blue-800">
                      Aktif
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Koneksi Google Calendar</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {currentUser ? `${currentUser.email} (Terhubung)` : 'Hubungkan akun untuk deteksi bentrok jadwal'}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold rounded-full border border-emerald-200 dark:border-emerald-800">
                      Tersambung
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Notifikasi Browser & Alarm</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Bunyikan alarm saat waktu time-block tiba</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4 accent-blue-600" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* 4. Mobile Bottom Navigation Bar (Fixed) */}
      <MobileBottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenQuickAdd={() => setIsQuickAddOpen(true)}
      />

      {/* 5. Modals */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onAddTask={handleAddTask}
      />

      <ConflictResolverModal
        conflictItem={activeConflict}
        onClose={() => setActiveConflict(null)}
        onApplySlot={handleResolveConflictSlot}
      />

      <ConfirmDeleteModal
        isOpen={deleteTarget !== null}
        taskTitle={deleteTarget?.title || ''}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {currentUser && (
        <EditProfileModal
          isOpen={isEditProfileOpen}
          onClose={() => setIsEditProfileOpen(false)}
          currentUser={currentUser}
          onProfileUpdated={(updated) => setCurrentUser(updated)}
        />
      )}

      <TimeBlockModal
        isOpen={isTimeBlockModalOpen}
        onClose={() => setIsTimeBlockModalOpen(false)}
        initialBlock={editingTimeBlock}
        onSave={handleSaveTimeBlock}
        onDelete={handleDeleteTimeBlock}
      />
    </div>
  );
};
