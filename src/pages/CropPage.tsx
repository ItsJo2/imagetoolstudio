import React from 'react';
import { useImageStore } from '../store/imageStore';
import { CropTool } from '../components/tools/CropTool';
import { Dropzone } from '../components/shared/Dropzone';
import { SEO } from '../components/shared/SEO';
import { Crop, X } from 'lucide-react';
import { toast } from 'sonner';

export function CropPage() {
  const { file, url, width, height, format, setImage, clearImage } = useImageStore();

  const handleDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    await setImage(acceptedFiles[0]);
    toast.success(`${acceptedFiles[0].name} loaded for cropping!`);
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
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
          <Crop className="w-4 h-4" />
          <span>Smart Image Crop & Rotate Service</span>
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">
          Crop, Rotate & Flip Images
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Precisely trim images with predefined aspect ratios (Square 1:1, Instagram 4:5, Landscape 16:9), freehand bounding boxes, 90° rotations, and horizontal/vertical flipping.
        </p>
      </div>

      {!url ? (
        <div className="space-y-8 my-4">
          <Dropzone onDrop={handleDrop} className="max-w-2xl mx-auto shadow-sm" />

          {/* Service Feature Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <div className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-center space-y-1">
              <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100">Preset Ratios</h4>
              <p className="text-xs text-gray-500">1:1 Square, 16:9 HD, 4:3 Photo, 4:5 Portrait Social.</p>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-center space-y-1">
              <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100">Lossless Transformations</h4>
              <p className="text-xs text-gray-500">Rotate in 90° increments and flip horizontally/vertically without quality loss.</p>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-center space-y-1">
              <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100">Interactive Canvas</h4>
              <p className="text-xs text-gray-500">Drag handles to adjust the crop box with live pixel dimension counters.</p>
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

          {/* Crop Tool Engine */}
          <CropTool />
        </div>
      )}
    </div>
  );
}
