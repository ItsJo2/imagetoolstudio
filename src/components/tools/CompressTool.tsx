import React, { useState, useEffect } from 'react';
import { useImageStore } from '../../store/imageStore';
import { compressImageToTargetSize, CompressResult, downloadBlob } from '../../lib/imageUtils';
import { SendToMenu } from '../shared/SendToMenu';
import { HardDrive, Download, RefreshCw, Check, ArrowRight, Sparkles, AlertCircle, FileCheck, ArrowDownRight } from 'lucide-react';
import { toast } from 'sonner';

export const CompressTool: React.FC = () => {
  const { file, url, width, height, setImage, pushHistory, history } = useImageStore();

  const [targetValue, setTargetValue] = useState<number>(200); // 200
  const [unit, setUnit] = useState<'KB' | 'MB'>('KB');
  const [outputFormat, setOutputFormat] = useState<string>('webp');
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [result, setResult] = useState<CompressResult | null>(null);

  useEffect(() => {
    // Default target to roughly 30% of current image size if known, or 200KB
    if (file && file.size) {
      const approxKb = Math.max(50, Math.round((file.size * 0.3) / 1024));
      if (approxKb > 1024) {
        setTargetValue(Number((approxKb / 1024).toFixed(1)));
        setUnit('MB');
      } else {
        setTargetValue(approxKb);
        setUnit('KB');
      }
    }
  }, [file]);

  if (!url || !file) return null;

  const targetSizeBytes = targetValue * (unit === 'MB' ? 1024 * 1024 : 1024);

  const handleCompress = async () => {
    if (targetSizeBytes <= 0) {
      toast.error('Please enter a valid target size greater than 0.');
      return;
    }

    setIsCompressing(true);
    setResult(null);

    try {
      const res = await compressImageToTargetSize(
        url,
        targetSizeBytes,
        outputFormat,
        file.name,
        file.size
      );
      setResult(res);
      toast.success(`Successfully compressed to ${(res.sizeBytes / 1024).toFixed(1)} KB!`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to compress image to target size.');
    } finally {
      setIsCompressing(false);
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
        await pushHistory(newFile, `Compressed to ${targetValue} ${unit}`);
      } else {
        await setImage(newFile, `Compressed to ${targetValue} ${unit}`);
      }
      setResult(null);
      toast.success('Updated active studio image in history stack!');
    }
  };

  const presets = [
    { label: '50 KB', value: 50, u: 'KB' as const },
    { label: '100 KB', value: 100, u: 'KB' as const },
    { label: '200 KB', value: 200, u: 'KB' as const },
    { label: '500 KB', value: 500, u: 'KB' as const },
    { label: '1 MB', value: 1, u: 'MB' as const },
    { label: '2 MB', value: 2, u: 'MB' as const },
  ];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <HardDrive className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          Target File Size Compression
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Specify your exact target file size threshold. Our smart binary compression engine iteratively adjusts quality and dimensions to hit your size target.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input Configuration Box */}
        <div className="space-y-4 bg-gray-50 dark:bg-gray-800/40 p-5 rounded-2xl border border-gray-200/80 dark:border-gray-800">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
              Select Target Size Limit
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                step="1"
                value={targetValue}
                onChange={(e) => setTargetValue(Math.max(1, parseFloat(e.target.value) || 1))}
                className="flex-1 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-base font-mono font-bold text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <div className="flex items-center bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl p-1">
                {(['KB', 'MB'] as const).map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setUnit(u)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                      unit === u
                        ? 'bg-teal-600 text-white shadow-xs'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                    }`}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Presets */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
              Popular File Size Presets
            </label>
            <div className="grid grid-cols-3 gap-2">
              {presets.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => {
                    setTargetValue(p.value);
                    setUnit(p.u);
                  }}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold border cursor-pointer transition-all ${
                    targetValue === p.value && unit === p.u
                      ? 'border-teal-600 bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Format Picker */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Compression Format
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'webp', name: 'WebP (Recommended)' },
                { id: 'jpg', name: 'JPG' },
                { id: 'avif', name: 'AVIF' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setOutputFormat(f.id)}
                  className={`py-2 px-2 rounded-xl text-xs font-bold uppercase cursor-pointer border text-center ${
                    outputFormat === f.id
                      ? 'border-teal-600 bg-teal-600 text-white shadow-xs'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {f.id}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              WebP and AVIF deliver superior quality compression at low byte targets.
            </p>
          </div>
        </div>

        {/* Info & Status Box */}
        <div className="space-y-4 bg-teal-50/40 dark:bg-teal-950/20 p-5 rounded-2xl border border-teal-200/60 dark:border-teal-900/40 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300 flex items-center gap-1.5">
              <FileCheck className="w-4 h-4" />
              Original vs Target Overview
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-teal-200/50 dark:border-teal-900/50">
                <span className="text-gray-600 dark:text-gray-400">Current Image File Size:</span>
                <span className="font-mono font-bold text-gray-900 dark:text-gray-100">
                  {((file?.size || 0) / 1024 / 1024).toFixed(2)} MB ({Math.round((file?.size || 0) / 1024)} KB)
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-teal-200/50 dark:border-teal-900/50">
                <span className="text-gray-600 dark:text-gray-400">Target Size Goal:</span>
                <span className="font-mono font-bold text-teal-600 dark:text-teal-400">
                  {targetValue} {unit} ({Math.round(targetSizeBytes / 1024)} KB)
                </span>
              </div>

              <div className="flex justify-between py-1.5">
                <span className="text-gray-600 dark:text-gray-400">Dimensions:</span>
                <span className="font-mono text-gray-800 dark:text-gray-200">
                  {width} × {height} px
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCompress}
            disabled={isCompressing}
            className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isCompressing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Compressing to Target...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Compress Image to {targetValue} {unit}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Output Result Card */}
      {result && (
        <div className="p-6 rounded-2xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-emerald-200/60 dark:border-emerald-900/60 pb-3">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-base">
              <Check className="w-5 h-5" />
              Target Size Compression Completed!
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-900/60 px-3 py-1 rounded-full">
              <ArrowDownRight className="w-4 h-4" />
              {(
                ((result.originalSizeBytes - result.sizeBytes) / result.originalSizeBytes) *
                100
              ).toFixed(1)}
              % Size Reduction
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="bg-white dark:bg-gray-900 p-3 rounded-xl border border-gray-200 dark:border-gray-800">
              <span className="text-[11px] text-gray-500 block">Final File Size</span>
              <span className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">
                {(result.sizeBytes / 1024).toFixed(1)} KB
              </span>
            </div>
            <div className="bg-white dark:bg-gray-900 p-3 rounded-xl border border-gray-200 dark:border-gray-800">
              <span className="text-[11px] text-gray-500 block">Target Size Goal</span>
              <span className="text-sm font-bold font-mono text-gray-900 dark:text-gray-100">
                {(result.targetSizeBytes / 1024).toFixed(1)} KB
              </span>
            </div>
            <div className="bg-white dark:bg-gray-900 p-3 rounded-xl border border-gray-200 dark:border-gray-800">
              <span className="text-[11px] text-gray-500 block">Quality Achieved</span>
              <span className="text-sm font-bold font-mono text-indigo-600 dark:text-indigo-400">
                {result.qualityAchieved}%
              </span>
            </div>
            <div className="bg-white dark:bg-gray-900 p-3 rounded-xl border border-gray-200 dark:border-gray-800">
              <span className="text-[11px] text-gray-500 block">Output Scale</span>
              <span className="text-sm font-bold font-mono text-gray-900 dark:text-gray-100">
                {result.width} × {result.height} px ({result.scaleAchieved}%)
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-5 pt-2">
            <div className="relative checkerboard rounded-xl border border-gray-300 dark:border-gray-700 p-2 overflow-hidden flex-shrink-0">
              <img
                src={result.url}
                alt="Compressed Output"
                className="max-h-48 w-auto object-contain rounded-lg"
              />
            </div>

            <div className="space-y-3 w-full">
              <div>
                <p className="font-bold text-gray-900 dark:text-gray-100 text-sm">{result.filename}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Format: <span className="uppercase font-semibold">{result.formatUsed}</span> • Target: {Math.round(result.targetSizeBytes / 1024)} KB • Achieved: {(result.sizeBytes / 1024).toFixed(1)} KB
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Download Compressed Image
                </button>
                <button
                  type="button"
                  onClick={handleUseAsCurrent}
                  className="px-4 py-2.5 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold border border-gray-200 dark:border-gray-700 rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
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
