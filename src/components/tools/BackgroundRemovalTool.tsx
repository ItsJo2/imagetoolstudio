import React, { useState, useRef, useEffect } from 'react';
import { useImageStore } from '../../store/imageStore';
import { removeBackgroundKeyColor, ColorKeyOptions, ProcessedResult, downloadBlob } from '../../lib/imageUtils';
import { SendToMenu } from '../shared/SendToMenu';
import { BeforeAfterSlider } from '../shared/BeforeAfterSlider';
import { Eraser, Download, RefreshCw, Check, ArrowRight, Sparkles, Pipette, Sliders, Palette, Layers } from 'lucide-react';
import { toast } from 'sonner';

export const BackgroundRemovalTool: React.FC = () => {
  const { file, url, setImage, pushHistory, history } = useImageStore();

  const [keyColor, setKeyColor] = useState<string>('#ffffff');
  const [tolerance, setTolerance] = useState<number>(35); // 0-150
  const [smoothness, setSmoothness] = useState<number>(15); // 0-50
  const [replacementType, setReplacementType] = useState<'transparent' | 'color'>('transparent');
  const [replacementColor, setReplacementColor] = useState<string>('#3b82f6'); // default studio blue
  const [outputFormat, setOutputFormat] = useState<string>('png');

  const [isPickingColor, setIsPickingColor] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [result, setResult] = useState<ProcessedResult | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (url && canvasRef.current) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const cvs = canvasRef.current;
        if (cvs) {
          cvs.width = img.naturalWidth || img.width;
          cvs.height = img.naturalHeight || img.height;
          const ctx = cvs.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
          }
        }
      };
      img.src = url;
    }
  }, [url]);

  if (!url || !file) return null;

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isPickingColor || !canvasRef.current) return;

    const cvs = canvasRef.current;
    const rect = cvs.getBoundingClientRect();
    const scaleX = cvs.width / rect.width;
    const scaleY = cvs.height / rect.height;

    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);

    const ctx = cvs.getContext('2d');
    if (ctx) {
      const pixel = ctx.getImageData(x, y, 1, 1).data;
      const r = pixel[0].toString(16).padStart(2, '0');
      const g = pixel[1].toString(16).padStart(2, '0');
      const b = pixel[2].toString(16).padStart(2, '0');
      const sampledHex = `#${r}${g}${b}`;
      setKeyColor(sampledHex);
      setIsPickingColor(false);
      setResult(null);
      toast.success(`Sampled key color: ${sampledHex.toUpperCase()}`);
    }
  };

  const handleProcess = async () => {
    setIsProcessing(true);
    setResult(null);

    const options: ColorKeyOptions = {
      keyColor,
      tolerance,
      smoothness,
      replacementType,
      replacementColor,
    };

    try {
      const res = await removeBackgroundKeyColor(url, options, outputFormat, 0.95, file.name);
      setResult(res);
      toast.success('Background removed successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to remove background.');
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
        await pushHistory(newFile, 'Removed Background');
      } else {
        await setImage(newFile, 'Removed Background');
      }
      setResult(null);
      toast.success('Updated active studio image in history stack!');
    }
  };

  const colorPresets = [
    { label: 'White Background', hex: '#ffffff' },
    { label: 'Green Screen', hex: '#00ff00' },
    { label: 'Black Background', hex: '#000000' },
    { label: 'Blue Screen', hex: '#0000ff' },
    { label: 'Light Gray', hex: '#f1f5f9' },
  ];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Eraser className="w-5 h-5 text-rose-600 dark:text-rose-400" />
          Background Removal & Color Keying Engine
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Isolate subjects by removing solid backgrounds or green screens. Click on the image preview to sample your background color with pixel precision.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Color Key Controls (7 Cols) */}
        <div className="lg:col-span-7 space-y-5 bg-gray-50 dark:bg-gray-800/40 p-5 rounded-2xl border border-gray-200/80 dark:border-gray-800">
          {/* Key Color Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                Key Background Color To Remove
              </label>
              <button
                type="button"
                onClick={() => setIsPickingColor(!isPickingColor)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isPickingColor
                    ? 'bg-rose-600 text-white animate-pulse shadow-xs'
                    : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Pipette className="w-3.5 h-3.5" />
                {isPickingColor ? 'Click Preview Image below...' : 'Sample Color from Image'}
              </button>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="color"
                value={keyColor}
                onChange={(e) => {
                  setKeyColor(e.target.value);
                  setResult(null);
                }}
                className="w-10 h-10 rounded-xl border border-gray-300 dark:border-gray-700 cursor-pointer p-0.5 bg-white dark:bg-gray-800"
              />
              <input
                type="text"
                value={keyColor}
                onChange={(e) => {
                  setKeyColor(e.target.value);
                  setResult(null);
                }}
                className="w-28 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-xs font-mono font-bold uppercase text-gray-900 dark:text-gray-100"
              />
              <span className="text-xs text-gray-500">Selected Key Target</span>
            </div>

            {/* Quick Color Presets */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {colorPresets.map((p) => (
                <button
                  key={p.hex}
                  type="button"
                  onClick={() => {
                    setKeyColor(p.hex);
                    setResult(null);
                  }}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-1.5 cursor-pointer"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-gray-400"
                    style={{ backgroundColor: p.hex }}
                  />
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Keying Sliders */}
          <div className="space-y-4 pt-2 border-t border-gray-200 dark:border-gray-700">
            {/* Color Tolerance */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-gray-700 dark:text-gray-300 flex items-center gap-1">
                  <Sliders className="w-3.5 h-3.5 text-rose-500" /> Color Distance Tolerance
                </span>
                <span className="font-mono text-rose-600 dark:text-rose-400 font-bold">{tolerance}</span>
              </div>
              <input
                type="range"
                min="5"
                max="120"
                value={tolerance}
                onChange={(e) => {
                  setTolerance(parseInt(e.target.value));
                  setResult(null);
                }}
                className="w-full accent-rose-600"
              />
              <p className="text-[11px] text-gray-400">Higher values expand matching to include similar color shades.</p>
            </div>

            {/* Edge Feather / Smoothness */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-gray-700 dark:text-gray-300">Edge Feathering / Smoothness</span>
                <span className="font-mono text-rose-600 dark:text-rose-400 font-bold">{smoothness}</span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                value={smoothness}
                onChange={(e) => {
                  setSmoothness(parseInt(e.target.value));
                  setResult(null);
                }}
                className="w-full accent-rose-600"
              />
              <p className="text-[11px] text-gray-400">Softens boundary edges to eliminate hard cutout pixels.</p>
            </div>
          </div>

          {/* Replacement Options */}
          <div className="space-y-3 pt-2 border-t border-gray-200 dark:border-gray-700">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              New Background Outcome
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setReplacementType('transparent');
                  setResult(null);
                }}
                className={`p-3 rounded-xl border text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-2 ${
                  replacementType === 'transparent'
                    ? 'border-rose-600 bg-rose-600 text-white shadow-xs'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Layers className="w-4 h-4" />
                Transparent Background
              </button>
              <button
                type="button"
                onClick={() => {
                  setReplacementType('color');
                  setResult(null);
                }}
                className={`p-3 rounded-xl border text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-2 ${
                  replacementType === 'color'
                    ? 'border-rose-600 bg-rose-600 text-white shadow-xs'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Palette className="w-4 h-4" />
                Solid Replacement Color
              </button>
            </div>

            {replacementType === 'color' && (
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="color"
                  value={replacementColor}
                  onChange={(e) => {
                    setReplacementColor(e.target.value);
                    setResult(null);
                  }}
                  className="w-9 h-9 rounded-xl border border-gray-300 dark:border-gray-700 cursor-pointer p-0.5 bg-white dark:bg-gray-800"
                />
                <span className="text-xs font-mono font-bold uppercase text-gray-800 dark:text-gray-200">
                  {replacementColor}
                </span>
                <span className="text-xs text-gray-500">Solid backdrop color</span>
              </div>
            )}

            {/* Export Format */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Export File Format
              </label>
              <div className="flex items-center gap-2 max-w-xs">
                {['png', 'webp', 'jpg'].map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => setOutputFormat(fmt)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold uppercase cursor-pointer ${
                      outputFormat === fmt
                        ? 'bg-rose-600 text-white shadow-xs'
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

        {/* Right Column: Interactive Color Sampler Canvas (5 Cols) */}
        <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 block flex items-center justify-between">
              <span>Interactive Sampler Canvas</span>
              {isPickingColor && <span className="text-rose-600 font-bold text-[11px] animate-pulse">EyeDropper Active! Click Image</span>}
            </span>
            <div className={`relative rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-950/5 dark:bg-gray-950/40 p-3 min-h-[280px] flex items-center justify-center overflow-hidden checkerboard ${isPickingColor ? 'cursor-crosshair ring-2 ring-rose-500' : ''}`}>
              <canvas
                ref={canvasRef}
                onClick={handleCanvasClick}
                className="max-h-[280px] max-w-full object-contain rounded-lg shadow-sm"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleProcess}
            disabled={isProcessing}
            className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Keying & Removing Background...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Remove Background & Render
              </>
            )}
          </button>
        </div>
      </div>

      {/* Output Result Card */}
      {result && (
        <div className="p-6 rounded-2xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-4">
          <div className="flex items-center justify-between border-b border-emerald-200/60 dark:border-emerald-900/60 pb-3">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-base">
              <Check className="w-5 h-5" />
              Background Removal Rendered Successfully!
            </div>
            <div className="text-xs text-gray-500 font-mono">
              {(result.sizeBytes / 1024 / 1024).toFixed(2)} MB
            </div>
          </div>

          <div className="pt-2 space-y-4">
            {url && (
              <BeforeAfterSlider
                originalUrl={url}
                processedUrl={result.url}
                originalLabel="Original Photo"
                processedLabel="Background Cutout"
              />
            )}

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-emerald-200/60 dark:border-emerald-900/60">
              <div>
                <p className="font-bold text-gray-900 dark:text-gray-100 text-sm">{result.filename}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Dimensions: {result.width} × {result.height} px • Outcome: {replacementType === 'transparent' ? 'Transparent Alpha' : 'Solid Replacement Color'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Download Cutout Image
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
