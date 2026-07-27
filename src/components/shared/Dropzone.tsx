import React from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image as ImageIcon, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';
import { createSampleImageFile } from '../../lib/sampleImages';

interface DropzoneProps {
  onDrop: (acceptedFiles: File[]) => void;
  className?: string;
  maxSize?: number; // bytes
  multiple?: boolean;
}

export const Dropzone: React.FC<DropzoneProps> = ({
  onDrop,
  className,
  maxSize = 1024 * 1024 * 1024, // 1GB default
  multiple = true,
}) => {
  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.avif', '.gif', '.svg', '.bmp', '.tiff'],
    },
    maxSize,
    multiple,
  } as any);

  const handleSampleClick = async (e: React.MouseEvent, type: 'landscape' | 'graphic') => {
    e.stopPropagation();
    const sample = await createSampleImageFile(type);
    onDrop([sample]);
  };

  return (
    <div
      {...getRootProps()}
      className={cn(
        'border-2 border-dashed rounded-2xl p-8 md:p-12 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center bg-white dark:bg-gray-900 shadow-sm relative overflow-hidden group',
        isDragActive && !isDragReject
          ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 scale-[0.99]'
          : isDragReject
          ? 'border-red-500 bg-red-50/50 dark:bg-red-950/20'
          : 'border-gray-300 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-gray-50/80 dark:hover:bg-gray-800/40',
        className
      )}
    >
      <input {...getInputProps()} />

      <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4 shadow-sm border border-blue-100 dark:border-blue-900/50 group-hover:scale-105 transition-transform duration-200">
        {isDragActive ? (
          <Upload className="w-8 h-8 animate-bounce text-blue-600 dark:text-blue-400" />
        ) : (
          <ImageIcon className="w-8 h-8" />
        )}
      </div>

      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
        {isDragActive
          ? 'Drop your image here to load...'
          : 'Drag & drop image here, or click to browse'}
      </h3>

      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-md">
        Supports PNG, JPG, WebP, AVIF, GIF, SVG, BMP, and TIFF up to 1GB. All processing runs privately in your browser.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors cursor-pointer"
        >
          Select Image
        </button>

        <div className="flex items-center gap-2 pt-2 sm:pt-0">
          <span className="text-xs text-gray-400 font-medium">Or try demo:</span>
          <button
            type="button"
            onClick={(e) => handleSampleClick(e, 'landscape')}
            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 cursor-pointer border border-gray-200 dark:border-gray-700"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Sunset Photo
          </button>
          <button
            type="button"
            onClick={(e) => handleSampleClick(e, 'graphic')}
            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 cursor-pointer border border-gray-200 dark:border-gray-700"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Graphic Logo
          </button>
        </div>
      </div>
    </div>
  );
};

