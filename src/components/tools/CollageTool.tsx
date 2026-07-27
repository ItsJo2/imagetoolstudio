import React, { useState, useEffect } from 'react';
import { useImageStore } from '../../store/imageStore';
import { generateCollageGrid, CollageOptions, ProcessedResult, downloadBlob, createManagedObjectURL } from '../../lib/imageUtils';
import { SendToMenu } from '../shared/SendToMenu';
import { LayoutGrid, Download, RefreshCw, Check, ArrowRight, Sparkles, Plus, Trash2, Layers, Sliders, Palette, MoveUp, MoveDown, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

export interface CollageItem {
  id: string;
  url: string;
  name: string;
  file?: File | null;
}

const LAYOUT_PRESETS = [
  { id: '2-horizontal', name: '2 Columns Side-by-Side', requiredCells: 2, icon: '2H' },
  { id: '2-vertical', name: '2 Rows Stacked', requiredCells: 2, icon: '2V' },
  { id: '2x2-grid', name: '2x2 Quad Grid', requiredCells: 4, icon: '2x2' },
  { id: '1-large-2-small', name: 'Hero + 2 Small Split', requiredCells: 3, icon: '1+2' },
  { id: '3-horizontal', name: '3 Columns Row', requiredCells: 3, icon: '3H' },
  { id: '3-vertical', name: '3 Rows Stacked', requiredCells: 3, icon: '3V' },
  { id: '3x3-grid', name: '3x3 Grid Matrix (9 Cells)', requiredCells: 9, icon: '3x3' },
];

const ASPECT_RATIOS = [
  { id: '1:1', label: '1:1 Square' },
  { id: '4:3', label: '4:3 Standard' },
  { id: '16:9', label: '16:9 Landscape' },
  { id: '9:16', label: '9:16 Story / Reel' },
  { id: '3:2', label: '3:2 Classic Photo' },
];

export const CollageTool: React.FC = () => {
  const { file: storeFile, url: storeUrl, setImage, pushHistory, history } = useImageStore();

  const [photos, setPhotos] = useState<CollageItem[]>([]);
  const [layout, setLayout] = useState<CollageOptions['layout']>('2-horizontal');
  const [aspectRatio, setAspectRatio] = useState<CollageOptions['aspectRatio']>('1:1');
  const [gap, setGap] = useState<number>(20); // px
  const [padding, setPadding] = useState<number>(20); // px
  const [borderRadius, setBorderRadius] = useState<number>(16); // px
  const [bgColor, setBgColor] = useState<string>('#ffffff');
  const [fitMode, setFitMode] = useState<'cover' | 'contain'>('cover');
  const [outputFormat, setOutputFormat] = useState<string>('png');

  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [result, setResult] = useState<ProcessedResult | null>(null);

  // Auto-seed active image into photos list if empty
  useEffect(() => {
    if (storeUrl && photos.length === 0) {
      setPhotos([
        {
          id: 'initial_store_image',
          url: storeUrl,
          name: storeFile?.name || 'Active Photo 1',
          file: storeFile,
        },
      ]);
    }
  }, [storeUrl, storeFile]);

  const handleAddPhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const newFiles = Array.from(e.target.files);
    const newItems: CollageItem[] = newFiles.map((fileItem: File, i: number) => ({
      id: `photo_${Date.now()}_${i}`,
      url: createManagedObjectURL(fileItem),
      name: fileItem.name,
      file: fileItem,
    }));

    setPhotos((prev) => [...prev, ...newItems]);
    setResult(null);
    toast.success(`Added ${newItems.length} photo${newItems.length > 1 ? 's' : ''}`);
    e.target.value = '';
  };

  const handleRemovePhoto = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
    setResult(null);
    toast.info('Photo removed from collage.');
  };

  const handleMovePhoto = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === photos.length - 1)) {
      return;
    }
    const newPhotos = [...photos];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const temp = newPhotos[index];
    newPhotos[index] = newPhotos[targetIdx];
    newPhotos[targetIdx] = temp;
    setPhotos(newPhotos);
    setResult(null);
  };

  const handleRenderCollage = async () => {
    if (photos.length === 0) {
      toast.error('Please add at least 1 image to build a collage.');
      return;
    }

    setIsRendering(true);
    setResult(null);

    const imageUrls = photos.map((p) => p.url);

    const options: CollageOptions = {
      layout,
      aspectRatio,
      gap,
      padding,
      borderRadius,
      bgColor,
      fitMode,
    };

    try {
      const res = await generateCollageGrid(imageUrls, options, outputFormat, 0.95);
      setResult(res);
      toast.success('Collage grid rendered successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to render collage grid.');
    } finally {
      setIsRendering(false);
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
        await pushHistory(newFile, 'Rendered Collage Grid');
      } else {
        await setImage(newFile, 'Rendered Collage Grid');
      }
      setResult(null);
      toast.success('Updated active studio image in history stack!');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <LayoutGrid className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          Photo Collage & Grid Builder
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Combine multiple photos into customizable side-by-side grids, quad matrices, or hero split layouts with gap padding, border radius, and aspect ratio controls.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Layout & Photo Controls (7 Cols) */}
        <div className="lg:col-span-7 space-y-5 bg-gray-50 dark:bg-gray-800/40 p-5 rounded-2xl border border-gray-200/80 dark:border-gray-800">
          {/* Photo Sources Header & Upload */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-indigo-500" />
                Collage Photos ({photos.length})
              </label>

              <label className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs">
                <Plus className="w-4 h-4" />
                Add More Photos
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleAddPhotos}
                  className="hidden"
                />
              </label>
            </div>

            {/* Photo Thumbnails List */}
            {photos.length === 0 ? (
              <div className="p-6 text-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 space-y-2">
                <p className="text-xs font-medium text-gray-500">No photos added yet.</p>
                <label className="inline-flex px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold text-xs rounded-lg cursor-pointer">
                  Choose Photo Files
                  <input type="file" multiple accept="image/*" onChange={handleAddPhotos} className="hidden" />
                </label>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-52 overflow-y-auto p-1">
                {photos.map((photo, idx) => (
                  <div
                    key={photo.id}
                    className="relative group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-2 flex items-center gap-2 shadow-2xs"
                  >
                    <img
                      src={photo.url}
                      alt={photo.name}
                      className="w-10 h-10 rounded-lg object-cover checkerboard border border-gray-200 dark:border-gray-700 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">
                        #{idx + 1} {photo.name}
                      </p>
                    </div>

                    <div className="flex flex-col gap-0.5">
                      <button
                        type="button"
                        onClick={() => handleMovePhoto(idx, 'up')}
                        disabled={idx === 0}
                        className="p-0.5 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 rounded cursor-pointer disabled:opacity-20"
                        title="Move Up"
                      >
                        <MoveUp className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMovePhoto(idx, 'down')}
                        disabled={idx === photos.length - 1}
                        className="p-0.5 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 rounded cursor-pointer disabled:opacity-20"
                        title="Move Down"
                      >
                        <MoveDown className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(photo.id)}
                      className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                      title="Remove Photo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Grid Layout Presets */}
          <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              Select Grid Layout Style
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {LAYOUT_PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setLayout(p.id as CollageOptions['layout']);
                    setResult(null);
                  }}
                  className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                    layout === p.id
                      ? 'border-indigo-600 bg-indigo-600 text-white shadow-xs'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">{p.name}</span>
                    <span className="text-[10px] font-mono opacity-80">{p.icon}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Aspect Ratio & Canvas Controls */}
          <div className="space-y-4 pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Output Aspect Ratio
                </label>
                <select
                  value={aspectRatio}
                  onChange={(e) => {
                    setAspectRatio(e.target.value as CollageOptions['aspectRatio']);
                    setResult(null);
                  }}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-xs font-semibold text-gray-800 dark:text-gray-200"
                >
                  {ASPECT_RATIOS.map((ar) => (
                    <option key={ar.id} value={ar.id}>
                      {ar.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Cell Image Fit Mode
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFitMode('cover');
                      setResult(null);
                    }}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold cursor-pointer ${
                      fitMode === 'cover'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    Fill / Cover
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFitMode('contain');
                      setResult(null);
                    }}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold cursor-pointer ${
                      fitMode === 'contain'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    Full Fit
                  </button>
                </div>
              </div>
            </div>

            {/* Gap, Padding, Border Radius Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-gray-700 dark:text-gray-300">Cell Gap</span>
                  <span className="font-mono text-indigo-600 font-bold">{gap}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="60"
                  value={gap}
                  onChange={(e) => {
                    setGap(parseInt(e.target.value));
                    setResult(null);
                  }}
                  className="w-full accent-indigo-600"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-gray-700 dark:text-gray-300">Outer Margin</span>
                  <span className="font-mono text-indigo-600 font-bold">{padding}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="60"
                  value={padding}
                  onChange={(e) => {
                    setPadding(parseInt(e.target.value));
                    setResult(null);
                  }}
                  className="w-full accent-indigo-600"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-gray-700 dark:text-gray-300">Corner Radius</span>
                  <span className="font-mono text-indigo-600 font-bold">{borderRadius}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  value={borderRadius}
                  onChange={(e) => {
                    setBorderRadius(parseInt(e.target.value));
                    setResult(null);
                  }}
                  className="w-full accent-indigo-600"
                />
              </div>
            </div>

            {/* Background Color & Format Picker */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Canvas Background Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={bgColor === 'transparent' ? '#ffffff' : bgColor}
                    onChange={(e) => {
                      setBgColor(e.target.value);
                      setResult(null);
                    }}
                    className="w-9 h-9 rounded-lg border border-gray-300 dark:border-gray-700 cursor-pointer p-0.5 bg-white dark:bg-gray-800"
                  />
                  <span className="text-xs font-mono font-medium text-gray-700 dark:text-gray-300 uppercase">
                    {bgColor}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setBgColor('transparent');
                      setResult(null);
                    }}
                    className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-[11px] font-bold rounded cursor-pointer"
                  >
                    Transparent
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Export Format
                </label>
                <div className="flex items-center gap-2">
                  {['png', 'jpg', 'webp'].map((fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => setOutputFormat(fmt)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold uppercase cursor-pointer ${
                        outputFormat === fmt
                          ? 'bg-indigo-600 text-white shadow-xs'
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
        </div>

        {/* Right Column: Stage & Render Action (5 Cols) */}
        <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 block">
              Collage Stage Preview
            </span>
            <div className="relative rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-950/5 dark:bg-gray-950/40 p-4 min-h-[300px] flex items-center justify-center overflow-hidden checkerboard">
              {photos.length > 0 ? (
                <div className="grid grid-cols-2 gap-2 w-full max-w-xs">
                  {photos.slice(0, 4).map((p, i) => (
                    <img
                      key={p.id}
                      src={p.url}
                      alt={`Thumb ${i}`}
                      className="w-full h-24 object-cover rounded-xl shadow-xs border border-gray-300 dark:border-gray-700"
                    />
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400">Add photos to preview grid stage</p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleRenderCollage}
            disabled={isRendering || photos.length === 0}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isRendering ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Building Photo Collage...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Render & Generate Collage
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
              Photo Collage Rendered Successfully!
            </div>
            <div className="text-xs text-gray-500 font-mono">
              {(result.sizeBytes / 1024 / 1024).toFixed(2)} MB
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-5 pt-1">
            <div className="relative checkerboard rounded-xl border border-gray-300 dark:border-gray-700 p-2 overflow-hidden flex-shrink-0">
              <img
                src={result.url}
                alt="Collage Output"
                className="max-h-56 w-auto object-contain rounded-lg"
              />
            </div>

            <div className="space-y-3 w-full">
              <div>
                <p className="font-bold text-gray-900 dark:text-gray-100 text-sm">{result.filename}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Dimensions: {result.width} × {result.height} px • Aspect: {aspectRatio}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Download Collage Image
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
