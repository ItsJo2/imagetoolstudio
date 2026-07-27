import { create } from 'zustand';
import { createManagedObjectURL, revokeManagedObjectURL } from '../lib/imageUtils';

export interface ImageDimensions {
  width: number;
  height: number;
}

export interface HistoryEntry {
  id: string;
  actionLabel: string;
  file: File;
  url: string;
  dimensions: ImageDimensions;
  format: string;
  timestamp: number;
}

export interface ImageStoreState {
  file: File | null;
  previewUrl: string | null;
  url: string | null; // Alias for previewUrl
  dimensions: ImageDimensions | null;
  width: number | null;
  height: number | null;
  format: string | null;
  isLoading: boolean;
  error: string | null;

  // History & Undo / Redo Stack
  history: HistoryEntry[];
  historyIndex: number;

  setImage: (file: File, actionLabel?: string) => Promise<void>;
  pushHistory: (file: File, actionLabel: string) => Promise<void>;
  undo: () => void;
  redo: () => void;
  jumpToHistory: (index: number) => void;
  updatePreview: (url: string, dimensions?: ImageDimensions) => void;
  clearImage: () => void;
}

export const useImageStore = create<ImageStoreState>((set, get) => ({
  file: null,
  previewUrl: null,
  url: null,
  dimensions: null,
  width: null,
  height: null,
  format: null,
  isLoading: false,
  error: null,

  history: [],
  historyIndex: -1,

  setImage: async (file: File, actionLabel = 'Original Image') => {
    set({ isLoading: true, error: null });

    try {
      const objectUrl = createManagedObjectURL(file);
      const dimensions = await new Promise<ImageDimensions>((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          resolve({
            width: img.naturalWidth || img.width,
            height: img.naturalHeight || img.height,
          });
        };
        img.onerror = () => {
          reject(new Error('Failed to load image metadata'));
        };
        img.src = objectUrl;
      });

      const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
      const format = file.type ? file.type.split('/')[1] || fileExtension : fileExtension;

      const initialEntry: HistoryEntry = {
        id: Math.random().toString(36).substring(2, 9),
        actionLabel,
        file,
        url: objectUrl,
        dimensions,
        format,
        timestamp: Date.now(),
      };

      const { history } = get();
      history.forEach((entry) => revokeManagedObjectURL(entry.url));

      set({
        file,
        previewUrl: objectUrl,
        url: objectUrl,
        dimensions,
        width: dimensions.width,
        height: dimensions.height,
        format,
        history: [initialEntry],
        historyIndex: 0,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : 'Error reading image metadata',
      });
    }
  },

  pushHistory: async (file: File, actionLabel: string) => {
    try {
      const objectUrl = createManagedObjectURL(file);
      const dimensions = await new Promise<ImageDimensions>((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          resolve({
            width: img.naturalWidth || img.width,
            height: img.naturalHeight || img.height,
          });
        };
        img.onerror = () => {
          reject(new Error('Failed to load image metadata'));
        };
        img.src = objectUrl;
      });

      const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
      const format = file.type ? file.type.split('/')[1] || fileExtension : fileExtension;

      const newEntry: HistoryEntry = {
        id: Math.random().toString(36).substring(2, 9),
        actionLabel,
        file,
        url: objectUrl,
        dimensions,
        format,
        timestamp: Date.now(),
      };

      const { history, historyIndex } = get();
      // Trim any future history entries if we were currently in an undone state
      const droppedEntries = history.slice(historyIndex + 1);
      droppedEntries.forEach((entry) => revokeManagedObjectURL(entry.url));

      const nextHistory = history.slice(0, historyIndex + 1);
      nextHistory.push(newEntry);

      set({
        file,
        previewUrl: objectUrl,
        url: objectUrl,
        dimensions,
        width: dimensions.width,
        height: dimensions.height,
        format,
        history: nextHistory,
        historyIndex: nextHistory.length - 1,
      });
    } catch (err) {
      console.error('Failed to push history entry:', err);
    }
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const target = history[newIndex];
      set({
        historyIndex: newIndex,
        file: target.file,
        previewUrl: target.url,
        url: target.url,
        dimensions: target.dimensions,
        width: target.dimensions.width,
        height: target.dimensions.height,
        format: target.format,
      });
    }
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const target = history[newIndex];
      set({
        historyIndex: newIndex,
        file: target.file,
        previewUrl: target.url,
        url: target.url,
        dimensions: target.dimensions,
        width: target.dimensions.width,
        height: target.dimensions.height,
        format: target.format,
      });
    }
  },

  jumpToHistory: (index: number) => {
    const { history } = get();
    if (index >= 0 && index < history.length) {
      const target = history[index];
      set({
        historyIndex: index,
        file: target.file,
        previewUrl: target.url,
        url: target.url,
        dimensions: target.dimensions,
        width: target.dimensions.width,
        height: target.dimensions.height,
        format: target.format,
      });
    }
  },

  updatePreview: (url: string, dimensions?: ImageDimensions) => {
    const currentDims = dimensions || get().dimensions;
    set((state) => ({
      previewUrl: url,
      url: url,
      dimensions: currentDims,
      width: currentDims ? currentDims.width : state.width,
      height: currentDims ? currentDims.height : state.height,
    }));
  },

  clearImage: () => {
    const { history } = get();
    history.forEach((entry) => revokeManagedObjectURL(entry.url));

    set({
      file: null,
      previewUrl: null,
      url: null,
      dimensions: null,
      width: null,
      height: null,
      format: null,
      history: [],
      historyIndex: -1,
      isLoading: false,
      error: null,
    });
  },
}));

