import React from 'react';
import {
  CalendarClock,
  Timer,
  Video,
  Utensils,
  AlertOctagon,
  ExternalLink,
  Plus,
  Pencil,
  Trash2,
} from 'lucide-react';
import { TimelineItem } from '../../types';

interface TimeBlockingSectionProps {
  timeline: TimelineItem[];
  onOpenFullGrid?: () => void;
  onResolveConflict?: (item: TimelineItem) => void;
  onAddBlock?: () => void;
  onEditBlock?: (item: TimelineItem) => void;
  onDeleteBlock?: (id: string) => void;
}

export const TimeBlockingSection: React.FC<TimeBlockingSectionProps> = ({
  timeline,
  onOpenFullGrid,
  onResolveConflict,
  onAddBlock,
  onEditBlock,
  onDeleteBlock,
}) => {
  const getStyleForBlock = (block: TimelineItem) => {
    const effectiveColor =
      block.color ||
      (block.type === 'gmeet'
        ? 'amber'
        : block.type === 'conflict'
        ? 'red'
        : block.type === 'break'
        ? 'slate'
        : 'blue');

    switch (effectiveColor) {
      case 'amber':
        return {
          cardBg: 'bg-amber-50/70 border-amber-200/70 hover:bg-amber-50',
          badgeBg: 'bg-amber-500 text-white',
          textTitle: 'text-amber-950',
          textSubtitle: 'text-amber-800/80',
          iconColor: 'text-amber-600',
          Icon: Video,
        };
      case 'emerald':
        return {
          cardBg: 'bg-emerald-50/70 border-emerald-200/70 hover:bg-emerald-50',
          badgeBg: 'bg-emerald-600 text-white',
          textTitle: 'text-emerald-950',
          textSubtitle: 'text-emerald-800/80',
          iconColor: 'text-emerald-600',
          Icon: Timer,
        };
      case 'purple':
        return {
          cardBg: 'bg-purple-50/70 border-purple-200/70 hover:bg-purple-50',
          badgeBg: 'bg-purple-600 text-white',
          textTitle: 'text-purple-950',
          textSubtitle: 'text-purple-800/80',
          iconColor: 'text-purple-600',
          Icon: Timer,
        };
      case 'red':
        return {
          cardBg: 'bg-red-50/80 border-red-200 hover:bg-red-50',
          badgeBg: 'bg-red-600 text-white',
          textTitle: 'text-red-950',
          textSubtitle: 'text-red-700/80',
          iconColor: 'text-red-600',
          Icon: AlertOctagon,
        };
      case 'slate':
        return {
          cardBg: 'bg-slate-50/80 border-dashed border-slate-200 hover:bg-slate-100/60',
          badgeBg: 'bg-slate-200 text-slate-700 font-medium',
          textTitle: 'text-slate-700',
          textSubtitle: 'text-slate-400',
          iconColor: 'text-slate-400',
          Icon: Utensils,
        };
      case 'blue':
      default:
        return {
          cardBg: 'bg-slate-50 border-slate-100 hover:bg-slate-100/70',
          badgeBg: 'bg-blue-600 text-white',
          textTitle: 'text-slate-900',
          textSubtitle: 'text-slate-500',
          iconColor: 'text-blue-600',
          Icon: Timer,
        };
    }
  };

  return (
    <section className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarClock className="w-5 h-5 text-purple-600" />
          <h3 className="text-base sm:text-lg font-bold text-slate-900">
            Jadwal & Time-Blocking
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {onAddBlock && (
            <button
              onClick={onAddBlock}
              className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold rounded-lg border border-purple-200 flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Blok</span>
            </button>
          )}
          {onOpenFullGrid && (
            <button
              onClick={onOpenFullGrid}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors flex items-center gap-1"
            >
              <span>Lihat Full Grid</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Vertical Timeline Visualizer */}
      <div className="bg-white rounded-2xl p-3.5 sm:p-5 shadow-card border border-slate-100 flex flex-col gap-3">
        {timeline.map((block) => {
          const isConflict = block.type === 'conflict';
          const style = getStyleForBlock(block);
          const BlockIcon = style.Icon;

          return (
            <div key={block.id} className="flex gap-3 items-stretch group relative">
              {/* Left Time Column */}
              <div className="w-14 sm:w-16 flex-shrink-0 flex flex-col justify-start pt-1 text-right pr-2">
                <span
                  className={`text-xs font-mono font-bold ${
                    isConflict ? 'text-red-600' : 'text-slate-800'
                  }`}
                >
                  {block.startTime}
                </span>
                <span
                  className={`text-[10px] font-mono ${
                    isConflict ? 'text-red-400 font-semibold' : 'text-slate-400'
                  }`}
                >
                  {block.endTime}
                </span>
              </div>

              {/* Right Content Card */}
              <div
                className={`flex-1 rounded-xl p-3 shadow-2xs border transition-colors ${style.cardBg}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md flex items-center gap-1 ${style.badgeBg}`}
                    >
                      {isConflict && <AlertOctagon className="w-3 h-3" />}
                      <span>{block.badgeText}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Conflict Action: Geser Jam */}
                    {isConflict && onResolveConflict && (
                      <button
                        onClick={() => onResolveConflict(block)}
                        className="text-xs font-semibold text-red-600 underline hover:text-red-800 transition-colors mr-1"
                      >
                        Geser Jam
                      </button>
                    )}

                    {/* Edit Button */}
                    {onEditBlock && (
                      <button
                        onClick={() => onEditBlock(block)}
                        className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-white transition-colors opacity-70 sm:opacity-0 sm:group-hover:opacity-100"
                        title="Edit blok / ganti label"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Delete Button */}
                    {onDeleteBlock && (
                      <button
                        onClick={() => onDeleteBlock(block.id)}
                        className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-white transition-colors opacity-70 sm:opacity-0 sm:group-hover:opacity-100"
                        title="Hapus blok jadwal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Type Icon */}
                    <BlockIcon className={`w-4 h-4 ml-1 ${style.iconColor}`} />
                  </div>
                </div>

                <p className={`text-xs sm:text-sm font-semibold mt-1.5 ${style.textTitle}`}>
                  {block.title}
                </p>
                <span className={`text-[11px] mt-0.5 block ${style.textSubtitle}`}>
                  {block.subtitle}
                </span>
              </div>
            </div>
          );
        })}

        {timeline.length === 0 && (
          <div className="py-8 text-center text-slate-400 text-xs">
            Belum ada jadwal time-blocking untuk hari ini. Klik "Tambah Blok" untuk membuat jadwal baru.
          </div>
        )}
      </div>
    </section>
  );
};
