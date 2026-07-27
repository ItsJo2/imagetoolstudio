import React, { useState } from 'react';
import JSZip from 'jszip';
import { Dropzone } from '../shared/Dropzone';
import { convertImageFormat, downloadBlob, ProcessedResult } from '../../lib/imageUtils';
import { Layers, Download, RefreshCw, Check, Trash2, FileArchive, Sparkles, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface BatchItem {
  id: string;
  file: File;
  previewUrl: string;
  status: 'pending' | 'processing' | 'done' | 'error';
  result?: ProcessedResult;
  errorMessage?: string;
}

const FORMATS = [
  { id: 'webp', name: 'WebP', badge: 'Recommended' },
  { id: 'png', name: 'PNG', badge: 'Lossless' },
  { id: 'jpg', name: 'JPG', badge: 'Standard' },
  { id: 'avif', name: 'AVIF', badge: 'Compact' },
];

export const BatchTool: React.FC = () => {
  const [items, setItems] = useState<BatchItem[]>([]);
  const [targetFormat, setTargetFormat] = useState<string>('webp');
  const [quality, setQuality] = useState<number>(0.90);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 });

  const handleDrop = (acceptedFiles: File[]) => {
    const newItems: BatchItem[] = acceptedFiles.map((file) => ({
      id: Math.random().toString(36).substring(2, 9),
      file,
      previewUrl: URL.createObjectURL(file),
      status: 'pending',
    }));

    setItems((prev) => [...prev, ...newItems]);
    toast.success(`Added ${acceptedFiles.length} file(s) to batch queue.`);
  };

  const removeItem = (id: string) => {
    setItems((prev) => {
      const target = prev.find((i) => i.id === id);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      if (target?.result?.url) URL.revokeObjectURL(target.result.url);
      return prev.filter((i) => i.id !== id);
    });
  };

  const clearAll = () => {
    items.forEach((item) => {
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      if (item.result?.url) URL.revokeObjectURL(item.result.url);
    });
    setItems([]);
  };

  const processBatch = async () => {
    if (items.length === 0) return;

    setIsProcessing(true);
    setProgress({ current: 0, total: items.length });

    const updated = [...items];

    for (let i = 0; i < updated.length; i++) {
      const item = updated[i];
      item.status = 'processing';
      setItems([...updated]);
      setProgress({ current: i + 1, total: updated.length });

      try {
        const res = await convertImageFormat(
          item.previewUrl,
          targetFormat,
          quality,
          '#ffffff',
          item.file.name
        );
        item.status = 'done';
        item.result = res;
      } catch (err) {
        item.status = 'error';
        item.errorMessage = err instanceof Error ? err.message : 'Conversion error';
      }

      setItems([...updated]);
    }

    setIsProcessing(false);
    toast.success(`Batch processing complete for ${items.length} images!`);
  };

  const downloadAllZip = async () => {
    const doneItems = items.filter((i) => i.status === 'done' && i.result);
    if (doneItems.length === 0) return;

    toast.info('Generating ZIP package...');
    const zip = new JSZip();

    doneItems.forEach((item) => {
      if (item.result) {
        zip.file(item.result.filename, item.result.blob);
      }
    });

    const content = await zip.generateAsync({ type: 'blob' });
    downloadBlob(content, `converted_images_${targetFormat}.zip`);
    toast.success('ZIP package downloaded successfully!');
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          Batch Image Converter
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Convert multiple images simultaneously in your browser and download all as a ZIP archive.
        </p>
      </div>

      {/* Dropzone for Batch Upload */}
      <Dropzone onDrop={handleDrop} multiple={true} className="py-8" />

      {/* Batch Options Bar */}
      {items.length > 0 && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-800 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                Target Format:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {FORMATS.map((fmt) => (
                  <button
                    key={fmt.id}
                    type="button"
                    onClick={() => setTargetFormat(fmt.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                      targetFormat === fmt.id
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {fmt.name}
                  </button>
                ))}
              </div>
            </div>

            {(targetFormat === 'jpg' || targetFormat === 'webp' || targetFormat === 'avif') && (
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Quality: <span className="text-blue-600 font-mono">{Math.round(quality * 100)}%</span>
                </span>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={quality}
                  onChange={(e) => setQuality(parseFloat(e.target.value))}
                  className="w-28 accent-blue-600"
                />
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
              {items.length} file(s) in queue
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={clearAll}
                disabled={isProcessing}
                className="px-3 py-1.5 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear All
              </button>

              <button
                type="button"
                onClick={processBatch}
                disabled={isProcessing}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm shadow-sm transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Converting ({progress.current}/{progress.total})...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Convert All ({items.length})
                  </>
                )}
              </button>

              {items.some((i) => i.status === 'done') && (
                <button
                  type="button"
                  onClick={downloadAllZip}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-sm shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <FileArchive className="w-4 h-4" /> Download ZIP
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Batch Files Queue List */}
      {items.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            Batch Queue ({items.length})
          </h3>
          <div className="divide-y divide-gray-100 dark:divide-gray-800 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900">
            {items.map((item) => (
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
                    <span className="text-xs font-medium text-blue-600 bg-blue-50 dark:bg-blue-950 px-2.5 py-1 rounded-full flex items-center gap-1">
                      <RefreshCw className="w-3 h-3 animate-spin" /> Processing
                    </span>
                  )}
                  {item.status === 'done' && item.result && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3" /> {(item.result.sizeBytes / 1024).toFixed(1)} KB
                      </span>
                      <button
                        type="button"
                        onClick={() => item.result && downloadBlob(item.result.blob, item.result.filename)}
                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-lg transition-colors cursor-pointer"
                        title="Download single file"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  {item.status === 'error' && (
                    <span className="text-xs font-medium text-red-600 bg-red-50 dark:bg-red-950 px-2.5 py-1 rounded-full">
                      Error
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                    title="Remove item"
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
  );
};
