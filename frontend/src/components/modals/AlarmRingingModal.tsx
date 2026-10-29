import React from 'react';
import { Bell, Volume2, Clock, Check, Moon } from 'lucide-react';
import { AlarmItem } from '../../types';

interface AlarmRingingModalProps {
  alarm: AlarmItem | null;
  onDismiss: () => void;
  onSnooze: (minutes: number) => void;
}

export const AlarmRingingModal: React.FC<AlarmRingingModalProps> = ({
  alarm,
  onDismiss,
  onSnooze,
}) => {
  if (!alarm) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border-2 border-amber-500/40 dark:border-amber-500/50 p-6 sm:p-8 flex flex-col items-center text-center overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Glowing Background Pulse */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-orange-500/20 rounded-full blur-3xl animate-pulse" />

        {/* Vibrating Ringing Bell Icon */}
        <div className="relative mb-4">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/30 animate-bounce">
            <Bell className="w-10 h-10 animate-[wiggle_1s_ease-in-out_infinite]" />
          </div>
          <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 flex items-center justify-center text-[10px] text-white font-bold">
            <Volume2 className="w-3.5 h-3.5" />
          </span>
        </div>

        {/* Alarm Time Display */}
        <div className="font-mono text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-wider mb-1">
          {alarm.time}
        </div>

        {/* Alarm Title & Tone details */}
        <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 max-w-xs leading-snug">
          {alarm.title || 'Waktunya Aktivitas!'}
        </h3>

        <div className="flex items-center gap-2 mt-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-200/80 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-300 font-medium">
          <Volume2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span>
            {alarm.soundType === 'custom'
              ? `Audio Kustom: ${alarm.customMediaName || 'Media File'}`
              : `Nada Dering: ${alarm.builtinTone || 'Bel Klasik'}`}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => onSnooze(alarm.snoozeMinutes || 5)}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm transition-all active:scale-95"
          >
            <Clock className="w-4 h-4 text-slate-500" />
            <span>Tunda {alarm.snoozeMinutes || 5} Menit</span>
          </button>

          <button
            type="button"
            onClick={onDismiss}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold text-sm shadow-md shadow-red-500/25 transition-all active:scale-95"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Matikan Alarm</span>
          </button>
        </div>
      </div>
    </div>
  );
};
