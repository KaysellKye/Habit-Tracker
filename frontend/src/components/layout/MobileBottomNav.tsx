import React from 'react';
import {
  CalendarDays,
  CheckCircle2,
  Calendar,
  Settings,
  Plus,
} from 'lucide-react';

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
  const navTabs = [
    {
      id: 'hari-ini',
      label: 'Hari Ini',
      icon: CalendarDays,
    },
    {
      id: 'tugas',
      label: 'Tugas',
      icon: CheckCircle2,
    },
    {
      id: 'kalender',
      label: 'Kalender',
      icon: Calendar,
    },
    {
      id: 'pengaturan',
      label: 'Pengaturan',
      icon: Settings,
    },
  ];

  const activeIndex = navTabs.findIndex((tab) => tab.id === activeTab);

  return (
    <nav
      aria-label="Navigasi Bawah Ponsel"
      className="fixed bottom-3 sm:bottom-5 left-0 right-0 z-40 flex items-center justify-center px-3.5 pointer-events-none md:hidden"
    >
      <div className="flex items-center gap-2.5 max-w-[390px] w-full justify-center pointer-events-auto select-none">
        {/* Main Floating Liquid Glass Capsule Dock */}
        <div className="flex-1 h-[58px] p-1 rounded-full liquid-glass-dock relative flex items-center transition-all duration-300">
          {/* Inner Grid Container */}
          <div className="relative grid grid-cols-4 w-full h-full items-center">
            {/* Sliding Liquid Glass Active Indicator Pill */}
            {activeIndex !== -1 && (
              <div
                className="absolute top-0 bottom-0 rounded-full liquid-glass-bubble pointer-events-none transition-all duration-300 ease-[cubic-bezier(0.34,1.35,0.64,1)] shadow-xs"
                style={{
                  width: '25%',
                  transform: `translateX(${activeIndex * 100}%)`,
                }}
              >
                {/* Active glowing indicator dot inside the sliding bubble */}
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-600 dark:bg-blue-400" />
              </div>
            )}

            {/* Navigation Tab Buttons */}
            {navTabs.map((tab, index) => {
              const Icon = tab.icon;
              const isActive = activeIndex === index;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onTabChange(tab.id)}
                  className={`relative z-10 w-full h-full flex flex-col items-center justify-center rounded-full transition-all duration-200 active:scale-95 group ${
                    isActive
                      ? 'text-blue-600 dark:text-blue-400 font-semibold'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Icon
                    className={`w-[19px] h-[19px] transition-transform duration-250 ${
                      isActive ? 'scale-110' : 'group-hover:scale-105'
                    }`}
                  />
                  <span className="text-[10px] tracking-tight mt-0.5 leading-none transition-all duration-200">
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Circular Liquid Glass Action Button (Tambah Tugas Cepat) */}
        <button
          type="button"
          onClick={onOpenQuickAdd}
          aria-label="Tambah Tugas Baru"
          title="Tambah Tugas Baru"
          className="w-[58px] h-[58px] flex-shrink-0 rounded-full liquid-glass-dock flex items-center justify-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 active:scale-90 transition-all duration-200 group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-full bg-blue-50/80 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-800/60 flex items-center justify-center shadow-xs group-hover:bg-blue-100 dark:group-hover:bg-blue-900/60 transition-colors">
            <Plus className="w-5 h-5 stroke-[2.5] text-blue-600 dark:text-blue-400 group-hover:rotate-90 transition-transform duration-300" />
          </div>
        </button>
      </div>
    </nav>
  );
};
