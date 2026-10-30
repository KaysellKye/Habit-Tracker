import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  Menu,
  Clock,
  User,
  LogIn,
  LogOut,
  Settings,
  Sparkles,
  ChevronDown,
  Sun,
  Moon,
  Mail,
} from 'lucide-react';
import { UserProfile } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface TopBarProps {
  onToggleSidebar?: () => void;
  onOpenSearch?: () => void;
  onOpenQuickAdd?: () => void;
  activeTabTitle?: string;
  currentUser: UserProfile | null;
  onOpenAuthModal: () => void;
  onOpenEditProfile: () => void;
  onLogout: () => void;
  currentTimeText?: string;
  currentDateText?: string;
  onOpenAlarmModal?: () => void;
  activeAlarmsCount?: number;
}

export const TopBar: React.FC<TopBarProps> = ({
  onToggleSidebar,
  onOpenSearch,
  onOpenQuickAdd,
  activeTabTitle = 'Hari Ini',
  currentUser,
  onOpenAuthModal,
  onOpenEditProfile,
  onLogout,
  currentTimeText,
  currentDateText,
  onOpenAlarmModal,
  activeAlarmsCount = 0,
}) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { theme, isDark, toggleTheme } = useTheme();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800 shadow-[0_1px_8px_rgba(0,0,0,0.03)] dark:shadow-[0_1px_8px_rgba(0,0,0,0.25)] transition-colors">
      <div className="h-16 px-4 md:px-6 flex items-center justify-between max-w-7xl mx-auto">
        {/* Left: Mobile hamburger & Brand */}
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="p-2 -ml-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden transition-colors"
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25">
              <Clock className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight leading-none">
                Habit Tracker
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                {activeTabTitle}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Quick Search Bar for Desktop */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
          <div
            onClick={onOpenSearch}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100/80 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-slate-400 dark:text-slate-400 text-sm cursor-pointer transition-all shadow-2xs"
          >
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500" />
            <span className="flex-1 text-slate-500 dark:text-slate-400 text-xs">
              Cari tugas atau ketik perintah waktu (mis. '14:00')...
            </span>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-500 dark:text-slate-300 bg-white dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600 shadow-2xs">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Real-time Live Clock Badge (Tablet & Desktop) */}
          {currentTimeText && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border border-slate-200/70 dark:border-slate-700/70 font-mono text-xs font-semibold shadow-2xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>{currentTimeText}</span>
            </div>
          )}

          {/* Quick Add Button (Desktop) */}
          {onOpenQuickAdd && (
            <button
              onClick={onOpenQuickAdd}
              className="hidden lg:flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm shadow-blue-500/20 active:scale-95 transition-all"
            >
              <span>+ Tambah Tugas</span>
            </button>
          )}

          {/* Theme Toggle Button (Terang / Gelap) */}
          <button
            onClick={toggleTheme}
            aria-label={isDark ? 'Ganti ke mode terang' : 'Ganti ke mode gelap'}
            className="w-10 h-10 flex items-center justify-center rounded-full text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={isDark ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-amber-400 transition-transform duration-200 hover:rotate-45" />
            ) : (
              <Moon className="w-5 h-5 text-slate-600 transition-transform duration-200 hover:-rotate-12" />
            )}
          </button>

          {/* Search Button (Mobile only) */}
          <button
            onClick={onOpenSearch}
            aria-label="Pencarian"
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-full text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Alarm & Notification Button with Badge */}
          <button
            onClick={onOpenAlarmModal}
            aria-label="Alarm & Pengingat"
            title="Kelola Alarm & Nada Dering"
            className="relative w-10 h-10 flex items-center justify-center rounded-full text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Bell className="w-5 h-5" />
            {activeAlarmsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-amber-500 ring-2 ring-white dark:ring-slate-900 text-[10px] font-bold text-white flex items-center justify-center">
                {activeAlarmsCount}
              </span>
            )}
          </button>

          {/* User Profile / Auth Button */}
          {currentUser ? (
            <div className="relative pl-1" ref={dropdownRef}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
              >
                <div className="relative">
                  <img
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-600/30"
                    src={currentUser.avatarUrl}
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-1.5 ring-white dark:ring-slate-900"></span>
                </div>
                <span className="hidden sm:inline text-xs font-semibold text-slate-800 dark:text-slate-200 max-w-[100px] truncate">
                  {currentUser.name}
                </span>
                <ChevronDown className="hidden sm:inline w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Profile Dropdown */}
              {profileDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2.5">
                    <img
                      src={currentUser.avatarUrl}
                      alt={currentUser.name}
                      className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {currentUser.name}
                      </p>
                      <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate">
                        @{currentUser.username}
                      </p>
                      {currentUser.email && (
                        <p
                          className="text-[10px] text-slate-400 dark:text-slate-500 truncate flex items-center gap-1 mt-0.5"
                          title={`Email: ${currentUser.email}`}
                        >
                          <Mail className="w-2.5 h-2.5 text-blue-500 flex-shrink-0" />
                          <span className="truncate">{currentUser.email}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onOpenEditProfile();
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/70 flex items-center gap-2 transition-colors"
                    >
                      <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span>Atur Nama & Foto Profil</span>
                    </button>
                    <button
                      onClick={() => {
                        toggleTheme();
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/70 flex items-center gap-2 transition-colors"
                    >
                      {isDark ? (
                        <>
                          <Sun className="w-4 h-4 text-amber-400" />
                          <span>Mode Terang</span>
                        </>
                      ) : (
                        <>
                          <Moon className="w-4 h-4 text-slate-600" />
                          <span>Mode Gelap</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onLogout();
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2 transition-colors"
                    >
                      <LogOut className="w-4 h-4 text-red-600 dark:text-red-400" />
                      <span>Keluar (Logout)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-xl text-xs font-semibold border border-blue-200 dark:border-blue-800 transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Masuk / Daftar</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
