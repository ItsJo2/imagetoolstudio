import React, { useState } from 'react';
import { useImageStore } from '../../store/imageStore';
import { applyWatermark, WatermarkOptions, WatermarkPosition, downloadBlob, ProcessedResult } from '../../lib/imageUtils';
import { SendToMenu } from '../shared/SendToMenu';
import { Stamp, Download, RefreshCw, Check, ArrowRight, Sparkles, Type, Image as ImageIcon, Grid, Upload } from 'lucide-react';
import { toast } from 'sonner';

const POSITIONS: { id: WatermarkPosition; label: string }[] = [
  { id: 'top-left', label: 'Top Left' },
  { id: 'top-center', label: 'Top Center' },
  { id: 'top-right', label: 'Top Right' },
  { id: 'center-left', label: 'Mid Left' },
  { id: 'center', label: 'Center' },
  { id: 'center-right', label: 'Mid Right' },
  { id: 'bottom-left', label: 'Bottom Left' },
  { id: 'bottom-center', label: 'Bottom Center' },
  { id: 'bottom-right', label: 'Bottom Right' },
  { id: 'tiled', label: 'Full Tiled Grid' },
];

const FONTS = [
  { id: 'sans-serif', name: 'Clean Sans' },
  { id: 'serif', name: 'Classic Serif' },
  { id: 'monospace', name: 'Monospace Code' },
  { id: 'Impact, sans-serif', name: 'Impact Bold' },
  { id: 'Georgia, serif', name: 'Georgia Editorial' },
  { id: 'Courier New, monospace', name: 'Courier Typewriter' },
];

export const WatermarkTool: React.FC = () => {
  const { file, url, setImage, pushHistory, history } = useImageStore();

  const [watermarkType, setWatermarkType] = useState<'text' | 'image'>('text');
  
  // Text Options
  const [text, setText] = useState<string>('© Copyright Brand 2026');
  const [fontFamily, setFontFamily] = useState<string>('sans-serif');
  const [fontSize, setFontSize] = useState<number>(60); // 12-200
  const [color, setColor] = useState<string>('#ffffff');
  
  // Logo Options
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoScale, setLogoScale] = useState<number>(0.25); // 0.05 - 0.7

  // Shared Options
  const [opacity, setOpacity] = useState<number>(0.75); // 0.1 - 1.0
  const [position, setPosition] = useState<WatermarkPosition>('bottom-right');
  const [rotation, setRotation] = useState<number>(0); // -180 to 180
  const [margin, setMargin] = useState<number>(30); // 10 to 100

  const [outputFormat, setOutputFormat] = useState<string>('png');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [result, setResult] = useState<ProcessedResult | null>(null);

  if (!url || !file) return null;

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const objectUrl = URL.createObjectURL(file);
      setLogoUrl(objectUrl);
      setResult(null);
      toast.success(`Loaded logo: ${file.name}`);
    }
  };

  const handleApply = async () => {
    if (watermarkType === 'image' && !logoUrl) {
      toast.error('Please upload a watermark logo image first.');
      return;
    }

    setIsProcessing(true);
    setResult(null);

    const options: WatermarkOptions = {
      type: watermarkType,
      text,
      fontFamily,
      fontSize,
      color,
      opacity,
      position,
      rotation,
      logoUrl: logoUrl || undefined,
      logoScale,
      margin,
    };

    try {
      const res = await applyWatermark(url, options, outputFormat, 0.95, file.name);
      setResult(res);
      toast.success('Watermark stamped successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to apply watermark.');
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
        await pushHistory(newFile, 'Watermarked');
      } else {
        await setImage(newFile, 'Watermarked');
      }
      setResult(null);
      toast.success('Updated active studio image in history stack!');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Stamp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            Watermark & Brand Protection
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Protect your creative photos and media with customizable copyright text badges or transparent logo overlays.
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center bg-gray-100 dark:bg-gray-800 p-1 rounded-xl self-start sm:self-auto border border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={() => {
              setWatermarkType('text');
              setResult(null);
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              watermarkType === 'text'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            Text Watermark
          </button>
          <button
            type="button"
            onClick={() => {
              setWatermarkType('image');
              setResult(null);
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              watermarkType === 'image'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            Logo Overlay
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Watermark Config Controls (7 Cols) */}
        <div className="lg:col-span-7 space-y-5 bg-gray-50 dark:bg-gray-800/40 p-5 rounded-2xl border border-gray-200/80 dark:border-gray-800">
          {watermarkType === 'text' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                  Copyright Text
                </label>
                <input
                  type="text"
                  value={text}
                  onChange={(e) => {
                    setText(e.target.value);
                    setResult(null);
                  }}
                  placeholder="© My Brand Name"
                  className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Font Family
                  </label>
                  <select
                    value={fontFamily}
                    onChange={(e) => {
                      setFontFamily(e.target.value);
                      setResult(null);
                    }}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-xs font-medium text-gray-800 dark:text-gray-200"
                  >
                    {FONTS.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Text Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => {
                        setColor(e.target.value);
                        setResult(null);
                      }}
                      className="w-9 h-9 rounded-lg border border-gray-300 dark:border-gray-700 cursor-pointer p-0.5 bg-white dark:bg-gray-800"
                    />
                    <span className="text-xs font-mono font-medium text-gray-700 dark:text-gray-300 uppercase">
                      {color}
                    </span>
                  </div>
                </div>
              </div>

              {/* Font Size Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-gray-700 dark:text-gray-300">Text Size</span>
                  <span className="font-mono text-purple-600 dark:text-purple-400 font-bold">{fontSize}</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="150"
                  value={fontSize}
                  onChange={(e) => {
                    setFontSize(parseInt(e.target.value));
                    setResult(null);
                  }}
                  className="w-full accent-purple-600"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                  Upload Brand Logo / Image PNG
                </label>
                <div className="flex items-center gap-3">
                  <label className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center gap-2 shadow-xs">
                    <Upload className="w-4 h-4" />
                    Select Logo File
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>
                  {logoUrl && (
                    <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-1.5 px-3 rounded-xl border border-gray-200 dark:border-gray-700">
                      <img src={logoUrl} alt="Logo preview" className="w-6 h-6 object-contain" />
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Logo Loaded</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Logo Scale Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-gray-700 dark:text-gray-300">Logo Scale (% of Image Width)</span>
                  <span className="font-mono text-purple-600 dark:text-purple-400 font-bold">
                    {Math.round(logoScale * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.6"
                  step="0.01"
                  value={logoScale}
                  onChange={(e) => {
                    setLogoScale(parseFloat(e.target.value));
                    setResult(null);
                  }}
                  className="w-full accent-purple-600"
                />
              </div>
            </div>
          )}

          {/* Shared Options Grid */}
          <div className="pt-3 border-t border-gray-200 dark:border-gray-700 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">
              Positioning & Opacity Controls
            </h4>

            {/* Position Picker Grid */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Watermark Placement Position
              </label>
              <div className="grid grid-cols-3 gap-2 max-w-xs">
                {POSITIONS.slice(0, 9).map((pos) => (
                  <button
                    key={pos.id}
                    type="button"
                    onClick={() => {
                      setPosition(pos.id);
                      setResult(null);
                    }}
                    className={`p-2 rounded-lg border text-[11px] font-semibold text-center cursor-pointer transition-all ${
                      position === pos.id
                        ? 'border-purple-600 bg-purple-600 text-white shadow-xs'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {pos.label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  setPosition('tiled');
                  setResult(null);
                }}
                className={`mt-2 w-full max-w-xs py-2 rounded-lg border text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                  position === 'tiled'
                    ? 'border-purple-600 bg-purple-600 text-white shadow-xs'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                Tile Across Entire Canvas (Tiled Grid)
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Opacity Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-gray-700 dark:text-gray-300">Opacity</span>
                  <span className="font-mono text-purple-600 font-bold">{Math.round(opacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={opacity}
                  onChange={(e) => {
                    setOpacity(parseFloat(e.target.value));
                    setResult(null);
                  }}
                  className="w-full accent-purple-600"
                />
              </div>

              {/* Rotation Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-gray-700 dark:text-gray-300">Rotation</span>
                  <span className="font-mono text-purple-600 font-bold">{rotation}°</span>
                </div>
                <input
                  type="range"
                  min="-90"
                  max="90"
                  value={rotation}
                  onChange={(e) => {
                    setRotation(parseInt(e.target.value));
                    setResult(null);
                  }}
                  className="w-full accent-purple-600"
                />
              </div>

              {/* Margin Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-gray-700 dark:text-gray-300">Edge Margin</span>
                  <span className="font-mono text-purple-600 font-bold">{margin}px</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={margin}
                  onChange={(e) => {
                    setMargin(parseInt(e.target.value));
                    setResult(null);
                  }}
                  className="w-full accent-purple-600"
                />
              </div>
            </div>

            {/* Output Format Picker */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Export Format
              </label>
              <div className="flex items-center gap-2 max-w-xs">
                {['png', 'webp', 'jpg'].map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => setOutputFormat(fmt)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold uppercase cursor-pointer ${
                      outputFormat === fmt
                        ? 'bg-purple-600 text-white shadow-xs'
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

        {/* Right Column: Original Image Canvas Stage (5 Cols) */}
        <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 block">
              Active Studio Canvas
            </span>
            <div className="relative rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-950/5 dark:bg-gray-950/40 p-4 min-h-[300px] flex items-center justify-center overflow-hidden checkerboard">
              <img
                src={url}
                alt="Source Image"
                className="max-h-[300px] w-auto object-contain rounded-lg shadow-sm"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleApply}
            disabled={isProcessing}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Rendering Watermark...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Render & Stamp Watermark
              </>
            )}
          </button>
        </div>
      </div>

      {/* Processed Result Box */}
      {result && (
        <div className="p-6 rounded-2xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-4">
          <div className="flex items-center justify-between border-b border-emerald-200/60 dark:border-emerald-900/60 pb-3">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-base">
              <Check className="w-5 h-5" />
              Watermarked Image Rendered Successfully!
            </div>
            <div className="text-xs text-gray-500 font-mono">
              {(result.sizeBytes / 1024 / 1024).toFixed(2)} MB
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-5 pt-1">
            <div className="relative checkerboard rounded-xl border border-gray-300 dark:border-gray-700 p-2 overflow-hidden flex-shrink-0">
              <img
                src={result.url}
                alt="Watermarked Result"
                className="max-h-48 w-auto object-contain rounded-lg"
              />
            </div>

            <div className="space-y-3 w-full">
              <div>
                <p className="font-bold text-gray-900 dark:text-gray-100 text-sm">{result.filename}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Dimensions: {result.width} × {result.height} px • Type: {watermarkType.toUpperCase()}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Download Watermarked Image
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
