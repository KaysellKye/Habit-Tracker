import React from 'react';
import {
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
  Camera,
} from 'lucide-react';

interface AppBrandLogoProps {
  logo?: string;
  size?: 'sm' | 'md' | 'lg';
  onEdit?: () => void;
  showEditBadge?: boolean;
}

const PRESET_MAP: Record<string, { icon: React.FC<any>; bg: string }> = {
  sparkles: { icon: Sparkles, bg: 'bg-blue-600 text-white' },
  clock: { icon: Clock, bg: 'bg-indigo-600 text-white' },
  flame: { icon: Flame, bg: 'bg-orange-500 text-white' },
  target: { icon: Target, bg: 'bg-emerald-600 text-white' },
  trophy: { icon: Trophy, bg: 'bg-amber-500 text-white' },
  rocket: { icon: Rocket, bg: 'bg-purple-600 text-white' },
  coffee: { icon: Coffee, bg: 'bg-amber-700 text-white' },
  star: { icon: Star, bg: 'bg-yellow-500 text-white' },
  heart: { icon: Heart, bg: 'bg-rose-500 text-white' },
  book: { icon: BookOpen, bg: 'bg-cyan-600 text-white' },
};

export const AppBrandLogo: React.FC<AppBrandLogoProps> = ({
  logo,
  size = 'md',
  onEdit,
  showEditBadge = true,
}) => {
  const sizeClasses = {
    sm: 'w-7 h-7 rounded-lg text-xs',
    md: 'w-8 h-8 rounded-lg text-sm',
    lg: 'w-10 h-10 rounded-xl text-base',
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const isPreset = logo && PRESET_MAP[logo];
  const isImage = Boolean(logo && !isPreset);

  const content = (() => {
    if (isImage) {
      return (
        <img
          src={logo}
          alt="Habit Tracker Logo"
          className="w-full h-full object-cover rounded-inherit"
          onError={(e) => {
            // Fallback on image error
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      );
    }

    if (isPreset) {
      const Preset = PRESET_MAP[logo!];
      const IconComp = Preset.icon;
      return (
        <div className={`w-full h-full flex items-center justify-center ${Preset.bg} rounded-inherit`}>
          <IconComp className={iconSizes[size]} />
        </div>
      );
    }

    // Default Sparkles Blue
    return (
      <div className="w-full h-full flex items-center justify-center bg-blue-600 text-white rounded-inherit shadow-md shadow-blue-500/20">
        <Sparkles className={iconSizes[size]} />
      </div>
    );
  })();

  return (
    <div
      onClick={onEdit}
      className={`relative group ${sizeClasses[size]} rounded-inherit flex-shrink-0 select-none ${
        onEdit ? 'cursor-pointer' : ''
      }`}
      title={onEdit ? 'Klik untuk mengganti foto / logo Habit Tracker' : 'Habit Tracker'}
    >
      <div className="w-full h-full overflow-hidden rounded-inherit ring-1 ring-black/5 dark:ring-white/10 group-hover:scale-105 transition-transform">
        {content}
      </div>

      {onEdit && showEditBadge && (
        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-slate-900/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-xs">
          <Camera className="w-2.5 h-2.5" />
        </div>
      )}
    </div>
  );
};
