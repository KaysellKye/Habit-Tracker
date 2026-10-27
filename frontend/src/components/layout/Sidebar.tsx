import React from 'react';
import {
  CalendarDays,
  CheckCircle2,
  Calendar,
  BarChart3,
  Settings,
  Plus,
  Flame,
  Check,
  RefreshCw,
  X,
  Layers,
  Sparkles
} from 'lucide-react';
import { Category, UserProfile } from '../../types';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onOpenQuickAdd: () => void;
  selectedCategory: Category | 'all';
  onSelectCategory: (cat: Category | 'all') => void;
  taskCounts: {
    today: number;
    all: number;
    overdue: number;
  };
  currentUser: UserProfile | null;
  onOpenAuthModal: () => void;
  onOpenEditProfile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  isOpenMobile,
  onCloseMobile,
  onOpenQuickAdd,
  selectedCategory,
  onSelectCategory,
  taskCounts,
  currentUser,
  onOpenAuthModal,
  onOpenEditProfile,
}) => {
  const navItems = [
    {
      id: 'hari-ini',
      label: 'Hari Ini',
      icon: CalendarDays,
      badge: taskCounts.today > 0 ? taskCounts.today : undefined,
    },
    {
      id: 'tugas',
      label: 'Semua Tugas',
      icon: CheckCircle2,
      badge: taskCounts.overdue > 0 ? `${taskCounts.overdue} Tertunda` : undefined,
      badgeColor: 'bg-red-50 text-red-600 border border-red-200',
    },
    {
      id: 'kalender',
      label: 'Kalender',
      icon: Calendar,
    },
    {
      id: 'analitik',
      label: 'Analisa',
      icon: BarChart3,
    },
    {
      id: 'pengaturan',
      label: 'Pengaturan',
      icon: Settings,
    },
  ];

  const categories: { id: Category; label: string; color: string; dotColor: string }[] = [
    { id: 'Kerja', label: 'Kerja', color: 'text-amber-600', dotColor: 'bg-amber-500' },
    { id: 'Produktif', label: 'Produktif', color: 'text-blue-600', dotColor: 'bg-blue-600' },
    { id: 'Hiburan', label: 'Hiburan', color: 'text-emerald-600', dotColor: 'bg-emerald-500' },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between p-4">
      <div className="flex flex-col gap-6">
        {/* Mobile Header in drawer */}
        <div className="flex items-center justify-between md:hidden pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-900">TimeBlock</span>
          </div>
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Primary Action Button */}
        <button
          onClick={() => {
            onOpenQuickAdd();
            if (isOpenMobile) onCloseMobile();
          }}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm shadow-md shadow-blue-500/20 active:scale-[0.99] transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Tugas Baru</span>
        </button>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-3 mb-1">
            Menu Utama
          </span>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  if (isOpenMobile) onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-blue-600' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[11px] font-mono px-2 py-0.5 rounded-full ${
                      item.badgeColor || 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Category Filters */}
        <div className="flex flex-col gap-1 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between px-3 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Kategori
            </span>
            {selectedCategory !== 'all' && (
              <button
                onClick={() => onSelectCategory('all')}
                className="text-[11px] text-blue-600 hover:underline"
              >
                Reset
              </button>
            )}
          </div>

          <button
            onClick={() => onSelectCategory('all')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              selectedCategory === 'all'
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <span>Semua Kategori</span>
            </div>
            {selectedCategory === 'all' && <Check className="w-3.5 h-3.5 text-blue-600" />}
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className={`w-2 h-2 rounded-full ${cat.dotColor}`} />
                <span>{cat.label}</span>
              </div>
              {selectedCategory === cat.id && <Check className="w-3.5 h-3.5 text-blue-600" />}
            </button>
          ))}
        </div>
      </div>

      {/* Footer Info: User Account & Streak */}
      <div className="flex flex-col gap-3 pt-3 border-t border-slate-100">
        {currentUser ? (
          <div
            onClick={onOpenEditProfile}
            className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200/70 flex items-center justify-between cursor-pointer transition-colors group"
            title="Klik untuk ubah nama atau foto profil"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-500/20 flex-shrink-0"
              />
              <div className="truncate">
                <p className="text-xs font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                  {currentUser.name}
                </p>
                <p className="text-[10px] font-mono text-slate-500 truncate">
                  @{currentUser.username}
                </p>
              </div>
            </div>
            <span className="text-[10px] text-blue-600 font-medium group-hover:underline flex-shrink-0">
              Edit
            </span>
          </div>
        ) : (
          <button
            onClick={onOpenAuthModal}
            className="p-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl border border-blue-200/80 flex items-center justify-between transition-colors text-left"
          >
            <div>
              <p className="text-xs font-bold">Sinkronisasi Akun</p>
              <p className="text-[10px] text-blue-600/80">Masuk agar data tidak hilang</p>
            </div>
            <span className="text-xs font-bold bg-blue-600 text-white px-2 py-0.5 rounded-lg">
              Masuk
            </span>
          </button>
        )}

        {/* Streak Card */}
        <div className="p-2.5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200/60 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-base flex-shrink-0">
            🔥
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-amber-900">
              {currentUser?.streakCount || 5} Hari Streak
            </span>
            <span className="text-[10px] text-amber-700/80 truncate">
              Akses dari HP & perangkat lain
            </span>
          </div>
        </div>

        {/* Google Calendar status */}
        <div className="flex items-center justify-between px-2 text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5 text-amber-600 font-medium">
            <RefreshCw className="w-3 h-3 animate-spin text-amber-600" />
            <span>Google Calendar Aktif</span>
          </div>
          <span className="text-slate-400">Sync: 1m lalu</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex flex-col w-64 fixed top-16 bottom-0 left-0 bg-white border-r border-slate-200/80 z-30 overflow-y-auto">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl z-10 overflow-y-auto">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
