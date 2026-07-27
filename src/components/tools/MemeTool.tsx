import React, { useState } from 'react';
import { useImageStore } from '../../store/imageStore';
import { generateMemeImage, MemeOptions, ProcessedResult, downloadBlob } from '../../lib/imageUtils';
import { SendToMenu } from '../shared/SendToMenu';
import { Type, Download, RefreshCw, Check, ArrowRight, Sparkles, Smile, Palette, AlignCenter } from 'lucide-react';
import { toast } from 'sonner';

const MEME_FONTS = [
  { id: 'Impact, sans-serif', name: 'Impact (Classic Meme)' },
  { id: 'sans-serif', name: 'Clean Sans-Serif' },
  { id: 'Arial Black, sans-serif', name: 'Arial Black Heavy' },
  { id: 'Comic Sans MS, cursive, sans-serif', name: 'Comic Casual' },
  { id: 'Georgia, serif', name: 'Georgia Editorial' },
  { id: 'Courier New, monospace', name: 'Courier Monospace' },
];

const QUICK_PRESETS = [
  { top: 'ONE DOES NOT SIMPLY', bottom: 'BUILD A BETTER IMAGE APP' },
  { top: 'I DON\'T ALWAYS EDIT PHOTOS', bottom: 'BUT WHEN I DO, I USE THIS TOOL' },
  { top: 'WHAT IF I TOLD YOU', bottom: 'ALL CONVERSIONS ARE 100% PRIVATE' },
  { top: 'KEEP CALM AND', bottom: 'GENERATE MEMES' },
];

export const MemeTool: React.FC = () => {
  const { file, url, setImage, pushHistory, history } = useImageStore();

  const [topText, setTopText] = useState<string>('TOP TEXT CAPTION');
  const [bottomText, setBottomText] = useState<string>('BOTTOM TEXT CAPTION');
  const [fontFamily, setFontFamily] = useState<string>('Impact, sans-serif');
  const [fontSize, setFontSize] = useState<number>(85); // 30 - 180
  const [textColor, setTextColor] = useState<string>('#ffffff');
  const [strokeColor, setStrokeColor] = useState<string>('#000000');
  const [strokeWidth, setStrokeWidth] = useState<number>(18); // 0 - 30
  const [allCaps, setAllCaps] = useState<boolean>(true);
  const [topOffset, setTopOffset] = useState<number>(25); // px
  const [bottomOffset, setBottomOffset] = useState<number>(25); // px
  const [outputFormat, setOutputFormat] = useState<string>('jpg');

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [result, setResult] = useState<ProcessedResult | null>(null);

  if (!url || !file) return null;

  const handleRenderMeme = async () => {
    setIsProcessing(true);
    setResult(null);

    const options: MemeOptions = {
      topText,
      bottomText,
      fontFamily,
      fontSize,
      textColor,
      strokeColor,
      strokeWidth,
      allCaps,
      topOffset,
      bottomOffset,
    };

    try {
      const res = await generateMemeImage(url, options, outputFormat, 0.92, file.name);
      setResult(res);
      toast.success('Meme generated successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate meme image.');
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
        await pushHistory(newFile, 'Added Meme Captions');
      } else {
        await setImage(newFile, 'Added Meme Captions');
      }
      setResult(null);
      toast.success('Updated active studio image in history stack!');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Smile className="w-5 h-5 text-amber-500" />
          Image Meme & Caption Studio
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Add classic top and bottom impact text captions, custom fonts, outline stroke colors, and all-caps styling to create viral memes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Meme Config Controls (7 Cols) */}
        <div className="lg:col-span-7 space-y-5 bg-gray-50 dark:bg-gray-800/40 p-5 rounded-2xl border border-gray-200/80 dark:border-gray-800">
          {/* Quick Preset Buttons */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 block">
              Quick Classic Preset Ideas
            </span>
            <div className="flex flex-wrap gap-2">
              {QUICK_PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setTopText(p.top);
                    setBottomText(p.bottom);
                    setResult(null);
                  }}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-amber-500/80 hover:text-amber-600 transition-colors cursor-pointer"
                >
                  "{p.top.substring(0, 15)}..."
                </button>
              ))}
            </div>
          </div>

          {/* Text Inputs */}
          <div className="space-y-4 pt-2 border-t border-gray-200 dark:border-gray-700">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                Top Impact Caption
              </label>
              <input
                type="text"
                value={topText}
                onChange={(e) => {
                  setTopText(e.target.value);
                  setResult(null);
                }}
                placeholder="TOP CAPTION GOES HERE"
                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                Bottom Impact Caption
              </label>
              <input
                type="text"
                value={bottomText}
                onChange={(e) => {
                  setBottomText(e.target.value);
                  setResult(null);
                }}
                placeholder="BOTTOM CAPTION GOES HERE"
                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Typography Styling Grid */}
          <div className="space-y-4 pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Font Typography
                </label>
                <select
                  value={fontFamily}
                  onChange={(e) => {
                    setFontFamily(e.target.value);
                    setResult(null);
                  }}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-xs font-semibold text-gray-800 dark:text-gray-200"
                >
                  {MEME_FONTS.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-800 dark:text-gray-200">
                  <input
                    type="checkbox"
                    checked={allCaps}
                    onChange={(e) => {
                      setAllCaps(e.target.checked);
                      setResult(null);
                    }}
                    className="w-4 h-4 rounded-xs text-amber-600 accent-amber-600 cursor-pointer"
                  />
                  FORCE ALL-CAPS TEXT
                </label>
              </div>
            </div>

            {/* Colors */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Text Fill Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => {
                      setTextColor(e.target.value);
                      setResult(null);
                    }}
                    className="w-9 h-9 rounded-lg border border-gray-300 dark:border-gray-700 cursor-pointer p-0.5 bg-white dark:bg-gray-800"
                  />
                  <span className="text-xs font-mono font-medium text-gray-700 dark:text-gray-300 uppercase">
                    {textColor}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Outline Stroke Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={strokeColor}
                    onChange={(e) => {
                      setStrokeColor(e.target.value);
                      setResult(null);
                    }}
                    className="w-9 h-9 rounded-lg border border-gray-300 dark:border-gray-700 cursor-pointer p-0.5 bg-white dark:bg-gray-800"
                  />
                  <span className="text-xs font-mono font-medium text-gray-700 dark:text-gray-300 uppercase">
                    {strokeColor}
                  </span>
                </div>
              </div>
            </div>

            {/* Size & Outline Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-gray-700 dark:text-gray-300">Font Scale Size</span>
                  <span className="font-mono text-amber-600 font-bold">{fontSize}</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="160"
                  value={fontSize}
                  onChange={(e) => {
                    setFontSize(parseInt(e.target.value));
                    setResult(null);
                  }}
                  className="w-full accent-amber-500"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-gray-700 dark:text-gray-300">Outline Stroke Thickness</span>
                  <span className="font-mono text-amber-600 font-bold">{strokeWidth}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={strokeWidth}
                  onChange={(e) => {
                    setStrokeWidth(parseInt(e.target.value));
                    setResult(null);
                  }}
                  className="w-full accent-amber-500"
                />
              </div>
            </div>

            {/* Position Offsets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-gray-700 dark:text-gray-300">Top Padding Margin</span>
                  <span className="font-mono text-amber-600 font-bold">{topOffset}px</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={topOffset}
                  onChange={(e) => {
                    setTopOffset(parseInt(e.target.value));
                    setResult(null);
                  }}
                  className="w-full accent-amber-500"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-gray-700 dark:text-gray-300">Bottom Padding Margin</span>
                  <span className="font-mono text-amber-600 font-bold">{bottomOffset}px</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={bottomOffset}
                  onChange={(e) => {
                    setBottomOffset(parseInt(e.target.value));
                    setResult(null);
                  }}
                  className="w-full accent-amber-500"
                />
              </div>
            </div>

            {/* Output Format Picker */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Export Format
              </label>
              <div className="flex items-center gap-2 max-w-xs">
                {['jpg', 'png', 'webp'].map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => setOutputFormat(fmt)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold uppercase cursor-pointer ${
                      outputFormat === fmt
                        ? 'bg-amber-500 text-white shadow-xs'
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

        {/* Right Column: Source Image Canvas Stage (5 Cols) */}
        <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 block">
              Active Studio Canvas
            </span>
            <div className="relative rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-950/5 dark:bg-gray-950/40 p-4 min-h-[300px] flex items-center justify-center overflow-hidden checkerboard">
              <img
                src={url}
                alt="Meme Source"
                className="max-h-[300px] w-auto object-contain rounded-lg shadow-sm"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleRenderMeme}
            disabled={isProcessing}
            className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Rendering Meme...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Render & Generate Meme
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
              Meme Rendered Successfully!
            </div>
            <div className="text-xs text-gray-500 font-mono">
              {(result.sizeBytes / 1024 / 1024).toFixed(2)} MB
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-5 pt-1">
            <div className="relative checkerboard rounded-xl border border-gray-300 dark:border-gray-700 p-2 overflow-hidden flex-shrink-0">
              <img
                src={result.url}
                alt="Meme Output"
                className="max-h-56 w-auto object-contain rounded-lg"
              />
            </div>

            <div className="space-y-3 w-full">
              <div>
                <p className="font-bold text-gray-900 dark:text-gray-100 text-sm">{result.filename}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Dimensions: {result.width} × {result.height} px
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Download Meme Image
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
