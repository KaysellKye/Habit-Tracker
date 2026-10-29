import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Camera,
  Check,
  RotateCcw,
  Sparkles,
  Clock,
  Flame,
  Target,
  Trophy,
  Rocket,
  Coffee,
  Star,
  Heart,
  BookOpen,
  Image as ImageIcon,
} from 'lucide-react';

interface CustomLogoModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLogo: string;
  onSaveLogo: (newLogo: string) => void;
}

export const PRESET_ICONS = [
  { id: 'sparkles', label: 'Sparkles (Default)', icon: Sparkles, bg: 'bg-blue-600 text-white' },
  { id: 'clock', label: 'Jam Klasik', icon: Clock, bg: 'bg-indigo-600 text-white' },
  { id: 'flame', label: 'Api Semangat', icon: Flame, bg: 'bg-orange-500 text-white' },
  { id: 'target', label: 'Target Fokus', icon: Target, bg: 'bg-emerald-600 text-white' },
  { id: 'trophy', label: 'Piala Juara', icon: Trophy, bg: 'bg-amber-500 text-white' },
  { id: 'rocket', label: 'Roket Cepat', icon: Rocket, bg: 'bg-purple-600 text-white' },
  { id: 'coffee', label: 'Kopi Santai', icon: Coffee, bg: 'bg-amber-700 text-white' },
  { id: 'star', label: 'Bintang Emas', icon: Star, bg: 'bg-yellow-500 text-white' },
  { id: 'heart', label: 'Kesehatan', icon: Heart, bg: 'bg-rose-500 text-white' },
  { id: 'book', label: 'Belajar', icon: BookOpen, bg: 'bg-cyan-600 text-white' },
];

export const PRESET_IMAGES = [
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&h=100&fit=crop&auto=format&q=80',
  'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=100&h=100&fit=crop&auto=format&q=80',
  'https://api.dicebear.com/7.x/shapes/svg?seed=HabitHero',
  'https://api.dicebear.com/7.x/identicon/svg?seed=Productive',
];

export const CustomLogoModal: React.FC<CustomLogoModalProps> = ({
  isOpen,
  onClose,
  currentLogo,
  onSaveLogo,
}) => {
  const [selectedLogo, setSelectedLogo] = useState<string>(currentLogo || '');
  const [customUrl, setCustomUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Ukuran gambar maksimal 5MB.');
      return;
    }

    setErrorMsg(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setSelectedLogo(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = () => {
    if (customUrl.trim()) {
      setSelectedLogo(customUrl.trim());
      setCustomUrl('');
      setErrorMsg(null);
    }
  };

  const handleSave = () => {
    onSaveLogo(selectedLogo);
    onClose();
  };

  const handleReset = () => {
    setSelectedLogo('');
    onSaveLogo('');
    onClose();
  };

  // Helper to render logo preview
  const renderLogoPreview = (logoVal: string) => {
    if (!logoVal || logoVal === 'sparkles') {
      return (
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25">
          <Sparkles className="w-5 h-5" />
        </div>
      );
    }

    const preset = PRESET_ICONS.find((p) => p.id === logoVal);
    if (preset) {
      const Icon = preset.icon;
      return (
        <div className={`w-10 h-10 rounded-xl ${preset.bg} flex items-center justify-center shadow-md`}>
          <Icon className="w-5 h-5" />
        </div>
      );
    }

    // Image URL or Base64 Data URL
    return (
      <img
        src={logoVal}
        alt="Custom Logo"
        className="w-10 h-10 rounded-xl object-cover ring-2 ring-blue-500/30 shadow-md"
        onError={() => setErrorMsg('Gambar tidak dapat dimuat. Periksa URL atau gunakan file lain.')}
      />
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-6 z-10 overflow-y-auto max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Kustomisasi Logo Menu
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Ganti foto di samping tulisan Habit Tracker
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-3 p-2.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl text-red-700 dark:text-red-300 text-xs">
            {errorMsg}
          </div>
        )}

        {/* Live Preview Card */}
        <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 flex flex-col gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Pratinjau Tampilan di Menu:
          </span>
          <div className="flex items-center gap-3 p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-2xs">
            {renderLogoPreview(selectedLogo)}
            <div className="flex flex-col">
              <span className="font-bold text-base text-slate-900 dark:text-white leading-tight">
                Habit Tracker
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">
                Menu Utama Aplikasi
              </span>
            </div>
          </div>
        </div>

        {/* Option 1: Upload from Device */}
        <div className="mt-4 flex flex-col gap-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Upload className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Upload Foto dari Perangkat:</span>
          </label>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2.5 px-4 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-dashed border-blue-300 dark:border-blue-800 rounded-xl text-xs font-semibold text-blue-700 dark:text-blue-300 flex items-center justify-center gap-2 transition-colors active:scale-[0.99]"
          >
            <Camera className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Pilih File Foto / Gambar (PNG, JPG, SVG, WebP)</span>
          </button>
        </div>

        {/* Option 2: Preset Icons */}
        <div className="mt-4 flex flex-col gap-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Atau Pilih Ikon Preset:
          </label>
          <div className="grid grid-cols-5 gap-2">
            {PRESET_ICONS.map((preset) => {
              const Icon = preset.icon;
              const isSelected = selectedLogo === preset.id || (!selectedLogo && preset.id === 'sparkles');
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setSelectedLogo(preset.id)}
                  title={preset.label}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 shadow-xs scale-105'
                      : 'border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg ${preset.bg} flex items-center justify-center`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[9px] font-medium text-slate-600 dark:text-slate-400 mt-1 truncate max-w-full">
                    {preset.id}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Option 3: Preset Aesthetic Art */}
        <div className="mt-3 flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
            Gambar Estetik Preset:
          </label>
          <div className="grid grid-cols-4 gap-2">
            {PRESET_IMAGES.map((imgUrl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedLogo(imgUrl)}
                className={`relative rounded-xl overflow-hidden border-2 transition-all ${
                  selectedLogo === imgUrl
                    ? 'border-blue-600 ring-2 ring-blue-500/30'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-400'
                }`}
              >
                <img src={imgUrl} alt={`Art ${idx + 1}`} className="w-full h-10 object-cover" />
                {selectedLogo === imgUrl && (
                  <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Option 4: URL Input */}
        <div className="mt-3 flex flex-col gap-1.5">
          <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            Atau tempel tautan (URL) gambar:
          </label>
          <div className="flex gap-1.5">
            <input
              type="url"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder="https://domain.com/logo.png"
              className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <button
              type="button"
              onClick={handleApplyUrl}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold"
            >
              Terapkan
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Default</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/25 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Simpan Logo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
