import { create } from 'zustand';
import { ImageFilterOptions } from '../lib/imageUtils';

export interface Preset {
  id: string;
  name: string;
  category: 'built-in' | 'custom' | 'favorite';
  filters: ImageFilterOptions;
  createdAt: number;
  isFavorite?: boolean;
}

export const DEFAULT_FILTERS: ImageFilterOptions = {
  brightness: 100,
  contrast: 100,
  saturate: 100,
  blur: 0,
  hueRotate: 0,
  sepia: 0,
  grayscale: 0,
  invert: 0,
};

export const BUILTIN_PRESETS: Preset[] = [
  {
    id: 'normal',
    name: 'Original',
    category: 'built-in',
    filters: DEFAULT_FILTERS,
    createdAt: 1,
  },
  {
    id: 'vivid',
    name: 'Vivid Pop',
    category: 'built-in',
    filters: { ...DEFAULT_FILTERS, brightness: 105, contrast: 120, saturate: 140 },
    createdAt: 2,
  },
  {
    id: 'vintage',
    name: 'Vintage Sepia',
    category: 'built-in',
    filters: { ...DEFAULT_FILTERS, sepia: 75, contrast: 110, brightness: 95 },
    createdAt: 3,
  },
  {
    id: 'mono',
    name: 'B&W Contrast',
    category: 'built-in',
    filters: { ...DEFAULT_FILTERS, grayscale: 100, contrast: 130, brightness: 105 },
    createdAt: 4,
  },
  {
    id: 'warm',
    name: 'Warm Sun',
    category: 'built-in',
    filters: { ...DEFAULT_FILTERS, sepia: 20, saturate: 125, hueRotate: 10 },
    createdAt: 5,
  },
  {
    id: 'cool',
    name: 'Cool Breeze',
    category: 'built-in',
    filters: { ...DEFAULT_FILTERS, hueRotate: 180, saturate: 110 },
    createdAt: 6,
  },
  {
    id: 'dramatic',
    name: 'Dramatic Mood',
    category: 'built-in',
    filters: { ...DEFAULT_FILTERS, contrast: 140, brightness: 90, saturate: 80 },
    createdAt: 7,
  },
  {
    id: 'soft',
    name: 'Soft Glow',
    category: 'built-in',
    filters: { ...DEFAULT_FILTERS, brightness: 110, blur: 1, contrast: 95 },
    createdAt: 8,
  },
  {
    id: 'inverted',
    name: 'X-Ray Invert',
    category: 'built-in',
    filters: { ...DEFAULT_FILTERS, invert: 100 },
    createdAt: 9,
  },
  {
    id: 'cyberpunk',
    name: 'Cyber Neon',
    category: 'built-in',
    filters: { ...DEFAULT_FILTERS, hueRotate: 290, contrast: 125, saturate: 150 },
    createdAt: 10,
  },
  {
    id: 'hdr-boost',
    name: 'HDR Clarity',
    category: 'built-in',
    filters: { ...DEFAULT_FILTERS, contrast: 130, saturate: 120, brightness: 108 },
    createdAt: 11,
  },
];

const LOCAL_STORAGE_KEY = 'quickpix_saved_presets_v1';

const loadSavedPresets = (): Preset[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load custom presets from localStorage:', err);
  }
  return [];
};

const saveCustomPresets = (presets: Preset[]) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(presets));
  } catch (err) {
    console.error('Failed to save custom presets to localStorage:', err);
  }
};

export interface PresetStoreState {
  customPresets: Preset[];
  allPresets: Preset[];
  
  savePreset: (name: string, filters: ImageFilterOptions) => Preset;
  deletePreset: (id: string) => void;
  renamePreset: (id: string, newName: string) => void;
  toggleFavorite: (id: string) => void;
  exportPresetsJSON: () => void;
  importPresetsJSON: (jsonString: string) => { success: boolean; count: number; error?: string };
}

export const usePresetStore = create<PresetStoreState>((set, get) => {
  const customPresets = loadSavedPresets();

  return {
    customPresets,
    allPresets: [...BUILTIN_PRESETS, ...customPresets],

    savePreset: (name: string, filters: ImageFilterOptions) => {
      const newPreset: Preset = {
        id: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        name: name.trim() || 'My Custom Preset',
        category: 'custom',
        filters: { ...filters },
        createdAt: Date.now(),
        isFavorite: false,
      };

      const updatedCustom = [newPreset, ...get().customPresets];
      saveCustomPresets(updatedCustom);

      set({
        customPresets: updatedCustom,
        allPresets: [...BUILTIN_PRESETS, ...updatedCustom],
      });

      return newPreset;
    },

    deletePreset: (id: string) => {
      const updatedCustom = get().customPresets.filter((p) => p.id !== id);
      saveCustomPresets(updatedCustom);

      set({
        customPresets: updatedCustom,
        allPresets: [...BUILTIN_PRESETS, ...updatedCustom],
      });
    },

    renamePreset: (id: string, newName: string) => {
      const updatedCustom = get().customPresets.map((p) =>
        p.id === id ? { ...p, name: newName.trim() || p.name } : p
      );
      saveCustomPresets(updatedCustom);

      set({
        customPresets: updatedCustom,
        allPresets: [...BUILTIN_PRESETS, ...updatedCustom],
      });
    },

    toggleFavorite: (id: string) => {
      const updatedCustom = get().customPresets.map((p) =>
        p.id === id ? { ...p, isFavorite: !p.isFavorite } : p
      );
      saveCustomPresets(updatedCustom);

      // Also update built-in favorites if toggled in UI memory
      const updatedBuiltins = BUILTIN_PRESETS.map((p) =>
        p.id === id ? { ...p, isFavorite: !p.isFavorite } : p
      );

      set({
        customPresets: updatedCustom,
        allPresets: [...updatedBuiltins, ...updatedCustom],
      });
    },

    exportPresetsJSON: () => {
      const customOnly = get().customPresets;
      const jsonStr = JSON.stringify(customOnly, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `quickpix_presets_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },

    importPresetsJSON: (jsonString: string) => {
      try {
        const parsed = JSON.parse(jsonString);
        if (!Array.isArray(parsed)) {
          return { success: false, count: 0, error: 'JSON format must be an array of presets' };
        }

        const validPresets: Preset[] = [];
        for (const item of parsed) {
          if (item && item.name && item.filters) {
            validPresets.push({
              id: item.id || `imported_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              name: String(item.name).trim(),
              category: 'custom',
              filters: {
                brightness: Number(item.filters.brightness ?? 100),
                contrast: Number(item.filters.contrast ?? 100),
                saturate: Number(item.filters.saturate ?? 100),
                blur: Number(item.filters.blur ?? 0),
                hueRotate: Number(item.filters.hueRotate ?? 0),
                sepia: Number(item.filters.sepia ?? 0),
                grayscale: Number(item.filters.grayscale ?? 0),
                invert: Number(item.filters.invert ?? 0),
              },
              createdAt: item.createdAt || Date.now(),
              isFavorite: Boolean(item.isFavorite),
            });
          }
        }

        if (validPresets.length === 0) {
          return { success: false, count: 0, error: 'No valid preset objects found in file' };
        }

        const existingIds = new Set(get().customPresets.map((p) => p.id));
        const newDeduplicated = validPresets.filter((p) => !existingIds.has(p.id));
        const updatedCustom = [...newDeduplicated, ...get().customPresets];

        saveCustomPresets(updatedCustom);
        set({
          customPresets: updatedCustom,
          allPresets: [...BUILTIN_PRESETS, ...updatedCustom],
        });

        return { success: true, count: newDeduplicated.length };
      } catch (err) {
        return { success: false, count: 0, error: (err as Error).message || 'Invalid JSON syntax' };
      }
    },
  };
});
