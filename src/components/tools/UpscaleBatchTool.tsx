import React, { useState, useEffect, useRef } from 'react';
import JSZip from 'jszip';
import { Dropzone } from '../shared/Dropzone';
import {
  upscaleImage,
  downloadBlob,
  createManagedObjectURL,
  revokeManagedObjectURL,
  ProcessedResult,
} from '../../lib/imageUtils';
import { BeforeAfterSlider } from '../shared/BeforeAfterSlider';
import {
  Zap,
  Sliders,
  Sparkles,
  RefreshCw,
  Check,
  Download,
  Trash2,
  FileArchive,
  Image as ImageIcon,
  Split,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

const MAX_BATCH_IMAGES = 10;

interface UpscaleBatchItem {
  id: string;
  file: File;
  previewUrl: string;
  originalWidth: number;
  originalHeight: number;
  status: 'pending' | 'processing' | 'done' | 'error';
  result?: ProcessedResult;
  errorMessage?: string;
  showComparison?: boolean;
}

function getImageDimensions(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      resolve({
        width: img.naturalWidth || img.width,
        height: img.naturalHeight || img.height,
      });
    };
    img.onerror = () => {
      resolve({ width: 0, height: 0 });
    };
    img.src = url;
  });
}

export const UpscaleBatchTool: React.FC = () => {
  const [items, setItems] = useState<UpscaleBatchItem[]>([]);
  const [scaleFactor, setScaleFactor] = useState<number>(2); // 2x or 4x
  const [sharpenAmount, setSharpenAmount] = useState<number>(0.25);
  const [format, setFormat] = useState<string>('png');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 });

  const itemsRef = useRef<UpscaleBatchItem[]>(items);
  itemsRef.current = items;

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      itemsRef.current.forEach((item) => {
        if (item.previewUrl) revokeManagedObjectURL(item.previewUrl);
        if (item.result?.url) revokeManagedObjectURL(item.result.url);
      });
    };
  }, []);

  const handleDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const currentCount = items.length;
    const availableSlots = MAX_BATCH_IMAGES - currentCount;

    if (availableSlots <= 0) {
      toast.error(
        `Batch limit reached (${MAX_BATCH_IMAGES} images max). Please remove images or clear queue to add new ones.`
      );
      return;
    }

    let filesToAdd = acceptedFiles;
    if (acceptedFiles.length > availableSlots) {
      toast.warning(
        `Batch limit is ${MAX_BATCH_IMAGES} images. Only adding the first ${availableSlots} image(s) from your selection.`
      );
      filesToAdd = acceptedFiles.slice(0, availableSlots);
    }

    const newItems: UpscaleBatchItem[] = [];
    for (const file of filesToAdd) {
      try {
        const previewUrl = createManagedObjectURL(file);
        const dimensions = await getImageDimensions(previewUrl);
        newItems.push({
          id: Math.random().toString(36).substring(2, 9),
          file,
          previewUrl,
          originalWidth: dimensions.width,
          originalHeight: dimensions.height,
          status: 'pending',
          showComparison: false,
        });
      } catch (e) {
        console.error('Failed to load image preview:', e);
      }
    }

    if (newItems.length > 0) {
      setItems((prev) => [...prev, ...newItems]);
      toast.success(
        `Added ${newItems.length} image(s) to upscale queue (${currentCount + newItems.length}/${MAX_BATCH_IMAGES}).`
      );
    }
  };

  const removeItem = (id: string) => {
    setItems((prev) => {
      const target = prev.find((i) => i.id === id);
      if (target?.previewUrl) revokeManagedObjectURL(target.previewUrl);
      if (target?.result?.url) revokeManagedObjectURL(target.result.url);
      return prev.filter((i) => i.id !== id);
    });
  };

  const clearAll = () => {
    items.forEach((item) => {
      if (item.previewUrl) revokeManagedObjectURL(item.previewUrl);
      if (item.result?.url) revokeManagedObjectURL(item.result.url);
    });
    setItems([]);
    toast.info('Batch queue cleared.');
  };

  const toggleComparison = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, showComparison: !item.showComparison } : item
      )
    );
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
        const res = await upscaleImage(
          item.previewUrl,
          scaleFactor,
          sharpenAmount,
          format,
          0.95,
          item.file.name
        );
        item.status = 'done';
        item.result = res;
      } catch (err) {
        item.status = 'error';
        item.errorMessage = err instanceof Error ? err.message : 'Upscale error';
      }

      setItems([...updated]);
    }

    setIsProcessing(false);
    const successfulCount = updated.filter((i) => i.status === 'done').length;
    toast.success(
      `Batch upscaling complete! (${successfulCount}/${updated.length} successful)`
    );
  };

  const downloadAllZip = async () => {
    const doneItems = items.filter((i) => i.status === 'done' && i.result);
    if (doneItems.length === 0) return;

    toast.info('Generating ZIP package...');
    try {
      const zip = new JSZip();

      doneItems.forEach((item) => {
        if (item.result) {
          zip.file(item.result.filename, item.result.blob);
        }
      });

      const content = await zip.generateAsync({ type: 'blob' });
      downloadBlob(content, `upscaled_images_${scaleFactor}x_${format}.zip`);
      toast.success('ZIP package downloaded successfully!');
    } catch (err) {
      console.error('ZIP generation failed:', err);
      toast.error('Failed to generate ZIP archive.');
    }
  };

  const doneCount = items.filter((i) => i.status === 'done').length;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            Batch Image Upscaler (Up to {MAX_BATCH_IMAGES} Images)
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Enlarge up to 10 photos simultaneously using bicubic sub-pixel interpolation and detail sharpening in sequence.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
            {items.length} / {MAX_BATCH_IMAGES} in Queue
          </span>
        </div>
      </div>

      {/* Dropzone for Multi-Image Upload */}
      {items.length < MAX_BATCH_IMAGES ? (
        <Dropzone
          onDrop={handleDrop}
          multiple={true}
          className="py-8"
        />
      ) : (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 flex items-center gap-3 text-amber-800 dark:text-amber-200 text-sm">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <span>
            Queue limit reached ({MAX_BATCH_IMAGES} images max). Remove items or clear the queue to add more images.
          </span>
        </div>
      )}

      {/* Batch Configuration Controls */}
      <div className="p-5 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-800 space-y-5">
        <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          Batch Upscale Settings (Applied to All Queued Images)
        </h3>

        {/* Scale Factor Selection */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block">
            Upscale Resolution Factor
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setScaleFactor(2)}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                scaleFactor === 2
                  ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 ring-1 ring-blue-600'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 bg-white dark:bg-gray-900'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-900 dark:text-gray-100">2× Resolution</span>
                <span className="text-[10px] bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-semibold px-2 py-0.5 rounded">
                  Fast & Crisp (+200%)
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Doubles both width and height with balanced sharpening.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setScaleFactor(4)}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                scaleFactor === 4
                  ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 ring-1 ring-blue-600'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 bg-white dark:bg-gray-900'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-900 dark:text-gray-100">4× Super Resolution</span>
                <span className="text-[10px] bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 font-semibold px-2 py-0.5 rounded">
                  Maximum Detail (+400%)
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Quadruples pixel dimensions for ultra high-res printing & zoom.
              </p>
            </button>
          </div>
        </div>

        {/* Sharpening & Format */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold text-gray-700 dark:text-gray-300">
              <span className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-blue-600" /> Edge Detail & Sharpening
              </span>
              <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">
                {Math.round(sharpenAmount * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="0.6"
              step="0.05"
              value={sharpenAmount}
              onChange={(e) => setSharpenAmount(parseFloat(e.target.value))}
              className="w-full accent-blue-600"
            />
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              Enhances edge contours and texture micro-contrast during magnification.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block">
              Output File Format
            </label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-xs font-medium text-gray-900 dark:text-gray-100"
            >
              <option value="png">PNG (Lossless pixel perfection)</option>
              <option value="webp">WebP (Optimized file size)</option>
              <option value="jpg">JPG (Standard compatibility)</option>
            </select>
          </div>
        </div>

        {/* Action Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
            {items.length === 0
              ? 'No images in queue yet. Add images above.'
              : `${items.length} image(s) queued for ${scaleFactor}x upscaling`}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {items.length > 0 && (
              <button
                type="button"
                onClick={clearAll}
                disabled={isProcessing}
                className="px-3 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50 font-medium"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear Queue
              </button>
            )}

            <button
              type="button"
              onClick={processBatch}
              disabled={isProcessing || items.length === 0}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm shadow-sm transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Upscaling {progress.current} of {progress.total}...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  Upscale All ({items.length})
                </>
              )}
            </button>

            {doneCount > 0 && (
              <button
                type="button"
                onClick={downloadAllZip}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-sm shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <FileArchive className="w-4 h-4" /> Download All as ZIP ({doneCount})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Progress Notification Bar when running */}
      {isProcessing && (
        <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-blue-900 dark:text-blue-200">
            <span className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
              Upscaling {progress.current} of {progress.total}...
            </span>
            <span className="font-mono">{Math.round((progress.current / progress.total) * 100)}%</span>
          </div>
          <div className="w-full bg-blue-200 dark:bg-blue-900/60 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Batch Files Queue List */}
      {items.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              Batch Queue ({items.length})
            </h3>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {doneCount} of {items.length} completed
            </span>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-800 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900">
            {items.map((item, idx) => (
              <div
                key={item.id}
                className="p-4 space-y-3 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  {/* Left: Thumbnail & Metadata */}
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-mono font-semibold text-gray-400 w-5 text-center flex-shrink-0">
                      #{idx + 1}
                    </span>
                    <img
                      src={item.previewUrl}
                      alt={item.file.name}
                      className="w-14 h-14 rounded-lg object-contain checkerboard border border-gray-200 dark:border-gray-700 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate max-w-xs sm:max-w-md">
                        {item.file.name}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-mono">
                        <span>
                          {item.originalWidth > 0 ? `${item.originalWidth} × ${item.originalHeight} px` : 'Loading...'}
                        </span>
                        <span>•</span>
                        <span>{(item.file.size / 1024).toFixed(1)} KB</span>
                        {item.result && (
                          <>
                            <span>→</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                              {item.result.width} × {item.result.height} px ({(item.result.sizeBytes / 1024).toFixed(1)} KB)
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Status & Actions */}
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                    {item.status === 'pending' && (
                      <span className="text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-full">
                        Ready
                      </span>
                    )}

                    {item.status === 'processing' && (
                      <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2.5 py-1 rounded-full flex items-center gap-1.5 animate-pulse">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Upscaling...
                      </span>
                    )}

                    {item.status === 'error' && (
                      <span className="text-xs font-medium text-red-600 bg-red-50 dark:bg-red-950 px-2.5 py-1 rounded-full flex items-center gap-1" title={item.errorMessage}>
                        <AlertCircle className="w-3.5 h-3.5" /> Error
                      </span>
                    )}

                    {item.status === 'done' && item.result && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2.5 py-1 rounded-full flex items-center gap-1 border border-emerald-200 dark:border-emerald-900">
                          <Check className="w-3 h-3" /> {scaleFactor}x Done
                        </span>

                        <button
                          type="button"
                          onClick={() => toggleComparison(item.id)}
                          className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors flex items-center gap-1 cursor-pointer border ${
                            item.showComparison
                              ? 'bg-blue-50 dark:bg-blue-950 text-blue-600 border-blue-300 dark:border-blue-700'
                              : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100'
                          }`}
                          title="Toggle before/after slider comparison"
                        >
                          <Split className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Compare</span>
                          {item.showComparison ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => item.result && downloadBlob(item.result.blob, item.result.filename)}
                          className="px-2.5 py-1 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                          title="Download this upscaled image"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Download</span>
                        </button>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      disabled={isProcessing}
                      className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer disabled:opacity-40"
                      title="Remove from queue"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Collapsible Per-Item Before/After Slider Comparison */}
                {item.status === 'done' && item.result && item.showComparison && (
                  <div className="pt-3 border-t border-gray-100 dark:border-gray-800 space-y-2">
                    <div className="max-w-xl mx-auto">
                      <BeforeAfterSlider
                        originalUrl={item.previewUrl}
                        processedUrl={item.result.url}
                        originalLabel={`Original (${item.originalWidth}×${item.originalHeight})`}
                        processedLabel={`Upscaled ${scaleFactor}x (${item.result.width}×${item.result.height})`}
                      />
                      <p className="text-[11px] text-center text-gray-500 dark:text-gray-400 mt-1">
                        Drag slider above to inspect interpolated pixels and texture sharpening.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
