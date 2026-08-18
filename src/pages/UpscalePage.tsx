import React, { useState } from 'react';
import { useImageStore } from '../store/imageStore';
import { UpscaleTool } from '../components/tools/UpscaleTool';
import { UpscaleBatchTool } from '../components/tools/UpscaleBatchTool';
import { Dropzone } from '../components/shared/Dropzone';
import { SEO } from '../components/shared/SEO';
import { Zap, X, Layers, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

export function UpscalePage() {
  const [activeTab, setActiveTab] = useState<'single' | 'batch'>('single');
  const { file, url, width, height, format, setImage, clearImage } = useImageStore();

  const handleDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    await setImage(acceptedFiles[0]);
    toast.success(`${acceptedFiles[0].name} loaded for upscaling!`);
  };

  const handleRemove = () => {
    clearImage();
    toast.info('Image removed.');
  };

  return (
    <div className="space-y-6">
      <SEO />

      {/* Service Header Info */}
      <div className="border-b border-gray-200 dark:border-gray-800 pb-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-500 dark:text-amber-400 mb-1">
          <Zap className="w-4 h-4" />
          <span>Bicubic Image Upscaler & Sharpening Service</span>
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">
          Upscale & Enlarge Images (2x / 4x)
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Enlarge low-resolution or blurry graphics by 200% (2x) or 400% (4x) using sub-pixel interpolation and edge-sharpening filters with split comparison viewer.
        </p>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-3 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab('single')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'single'
              ? 'bg-amber-500 text-white shadow-sm'
              : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
          }`}
        >
          <ImageIcon className="w-4 h-4" /> Single Image Upscaler
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('batch')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'batch'
              ? 'bg-amber-500 text-white shadow-sm'
              : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
          }`}
        >
          <Layers className="w-4 h-4" /> Batch Upscaler (Up to 10 Images)
        </button>
      </div>

      {activeTab === 'batch' ? (
        <UpscaleBatchTool />
      ) : !url ? (
        <div className="space-y-8 my-4">
          <Dropzone onDrop={handleDrop} className="max-w-2xl mx-auto shadow-sm" />

          {/* Service Feature Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <div className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-center space-y-1">
              <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100">2x & 4x Magnification</h4>
              <p className="text-xs text-gray-500">Transform 500px images into crisp 2000px high-definition assets.</p>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-center space-y-1">
              <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100">Sub-Pixel Interpolation</h4>
              <p className="text-xs text-gray-500">Edge sharpening kernel restores clarity without creating pixelated artifacts.</p>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-center space-y-1">
              <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100">Before/After Comparison</h4>
              <p className="text-xs text-gray-500">Interactive slider bar lets you compare original vs upscaled pixels side by side.</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Active Image Metadata Preview Card */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative group flex-shrink-0">
                  <img
                    src={url}
                    alt="Active target"
                    className="w-16 h-16 rounded-xl object-contain checkerboard border border-gray-200 dark:border-gray-700"
                  />
                  <button
                    onClick={handleRemove}
                    type="button"
                    className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-md transition-transform hover:scale-110 cursor-pointer"
                    title="Remove image"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-base truncate max-w-xs sm:max-w-md">
                    {file?.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {width} × {height} px • <span className="uppercase font-medium text-gray-700 dark:text-gray-300">{format}</span> • {((file?.size || 0) / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRemove}
                className="px-3.5 py-1.5 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Upload Different Image
              </button>
            </div>
          </div>

          {/* Upscale Tool Engine */}
          <UpscaleTool />
        </div>
      )}
    </div>
  );
}
