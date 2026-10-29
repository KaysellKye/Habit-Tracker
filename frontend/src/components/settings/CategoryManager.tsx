import React, { useState } from 'react';
import {
  Tag,
  Plus,
  Trash2,
  Edit2,
  Check,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { CategoryItem, CategoryColor } from '../../types';
import {
  DEFAULT_CATEGORIES,
  COLOR_OPTIONS,
  COLOR_STYLES,
} from '../../utils/categoryUtils';

interface CategoryManagerProps {
  categories: CategoryItem[];
  onUpdateCategories: (categories: CategoryItem[]) => void;
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({
  categories,
  onUpdateCategories,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState<CategoryColor>('blue');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState<CategoryColor>('blue');

  const handleStartAdd = () => {
    setIsAdding(true);
    setNewCatName('');
    setNewCatColor('purple');
  };

  const handleSaveNew = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCatName.trim();
    if (!trimmed) return;

    // Check duplicate
    if (categories.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
      alert(`Kategori "${trimmed}" sudah ada.`);
      return;
    }

    const newCategory: CategoryItem = {
      id: `cat-${Date.now()}`,
      name: trimmed,
      color: newCatColor,
      isDefault: false,
    };

    onUpdateCategories([...categories, newCategory]);
    setIsAdding(false);
    setNewCatName('');
  };

  const handleStartEdit = (cat: CategoryItem) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditColor(cat.color);
  };

  const handleSaveEdit = (catId: string) => {
    const trimmed = editName.trim();
    if (!trimmed) return;

    // Check duplicate with another item
    if (
      categories.some(
        (c) => c.id !== catId && c.name.toLowerCase() === trimmed.toLowerCase()
      )
    ) {
      alert(`Kategori "${trimmed}" sudah ada.`);
      return;
    }

    const updated = categories.map((c) =>
      c.id === catId ? { ...c, name: trimmed, color: editColor } : c
    );
    onUpdateCategories(updated);
    setEditingId(null);
  };

  const handleDeleteCategory = (catId: string, catName: string) => {
    if (categories.length <= 1) {
      alert('Minimal harus ada satu kategori.');
      return;
    }
    if (confirm(`Hapus kategori "${catName}"?`)) {
      onUpdateCategories(categories.filter((c) => c.id !== catId));
    }
  };

  const handleResetDefaults = () => {
    if (
      confirm(
        'Reset semua kategori ke kategori default (Kerja, Produktif, Hiburan)?'
      )
    ) {
      onUpdateCategories(DEFAULT_CATEGORIES);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-card flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Kelola & Kustomisasi Kategori
            </h4>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Bebas tambah, ubah nama, ganti warna, atau sesuaikan kategori tugas Anda
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
            title="Kembalikan kategori default: Kerja, Produktif, Hiburan"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Default</span>
          </button>
          {!isAdding && (
            <button
              type="button"
              onClick={handleStartAdd}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs active:scale-95 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Kategori</span>
            </button>
          )}
        </div>
      </div>

      {/* Add New Category Form */}
      {isAdding && (
        <form
          onSubmit={handleSaveNew}
          className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 flex flex-col gap-3 animate-in fade-in duration-150"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-900 dark:text-blue-300">
              Buat Kategori Baru
            </span>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              Batal
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nama Kategori
              </label>
              <input
                type="text"
                autoFocus
                required
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="Mis. Kuliah, Kesehatan, Finansial..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Warna Label
              </label>
              <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                {COLOR_OPTIONS.map((opt) => (
                  <button
                    key={opt.color}
                    type="button"
                    onClick={() => setNewCatColor(opt.color)}
                    title={opt.label}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                      opt.dotClass
                    } ${
                      newCatColor === opt.color
                        ? 'ring-2 ring-offset-2 ring-blue-600 dark:ring-offset-slate-900 scale-110'
                        : 'opacity-80 hover:opacity-100 hover:scale-105'
                    }`}
                  >
                    {newCatColor === opt.color && (
                      <Check className="w-4 h-4 text-white stroke-[3]" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
            >
              Simpan Kategori
            </button>
          </div>
        </form>
      )}

      {/* Category List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {categories.map((cat) => {
          const isEditing = editingId === cat.id;
          const style = COLOR_STYLES[cat.color] || COLOR_STYLES.blue;

          if (isEditing) {
            return (
              <div
                key={cat.id}
                className="p-3 rounded-xl border border-blue-400 bg-blue-50/30 dark:bg-blue-950/20 flex flex-col gap-2.5 col-span-1 sm:col-span-2 lg:col-span-3"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
                  />
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {COLOR_OPTIONS.map((opt) => (
                      <button
                        key={opt.color}
                        type="button"
                        onClick={() => setEditColor(opt.color)}
                        className={`w-6 h-6 rounded-md flex items-center justify-center ${
                          opt.dotClass
                        } ${
                          editColor === opt.color
                            ? 'ring-2 ring-offset-1 ring-blue-600'
                            : 'opacity-70 hover:opacity-100'
                        }`}
                      >
                        {editColor === opt.color && (
                          <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-700"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveEdit(cat.id)}
                    className="px-3 py-1 text-xs font-semibold bg-blue-600 text-white rounded-lg"
                  >
                    Simpan
                  </button>
                </div>
              </div>
            );
          }

          return (
            <div
              key={cat.id}
              className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between group hover:border-slate-300 dark:hover:border-slate-700 transition-all"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className={`w-3 h-3 rounded-full ${style.dotClass} flex-shrink-0`} />
                <div className="truncate">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate block">
                    {cat.name}
                  </span>
                  {cat.isDefault && (
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">
                      Bawaan
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleStartEdit(cat)}
                  title="Ubah nama atau warna kategori"
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteCategory(cat.id, cat.name)}
                  title="Hapus kategori ini"
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
