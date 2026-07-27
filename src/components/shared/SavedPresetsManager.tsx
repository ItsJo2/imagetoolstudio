import React, { useState, useRef } from 'react';
import { usePresetStore, Preset } from '../../store/presetStore';
import { useImageStore } from '../../store/imageStore';
import { ImageFilterOptions } from '../../lib/imageUtils';
import {
  Sliders,
  Bookmark,
  Plus,
  Trash2,
  Edit2,
  Download,
  Upload,
  Search,
  Star,
  Check,
  X,
  Sparkles,
  Layers,
  Palette,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';

export interface SavedPresetsManagerProps {
  currentFilters?: ImageFilterOptions;
  onApplyPreset?: (preset: Preset) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const SavedPresetsManager: React.FC<SavedPresetsManagerProps> = ({
  currentFilters,
  onApplyPreset,
  isOpen,
  onClose,
}) => {
  const { url } = useImageStore();
  const {
    customPresets,
    allPresets,
    savePreset,
    deletePreset,
    renamePreset,
    toggleFavorite,
    exportPresetsJSON,
    importPresetsJSON,
  } = usePresetStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'custom' | 'builtin' | 'favorites'>('all');
  const [isSavingNew, setIsSavingNew] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Filter presets based on tab and search query
  const filteredPresets = allPresets.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (activeTab === 'custom') return p.category === 'custom';
    if (activeTab === 'builtin') return p.category === 'built-in';
    if (activeTab === 'favorites') return Boolean(p.isFavorite);
    return true;
  });

  const handleSaveCurrent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentFilters) {
      toast.error('No active filter settings to save.');
      return;
    }

    if (!newPresetName.trim()) {
      toast.error('Please enter a name for your preset.');
      return;
    }

    const created = savePreset(newPresetName, currentFilters);
    toast.success(`Saved preset "${created.name}"!`);
    setNewPresetName('');
    setIsSavingNew(false);
    setActiveTab('custom');
  };

  const handleStartRename = (preset: Preset) => {
    setEditingId(preset.id);
    setEditingName(preset.name);
  };

  const handleConfirmRename = (id: string) => {
    if (editingName.trim()) {
      renamePreset(id, editingName);
      toast.success('Preset renamed!');
    }
    setEditingId(null);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete preset "${name}"?`)) {
      deletePreset(id);
      toast.info(`Deleted preset "${name}".`);
    }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const result = importPresetsJSON(content);
        if (result.success) {
          toast.success(`Successfully imported ${result.count} preset(s)!`);
          setActiveTab('custom');
        } else {
          toast.error(result.error || 'Failed to import presets.');
        }
      }
    };
    reader.readAsText(file);
    if (e.target) e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
              <Bookmark className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                Saved Presets Manager
                <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-mono">
                  {allPresets.length} Total
                </span>
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Save, load, organize, and export custom color adjustments & filter presets.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Bar (Save Current + Import / Export) */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-wrap items-center justify-between gap-3">
          {currentFilters && (
            <div>
              {!isSavingNew ? (
                <button
                  type="button"
                  onClick={() => setIsSavingNew(true)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-indigo-500/20 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Save Current Filter as Preset
                </button>
              ) : (
                <form onSubmit={handleSaveCurrent} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newPresetName}
                    onChange={(e) => setNewPresetName(e.target.value)}
                    placeholder="E.g. Summer Sunset Vibe"
                    autoFocus
                    className="px-3 py-1.5 rounded-xl border border-indigo-300 dark:border-indigo-700 bg-white dark:bg-gray-800 text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-52"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" /> Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsSavingNew(false)}
                    className="px-2.5 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-bold text-xs hover:bg-gray-200 cursor-pointer"
                  >
                    Cancel
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Import / Export Controls */}
          <div className="flex items-center gap-2 ml-auto">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportFile}
              accept=".json"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Import Presets from JSON"
            >
              <Upload className="w-3.5 h-3.5 text-indigo-500" />
              Import JSON
            </button>

            <button
              type="button"
              onClick={() => {
                if (customPresets.length === 0) {
                  toast.info('No custom presets to export yet!');
                  return;
                }
                exportPresetsJSON();
                toast.success('Exported custom presets as JSON!');
              }}
              className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Export Custom Presets to JSON"
            >
              <Download className="w-3.5 h-3.5 text-indigo-500" />
              Export JSON
            </button>
          </div>
        </div>

        {/* Search & Tabs */}
        <div className="p-4 bg-gray-50/50 dark:bg-gray-950/50 border-b border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex items-center gap-1 bg-gray-200/80 dark:bg-gray-800 p-1 rounded-2xl w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex-1 sm:flex-initial cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              All ({allPresets.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('custom')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex-1 sm:flex-initial cursor-pointer ${
                activeTab === 'custom'
                  ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              My Presets ({customPresets.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('builtin')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex-1 sm:flex-initial cursor-pointer ${
                activeTab === 'builtin'
                  ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              Built-in
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('favorites')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex-1 sm:flex-initial cursor-pointer flex items-center justify-center gap-1 ${
                activeTab === 'favorites'
                  ? 'bg-white dark:bg-gray-700 text-amber-500 shadow-2xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-current" />
              Favorites
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search presets..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Presets Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 min-h-[300px]">
          {filteredPresets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center space-y-3">
              <div className="p-4 rounded-3xl bg-gray-100 dark:bg-gray-800 text-gray-400">
                <Palette className="w-8 h-8" />
              </div>
              <p className="text-sm font-bold text-gray-700 dark:text-gray-300">No Presets Found</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs">
                {activeTab === 'custom'
                  ? 'You have not saved any custom presets yet. Adjust filters in Filter Tool and click "Save Current Filter".'
                  : 'Try searching for another keyword or switching categories.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPresets.map((preset) => {
                const pFilterStr = [
                  `brightness(${preset.filters.brightness}%)`,
                  `contrast(${preset.filters.contrast}%)`,
                  `saturate(${preset.filters.saturate}%)`,
                  `blur(${preset.filters.blur}px)`,
                  `hue-rotate(${preset.filters.hueRotate}deg)`,
                  `sepia(${preset.filters.sepia}%)`,
                  `grayscale(${preset.filters.grayscale}%)`,
                  `invert(${preset.filters.invert}%)`,
                ].join(' ');

                const isEditing = editingId === preset.id;

                return (
                  <div
                    key={preset.id}
                    className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all flex flex-col justify-between space-y-3 group shadow-2xs hover:shadow-md"
                  >
                    {/* Top Header & Favorite */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        {isEditing ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              className="px-2 py-1 rounded-lg border border-indigo-400 text-xs bg-gray-50 dark:bg-gray-800 w-full"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => handleConfirmRename(preset.id)}
                              className="p-1 rounded bg-indigo-600 text-white"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
                              {preset.name}
                            </h3>
                            {preset.category === 'custom' && (
                              <span className="px-1.5 py-0.2 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[10px] font-bold">
                                Custom
                              </span>
                            )}
                          </div>
                        )}
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {preset.category === 'built-in' ? 'System Preset' : `Saved ${new Date(preset.createdAt).toLocaleDateString()}`}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleFavorite(preset.id)}
                        className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                          preset.isFavorite
                            ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40'
                            : 'text-gray-300 dark:text-gray-700 hover:text-amber-400'
                        }`}
                        title="Toggle Favorite"
                      >
                        <Star className={`w-4 h-4 ${preset.isFavorite ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    {/* Thumbnail Preview */}
                    <div className="relative h-28 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 checkerboard flex items-center justify-center bg-gray-950/10">
                      {url ? (
                        <img
                          src={url}
                          alt={preset.name}
                          style={{ filter: pFilterStr }}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div
                          className="w-full h-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500"
                          style={{ filter: pFilterStr }}
                        />
                      )}
                    </div>

                    {/* Filter Settings Mini-Pills */}
                    <div className="flex flex-wrap gap-1 text-[10px]">
                      <span className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                        Bright: {preset.filters.brightness}%
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                        Contrast: {preset.filters.contrast}%
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                        Sat: {preset.filters.saturate}%
                      </span>
                      {preset.filters.hueRotate !== 0 && (
                        <span className="px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                          Hue: {preset.filters.hueRotate}°
                        </span>
                      )}
                      {preset.filters.sepia > 0 && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400">
                          Sepia: {preset.filters.sepia}%
                        </span>
                      )}
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                      <div className="flex items-center gap-1">
                        {preset.category === 'custom' && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleStartRename(preset)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                              title="Rename Preset"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(preset.id, preset.name)}
                              className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                              title="Delete Preset"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (onApplyPreset) {
                            onApplyPreset(preset);
                            toast.success(`Applied preset "${preset.name}"!`);
                            onClose();
                          }
                        }}
                        className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 hover:bg-indigo-600 text-indigo-600 dark:text-indigo-400 hover:text-white font-bold text-xs flex items-center gap-1 transition-all cursor-pointer border border-indigo-200 dark:border-indigo-800 hover:border-transparent"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Apply Preset
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/50 flex items-center justify-between">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Presets are safely stored in your browser's local cache. Export to JSON for cloud backups.
          </p>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-bold text-xs hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
