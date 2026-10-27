import React from 'react';
import { X, AlertOctagon, CheckCircle2, Clock, ArrowRight } from 'lucide-react';
import { TimelineItem } from '../../types';

interface ConflictResolverModalProps {
  conflictItem: TimelineItem | null;
  onClose: () => void;
  onApplySlot: (newStartTime: string, newEndTime: string) => void;
}

export const ConflictResolverModal: React.FC<ConflictResolverModalProps> = ({
  conflictItem,
  onClose,
  onApplySlot,
}) => {
  if (!conflictItem) return null;

  const suggestedSlots = [
    { start: '15:00', end: '15:45', label: 'Slot Bebas Sore', reason: 'Tepat setelah sesi rapat' },
    { start: '16:00', end: '16:45', label: 'Slot Fokus Sebelum Pulang', reason: 'Jeda 15 menit' },
    { start: '19:00', end: '19:45', label: 'Slot Malam', reason: 'Setelah waktu istirahat' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-red-100 p-6 z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center font-bold">
              <AlertOctagon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Resolusi Bentrok Jadwal</h3>
              <p className="text-[11px] text-slate-500 font-mono">
                {conflictItem.startTime} - {conflictItem.endTime}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-3">
          <div className="p-3 bg-red-50 border border-red-200/80 rounded-2xl">
            <p className="text-xs font-semibold text-red-950">
              {conflictItem.title}
            </p>
            <p className="text-[11px] text-red-700 mt-0.5">
              {conflictItem.conflictDetails || conflictItem.subtitle}
            </p>
          </div>

          <p className="text-xs font-semibold text-slate-700 mt-1">
            Pilih Waktu Alternatif yang Kosong:
          </p>

          <div className="flex flex-col gap-2">
            {suggestedSlots.map((slot, idx) => (
              <div
                key={idx}
                onClick={() => onApplySlot(slot.start, slot.end)}
                className="group flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center text-slate-600 group-hover:text-blue-600">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-mono font-bold text-slate-900 group-hover:text-blue-700">
                      {slot.start} - {slot.end}
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      {slot.label} • {slot.reason}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs font-semibold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Pilih</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-100 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
