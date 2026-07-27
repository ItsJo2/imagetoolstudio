import React, { useState } from 'react';
import { useImageStore } from '../../store/imageStore';
import { usePresetStore, Preset, DEFAULT_FILTERS } from '../../store/presetStore';
import { applyImageFilters, ImageFilterOptions, downloadBlob, ProcessedResult } from '../../lib/imageUtils';
import { SendToMenu } from '../shared/SendToMenu';
import { BeforeAfterSlider } from '../shared/BeforeAfterSlider';
import { SavedPresetsManager } from '../shared/SavedPresetsManager';
import { Sliders, Download, RefreshCw, Check, ArrowRight, RotateCcw, Palette, Sparkles, Bookmark, Plus } from 'lucide-react';
import { toast } from 'sonner';

export const FilterTool: React.FC = () => {
  const { file, url, setImage, pushHistory, history } = useImageStore();
  const { allPresets } = usePresetStore();

  const [filters, setFilters] = useState<ImageFilterOptions>(DEFAULT_FILTERS);
  const [activePreset, setActivePreset] = useState<string>('normal');
  const [outputFormat, setOutputFormat] = useState<string>('png');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [result, setResult] = useState<ProcessedResult | null>(null);
  const [isPresetManagerOpen, setIsPresetManagerOpen] = useState<boolean>(false);

  if (!url || !file) return null;

  const updateFilter = (key: keyof ImageFilterOptions, value: number) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setActivePreset('custom');
    setResult(null);
  };

  const applyPreset = (presetId: string, presetFilters: ImageFilterOptions) => {
    setFilters(presetFilters);
    setActivePreset(presetId);
    setResult(null);
  };

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS);
    setActivePreset('normal');
    setResult(null);
    toast.info('Filter adjustments reset.');
  };

  const handleProcess = async () => {
    setIsProcessing(true);
    try {
      const res = await applyImageFilters(url, filters, outputFormat, 0.95, file.name);
      setResult(res);
      toast.success('Filters applied successfully!');
    } catch (err) {
      toast.error('Failed to apply filters to image.');
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (result) {
      downloadBlob(result.blob, result.filename);
      toast.success(`Downloaded ${result.filename}`);
    }
  };

  const handleUseAsCurrent = async () => {
    if (result) {
      const newFile = new File([result.blob], result.filename, { type: result.blob.type });
      const label = activePreset && activePreset !== 'custom' && activePreset !== 'normal'
        ? `Filter: ${allPresets.find(p => p.id === activePreset)?.name || activePreset}`
        : 'Adjusted Colors & Filter';

      if (history.length > 0) {
        await pushHistory(newFile, label);
      } else {
        await setImage(newFile, label);
      }
      setResult(null);
      setFilters(DEFAULT_FILTERS);
      setActivePreset('normal');
      toast.success('Updated active studio image in history stack!');
    }
  };

  // Live CSS filter string for 60fps real-time preview
  const liveFilterString = [
    `brightness(${filters.brightness}%)`,
    `contrast(${filters.contrast}%)`,
    `saturate(${filters.saturate}%)`,
    `blur(${filters.blur}px)`,
    `hue-rotate(${filters.hueRotate}deg)`,
    `sepia(${filters.sepia}%)`,
    `grayscale(${filters.grayscale}%)`,
    `invert(${filters.invert}%)`,
  ].join(' ');

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Color Adjustments & Creative Filters
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Fine-tune brightness, contrast, saturation, color hue, sepia, and artistic styles in real time.
          </p>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset All Adjustments
        </button>
      </div>

      {/* Preset Filter Gallery Header & Actions */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
            <Palette className="w-4 h-4 text-indigo-500" />
            Style Presets Gallery
          </label>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPresetManagerOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-800/80 text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Bookmark className="w-3.5 h-3.5" />
              Manage & Save Presets ({allPresets.length})
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-8 xl:grid-cols-11 gap-2">
          {allPresets.map((p) => {
            const isSelected = activePreset === p.id;
            const pFilterStr = [
              `brightness(${p.filters.brightness}%)`,
              `contrast(${p.filters.contrast}%)`,
              `saturate(${p.filters.saturate}%)`,
              `blur(${p.filters.blur}px)`,
              `hue-rotate(${p.filters.hueRotate}deg)`,
              `sepia(${p.filters.sepia}%)`,
              `grayscale(${p.filters.grayscale}%)`,
              `invert(${p.filters.invert}%)`,
            ].join(' ');

            return (
              <button
                key={p.id}
                type="button"
                onClick={() => applyPreset(p.id, p.filters)}
                className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer relative ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/60 ring-2 ring-indigo-500/40'
                    : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 bg-gray-50 dark:bg-gray-800/40'
                }`}
              >
                <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700 checkerboard flex items-center justify-center">
                  <img
                    src={url}
                    alt={p.name}
                    style={{ filter: pFilterStr }}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-[11px] font-semibold text-gray-800 dark:text-gray-200 truncate w-full">
                  {p.name}
                </span>
                {p.category === 'custom' && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-purple-500 border-2 border-white dark:border-gray-900" title="Custom Preset" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Live Preview & Slider Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4 border-t border-gray-100 dark:border-gray-800">
        {/* Live Preview Stage (7 Cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Live Real-Time Preview
            </span>
            <span className="text-[11px] text-gray-400">GPU Accelerated</span>
          </div>

          <div className="relative rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-950/5 dark:bg-gray-950/40 p-4 min-h-[320px] flex items-center justify-center overflow-hidden checkerboard">
            <img
              src={url}
              alt="Live Filter Target"
              style={{ filter: liveFilterString }}
              className="max-h-[360px] w-auto object-contain rounded-lg transition-all duration-75 shadow-md"
            />
          </div>
        </div>

        {/* Adjustments Sliders (5 Cols) */}
        <div className="lg:col-span-5 space-y-4 bg-gray-50 dark:bg-gray-800/40 p-4 rounded-2xl border border-gray-200/80 dark:border-gray-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-2">
            Fine Adjustment Controls
          </h3>

          {/* Brightness */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-gray-700 dark:text-gray-300">Brightness</span>
              <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">{filters.brightness}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="200"
              value={filters.brightness}
              onChange={(e) => updateFilter('brightness', parseInt(e.target.value))}
              className="w-full accent-indigo-600"
            />
          </div>

          {/* Contrast */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-gray-700 dark:text-gray-300">Contrast</span>
              <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">{filters.contrast}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="200"
              value={filters.contrast}
              onChange={(e) => updateFilter('contrast', parseInt(e.target.value))}
              className="w-full accent-indigo-600"
            />
          </div>

          {/* Saturation */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-gray-700 dark:text-gray-300">Saturation</span>
              <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">{filters.saturate}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="200"
              value={filters.saturate}
              onChange={(e) => updateFilter('saturate', parseInt(e.target.value))}
              className="w-full accent-indigo-600"
            />
          </div>

          {/* Hue Rotation */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-gray-700 dark:text-gray-300">Hue Color Rotation</span>
              <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">{filters.hueRotate}°</span>
            </div>
            <input
              type="range"
              min="0"
              max="360"
              value={filters.hueRotate}
              onChange={(e) => updateFilter('hueRotate', parseInt(e.target.value))}
              className="w-full accent-indigo-600"
            />
          </div>

          {/* Sepia */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-gray-700 dark:text-gray-300">Sepia Warmth</span>
              <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">{filters.sepia}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={filters.sepia}
              onChange={(e) => updateFilter('sepia', parseInt(e.target.value))}
              className="w-full accent-indigo-600"
            />
          </div>

          {/* Grayscale */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-gray-700 dark:text-gray-300">Grayscale (B&W)</span>
              <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">{filters.grayscale}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={filters.grayscale}
              onChange={(e) => updateFilter('grayscale', parseInt(e.target.value))}
              className="w-full accent-indigo-600"
            />
          </div>

          {/* Blur */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-gray-700 dark:text-gray-300">Gaussian Blur</span>
              <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">{filters.blur}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="15"
              value={filters.blur}
              onChange={(e) => updateFilter('blur', parseInt(e.target.value))}
              className="w-full accent-indigo-600"
            />
          </div>

          {/* Output Format Picker */}
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Export Format
            </label>
            <div className="flex items-center gap-2">
              {['png', 'webp', 'jpg'].map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => setOutputFormat(fmt)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold uppercase cursor-pointer ${
                    outputFormat === fmt
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-2 flex items-center gap-3">
        <button
          type="button"
          onClick={handleProcess}
          disabled={isProcessing}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer text-sm"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Rendering Image...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Apply & Render Filtered Image
            </>
          )}
        </button>
      </div>

      {/* Processed Result Output */}
      {result && (
        <div className="mt-6 p-5 rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-semibold text-sm">
              <Check className="w-5 h-5" />
              Filtered Image Ready!
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
              {(result.sizeBytes / 1024 / 1024).toFixed(2)} MB
            </div>
          </div>

          <div className="pt-2 space-y-4">
            {url && (
              <BeforeAfterSlider
                originalUrl={url}
                processedUrl={result.url}
                originalLabel="Original Photo"
                processedLabel="Filtered Photo"
              />
            )}

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-emerald-200/60 dark:border-emerald-900/60">
              <div className="space-y-1">
                <p className="font-bold text-gray-900 dark:text-gray-100 text-sm">{result.filename}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Dimensions: {result.width} × {result.height} px
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-sm shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Download File
                </button>
                <button
                  type="button"
                  onClick={handleUseAsCurrent}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium rounded-lg text-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  Use as Active Image <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <SendToMenu result={result} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Saved Presets Manager Modal */}
      <SavedPresetsManager
        isOpen={isPresetManagerOpen}
        onClose={() => setIsPresetManagerOpen(false)}
        currentFilters={filters}
        onApplyPreset={(preset) => applyPreset(preset.id, preset.filters)}
      />
    </div>
  );
};
