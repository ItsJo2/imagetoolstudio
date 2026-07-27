import { create } from 'zustand';
import { ExportRecipe } from '../types/recipe';
import { DEFAULT_FILTERS } from './presetStore';

export const DEFAULT_RECIPES: ExportRecipe[] = [
  {
    id: 'builtin_web_ready',
    name: 'Web Ready 1200px + WebP 85%',
    description: 'Resizes to 1200px max width, strips location metadata, and converts to WebP 85% for lightning web speed.',
    isBuiltIn: true,
    createdAt: 1,
    steps: {
      resize: {
        enabled: true,
        mode: 'max_width',
        width: 1200,
        height: 800,
        percentage: 100,
        fitMode: 'contain',
        bgColor: '#ffffff',
      },
      watermark: {
        enabled: false,
        type: 'text',
        text: '© My Brand',
        fontFamily: 'sans-serif',
        fontSize: 36,
        color: '#ffffff',
        opacity: 0.7,
        position: 'bottom-right',
        rotation: 0,
        logoScale: 0.2,
        margin: 20,
      },
      filter: {
        enabled: false,
        filters: DEFAULT_FILTERS,
      },
      exifStrip: {
        enabled: true,
      },
      format: {
        targetFormat: 'webp',
        quality: 0.85,
      },
    },
  },
  {
    id: 'builtin_brand_watermark',
    name: 'Brand Watermark + WebP 90%',
    description: 'Applies copyright watermark to the bottom-right and exports crisp WebP 90%.',
    isBuiltIn: true,
    createdAt: 2,
    steps: {
      resize: {
        enabled: false,
        mode: 'max_width',
        width: 1920,
        height: 1080,
        percentage: 100,
        fitMode: 'contain',
        bgColor: '#ffffff',
      },
      watermark: {
        enabled: true,
        type: 'text',
        text: '© 2026 ImageTool Studio',
        fontFamily: 'sans-serif',
        fontSize: 40,
        color: '#ffffff',
        opacity: 0.75,
        position: 'bottom-right',
        rotation: 0,
        logoScale: 0.25,
        margin: 24,
      },
      filter: {
        enabled: false,
        filters: DEFAULT_FILTERS,
      },
      exifStrip: {
        enabled: true,
      },
      format: {
        targetFormat: 'webp',
        quality: 0.90,
      },
    },
  },
  {
    id: 'builtin_ecommerce_product',
    name: 'E-commerce Catalog (1000x1000 JPG)',
    description: 'Resizes to 1000x1000 square catalog image with boosted contrast and white fill.',
    isBuiltIn: true,
    createdAt: 3,
    steps: {
      resize: {
        enabled: true,
        mode: 'exact',
        width: 1000,
        height: 1000,
        percentage: 100,
        fitMode: 'contain',
        bgColor: '#ffffff',
      },
      watermark: {
        enabled: false,
        type: 'text',
        text: '',
        fontFamily: 'sans-serif',
        fontSize: 30,
        color: '#ffffff',
        opacity: 0.5,
        position: 'center',
        rotation: 0,
        logoScale: 0.2,
        margin: 20,
      },
      filter: {
        enabled: true,
        filters: { ...DEFAULT_FILTERS, brightness: 103, contrast: 110, saturate: 110 },
      },
      exifStrip: {
        enabled: true,
      },
      format: {
        targetFormat: 'jpg',
        quality: 0.90,
      },
    },
  },
];

const RECIPES_STORAGE_KEY = 'imagetool_custom_export_recipes_v1';

const loadSavedRecipes = (): ExportRecipe[] => {
  try {
    const raw = localStorage.getItem(RECIPES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.error('Failed to load custom export recipes:', err);
  }
  return [];
};

const saveCustomRecipes = (recipes: ExportRecipe[]) => {
  try {
    localStorage.setItem(RECIPES_STORAGE_KEY, JSON.stringify(recipes));
  } catch (err) {
    console.error('Failed to persist custom export recipes:', err);
  }
};

export interface RecipeStoreState {
  customRecipes: ExportRecipe[];
  allRecipes: ExportRecipe[];
  selectedRecipeId: string;

  setSelectedRecipeId: (id: string) => void;
  saveRecipe: (recipe: Omit<ExportRecipe, 'id' | 'createdAt' | 'isBuiltIn'>, idToUpdate?: string) => ExportRecipe;
  deleteRecipe: (id: string) => void;
  exportRecipesJSON: () => void;
  importRecipesJSON: (jsonStr: string) => { success: boolean; count: number; error?: string };
}

export const useRecipeStore = create<RecipeStoreState>((set, get) => {
  const customRecipes = loadSavedRecipes();

  return {
    customRecipes,
    allRecipes: [...DEFAULT_RECIPES, ...customRecipes],
    selectedRecipeId: DEFAULT_RECIPES[0].id,

    setSelectedRecipeId: (id: string) => set({ selectedRecipeId: id }),

    saveRecipe: (data, idToUpdate) => {
      const existingCustom = get().customRecipes;

      if (idToUpdate) {
        // Edit existing
        const updatedCustom = existingCustom.map((r) =>
          r.id === idToUpdate
            ? { ...r, ...data, name: data.name.trim() || r.name }
            : r
        );
        saveCustomRecipes(updatedCustom);
        const all = [...DEFAULT_RECIPES, ...updatedCustom];
        set({ customRecipes: updatedCustom, allRecipes: all });
        return all.find((r) => r.id === idToUpdate)!;
      } else {
        // Create new
        const newRecipe: ExportRecipe = {
          ...data,
          id: `recipe_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          name: data.name.trim() || 'Custom Pipeline Recipe',
          description: data.description.trim() || 'Multi-step automated image transformation pipeline.',
          isBuiltIn: false,
          createdAt: Date.now(),
        };

        const updatedCustom = [newRecipe, ...existingCustom];
        saveCustomRecipes(updatedCustom);
        const all = [...DEFAULT_RECIPES, ...updatedCustom];
        set({
          customRecipes: updatedCustom,
          allRecipes: all,
          selectedRecipeId: newRecipe.id,
        });
        return newRecipe;
      }
    },

    deleteRecipe: (id: string) => {
      const updatedCustom = get().customRecipes.filter((r) => r.id !== id);
      saveCustomRecipes(updatedCustom);
      const all = [...DEFAULT_RECIPES, ...updatedCustom];
      const nextSelected = get().selectedRecipeId === id ? DEFAULT_RECIPES[0].id : get().selectedRecipeId;
      set({
        customRecipes: updatedCustom,
        allRecipes: all,
        selectedRecipeId: nextSelected,
      });
    },

    exportRecipesJSON: () => {
      const customOnly = get().customRecipes;
      const jsonStr = JSON.stringify(customOnly, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `imagetool_export_recipes_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },

    importRecipesJSON: (jsonStr: string) => {
      try {
        const parsed = JSON.parse(jsonStr);
        if (!Array.isArray(parsed)) {
          return { success: false, count: 0, error: 'JSON must contain an array of recipe objects.' };
        }

        const validRecipes: ExportRecipe[] = [];
        for (const item of parsed) {
          if (item && item.name && item.steps) {
            validRecipes.push({
              id: item.id || `imported_recipe_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              name: String(item.name).trim(),
              description: String(item.description || ''),
              isBuiltIn: false,
              createdAt: item.createdAt || Date.now(),
              steps: item.steps,
            });
          }
        }

        if (validRecipes.length === 0) {
          return { success: false, count: 0, error: 'No valid recipe objects found in file.' };
        }

        const existingIds = new Set(get().customRecipes.map((r) => r.id));
        const newDeduplicated = validRecipes.filter((r) => !existingIds.has(r.id));
        const updatedCustom = [...newDeduplicated, ...get().customRecipes];

        saveCustomRecipes(updatedCustom);
        const all = [...DEFAULT_RECIPES, ...updatedCustom];
        set({
          customRecipes: updatedCustom,
          allRecipes: all,
          selectedRecipeId: newDeduplicated[0]?.id || get().selectedRecipeId,
        });

        return { success: true, count: newDeduplicated.length };
      } catch (err) {
        return { success: false, count: 0, error: (err as Error).message || 'Invalid JSON format' };
      }
    },
  };
});
