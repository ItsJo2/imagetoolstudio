import React, { useState } from 'react';
import { BUILTIN_SOCIAL_PRESETS, executeSocialMediaPreset } from '../../lib/recipeUtils';
import { SocialMediaPreset } from '../../types/recipe';
import { Dropzone } from '../shared/Dropzone';
import { downloadBlob, ProcessedResult } from '../../lib/imageUtils';
import JSZip from 'jszip';
import {
  Share2,
  CheckSquare,
  Square,
  Sparkles,
  Download,
  FileArchive,
  RefreshCw,
  Layers,
  Trash2,
  Check,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';

interface SocialSourceImage {
  id: string;
  file: File;
  previewUrl: string;
}

interface SocialExportResult {
  id: string;
  sourceName: string;
  preset: SocialMediaPreset;
  result: ProcessedResult;
}

export const SocialMediaExporter: React.FC = () => {
  const [sources, setSources] = useState<SocialSourceImage[]>([]);
  const [selectedPresetIds, setSelectedPresetIds] = useState<Set<string>>(
    new Set(BUILTIN_SOCIAL_PRESETS.map((p) => p.id))
  );
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [progress, setProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 });
  const [exportResults, setExportResults] = useState<SocialExportResult[]>([]);

  const handleDrop = (acceptedFiles: File[]) => {
    const newItems: SocialSourceImage[] = acceptedFiles.map((f) => ({
      id: Math.random().toString(36).substring(2, 9),
      file: f,
      previewUrl: URL.createObjectURL(f),
    }));

    setSources((prev) => [...prev, ...newItems]);
    toast.success(`Added ${acceptedFiles.length} image(s) for social export.`);
  };

  const removeSource = (id: string) => {
    setSources((prev) => {
      const target = prev.find((s) => s.id === id);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((s) => s.id !== id);
    });
  };

  const clearAllSources = () => {
    sources.forEach((s) => {
      if (s.previewUrl) URL.revokeObjectURL(s.previewUrl);
    });
    setSources([]);
    setExportResults([]);
  };

  const togglePreset = (id: string) => {
    setSelectedPresetIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllPresets = () => {
    setSelectedPresetIds(new Set(BUILTIN_SOCIAL_PRESETS.map((p) => p.id)));
  };

  const deselectAllPresets = () => {
    setSelectedPresetIds(new Set());
  };

  const runSocialBulkExport = async () => {
    if (sources.length === 0) {
      toast.error('Please upload at least one image to export.');
      return;
    }

    const activePresets = BUILTIN_SOCIAL_PRESETS.filter((p) => selectedPresetIds.has(p.id));
    if (activePresets.length === 0) {
      toast.error('Please select at least one social media preset target.');
      return;
    }

    setIsExporting(true);
    const totalOperations = sources.length * activePresets.length;
    setProgress({ current: 0, total: totalOperations });

    const newResults: SocialExportResult[] = [];
    let count = 0;

    for (const source of sources) {
      for (const preset of activePresets) {
        count++;
        setProgress({ current: count, total: totalOperations });

        try {
          const res = await executeSocialMediaPreset(source.previewUrl, preset, source.file.name);
          newResults.push({
            id: Math.random().toString(36).substring(2, 9),
            sourceName: source.file.name,
            preset,
            result: res,
          });
        } catch (err) {
          console.error(`Failed export for ${preset.title}:`, err);
        }
      }
    }

    setExportResults(newResults);
    setIsExporting(false);
    toast.success(`Generated ${newResults.length} social media assets across ${sources.length} photo(s)!`);
  };

  const downloadAllSocialZip = async () => {
    if (exportResults.length === 0) return;

    toast.info('Packing all social media assets into ZIP...');
    const zip = new JSZip();

    exportResults.forEach((item) => {
      zip.file(item.result.filename, item.result.blob);
    });

    const content = await zip.generateAsync({ type: 'blob' });
    downloadBlob(content, `social_media_assets_bundle.zip`);
    toast.success('Downloaded ZIP containing all social media assets!');
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Share2 className="w-5 h-5 text-pink-600 dark:text-pink-400" />
            Social Media Export Presets
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            1-click bulk export for YouTube, Instagram, Twitter / X, Facebook, LinkedIn, Pinterest, and TikTok.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={selectAllPresets}
            className="px-3 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-colors cursor-pointer"
          >
            Select All ({BUILTIN_SOCIAL_PRESETS.length})
          </button>
          <button
            type="button"
            onClick={deselectAllPresets}
            className="px-3 py-1.5 text-xs font-semibold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
          >
            Clear Selection
          </button>
        </div>
      </div>

      {/* Social Media Presets Selector Grid */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
          Target Social Media Formats ({selectedPresetIds.size} Selected):
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {BUILTIN_SOCIAL_PRESETS.map((preset) => {
            const isChecked = selectedPresetIds.has(preset.id);
            return (
              <div
                key={preset.id}
                onClick={() => togglePreset(preset.id)}
                className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between space-y-2 select-none ${
                  isChecked
                    ? 'border-pink-500 bg-pink-50/30 dark:bg-pink-950/20 shadow-xs'
                    : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 opacity-60 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${preset.badgeColor}`}>
                    {preset.platform}
                  </span>
                  {isChecked ? (
                    <CheckSquare className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                  ) : (
                    <Square className="w-4 h-4 text-gray-400" />
                  )}
                </div>

                <div>
                  <h4 className="font-bold text-xs text-gray-900 dark:text-gray-100">{preset.title}</h4>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 font-mono mt-0.5">
                    {preset.width} × {preset.height} px ({preset.aspectRatioLabel})
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upload Dropzone */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
            Source Image Uploads ({sources.length})
          </h3>
          {sources.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={clearAllSources}
                disabled={isExporting}
                className="px-3 py-1.5 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                Clear Images
              </button>
              <button
                type="button"
                onClick={runSocialBulkExport}
                disabled={isExporting || selectedPresetIds.size === 0}
                className="px-5 py-2 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-lg text-xs shadow-sm transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isExporting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Exporting Assets ({progress.current}/{progress.total})...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> 1-Click Social Bulk Export ({sources.length * selectedPresetIds.size} files)
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        <Dropzone onDrop={handleDrop} multiple className="py-8" />
      </div>

      {/* Source Files Bar */}
      {sources.length > 0 && (
        <div className="flex flex-wrap gap-3 p-3 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-200 dark:border-gray-800">
          {sources.map((src) => (
            <div
              key={src.id}
              className="flex items-center gap-2 bg-white dark:bg-gray-900 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-800 dark:text-gray-200"
            >
              <img src={src.previewUrl} alt={src.file.name} className="w-6 h-6 rounded object-cover" />
              <span className="truncate max-w-[140px]">{src.file.name}</span>
              <button
                type="button"
                onClick={() => removeSource(src.id)}
                className="text-gray-400 hover:text-red-500 ml-1 cursor-pointer"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Export Results Grid */}
      {exportResults.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Generated Social Media Assets ({exportResults.length})
            </h3>
            <button
              type="button"
              onClick={downloadAllSocialZip}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <FileArchive className="w-4 h-4" /> Download Social Assets ZIP
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {exportResults.map((item) => (
              <div
                key={item.id}
                className="bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-800 p-3.5 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${item.preset.badgeColor}`}>
                      {item.preset.platform}
                    </span>
                    <span className="text-[10px] font-mono text-gray-500">
                      {(item.result.sizeBytes / 1024).toFixed(1)} KB
                    </span>
                  </div>

                  <div className="relative aspect-video rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex items-center justify-center checkerboard">
                    <img
                      src={item.result.url}
                      alt={item.result.filename}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>

                  <div>
                    <h5 className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate">
                      {item.preset.title}
                    </h5>
                    <p className="text-[11px] text-gray-500 font-mono">
                      {item.result.width} × {item.result.height} px ({item.preset.format.toUpperCase()})
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => downloadBlob(item.result.blob, item.result.filename)}
                  className="w-full py-1.5 bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200 text-xs font-bold rounded-lg border border-gray-300 dark:border-gray-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Download {item.preset.title}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
