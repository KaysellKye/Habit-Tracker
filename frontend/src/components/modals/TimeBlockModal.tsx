import React, { useState, useEffect } from 'react';
import { X, Clock, CalendarClock, Tag, Trash2, Check, Plus, Palette } from 'lucide-react';
import { TimelineItem, TimelineType } from '../../types';

interface TimeBlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialBlock?: TimelineItem | null;
  onSave: (block: TimelineItem) => void;
  onDelete?: (id: string) => void;
}

interface LabelPreset {
  id: string;
  label: string;
  color: 'blue' | 'amber' | 'emerald' | 'purple' | 'red' | 'slate';
  type: TimelineType;
}

const DEFAULT_PRESETS: LabelPreset[] = [
  { id: '1', label: 'FOKUS KERJA', color: 'blue', type: 'focus' },
  { id: '2', label: 'GOOGLE MEET', color: 'amber', type: 'gmeet' },
  { id: '3', label: 'ISTIRAHAT', color: 'slate', type: 'break' },
  { id: '4', label: 'BELAJAR & RISET', color: 'purple', type: 'focus' },
  { id: '5', label: 'GYM & OLAHRAGA', color: 'emerald', type: 'break' },
  { id: '6', label: 'BENTROK JADWAL', color: 'red', type: 'conflict' },
];

const PRESETS_STORAGE_KEY = 'timeblock_user_label_presets';

export const TimeBlockModal: React.FC<TimeBlockModalProps> = ({
  isOpen,
  onClose,
  initialBlock,
  onSave,
  onDelete,
}) => {
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:30');
  const [title, setTitle] = useState('');
  const [badgeText, setBadgeText] = useState('FOKUS KERJA');
  const [type, setType] = useState<TimelineType>('focus');
  const [color, setColor] = useState<'blue' | 'amber' | 'emerald' | 'purple' | 'red' | 'slate'>('blue');
  const [subtitle, setSubtitle] = useState('');

  // User customizable label presets
  const [presets, setPresets] = useState<LabelPreset[]>(() => {
    try {
      const saved = localStorage.getItem(PRESETS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_PRESETS;
  });

  const [newPresetInput, setNewPresetInput] = useState('');
  const [showAddPresetInput, setShowAddPresetInput] = useState(false);

  // Sync to localStorage
  const savePresetsToStorage = (newPresets: LabelPreset[]) => {
    setPresets(newPresets);
    localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(newPresets));
  };

  useEffect(() => {
    if (initialBlock) {
      setStartTime(initialBlock.startTime);
      setEndTime(initialBlock.endTime);
      setTitle(initialBlock.title);
      setBadgeText(initialBlock.badgeText);
      setType(initialBlock.type);
      setColor(initialBlock.color || (initialBlock.type === 'gmeet' ? 'amber' : initialBlock.type === 'conflict' ? 'red' : initialBlock.type === 'break' ? 'slate' : 'blue'));
      setSubtitle(initialBlock.subtitle);
    } else {
      setStartTime('09:00');
      setEndTime('10:30');
      setTitle('');
      setBadgeText('FOKUS KERJA');
      setType('focus');
      setColor('blue');
      setSubtitle('Durasi: 1j 30m');
    }
  }, [initialBlock, isOpen]);

  if (!isOpen) return null;

  const handleSelectPreset = (p: LabelPreset) => {
    setBadgeText(p.label);
    setColor(p.color);
    setType(p.type);
    if (!subtitle) {
      setSubtitle(p.label === 'ISTIRAHAT' ? 'Bebas Layar • Recharging' : 'Sesi Fokus');
    }
  };

  const handleDeletePreset = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = presets.filter((p) => p.id !== id);
    savePresetsToStorage(updated);
  };

  const handleCreateNewPreset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPresetInput.trim()) return;

    const newP: LabelPreset = {
      id: `preset-${Date.now()}`,
      label: newPresetInput.trim().toUpperCase(),
      color,
      type,
    };

    const updated = [...presets, newP];
    savePresetsToStorage(updated);
    setBadgeText(newP.label);
    setNewPresetInput('');
    setShowAddPresetInput(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const savedItem: TimelineItem = {
      id: initialBlock?.id || `block-${Date.now()}`,
      startTime,
      endTime,
      type,
      color,
      badgeText: badgeText.trim().toUpperCase() || 'FOKUS',
      title: title.trim(),
      subtitle: subtitle.trim() || `${startTime} - ${endTime}`,
      isActionable: type === 'conflict',
    };

    onSave(savedItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 z-10 overflow-y-auto max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <CalendarClock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {initialBlock ? 'Ubah Blok Jadwal' : 'Tambah Blok Jadwal Baru'}
              </h3>
              <p className="text-[11px] text-slate-500">
                Atur label & waktu aktivitas sesuka hati
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
          {/* Judul Aktivitas */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Aktivitas / Kegiatan *
            </label>
            <input
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Mis. Desain UI Pitch Deck / Meeting Klien..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
            />
          </div>

          {/* Jam Mulai & Selesai */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Jam Mulai
              </label>
              <div className="relative">
                <Clock className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  placeholder="09:00"
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Jam Selesai
              </label>
              <div className="relative">
                <Clock className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  placeholder="10:30"
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Bagian Tipe / Label Jadwal (Bebas Diedit & Dihapus) */}
          <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200/70 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-purple-600" />
                <span>Label Jadwal (Bisa Diatur Sesuka Hati)</span>
              </label>

              <button
                type="button"
                onClick={() => setShowAddPresetInput(!showAddPresetInput)}
                className="text-[11px] font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>Buat Label Baru</span>
              </button>
            </div>

            {/* Input Label Langsung (Editable Text) */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                required
                value={badgeText}
                onChange={(e) => setBadgeText(e.target.value.toUpperCase())}
                placeholder="Ketik label jadwal bebas..."
                className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold font-mono uppercase bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              />

              {/* Color Picker for Badge */}
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
                {(['blue', 'amber', 'emerald', 'purple', 'red', 'slate'] as const).map((c) => {
                  const bgClass =
                    c === 'blue'
                      ? 'bg-blue-600'
                      : c === 'amber'
                      ? 'bg-amber-500'
                      : c === 'emerald'
                      ? 'bg-emerald-500'
                      : c === 'purple'
                      ? 'bg-purple-600'
                      : c === 'red'
                      ? 'bg-red-600'
                      : 'bg-slate-700';

                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-5 h-5 rounded-full ${bgClass} transition-transform ${
                        color === c ? 'scale-110 ring-2 ring-offset-1 ring-slate-400' : 'opacity-70 hover:opacity-100'
                      }`}
                      title={c}
                    />
                  );
                })}
              </div>
            </div>

            {/* Form Input Tambah Label Preset Baru */}
            {showAddPresetInput && (
              <div className="flex gap-1.5 pt-1">
                <input
                  type="text"
                  value={newPresetInput}
                  onChange={(e) => setNewPresetInput(e.target.value)}
                  placeholder="Nama label baru (mis. GAMING, MEMBACA)..."
                  className="flex-1 px-2.5 py-1 text-xs rounded-lg border border-purple-200 bg-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleCreateNewPreset}
                  className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold"
                >
                  Simpan Label
                </button>
              </div>
            )}

            {/* Daftar Label Preset yang Bisa Dipilih & Dihapus */}
            <div>
              <span className="text-[10px] text-slate-500 mb-1 block">
                Pilih atau hapus (✕) label yang ada:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {presets.map((p) => {
                  const isSelected = badgeText === p.label;
                  return (
                    <div
                      key={p.id}
                      onClick={() => handleSelectPreset(p)}
                      className={`group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold cursor-pointer border transition-all ${
                        isSelected
                          ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <span>{p.label}</span>
                      {/* Delete Label Preset Button */}
                      <button
                        type="button"
                        onClick={(e) => handleDeletePreset(p.id, e)}
                        className={`w-3.5 h-3.5 rounded-full flex items-center justify-center opacity-60 hover:opacity-100 hover:bg-red-500 hover:text-white transition-all ${
                          isSelected ? 'text-white' : 'text-slate-400'
                        }`}
                        title="Hapus label ini"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Subtitle / Catatan Tambahan */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Catatan / Keterangan Waktu
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Mis. Durasi: 1j 30m / Recharging / Diskusi Online"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-1">
            {initialBlock && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  onDelete(initialBlock.id);
                  onClose();
                }}
                className="py-2 px-3 text-red-600 hover:bg-red-50 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Blok</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="py-2 px-3.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="py-2 px-4 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-500/25 active:scale-95 transition-all"
              >
                Simpan Jadwal
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
