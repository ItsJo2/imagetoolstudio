import React, { useState, useEffect } from 'react';
import { useImageStore } from '../../store/imageStore';
import { resizeImage, downloadBlob, ProcessedResult } from '../../lib/imageUtils';
import { SendToMenu } from '../shared/SendToMenu';
import { Maximize2, Lock, Unlock, Download, RefreshCw, Check, ArrowRight, Percent } from 'lucide-react';
import { toast } from 'sonner';

const PERCENT_PRESETS = [25, 50, 75, 100, 150, 200];

export const ResizeTool: React.FC = () => {
  const { file, url, width: origWidth, height: origHeight, setImage, pushHistory, history } = useImageStore();

  const [targetWidth, setTargetWidth] = useState<number>(origWidth || 800);
  const [targetHeight, setTargetHeight] = useState<number>(origHeight || 600);
  const [lockAspectRatio, setLockAspectRatio] = useState<boolean>(true);
  const [format, setFormat] = useState<string>('png');
  const [quality, setQuality] = useState<number>(0.92);
  const [smoothing, setSmoothing] = useState<boolean>(true);
  const [smoothingQuality, setSmoothingQuality] = useState<ImageSmoothingQuality>('high');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [result, setResult] = useState<ProcessedResult | null>(null);

  useEffect(() => {
    if (origWidth && origHeight) {
      setTargetWidth(origWidth);
      setTargetHeight(origHeight);
    }
  }, [origWidth, origHeight]);

  if (!url || !file || !origWidth || !origHeight) return null;

  const aspectRatio = origWidth / origHeight;

  const handleWidthChange = (val: number) => {
    const w = Math.max(1, Math.round(val));
    setTargetWidth(w);
    if (lockAspectRatio) {
      setTargetHeight(Math.max(1, Math.round(w / aspectRatio)));
    }
    setResult(null);
  };

  const handleHeightChange = (val: number) => {
    const h = Math.max(1, Math.round(val));
    setTargetHeight(h);
    if (lockAspectRatio) {
      setTargetWidth(Math.max(1, Math.round(h * aspectRatio)));
    }
    setResult(null);
  };

  const applyPercentScale = (pct: number) => {
    const w = Math.max(1, Math.round((origWidth * pct) / 100));
    const h = Math.max(1, Math.round((origHeight * pct) / 100));
    setTargetWidth(w);
    setTargetHeight(h);
    setResult(null);
  };

  const handleResize = async () => {
    setIsProcessing(true);
    try {
      const res = await resizeImage(
        url,
        targetWidth,
        targetHeight,
        format,
        quality,
        file.name,
        smoothing,
        smoothingQuality
      );
      setResult(res);
      toast.success(`Resized to ${targetWidth} × ${targetHeight} px!`);
    } catch (err) {
      toast.error('Failed to resize image.');
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
      if (history.length > 0) {
        await pushHistory(newFile, `Resized ${targetWidth}×${targetHeight}`);
      } else {
        await setImage(newFile, `Resized ${targetWidth}×${targetHeight}`);
      }
      setResult(null);
      toast.success('Updated active image in history stack!');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Maximize2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          Resize Dimensions
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Scale by exact pixel dimensions or percentage presets with high-quality Lanczos/Bicubic smoothing.
        </p>
      </div>

      {/* Preset Scale Buttons */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
          <Percent className="w-4 h-4 text-blue-600" />
          Quick Percentage Scaling
        </label>
        <div className="flex flex-wrap gap-2">
          {PERCENT_PRESETS.map((pct) => (
            <button
              key={pct}
              type="button"
              onClick={() => applyPercentScale(pct)}
              className="px-3.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-950 hover:border-blue-500 text-xs font-semibold text-gray-700 dark:text-gray-300 transition-colors cursor-pointer"
            >
              {pct}%
            </button>
          ))}
        </div>
      </div>

      {/* Dimensions Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end pt-2 border-t border-gray-100 dark:border-gray-800">
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Width (Pixels)
          </label>
          <input
            type="number"
            min="1"
            value={targetWidth}
            onChange={(e) => handleWidthChange(parseInt(e.target.value) || 1)}
            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-mono font-medium"
          />
        </div>

        <div className="flex items-center justify-center pb-1">
          <button
            type="button"
            onClick={() => setLockAspectRatio(!lockAspectRatio)}
            className={`p-2.5 rounded-lg border transition-colors flex items-center gap-2 text-xs font-medium cursor-pointer ${
              lockAspectRatio
                ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-600 dark:text-blue-400'
                : 'bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-500'
            }`}
            title={lockAspectRatio ? 'Lock aspect ratio' : 'Unlock aspect ratio'}
          >
            {lockAspectRatio ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
            {lockAspectRatio ? 'Locked Aspect Ratio' : 'Freeform Ratio'}
          </button>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Height (Pixels)
          </label>
          <input
            type="number"
            min="1"
            value={targetHeight}
            onChange={(e) => handleHeightChange(parseInt(e.target.value) || 1)}
            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-mono font-medium"
          />
        </div>
      </div>

      {/* Format & Quality & Resampling Settings */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-gray-100 dark:border-gray-800">
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Output Format
          </label>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium"
          >
            <option value="png">PNG (Lossless)</option>
            <option value="jpg">JPG (Smaller size)</option>
            <option value="webp">WebP (Modern web format)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
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
            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium"
          >
            <option value="high">Bicubic High (Smooth Photos)</option>
            <option value="medium">Bilinear Medium (Standard)</option>
            <option value="pixelated">Nearest Neighbor (Pixel Art / Sharp)</option>
          </select>
        </div>

        {(format === 'jpg' || format === 'webp') && (
          <div>
            <div className="flex justify-between items-center text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              <span>Quality</span>
              <span className="text-blue-600 font-mono">{Math.round(quality * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={quality}
              onChange={(e) => setQuality(parseFloat(e.target.value))}
              className="w-full accent-blue-600 mt-2"
            />
          </div>
        )}
      </div>

      {/* Action button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleResize}
          disabled={isProcessing}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Resizing Image...
            </>
          ) : (
            <>
              <Maximize2 className="w-4 h-4" />
              Resize to {targetWidth} × {targetHeight} px
            </>
          )}
        </button>
      </div>

      {/* Result Card */}
      {result && (
        <div className="mt-6 p-4 rounded-xl border border-green-200 dark:border-green-900/40 bg-green-50/50 dark:bg-green-950/20 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-semibold text-sm">
              <Check className="w-5 h-5" />
              Resized Successfully!
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
              {(result.sizeBytes / 1024 / 1024).toFixed(2)} MB
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
            <img
              src={result.url}
              alt="Resized Result"
              className="max-h-40 w-auto rounded-lg border border-gray-200 dark:border-gray-700 checkerboard object-contain shadow-sm"
            />
            <div className="space-y-2 text-sm w-full">
              <p className="font-medium text-gray-900 dark:text-gray-100">{result.filename}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                New Dimensions: {result.width} × {result.height} px
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg text-sm shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Download Resized Image
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
    </div>
  );
};
