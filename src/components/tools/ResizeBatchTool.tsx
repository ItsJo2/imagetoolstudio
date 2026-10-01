import React, { useState, useEffect, useRef } from 'react';
import JSZip from 'jszip';
import { Dropzone } from '../shared/Dropzone';
import {
  resizeImage,
  downloadBlob,
  createManagedObjectURL,
  revokeManagedObjectURL,
  ProcessedResult,
  ResizeFitMode,
} from '../../lib/imageUtils';
import {
  Maximize2,
  Sliders,
  Sparkles,
  RefreshCw,
  Check,
  Download,
  Trash2,
  FileArchive,
  Percent,
  AlertCircle,
  Crop,
  Square,
  Scaling,
} from 'lucide-react';
import { toast } from 'sonner';

const MAX_BATCH_IMAGES = 10;
const PERCENT_PRESETS = [25, 50, 75, 100, 150, 200];

const EXACT_DIMENSION_PRESETS = [
  { label: '1920 × 1080 (FHD 16:9)', w: 1920, h: 1080 },
  { label: '1280 × 720 (HD 16:9)', w: 1280, h: 720 },
  { label: '1080 × 1080 (Square 1:1)', w: 1080, h: 1080 },
  { label: '1080 × 1350 (Portrait 4:5)', w: 1080, h: 1350 },
  { label: '800 × 600 (Classic 4:3)', w: 800, h: 600 },
];

interface ResizeBatchItem {
  id: string;
  file: File;
  previewUrl: string;
  originalWidth: number;
  originalHeight: number;
  status: 'pending' | 'processing' | 'done' | 'error';
  result?: ProcessedResult;
  errorMessage?: string;
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

export const ResizeBatchTool: React.FC = () => {
  const [items, setItems] = useState<ResizeBatchItem[]>([]);
  // Mode selection: 'percentage' or 'exact'
  const [mode, setMode] = useState<'percentage' | 'exact'>('percentage');

  // Percentage scaling state
  const [percentScale, setPercentScale] = useState<number>(50);

  // Exact dimensions scaling state
  const [exactWidth, setExactWidth] = useState<number>(1200);
  const [exactHeight, setExactHeight] = useState<number>(800);
  const [fitMode, setFitMode] = useState<ResizeFitMode>('cover');
  const [padColor, setPadColor] = useState<string>('transparent');

  // Common options
  const [format, setFormat] = useState<string>('png');
  const [quality, setQuality] = useState<number>(0.92);
  const [smoothing, setSmoothing] = useState<boolean>(true);
  const [smoothingQuality, setSmoothingQuality] = useState<ImageSmoothingQuality>('high');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 });

  const itemsRef = useRef<ResizeBatchItem[]>(items);
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

    const newItems: ResizeBatchItem[] = [];
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
        });
      } catch (e) {
        console.error('Failed to load image preview:', e);
      }
    }

    if (newItems.length > 0) {
      setItems((prev) => [...prev, ...newItems]);
      toast.success(
        `Added ${newItems.length} image(s) to resize queue (${currentCount + newItems.length}/${MAX_BATCH_IMAGES}).`
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

      let targetW: number;
      let targetH: number;
      let effectiveFitMode: ResizeFitMode = 'stretch';
      let effectiveBgColor = 'transparent';

      if (mode === 'percentage') {
        // Percentage scale: proportional per image
        targetW = Math.max(1, Math.round((item.originalWidth * percentScale) / 100));
        targetH = Math.max(1, Math.round((item.originalHeight * percentScale) / 100));
        effectiveFitMode = 'stretch';
      } else {
        // Exact Dimensions: uniform exact target dimensions with fitMode calculation
        targetW = Math.max(1, exactWidth);
        targetH = Math.max(1, exactHeight);
        effectiveFitMode = fitMode;
        effectiveBgColor = padColor;
      }

      try {
        const res = await resizeImage(
          item.previewUrl,
          targetW,
          targetH,
          format,
          quality,
          item.file.name,
          smoothing,
          smoothingQuality,
          effectiveFitMode,
          effectiveBgColor
        );
        item.status = 'done';
        item.result = res;
      } catch (err) {
        item.status = 'error';
        item.errorMessage = err instanceof Error ? err.message : 'Resize error';
      }

      setItems([...updated]);
    }

    setIsProcessing(false);
    const successfulCount = updated.filter((i) => i.status === 'done').length;
    toast.success(
      `Batch resizing complete! (${successfulCount}/${updated.length} successful)`
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
      const zipName =
        mode === 'percentage'
          ? `resized_images_${percentScale}pct_${format}.zip`
          : `resized_images_${exactWidth}x${exactHeight}_${fitMode}_${format}.zip`;
      downloadBlob(content, zipName);
      toast.success('ZIP package downloaded successfully!');
    } catch (err) {
      console.error('ZIP generation failed:', err);
      toast.error('Failed to generate ZIP archive.');
    }
  };

  const doneCount = items.filter((i) => i.status === 'done').length;

  const getFitModeLabel = (modeKey: ResizeFitMode) => {
    switch (modeKey) {
      case 'stretch':
        return 'Stretch to Exact Size';
      case 'cover':
        return 'Crop to Fill';
      case 'contain':
        return 'Fit Inside (add padding)';
    }
  };

  const getQueueTargetLabel = (item: ResizeBatchItem) => {
    if (item.result) {
      return `${item.result.width} × ${item.result.height} px (${(item.result.sizeBytes / 1024).toFixed(1)} KB)`;
    }
    if (mode === 'percentage') {
      const projectedW = Math.max(1, Math.round((item.originalWidth * percentScale) / 100));
      const projectedH = Math.max(1, Math.round((item.originalHeight * percentScale) / 100));
      return `~${projectedW} × ${projectedH} px (${percentScale}%)`;
    } else {
      const fitShort = fitMode === 'stretch' ? 'Stretched' : fitMode === 'cover' ? 'Crop to Fill' : 'Padded';
      return `${exactWidth} × ${exactHeight} px (${fitShort})`;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Maximize2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Batch Image Resizer (Up to {MAX_BATCH_IMAGES} Images)
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Resize up to 10 images simultaneously by percentage scale or exact dimensions with intelligent fit modes (Stretch, Crop to Fill, or Fit Inside).
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900">
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 dark:border-gray-700 pb-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Batch Resize Settings
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Choose between proportional percentage scaling or fixed exact pixel dimensions.
            </p>
          </div>

          {/* Mode Switcher Toggle: Percentage vs Exact Dimensions */}
          <div className="flex p-1 bg-gray-200/80 dark:bg-gray-900 rounded-xl max-w-xs self-start sm:self-auto border border-gray-200 dark:border-gray-800">
            <button
              type="button"
              onClick={() => setMode('percentage')}
              className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                mode === 'percentage'
                  ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              <Percent className="w-3.5 h-3.5" />
              Percentage Mode
            </button>
            <button
              type="button"
              onClick={() => setMode('exact')}
              className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                mode === 'exact'
                  ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              <Maximize2 className="w-3.5 h-3.5" />
              Exact Dimensions
            </button>
          </div>
        </div>

        {/* MODE 1: Percentage Presets (Proportional) */}
        {mode === 'percentage' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <Percent className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                Scale Percentage (Preserves Each Image's Natural Aspect Ratio)
              </label>
              <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-900">
                {percentScale}% of original size
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {PERCENT_PRESETS.map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setPercentScale(pct)}
                  className={`py-2.5 px-3 rounded-xl border text-center transition-all cursor-pointer font-semibold text-sm ${
                    percentScale === pct
                      ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-600 shadow-xs'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              Each queued photo is scaled from its own unique dimensions by {percentScale}%, keeping all proportions natural.
            </p>
          </div>
        )}

        {/* MODE 2: Exact Dimensions + Fit Mode */}
        {mode === 'exact' && (
          <div className="space-y-4">
            {/* Target Width & Height Number Inputs */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <Maximize2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  Target Canvas Size (All Queued Images Output to This Exact Resolution)
                </label>
                <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-900">
                  {exactWidth} × {exactHeight} px
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">
                    Target Width (Pixels)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="16384"
                    value={exactWidth}
                    onChange={(e) => setExactWidth(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-mono font-semibold text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">
                    Target Height (Pixels)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="16384"
                    value={exactHeight}
                    onChange={(e) => setExactHeight(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-mono font-semibold text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Quick Size Presets for Exact Dimensions */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <span className="text-[11px] text-gray-500 dark:text-gray-400 mr-1">Quick Presets:</span>
                {EXACT_DIMENSION_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      setExactWidth(preset.w);
                      setExactHeight(preset.h);
                    }}
                    className={`px-2 py-1 rounded-md text-[11px] font-medium border transition-colors cursor-pointer ${
                      exactWidth === preset.w && exactHeight === preset.h
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-400 text-indigo-700 dark:text-indigo-300 font-semibold'
                        : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Fit Mode Selector: Stretch, Crop to Fill, Fit Inside */}
            <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-700">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block">
                Aspect Ratio & Fit Mode (Handles Differing Image Aspect Ratios)
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* 1. Stretch to Exact Size */}
                <button
                  type="button"
                  onClick={() => setFitMode('stretch')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                    fitMode === 'stretch'
                      ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-200 ring-1 ring-indigo-600 shadow-xs'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Scaling className={`w-4 h-4 ${fitMode === 'stretch' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500'}`} />
                    <span className="text-xs font-bold">Stretch to Exact Size</span>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-tight">
                    Forces image to exact width & height. May distort photos whose aspect ratios do not match.
                  </p>
                </button>

                {/* 2. Crop to Fill */}
                <button
                  type="button"
                  onClick={() => setFitMode('cover')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                    fitMode === 'cover'
                      ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-200 ring-1 ring-indigo-600 shadow-xs'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Crop className={`w-4 h-4 ${fitMode === 'cover' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500'}`} />
                    <span className="text-xs font-bold">Crop to Fill</span>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-tight">
                    Scales and center-crops to fill the canvas completely without distortion. Edge areas are cropped.
                  </p>
                </button>

                {/* 3. Fit Inside (add padding) */}
                <button
                  type="button"
                  onClick={() => setFitMode('contain')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                    fitMode === 'contain'
                      ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-200 ring-1 ring-indigo-600 shadow-xs'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Square className={`w-4 h-4 ${fitMode === 'contain' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500'}`} />
                    <span className="text-xs font-bold">Fit Inside (add padding)</span>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-tight">
                    Entire image stays fully visible without cropping or distortion, surrounded by blank padding space.
                  </p>
                </button>
              </div>

              {/* Padding background color options when 'contain' is active */}
              {fitMode === 'contain' && (
                <div className="p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-wrap items-center gap-3 mt-2">
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Padding Background:
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPadColor('transparent')}
                      className={`px-2.5 py-1 rounded text-xs font-medium border cursor-pointer ${
                        padColor === 'transparent'
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 font-bold'
                          : 'border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      Transparent (PNG/WebP)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPadColor('#ffffff')}
                      className={`px-2.5 py-1 rounded text-xs font-medium border cursor-pointer ${
                        padColor === '#ffffff'
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 font-bold'
                          : 'border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      White
                    </button>
                    <button
                      type="button"
                      onClick={() => setPadColor('#000000')}
                      className={`px-2.5 py-1 rounded text-xs font-medium border cursor-pointer ${
                        padColor === '#000000'
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 font-bold'
                          : 'border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      Black
                    </button>
                    <div className="flex items-center gap-1 ml-1">
                      <span className="text-[11px] text-gray-500">Custom:</span>
                      <input
                        type="color"
                        value={padColor === 'transparent' ? '#ffffff' : padColor}
                        onChange={(e) => setPadColor(e.target.value)}
                        className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600 cursor-pointer p-0"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Output Format, Resampling, Quality Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block">
              Output Format
            </label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-xs font-medium text-gray-900 dark:text-gray-100"
            >
              <option value="png">PNG (Lossless)</option>
              <option value="jpg">JPG (Smaller size)</option>
              <option value="webp">WebP (Modern web format)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block">
              Resampling Algorithm
            </label>
            <select
              value={smoothing ? smoothingQuality : 'pixelated'}
              onChange={(e) => {
                const val = e.target.value;
                if (val === 'pixelated') {
                  setSmoothing(false);
                } else {
                  setSmoothing(true);
                  setSmoothingQuality(val as ImageSmoothingQuality);
                }
              }}
              className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-xs font-medium text-gray-900 dark:text-gray-100"
            >
              <option value="high">Bicubic High (Smooth Photos)</option>
              <option value="medium">Bilinear Medium (Standard)</option>
              <option value="pixelated">Nearest Neighbor (Pixel Art / Sharp)</option>
            </select>
          </div>

          {(format === 'jpg' || format === 'webp') ? (
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-semibold text-gray-700 dark:text-gray-300">
                <span>Quality</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-mono font-bold">
                  {Math.round(quality * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={quality}
                onChange={(e) => setQuality(parseFloat(e.target.value))}
                className="w-full accent-indigo-600 mt-1.5"
              />
            </div>
          ) : (
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-gray-500 block">Compression</span>
              <p className="text-xs text-gray-500 dark:text-gray-400 pt-1.5">
                PNG uses lossless compression preserving full pixel integrity.
              </p>
            </div>
          )}
        </div>

        {/* Action Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
            {items.length === 0
              ? 'No images in queue yet. Add images above.'
              : mode === 'percentage'
              ? `${items.length} image(s) queued for ${percentScale}% proportional resize`
              : `${items.length} image(s) queued for ${exactWidth} × ${exactHeight} px (${getFitModeLabel(fitMode)})`}
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
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-sm shadow-sm transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Resizing {progress.current} of {progress.total}...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  Resize All ({items.length})
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
        <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-indigo-900 dark:text-indigo-200">
            <span className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
              Resizing {progress.current} of {progress.total}...
            </span>
            <span className="font-mono">{Math.round((progress.current / progress.total) * 100)}%</span>
          </div>
          <div className="w-full bg-indigo-200 dark:bg-indigo-900/60 rounded-full h-2 overflow-hidden">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
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
                className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
              >
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
                      <span>→</span>
                      {item.result ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                          {getQueueTargetLabel(item)}
                        </span>
                      ) : (
                        <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                          {getQueueTargetLabel(item)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Status & Actions */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                  {item.status === 'pending' && (
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-full">
                      {mode === 'percentage' ? `Ready (${percentScale}%)` : `Ready (${exactWidth}×${exactHeight})`}
                    </span>
                  )}

                  {item.status === 'processing' && (
                    <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 rounded-full flex items-center gap-1.5 animate-pulse">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Resizing...
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
                        <Check className="w-3 h-3" /> Done
                      </span>

                      <button
                        type="button"
                        onClick={() => item.result && downloadBlob(item.result.blob, item.result.filename)}
                        className="px-2.5 py-1 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                        title="Download this resized image"
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
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
