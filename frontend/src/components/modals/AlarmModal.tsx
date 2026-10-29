import React, { useState } from 'react';
import {
  X,
  Bell,
  Plus,
  Trash2,
  Edit2,
  Volume2,
  VolumeX,
  Play,
  Square,
  Clock,
  Video,
  Music,
  Check,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { AlarmItem, BuiltinAlarmTone } from '../../types';
import {
  DEFAULT_BUILTIN_TONES,
  previewAlarmSound,
  stopCurrentPreview,
  saveMediaBlob,
  deleteMediaBlob,
} from '../../utils/audioAlarmEngine';

interface AlarmModalProps {
  isOpen: boolean;
  onClose: () => void;
  alarms: AlarmItem[];
  onUpdateAlarms: (alarms: AlarmItem[]) => void;
}

const DAY_LABELS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

export const AlarmModal: React.FC<AlarmModalProps> = ({
  isOpen,
  onClose,
  alarms,
  onUpdateAlarms,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingAlarmId, setEditingAlarmId] = useState<string | null>(null);

  // Form states
  const [time, setTime] = useState('07:00');
  const [title, setTitle] = useState('');
  const [repeatDays, setRepeatDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [soundType, setSoundType] = useState<'builtin' | 'custom'>('builtin');
  const [builtinTone, setBuiltinTone] = useState<BuiltinAlarmTone>('bell');
  const [customFile, setCustomFile] = useState<File | null>(null);
  const [customMediaUrl, setCustomMediaUrl] = useState<string | undefined>(undefined);
  const [customMediaName, setCustomMediaName] = useState<string | undefined>(undefined);
  const [customMediaType, setCustomMediaType] = useState<'audio' | 'video' | undefined>(undefined);
  const [volume, setVolume] = useState<number>(0.8);
  const [snoozeMinutes, setSnoozeMinutes] = useState<number>(5);

  const [previewingId, setPreviewingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleStartAdd = () => {
    setIsAdding(true);
    setEditingAlarmId(null);
    setTime('07:00');
    setTitle('Alarm Produktif');
    setRepeatDays([1, 2, 3, 4, 5]);
    setSoundType('builtin');
    setBuiltinTone('bell');
    setCustomFile(null);
    setCustomMediaUrl(undefined);
    setCustomMediaName(undefined);
    setCustomMediaType(undefined);
    setVolume(0.85);
  };

  const handleStartEdit = (alarm: AlarmItem) => {
    setEditingAlarmId(alarm.id);
    setIsAdding(true);
    setTime(alarm.time);
    setTitle(alarm.title);
    setRepeatDays(alarm.repeatDays);
    setSoundType(alarm.soundType);
    setBuiltinTone(alarm.builtinTone);
    setCustomMediaUrl(alarm.customMediaUrl);
    setCustomMediaName(alarm.customMediaName);
    setCustomMediaType(alarm.customMediaType);
    setVolume(alarm.volume);
    setSnoozeMinutes(alarm.snoozeMinutes || 5);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCustomFile(file);
    setCustomMediaName(file.name);
    const isVideo = file.type.startsWith('video/') || /\.(mp4|webm|mov|mkv)$/i.test(file.name);
    setCustomMediaType(isVideo ? 'video' : 'audio');

    // Create temporary preview URL
    const tempUrl = URL.createObjectURL(file);
    setCustomMediaUrl(tempUrl);
    setSoundType('custom');
  };

  const handleToggleDay = (dayIndex: number) => {
    if (repeatDays.includes(dayIndex)) {
      setRepeatDays(repeatDays.filter((d) => d !== dayIndex));
    } else {
      setRepeatDays([...repeatDays, dayIndex].sort());
    }
  };

  const handleSaveAlarm = async (e: React.FormEvent) => {
    e.preventDefault();
    stopCurrentPreview();
    setPreviewingId(null);

    const targetId = editingAlarmId || `alarm-${Date.now()}`;
    let finalMediaUrl = customMediaUrl;

    // If new custom file uploaded, persist it into IndexedDB
    if (soundType === 'custom' && customFile) {
      finalMediaUrl = await saveMediaBlob(targetId, customFile);
    }

    const newAlarm: AlarmItem = {
      id: targetId,
      time,
      title: title.trim() || 'Alarm',
      enabled: true,
      repeatDays,
      soundType,
      builtinTone,
      customMediaUrl: soundType === 'custom' ? finalMediaUrl : undefined,
      customMediaName: soundType === 'custom' ? customMediaName : undefined,
      customMediaType: soundType === 'custom' ? customMediaType : undefined,
      volume,
      snoozeMinutes,
    };

    if (editingAlarmId) {
      onUpdateAlarms(alarms.map((a) => (a.id === editingAlarmId ? newAlarm : a)));
    } else {
      onUpdateAlarms([newAlarm, ...alarms]);
    }

    setIsAdding(false);
    setEditingAlarmId(null);
  };

  const handleDeleteAlarm = async (id: string) => {
    if (confirm('Hapus alarm ini?')) {
      stopCurrentPreview();
      await deleteMediaBlob(id);
      onUpdateAlarms(alarms.filter((a) => a.id !== id));
    }
  };

  const handleToggleEnabled = (id: string) => {
    onUpdateAlarms(
      alarms.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a))
    );
  };

  const handleTestPreview = (alarmOrPartial: Partial<AlarmItem>, previewKey: string) => {
    if (previewingId === previewKey) {
      stopCurrentPreview();
      setPreviewingId(null);
    } else {
      previewAlarmSound(alarmOrPartial);
      setPreviewingId(previewKey);
    }
  };

  const handleRequestNotification = async () => {
    if ('Notification' in window) {
      const res = await Notification.requestPermission();
      if (res === 'granted') {
        alert('Izin notifikasi browser berhasil diaktifkan! Alarm akan memunculkan pemberitahuan saat berbunyi.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={() => {
          stopCurrentPreview();
          onClose();
        }}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-6 z-10 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Kelola Alarm & Nada Dering
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Atur alarm aktivitas dengan nada dering bawaan atau file audio/video kustom
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCurrentPreview();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notification Permission Banner if not yet granted */}
        {'Notification' in window && Notification.permission !== 'granted' && (
          <div className="mt-4 p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-blue-900 dark:text-blue-300">
              <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span>Aktifkan notifikasi browser agar alarm berdering saat tab di latar belakang.</span>
            </div>
            <button
              type="button"
              onClick={handleRequestNotification}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg flex-shrink-0 shadow-xs"
            >
              Izinkan
            </button>
          </div>
        )}

        {/* Content Body: Form (if adding/editing) or Alarm List */}
        {isAdding ? (
          <form onSubmit={handleSaveAlarm} className="flex flex-col gap-4 mt-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                {editingAlarmId ? 'Ubah Pengaturan Alarm' : 'Buat Alarm Baru'}
              </span>
              <button
                type="button"
                onClick={() => {
                  stopCurrentPreview();
                  setIsAdding(false);
                }}
                className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                Kembali ke Daftar
              </button>
            </div>

            {/* Time & Title Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Waktu Alarm (Jam : Menit) *
                </label>
                <input
                  type="time"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-base font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Label / Nama Alarm *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Mis. Bangun Pagi, Review Tugas, Olahraga..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>
            </div>

            {/* Repeat Days Selection */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Ulangi Setiap Hari
                </label>
                <div className="flex gap-2 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setRepeatDays([1, 2, 3, 4, 5])}
                    className="text-amber-600 dark:text-amber-400 hover:underline"
                  >
                    Hari Kerja
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => setRepeatDays([0, 1, 2, 3, 4, 5, 6])}
                    className="text-amber-600 dark:text-amber-400 hover:underline"
                  >
                    Setiap Hari
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => setRepeatDays([])}
                    className="text-slate-500 hover:underline"
                  >
                    Sekali Saja
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1.5">
                {DAY_LABELS.map((dayLabel, idx) => {
                  const isChecked = repeatDays.includes(idx);
                  return (
                    <button
                      key={dayLabel}
                      type="button"
                      onClick={() => handleToggleDay(idx)}
                      className={`py-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                        isChecked
                          ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                      }`}
                    >
                      {dayLabel}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sound Selector Tabs */}
            <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 flex flex-col gap-3">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                Pilih Nada Alarm / Audio
              </label>

              {/* Toggle Tab: Builtin vs Custom Audio/Video */}
              <div className="grid grid-cols-2 gap-2 bg-slate-200/70 dark:bg-slate-800 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setSoundType('builtin')}
                  className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    soundType === 'builtin'
                      ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <Music className="w-3.5 h-3.5" />
                  <span>Nada Bawaan</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSoundType('custom')}
                  className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    soundType === 'custom'
                      ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Audio / Video Sendiri</span>
                </button>
              </div>

              {/* Sub-Panel 1: Builtin tones */}
              {soundType === 'builtin' ? (
                <div className="flex flex-col gap-2 mt-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {DEFAULT_BUILTIN_TONES.map((tone) => {
                      const isSelected = builtinTone === tone.id;
                      const isPlaying = previewingId === `form-${tone.id}`;
                      return (
                        <div
                          key={tone.id}
                          onClick={() => setBuiltinTone(tone.id)}
                          className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                            isSelected
                              ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/30'
                              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300'
                          }`}
                        >
                          <div>
                            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                              {tone.name}
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400">
                              {tone.description}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTestPreview({ soundType: 'builtin', builtinTone: tone.id, volume }, `form-${tone.id}`);
                            }}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-slate-700 dark:text-slate-200 transition-colors"
                            title={isPlaying ? 'Hentikan' : 'Dengarkan nada'}
                          >
                            {isPlaying ? <Square className="w-3.5 h-3.5 text-red-500 fill-red-500" /> : <Play className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* Sub-Panel 2: Custom audio OR video upload */
                <div className="flex flex-col gap-3 mt-1">
                  <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-4 flex flex-col items-center justify-center text-center bg-white dark:bg-slate-800/80 hover:border-amber-500 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-2">
                      <Video className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      Pilih File Audio atau Video
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-sm mt-0.5">
                      Mendukung MP3, WAV, OGG, M4A, serta file video MP4, WEBM, MOV (audio otomatis diekstrak langsung).
                    </p>

                    <label className="mt-3 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs cursor-pointer shadow-xs active:scale-95 transition-all">
                      <span>Pilih File Dari Komputer / HP</span>
                      <input
                        type="file"
                        accept="audio/*,video/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Uploaded File Indicator */}
                  {customMediaName && (
                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        {customMediaType === 'video' ? (
                          <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-600 flex items-center justify-center flex-shrink-0">
                            <Video className="w-4 h-4" />
                          </div>
                        ) : (
                          <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center flex-shrink-0">
                            <Music className="w-4 h-4" />
                          </div>
                        )}
                        <div className="truncate">
                          <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate block">
                            {customMediaName}
                          </span>
                          <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-medium">
                            {customMediaType === 'video'
                              ? '🎬 Video terdeteksi: Audio otomatis dikonversi sebagai nada alarm'
                              : '🎵 File audio siap digunakan'}
                          </span>
                        </div>
                      </div>

                      {customMediaUrl && (
                        <button
                          type="button"
                          onClick={() =>
                            handleTestPreview(
                              {
                                soundType: 'custom',
                                customMediaUrl,
                                customMediaType,
                                volume,
                              },
                              'form-custom'
                            )
                          }
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-all flex-shrink-0"
                        >
                          {previewingId === 'form-custom' ? (
                            <>
                              <Square className="w-3.5 h-3.5 text-red-500 fill-red-500" />
                              <span>Stop</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Uji Putar</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Volume Slider */}
              <div className="flex items-center gap-3 pt-2">
                <Volume2 className="w-4 h-4 text-slate-400" />
                <div className="flex-1 flex flex-col gap-1">
                  <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span>Volume Suara</span>
                    <span className="font-mono font-bold">{Math.round(volume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Submit / Cancel Buttons */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  stopCurrentPreview();
                  setIsAdding(false);
                }}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/20 active:scale-95 transition-all"
              >
                {editingAlarmId ? 'Simpan Perubahan' : 'Buat Alarm'}
              </button>
            </div>
          </form>
        ) : (
          /* List of Existing Alarms */
          <div className="flex flex-col gap-3 mt-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Daftar Alarm Aktif ({alarms.length})
              </span>
              <button
                type="button"
                onClick={handleStartAdd}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs shadow-xs active:scale-95 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Tambah Alarm Baru</span>
              </button>
            </div>

            {alarms.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 text-center flex flex-col items-center justify-center">
                <Bell className="w-8 h-8 text-slate-400 mb-2" />
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Belum Ada Alarm yang Diatur
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-sm">
                  Tambahkan alarm untuk membantu mengingatkan jadwal penting atau time-block harian Anda.
                </p>
                <button
                  type="button"
                  onClick={handleStartAdd}
                  className="mt-3 px-4 py-2 rounded-xl bg-amber-500 text-white text-xs font-semibold shadow-xs"
                >
                  + Tambah Alarm Sekarang
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {alarms.map((alarm) => {
                  const isPlaying = previewingId === `list-${alarm.id}`;
                  const repeatLabel =
                    alarm.repeatDays.length === 7
                      ? 'Setiap Hari'
                      : alarm.repeatDays.length === 5 &&
                        !alarm.repeatDays.includes(0) &&
                        !alarm.repeatDays.includes(6)
                      ? 'Hari Kerja (Sen-Jum)'
                      : alarm.repeatDays.length === 0
                      ? 'Satu Kali Saja'
                      : alarm.repeatDays.map((d) => DAY_LABELS[d]).join(', ');

                  return (
                    <div
                      key={alarm.id}
                      className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                        alarm.enabled
                          ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-card'
                          : 'bg-slate-50/60 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800/50 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Toggle checkbox / switch */}
                        <input
                          type="checkbox"
                          checked={alarm.enabled}
                          onChange={() => handleToggleEnabled(alarm.id)}
                          aria-label="Aktifkan alarm"
                          className="w-4 h-4 rounded text-amber-500 accent-amber-500 cursor-pointer flex-shrink-0"
                        />

                        <div className="truncate">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xl font-black text-slate-900 dark:text-white">
                              {alarm.time}
                            </span>
                            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                              {alarm.title}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                            <span>{repeatLabel}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                              {alarm.soundType === 'custom' ? (
                                <>
                                  <Video className="w-3 h-3" />
                                  <span className="truncate max-w-[140px]">
                                    {alarm.customMediaName || 'Audio Kustom'}
                                  </span>
                                </>
                              ) : (
                                <>
                                  <Music className="w-3 h-3" />
                                  <span>{alarm.builtinTone || 'Bel Klasik'}</span>
                                </>
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => handleTestPreview(alarm, `list-${alarm.id}`)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title={isPlaying ? 'Hentikan Preview' : 'Putar Nada'}
                        >
                          {isPlaying ? (
                            <Square className="w-4 h-4 text-red-500 fill-red-500" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStartEdit(alarm)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Ubah Alarm"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteAlarm(alarm.id)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                          title="Hapus Alarm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
