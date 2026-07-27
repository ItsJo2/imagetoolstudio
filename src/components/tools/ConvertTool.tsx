import React, { useState } from 'react';
import { useImageStore } from '../../store/imageStore';
import { convertImageFormat, downloadBlob, ProcessedResult } from '../../lib/imageUtils';
import { SendToMenu } from '../shared/SendToMenu';
import { Download, RefreshCw, Sparkles, Check, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

const FORMATS = [
  { id: 'webp', name: 'WebP', desc: 'Modern web format, superior compression', badge: 'Recommended' },
  { id: 'png', name: 'PNG', desc: 'Lossless quality & transparency support', badge: 'High Quality' },
  { id: 'jpg', name: 'JPG / JPEG', desc: 'Universal compatibility & small sizes', badge: 'Standard' },
  { id: 'avif', name: 'AVIF', desc: 'Next-gen compact web format', badge: 'Ultra Compressed' },
  { id: 'bmp', name: 'BMP', desc: 'Uncompressed raster bitmap', badge: 'Raw' },
];

export const ConvertTool: React.FC = () => {
  const { file, url, format: currentFormat, setImage, pushHistory, history } = useImageStore();

  const [selectedFormat, setSelectedFormat] = useState<string>('webp');
  const [quality, setQuality] = useState<number>(0.90);
  const [bgColor, setBgColor] = useState<string>('#ffffff');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [result, setResult] = useState<ProcessedResult | null>(null);

  if (!url || !file) return null;

  const handleConvert = async () => {
    setIsProcessing(true);
    try {
      const res = await convertImageFormat(
        url,
        selectedFormat,
        quality,
        bgColor,
        file.name
      );
      setResult(res);
      toast.success(`Converted to ${selectedFormat.toUpperCase()}!`);
    } catch (err) {
      toast.error('Conversion failed. Format may not be supported by browser.');
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
        await pushHistory(newFile, `Converted to ${selectedFormat.toUpperCase()}`);
      } else {
        await setImage(newFile, `Converted to ${selectedFormat.toUpperCase()}`);
      }
      setResult(null);
      toast.success('Updated active image in history stack!');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          Convert Image Format
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Select target format and compression level. All conversion runs offline inside your browser.
        </p>
      </div>

      {/* Target Format Selector */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Target Output Format
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {FORMATS.map((fmt) => {
            const isSelected = selectedFormat === fmt.id;
            return (
              <button
                key={fmt.id}
                type="button"
                onClick={() => {
                  setSelectedFormat(fmt.id);
                  setResult(null);
                }}
                className={`flex flex-col text-left p-3.5 rounded-xl border transition-all duration-200 ${
                  isSelected
                    ? 'border-blue-600 dark:border-blue-500 bg-blue-50/60 dark:bg-blue-950/40 ring-1 ring-blue-600'
                    : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 bg-white dark:bg-gray-900'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{fmt.name}</span>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                    isSelected
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                  }`}>
                    {fmt.badge}
                  </span>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">{fmt.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Controls: Quality Slider & Background Color */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-gray-100 dark:border-gray-800">
        {(selectedFormat === 'jpg' || selectedFormat === 'webp' || selectedFormat === 'avif') && (
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <label className="font-medium text-gray-700 dark:text-gray-300">
                Quality Level
              </label>
              <span className="font-mono text-blue-600 dark:text-blue-400 font-semibold">
                {Math.round(quality * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={quality}
              onChange={(e) => {
                setQuality(parseFloat(e.target.value));
                setResult(null);
              }}
              className="w-full accent-blue-600"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Higher quality preserves fine detail; lower quality creates smaller files.
            </p>
          </div>
        )}

        {selectedFormat === 'jpg' && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Background Color (for transparent sources)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={bgColor}
                onChange={(e) => {
                  setBgColor(e.target.value);
                  setResult(null);
                }}
                className="w-10 h-10 rounded border cursor-pointer border-gray-300 dark:border-gray-700"
              />
              <span className="text-xs font-mono text-gray-600 dark:text-gray-400 uppercase">
                {bgColor}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              JPEG format does not support transparency. Alpha channels will fill with this color.
            </p>
          </div>
        )}
      </div>

      {/* Action Button */}
      <div className="pt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleConvert}
          disabled={isProcessing}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Converting...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              Convert to {selectedFormat.toUpperCase()}
            </>
          )}
        </button>
      </div>

      {/* Conversion Result Preview & Download */}
      {result && (
        <div className="mt-6 p-4 rounded-xl border border-green-200 dark:border-green-900/40 bg-green-50/50 dark:bg-green-950/20 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-semibold text-sm">
              <Check className="w-5 h-5" />
              Conversion Complete!
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
              {(result.sizeBytes / 1024 / 1024).toFixed(2)} MB
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
            <img
              src={result.url}
              alt="Converted Result"
              className="max-h-40 w-auto rounded-lg border border-gray-200 dark:border-gray-700 checkerboard object-contain"
            />
            <div className="space-y-2 text-sm w-full">
              <p className="font-medium text-gray-900 dark:text-gray-100">{result.filename}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Dimensions: {result.width} × {result.height} px
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg text-sm shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
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
    </div>
  );
};
