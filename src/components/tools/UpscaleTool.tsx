import React, { useState } from 'react';
import { useImageStore } from '../../store/imageStore';
import { upscaleImage, downloadBlob, ProcessedResult } from '../../lib/imageUtils';
import { SendToMenu } from '../shared/SendToMenu';
import { BeforeAfterSlider } from '../shared/BeforeAfterSlider';
import { Sparkles, Zap, Download, RefreshCw, Check, ArrowRight, Sliders } from 'lucide-react';
import { toast } from 'sonner';

export const UpscaleTool: React.FC = () => {
  const { file, url, width: origWidth, height: origHeight, setImage, pushHistory, history } = useImageStore();

  const [scaleFactor, setScaleFactor] = useState<number>(2); // 2 or 4
  const [sharpenAmount, setSharpenAmount] = useState<number>(0.25);
  const [format, setFormat] = useState<string>('png');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [result, setResult] = useState<ProcessedResult | null>(null);

  if (!url || !file || !origWidth || !origHeight) return null;

  const targetW = origWidth * scaleFactor;
  const targetH = origHeight * scaleFactor;

  const handleUpscale = async () => {
    setIsProcessing(true);
    try {
      const res = await upscaleImage(
        url,
        scaleFactor,
        sharpenAmount,
        format,
        0.95,
        file.name
      );
      setResult(res);
      toast.success(`Upscaled ${scaleFactor}x to ${res.width} × ${res.height} px!`);
    } catch (err) {
      toast.error('Failed to upscale image.');
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
        await pushHistory(newFile, `Upscaled ${scaleFactor}x (${result.width}×${result.height})`);
      } else {
        await setImage(newFile, `Upscaled ${scaleFactor}x (${result.width}×${result.height})`);
      }
      setResult(null);
      toast.success('Updated current active image in history stack!');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-500" />
          Smart Image Upscaler
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Increase resolution up to 4x with bicubic sub-pixel interpolation and detail unsharp edge enhancement.
        </p>
      </div>

      {/* Scale Factor Selection */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Upscale Resolution Factor
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => {
              setScaleFactor(2);
              setResult(null);
            }}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
              scaleFactor === 2
                ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 ring-1 ring-blue-600'
                : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 bg-white dark:bg-gray-900'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-gray-900 dark:text-gray-100">2× Resolution</span>
              <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-semibold px-2 py-0.5 rounded">
                Fast & Crisp
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              New dimensions: {origWidth * 2} × {origHeight * 2} px
            </p>
          </button>

          <button
            type="button"
            onClick={() => {
              setScaleFactor(4);
              setResult(null);
            }}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
              scaleFactor === 4
                ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 ring-1 ring-blue-600'
                : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 bg-white dark:bg-gray-900'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-gray-900 dark:text-gray-100">4× Super Resolution</span>
              <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 font-semibold px-2 py-0.5 rounded">
                Maximum Detail
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              New dimensions: {origWidth * 4} × {origHeight * 4} px
            </p>
          </button>
        </div>
      </div>

      {/* Detail Sharpening */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-gray-100 dark:border-gray-800">
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm font-medium text-gray-700 dark:text-gray-300">
            <span className="flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-blue-600" /> Edge Detail & Sharpening
            </span>
            <span className="font-mono text-blue-600 dark:text-blue-400 font-semibold">
              {Math.round(sharpenAmount * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="0.6"
            step="0.05"
            value={sharpenAmount}
            onChange={(e) => {
              setSharpenAmount(parseFloat(e.target.value));
              setResult(null);
            }}
            className="w-full accent-blue-600"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Higher values sharpen textures and clarity when magnifying small images.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
            Output File Format
          </label>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium"
          >
            <option value="png">PNG (Preserve fine pixels)</option>
            <option value="webp">WebP (Optimized file size)</option>
            <option value="jpg">JPG (Standard compatibility)</option>
          </select>
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleUpscale}
          disabled={isProcessing}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Upscaling Image ({scaleFactor}x)...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-300" />
              Upscale to {targetW} × {targetH} px
            </>
          )}
        </button>
      </div>

      {/* Interactive Split Comparison View & Output */}
      {result && (
        <div className="mt-6 p-4 rounded-xl border border-green-200 dark:border-green-900/40 bg-green-50/50 dark:bg-green-950/20 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-semibold text-sm">
              <Check className="w-5 h-5" />
              Upscaled {scaleFactor}x Successfully!
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
              {result.width} × {result.height} px • {(result.sizeBytes / 1024 / 1024).toFixed(2)} MB
            </div>
          </div>

          {/* Side-by-side / Split comparison slider */}
          <BeforeAfterSlider
            originalUrl={url}
            processedUrl={result.url}
            originalLabel={`Original (${origWidth}×${origHeight})`}
            processedLabel={`Upscaled ${scaleFactor}x (${result.width}×${result.height})`}
          />

          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            Drag across image above to compare Original vs Upscaled detail
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleDownload}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg text-sm shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Download Upscaled Image
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
      )}
    </div>
  );
};
