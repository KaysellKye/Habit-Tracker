import { CategoryItem, CategoryColor } from '../types';

export const DEFAULT_CATEGORIES: CategoryItem[] = [
  { id: 'cat-kerja', name: 'Kerja', color: 'amber', isDefault: true },
  { id: 'cat-produktif', name: 'Produktif', color: 'blue', isDefault: true },
  { id: 'cat-hiburan', name: 'Hiburan', color: 'emerald', isDefault: true },
];

export const COLOR_OPTIONS: { color: CategoryColor; label: string; dotClass: string }[] = [
  { color: 'amber', label: 'Amber / Kuning', dotClass: 'bg-amber-500' },
  { color: 'blue', label: 'Biru', dotClass: 'bg-blue-600' },
  { color: 'emerald', label: 'Hijau Emerald', dotClass: 'bg-emerald-500' },
  { color: 'purple', label: 'Ungu', dotClass: 'bg-purple-600' },
  { color: 'rose', label: 'Merah Rose', dotClass: 'bg-rose-500' },
  { color: 'cyan', label: 'Cyan / Toska', dotClass: 'bg-cyan-500' },
  { color: 'pink', label: 'Pink', dotClass: 'bg-pink-500' },
  { color: 'slate', label: 'Abu-abu Netral', dotClass: 'bg-slate-500' },
];

const CATEGORIES_STORAGE_KEY = 'habit_tracker_categories';

/**
 * Load categories from localStorage, or return DEFAULT_CATEGORIES
 */
export const loadUserCategories = (): CategoryItem[] => {
  try {
    const raw = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to load categories from localStorage:', err);
  }
  return DEFAULT_CATEGORIES;
};

/**
 * Save categories to localStorage
 */
export const saveUserCategories = (categories: CategoryItem[]): void => {
  try {
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
  } catch (err) {
    console.warn('Failed to save categories to localStorage:', err);
  }
};

/**
 * Style dictionary for each CategoryColor
 */
export const COLOR_STYLES: Record<
  CategoryColor,
  {
    badgeClass: string;
    dotClass: string;
    textClass: string;
    borderClass: string;
    bgSubtle: string;
  }
> = {
  amber: {
    badgeClass:
      'bg-amber-100 dark:bg-amber-950/50 text-amber-900 dark:text-amber-300 border-amber-200/60 dark:border-amber-900/40',
    dotClass: 'bg-amber-500',
    textClass: 'text-amber-600 dark:text-amber-400',
    borderClass: 'border-amber-500',
    bgSubtle: 'bg-amber-50 dark:bg-amber-950/30',
  },
  blue: {
    badgeClass:
      'bg-blue-100 dark:bg-blue-950/50 text-blue-900 dark:text-blue-300 border-blue-200/60 dark:border-blue-900/40',
    dotClass: 'bg-blue-600',
    textClass: 'text-blue-600 dark:text-blue-400',
    borderClass: 'border-blue-600',
    bgSubtle: 'bg-blue-50 dark:bg-blue-950/30',
  },
  emerald: {
    badgeClass:
      'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-900/40',
    dotClass: 'bg-emerald-500',
    textClass: 'text-emerald-600 dark:text-emerald-400',
    borderClass: 'border-emerald-500',
    bgSubtle: 'bg-emerald-50 dark:bg-emerald-950/30',
  },
  purple: {
    badgeClass:
      'bg-purple-100 dark:bg-purple-950/50 text-purple-900 dark:text-purple-300 border-purple-200/60 dark:border-purple-900/40',
    dotClass: 'bg-purple-600',
    textClass: 'text-purple-600 dark:text-purple-400',
    borderClass: 'border-purple-600',
    bgSubtle: 'bg-purple-50 dark:bg-purple-950/30',
  },
  rose: {
    badgeClass:
      'bg-rose-100 dark:bg-rose-950/50 text-rose-900 dark:text-rose-300 border-rose-200/60 dark:border-rose-900/40',
    dotClass: 'bg-rose-500',
    textClass: 'text-rose-600 dark:text-rose-400',
    borderClass: 'border-rose-500',
    bgSubtle: 'bg-rose-50 dark:bg-rose-950/30',
  },
  cyan: {
    badgeClass:
      'bg-cyan-100 dark:bg-cyan-950/50 text-cyan-900 dark:text-cyan-300 border-cyan-200/60 dark:border-cyan-900/40',
    dotClass: 'bg-cyan-500',
    textClass: 'text-cyan-600 dark:text-cyan-400',
    borderClass: 'border-cyan-500',
    bgSubtle: 'bg-cyan-50 dark:bg-cyan-950/30',
  },
  pink: {
    badgeClass:
      'bg-pink-100 dark:bg-pink-950/50 text-pink-900 dark:text-pink-300 border-pink-200/60 dark:border-pink-900/40',
    dotClass: 'bg-pink-500',
    textClass: 'text-pink-600 dark:text-pink-400',
    borderClass: 'border-pink-500',
    bgSubtle: 'bg-pink-50 dark:bg-pink-950/30',
  },
  slate: {
    badgeClass:
      'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700',
    dotClass: 'bg-slate-500',
    textClass: 'text-slate-600 dark:text-slate-400',
    borderClass: 'border-slate-500',
    bgSubtle: 'bg-slate-100 dark:bg-slate-800',
  },
};

/**
 * Resolves styling for any category name (custom or default)
 */
export const getCategoryStyle = (
  categoryName: string,
  categories: CategoryItem[] = DEFAULT_CATEGORIES
) => {
  const match = categories.find(
    (c) => c.name.toLowerCase() === (categoryName || '').toLowerCase()
  );
  const colorKey: CategoryColor = match?.color || 'blue';
  return COLOR_STYLES[colorKey] || COLOR_STYLES.blue;
};
