import React from 'react';
import { CalendarDays, CheckCircle2, Calendar, Settings, Plus } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenQuickAdd: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onTabChange,
  onOpenQuickAdd,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800 shadow-[0_-2px_12px_rgba(0,0,0,0.04)] dark:shadow-[0_-2px_12px_rgba(0,0,0,0.3)] md:hidden transition-colors">
      <div className="flex items-center justify-between h-16 px-3 max-w-lg mx-auto relative">
        {/* Hari Ini */}
        <button
          onClick={() => onTabChange('hari-ini')}
          className={`flex flex-col items-center justify-center min-w-[56px] h-11 rounded-lg transition-colors ${
            activeTab === 'hari-ini'
              ? 'text-blue-600 dark:text-blue-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <CalendarDays className="w-5 h-5" />
          <span className="text-[11px] mt-0.5 font-medium">Hari Ini</span>
        </button>

        {/* Tugas */}
        <button
          onClick={() => onTabChange('tugas')}
          className={`flex flex-col items-center justify-center min-w-[56px] h-11 rounded-lg transition-colors ${
            activeTab === 'tugas'
              ? 'text-blue-600 dark:text-blue-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-[11px] mt-0.5 font-medium">Tugas</span>
        </button>

        {/* Central Floating Plus Button */}
        <div className="flex items-center justify-center px-1">
          <button
            onClick={onOpenQuickAdd}
            aria-label="Tambah Tugas Baru"
            className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-lg shadow-blue-500/35 active:scale-95 transition-all -translate-y-2 ring-4 ring-white dark:ring-slate-900"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* Kalender */}
        <button
          onClick={() => onTabChange('kalender')}
          className={`flex flex-col items-center justify-center min-w-[56px] h-11 rounded-lg transition-colors ${
            activeTab === 'kalender'
              ? 'text-blue-600 dark:text-blue-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[11px] mt-0.5 font-medium">Kalender</span>
        </button>

        {/* Pengaturan */}
        <button
          onClick={() => onTabChange('pengaturan')}
          className={`flex flex-col items-center justify-center min-w-[56px] h-11 rounded-lg transition-colors ${
            activeTab === 'pengaturan'
              ? 'text-blue-600 dark:text-blue-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-[11px] mt-0.5 font-medium">Pengaturan</span>
        </button>
      </div>
    </nav>
  );
};
