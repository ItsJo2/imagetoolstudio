import React from 'react';
import { useImageStore } from '../store/imageStore';
import { ResizeTool } from '../components/tools/ResizeTool';
import { Dropzone } from '../components/shared/Dropzone';
import { SEO } from '../components/shared/SEO';
import { Maximize2, X } from 'lucide-react';
import { toast } from 'sonner';

export function ResizePage() {
  const { file, url, width, height, format, setImage, clearImage } = useImageStore();

  const handleDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    await setImage(acceptedFiles[0]);
    toast.success(`${acceptedFiles[0].name} loaded for resizing!`);
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
        <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
          <Maximize2 className="w-4 h-4" />
          <span>Precision Image Resizer Service</span>
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">
          Resize Image Dimensions
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Resize image width and height by percentages (50%, 75%, 200%) or exact pixel dimensions with aspect ratio locking and algorithm selection (Bicubic High, Bilinear, Nearest Neighbor).
        </p>
      </div>

      {!url ? (
        <div className="space-y-8 my-4">
          <Dropzone onDrop={handleDrop} className="max-w-2xl mx-auto shadow-sm" />

          {/* Service Feature Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <div className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-center space-y-1">
              <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100">Aspect Lock</h4>
              <p className="text-xs text-gray-500">Automatically recalculate height when changing width to prevent stretching.</p>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-center space-y-1">
              <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100">Resampling Algorithms</h4>
              <p className="text-xs text-gray-500">Switch between Bicubic High (smooth photos) and Nearest Neighbor (crisp pixel art).</p>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-center space-y-1">
              <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100">Format & Quality Options</h4>
              <p className="text-xs text-gray-500">Output resized results directly to PNG, WebP, or compressed JPG.</p>
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

          {/* Resize Tool Engine */}
          <ResizeTool />
        </div>
      )}
    </div>
  );
}
