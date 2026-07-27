import React, { useState } from 'react';
import { useRecipeStore } from '../../store/recipeStore';
import { ExportRecipe, ResizeStepConfig, WatermarkStepConfig, FilterStepConfig, ExifStripStepConfig, FormatStepConfig } from '../../types/recipe';
import { Dropzone } from '../shared/Dropzone';
import { executeRecipePipeline } from '../../lib/recipeUtils';
import { downloadBlob, ProcessedResult } from '../../lib/imageUtils';
import JSZip from 'jszip';
import { DEFAULT_FILTERS } from '../../store/presetStore';
import {
  Workflow,
  Plus,
  Play,
  Save,
  Trash2,
  Check,
  RefreshCw,
  Download,
  FileArchive,
  Settings2,
  Sliders,
  Maximize2,
  Stamp,
  ShieldCheck,
  FileCode,
  Sparkles,
  Upload,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { toast } from 'sonner';

interface BatchQueueItem {
  id: string;
  file: File;
  previewUrl: string;
  status: 'pending' | 'processing' | 'done' | 'error';
  result?: ProcessedResult;
  errorMessage?: string;
}

export const RecipeManager: React.FC = () => {
  const { allRecipes, selectedRecipeId, setSelectedRecipeId, saveRecipe, deleteRecipe, exportRecipesJSON, importRecipesJSON } = useRecipeStore();

  const [queue, setQueue] = useState<BatchQueueItem[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 });
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingRecipeId, setEditingRecipeId] = useState<string | null>(null);

  // Modal Form State
  const [recipeName, setRecipeName] = useState<string>('');
  const [recipeDesc, setRecipeDesc] = useState<string>('');
  
  const [resizeConfig, setResizeConfig] = useState<ResizeStepConfig>({
    enabled: true,
    mode: 'max_width',
    width: 1200,
    height: 800,
    percentage: 100,
    fitMode: 'contain',
    bgColor: '#ffffff',
  });

  const [watermarkConfig, setWatermarkConfig] = useState<WatermarkStepConfig>({
    enabled: false,
    type: 'text',
    text: '© My Brand',
    fontFamily: 'sans-serif',
    fontSize: 36,
    color: '#ffffff',
    opacity: 0.7,
    position: 'bottom-right',
    rotation: 0,
    logoScale: 0.25,
    margin: 20,
  });

  const [filterConfig, setFilterConfig] = useState<FilterStepConfig>({
    enabled: false,
    filters: DEFAULT_FILTERS,
  });

  const [exifConfig, setExifConfig] = useState<ExifStripStepConfig>({
    enabled: true,
  });

  const [formatConfig, setFormatConfig] = useState<FormatStepConfig>({
    targetFormat: 'webp',
    quality: 0.85,
  });

  const activeRecipe = allRecipes.find((r) => r.id === selectedRecipeId) || allRecipes[0];

  const handleDrop = (acceptedFiles: File[]) => {
    const items: BatchQueueItem[] = acceptedFiles.map((f) => ({
      id: Math.random().toString(36).substring(2, 9),
      file: f,
      previewUrl: URL.createObjectURL(f),
      status: 'pending',
    }));

    setQueue((prev) => [...prev, ...items]);
    toast.success(`Loaded ${acceptedFiles.length} file(s) into Recipe Queue`);
  };

  const removeQueueItem = (id: string) => {
    setQueue((prev) => {
      const target = prev.find((i) => i.id === id);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      if (target?.result?.url) URL.revokeObjectURL(target.result.url);
      return prev.filter((i) => i.id !== id);
    });
  };

  const clearQueue = () => {
    queue.forEach((item) => {
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      if (item.result?.url) URL.revokeObjectURL(item.result.url);
    });
    setQueue([]);
  };

  const runBatchRecipe = async () => {
    if (queue.length === 0 || !activeRecipe) return;

    setIsProcessing(true);
    setProgress({ current: 0, total: queue.length });

    const updated = [...queue];

    for (let i = 0; i < updated.length; i++) {
      const item = updated[i];
      item.status = 'processing';
      setQueue([...updated]);
      setProgress({ current: i + 1, total: updated.length });

      try {
        const res = await executeRecipePipeline(item.previewUrl, activeRecipe, item.file.name);
        item.status = 'done';
        item.result = res;
      } catch (err) {
        item.status = 'error';
        item.errorMessage = err instanceof Error ? err.message : 'Pipeline execution failed';
      }

      setQueue([...updated]);
    }

    setIsProcessing(false);
    toast.success(`Recipe "${activeRecipe.name}" applied to ${queue.length} items!`);
  };

  const downloadZip = async () => {
    const doneItems = queue.filter((q) => q.status === 'done' && q.result);
    if (doneItems.length === 0) return;

    toast.info('Packing processed images into ZIP...');
    const zip = new JSZip();

    doneItems.forEach((item) => {
      if (item.result) {
        zip.file(item.result.filename, item.result.blob);
      }
    });

    const blob = await zip.generateAsync({ type: 'blob' });
    downloadBlob(blob, `recipe_export_${activeRecipe.id}.zip`);
    toast.success('ZIP package downloaded successfully!');
  };

  const openCreateModal = () => {
    setEditingRecipeId(null);
    setRecipeName('My Multi-Step Pipeline');
    setRecipeDesc('Automated resize, watermark, and format conversion pipeline.');
    setResizeConfig({
      enabled: true,
      mode: 'max_width',
      width: 1200,
      height: 800,
      percentage: 100,
      fitMode: 'contain',
      bgColor: '#ffffff',
    });
    setWatermarkConfig({
      enabled: true,
      type: 'text',
      text: '© 2026 My Studio',
      fontFamily: 'sans-serif',
      fontSize: 36,
      color: '#ffffff',
      opacity: 0.7,
      position: 'bottom-right',
      rotation: 0,
      logoScale: 0.25,
      margin: 20,
    });
    setFilterConfig({ enabled: false, filters: DEFAULT_FILTERS });
    setExifConfig({ enabled: true });
    setFormatConfig({ targetFormat: 'webp', quality: 0.85 });
    setIsModalOpen(true);
  };

  const openEditModal = (recipe: ExportRecipe) => {
    setEditingRecipeId(recipe.id);
    setRecipeName(recipe.name);
    setRecipeDesc(recipe.description);
    setResizeConfig({ ...recipe.steps.resize });
    setWatermarkConfig({ ...recipe.steps.watermark });
    setFilterConfig({ ...recipe.steps.filter, filters: { ...recipe.steps.filter.filters } });
    setExifConfig({ ...recipe.steps.exifStrip });
    setFormatConfig({ ...recipe.steps.format });
    setIsModalOpen(true);
  };

  const handleSaveRecipeForm = (e: React.FormEvent) => {
    e.preventDefault();
    const saved = saveRecipe(
      {
        name: recipeName,
        description: recipeDesc,
        steps: {
          resize: resizeConfig,
          watermark: watermarkConfig,
          filter: filterConfig,
          exifStrip: exifConfig,
          format: formatConfig,
        },
      },
      editingRecipeId || undefined
    );

    setIsModalOpen(false);
    toast.success(`Recipe "${saved.name}" saved successfully!`);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (content) {
        const res = importRecipesJSON(content);
        if (res.success) {
          toast.success(`Imported ${res.count} custom export recipe(s)!`);
        } else {
          toast.error(res.error || 'Failed to import recipes.');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action Controls */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-5">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Workflow className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Custom Export Recipes & Automation
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Save multi-step editing pipelines (e.g. Resize + Watermark + WebP 80%) and execute them on batch uploads in 1 click.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={exportRecipesJSON}
              className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Export Recipes
            </button>

            <label className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg text-xs transition-colors flex items-center gap-1.5 cursor-pointer">
              <Upload className="w-3.5 h-3.5" /> Import
              <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
            </label>

            <button
              type="button"
              onClick={openCreateModal}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-xs transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Build New Recipe
            </button>
          </div>
        </div>

        {/* Recipe Selection Grid */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
            Select Active Pipeline Recipe:
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {allRecipes.map((recipe) => {
              const isSelected = recipe.id === selectedRecipeId;
              return (
                <div
                  key={recipe.id}
                  onClick={() => setSelectedRecipeId(recipe.id)}
                  className={`p-4 rounded-xl border text-left cursor-pointer transition-all relative flex flex-col justify-between space-y-3 ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20'
                      : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-700'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-sm text-gray-900 dark:text-gray-100 truncate">
                        {recipe.name}
                      </span>
                      {recipe.isBuiltIn ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                          Preset
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                          Custom
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                      {recipe.description}
                    </p>
                  </div>

                  {/* Step badges */}
                  <div className="flex flex-wrap gap-1 text-[10px] pt-1 border-t border-gray-100 dark:border-gray-800">
                    {recipe.steps.resize.enabled && (
                      <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-medium">
                        Resize {recipe.steps.resize.width}px
                      </span>
                    )}
                    {recipe.steps.watermark.enabled && (
                      <span className="px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-medium">
                        Watermark
                      </span>
                    )}
                    {recipe.steps.filter.enabled && (
                      <span className="px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-medium">
                        Filter
                      </span>
                    )}
                    {recipe.steps.exifStrip.enabled && (
                      <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-medium">
                        Clean EXIF
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold uppercase">
                      {recipe.steps.format.targetFormat} {Math.round(recipe.steps.format.quality * 100)}%
                    </span>
                  </div>

                  {!recipe.isBuiltIn && (
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(recipe);
                        }}
                        className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteRecipe(recipe.id);
                          toast.success(`Deleted recipe "${recipe.name}"`);
                        }}
                        className="text-xs text-red-600 dark:text-red-400 hover:underline font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Dropzone for Recipe Processing */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
              Batch Uploads for Recipe: <span className="text-indigo-600 dark:text-indigo-400">{activeRecipe.name}</span>
            </h3>
            {queue.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={clearQueue}
                  disabled={isProcessing}
                  className="px-3 py-1.5 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  Clear Queue
                </button>
                <button
                  type="button"
                  onClick={runBatchRecipe}
                  disabled={isProcessing}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-xs shadow-sm transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Running Pipeline ({progress.current}/{progress.total})...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" /> Apply Recipe ({queue.length})
                    </>
                  )}
                </button>
                {queue.some((q) => q.status === 'done') && (
                  <button
                    type="button"
                    onClick={downloadZip}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-xs shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileArchive className="w-4 h-4" /> Download ZIP
                  </button>
                )}
              </div>
            )}
          </div>

          <Dropzone onDrop={handleDrop} multiple className="py-8" />
        </div>

        {/* Queue Results List */}
        {queue.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="divide-y divide-gray-100 dark:divide-gray-800 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900">
              {queue.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={item.previewUrl}
                      alt={item.file.name}
                      className="w-12 h-12 rounded-lg object-contain checkerboard border border-gray-200 dark:border-gray-700 flex-shrink-0"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate max-w-xs sm:max-w-md">
                        {item.file.name}
                      </p>
                      <p className="text-xs text-gray-500 font-mono mt-0.5">
                        {(item.file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    {item.status === 'pending' && (
                      <span className="text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-full">
                        Ready
                      </span>
                    )}
                    {item.status === 'processing' && (
                      <span className="text-xs font-medium text-indigo-600 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 rounded-full flex items-center gap-1">
                        <RefreshCw className="w-3 h-3 animate-spin" /> Processing
                      </span>
                    )}
                    {item.status === 'done' && item.result && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-full flex items-center gap-1">
                          <Check className="w-3 h-3" /> {item.result.width}x{item.result.height} | {(item.result.sizeBytes / 1024).toFixed(1)} KB
                        </span>
                        <button
                          type="button"
                          onClick={() => item.result && downloadBlob(item.result.blob, item.result.filename)}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-lg transition-colors cursor-pointer"
                          title="Download item"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    {item.status === 'error' && (
                      <span className="text-xs font-medium text-red-600 bg-red-50 dark:bg-red-950 px-2.5 py-1 rounded-full">
                        {item.errorMessage || 'Failed'}
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => removeQueueItem(item.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Builder Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 max-w-2xl w-full p-6 shadow-2xl space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Workflow className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                {editingRecipeId ? 'Edit Export Recipe' : 'Build Custom Export Recipe'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveRecipeForm} className="space-y-6">
              {/* Name and Description */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Recipe Name
                  </label>
                  <input
                    type="text"
                    required
                    value={recipeName}
                    onChange={(e) => setRecipeName(e.target.value)}
                    placeholder="e.g. Website Catalog WebP 1200px"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium text-gray-900 dark:text-gray-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={recipeDesc}
                    onChange={(e) => setRecipeDesc(e.target.value)}
                    placeholder="Short description of this automated pipeline..."
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Pipeline Steps Accordion */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Pipeline Steps Configuration:
                </h4>

                {/* Step 1: Resize */}
                <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={resizeConfig.enabled}
                        onChange={(e) => setResizeConfig({ ...resizeConfig, enabled: e.target.checked })}
                        className="rounded accent-indigo-600"
                      />
                      <span className="font-bold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                        <Maximize2 className="w-4 h-4 text-blue-500" /> 1. Resize Step
                      </span>
                    </label>
                  </div>

                  {resizeConfig.enabled && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          Resize Mode
                        </label>
                        <select
                          value={resizeConfig.mode}
                          onChange={(e) => setResizeConfig({ ...resizeConfig, mode: e.target.value as any })}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-medium text-gray-900 dark:text-gray-100"
                        >
                          <option value="max_width">Max Width Constraint</option>
                          <option value="max_height">Max Height Constraint</option>
                          <option value="exact">Exact Dimension (Crop/Fit)</option>
                          <option value="percentage">Percentage Scale (%)</option>
                        </select>
                      </div>

                      {resizeConfig.mode === 'percentage' ? (
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                            Scale Percentage
                          </label>
                          <input
                            type="number"
                            min="10"
                            max="200"
                            value={resizeConfig.percentage}
                            onChange={(e) => setResizeConfig({ ...resizeConfig, percentage: parseInt(e.target.value) || 100 })}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-mono text-gray-900 dark:text-gray-100"
                          />
                        </div>
                      ) : (
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                            Target Width (px)
                          </label>
                          <input
                            type="number"
                            min="50"
                            max="8000"
                            value={resizeConfig.width}
                            onChange={(e) => setResizeConfig({ ...resizeConfig, width: parseInt(e.target.value) || 1200 })}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-mono text-gray-900 dark:text-gray-100"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Step 2: Watermark */}
                <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={watermarkConfig.enabled}
                        onChange={(e) => setWatermarkConfig({ ...watermarkConfig, enabled: e.target.checked })}
                        className="rounded accent-indigo-600"
                      />
                      <span className="font-bold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                        <Stamp className="w-4 h-4 text-purple-500" /> 2. Watermark Step
                      </span>
                    </label>
                  </div>

                  {watermarkConfig.enabled && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          Watermark Text
                        </label>
                        <input
                          type="text"
                          value={watermarkConfig.text}
                          onChange={(e) => setWatermarkConfig({ ...watermarkConfig, text: e.target.value })}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-gray-900 dark:text-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          Position
                        </label>
                        <select
                          value={watermarkConfig.position}
                          onChange={(e) => setWatermarkConfig({ ...watermarkConfig, position: e.target.value as any })}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-medium text-gray-900 dark:text-gray-100"
                        >
                          <option value="bottom-right">Bottom Right</option>
                          <option value="bottom-left">Bottom Left</option>
                          <option value="center">Center</option>
                          <option value="top-right">Top Right</option>
                          <option value="tiled">Tiled Repeat Pattern</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                {/* Step 3: EXIF Strip */}
                <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={exifConfig.enabled}
                        onChange={(e) => setExifConfig({ ...exifConfig, enabled: e.target.checked })}
                        className="rounded accent-indigo-600"
                      />
                      <span className="font-bold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" /> 3. Strip Location & Camera EXIF
                      </span>
                    </label>
                  </div>
                </div>

                {/* Step 4: Final Format & Compression */}
                <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 space-y-3">
                  <h5 className="font-bold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-500" /> 4. Target Format & Compression
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Format
                      </label>
                      <select
                        value={formatConfig.targetFormat}
                        onChange={(e) => setFormatConfig({ ...formatConfig, targetFormat: e.target.value as any })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-bold text-gray-900 dark:text-gray-100"
                      >
                        <option value="webp">WebP (Recommended)</option>
                        <option value="png">PNG (Lossless)</option>
                        <option value="jpg">JPG (Standard)</option>
                        <option value="avif">AVIF (Ultra High Compression)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Quality: <span className="font-mono text-indigo-600">{Math.round(formatConfig.quality * 100)}%</span>
                      </label>
                      <input
                        type="range"
                        min="0.2"
                        max="1.0"
                        step="0.05"
                        value={formatConfig.quality}
                        onChange={(e) => setFormatConfig({ ...formatConfig, quality: parseFloat(e.target.value) })}
                        className="w-full accent-indigo-600"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-gray-200 dark:border-gray-800 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" /> Save Export Recipe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
