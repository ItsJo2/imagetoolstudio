import React, { useState, useRef } from 'react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { useImageStore } from '../../store/imageStore';
import { getCroppedImg, downloadBlob, ProcessedResult } from '../../lib/imageUtils';
import { SendToMenu } from '../shared/SendToMenu';
import { Crop as CropIcon, RotateCcw, RotateCw, FlipHorizontal, FlipVertical, Download, ArrowRight, RefreshCw, Check } from 'lucide-react';
import { toast } from 'sonner';

const ASPECT_PRESETS = [
  { name: 'Freehand', value: undefined },
  { name: '1:1 Square', value: 1 },
  { name: '16:9 Widescreen', value: 16 / 9 },
  { name: '9:16 Story/Reels', value: 9 / 16 },
  { name: '4:3 Standard', value: 4 / 3 },
  { name: '3:2 Photo', value: 3 / 2 },
];

export const CropTool: React.FC = () => {
  const { file, url, format: currentFormat, setImage, pushHistory, history } = useImageStore();

  const imgRef = useRef<HTMLImageElement | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [aspect, setAspect] = useState<number | undefined>(undefined);
  const [rotation, setRotation] = useState<number>(0);
  const [flip, setFlip] = useState<{ horizontal: boolean; vertical: boolean }>({
    horizontal: false,
    vertical: false,
  });
  const [outputFormat, setOutputFormat] = useState<string>('png');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [result, setResult] = useState<ProcessedResult | null>(null);

  if (!url || !file) return null;

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    if (aspect) {
      setCrop(centerCrop(makeAspectCrop({ unit: '%', width: 90 }, aspect, width, height), width, height));
    } else {
      setCrop({ unit: '%', width: 90, height: 90, x: 5, y: 5 });
    }
  };

  const handleAspectChange = (newAspect?: number) => {
    setAspect(newAspect);
    if (imgRef.current && newAspect) {
      const { width, height } = imgRef.current;
      setCrop(centerCrop(makeAspectCrop({ unit: '%', width: 80 }, newAspect, width, height), width, height));
    }
    setResult(null);
  };

  const handleCropAction = async () => {
    if (!imgRef.current || !completedCrop) {
      toast.error('Please drag to select a crop area on the image.');
      return;
    }

    setIsProcessing(true);
    try {
      // Calculate true natural scale coordinates
      const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
      const scaleY = imgRef.current.naturalHeight / imgRef.current.height;

      const pixelCrop = {
        x: completedCrop.x * scaleX,
        y: completedCrop.y * scaleY,
        width: completedCrop.width * scaleX,
        height: completedCrop.height * scaleY,
      };

      const res = await getCroppedImg(
        imgRef.current,
        pixelCrop,
        rotation,
        flip,
        outputFormat,
        0.95,
        file.name
      );

      setResult(res);
      toast.success('Image cropped successfully!');
    } catch (err) {
      toast.error('Failed to crop image.');
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
        await pushHistory(newFile, 'Cropped & Rotated');
      } else {
        await setImage(newFile, 'Cropped & Rotated');
      }
      setResult(null);
      toast.success('Updated current image in history stack!');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <CropIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          Crop & Rotate Image
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Adjust crop handles, select aspect ratio presets, or rotate and flip your image.
        </p>
      </div>

      {/* Preset Controls */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Aspect Ratio Presets
        </label>
        <div className="flex flex-wrap gap-2">
          {ASPECT_PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => handleAspectChange(preset.value)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                aspect === preset.value
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100'
              }`}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Rotation & Flip Controls */}
      <div className="flex flex-wrap items-center gap-3 pt-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">
          Transform:
        </span>
        <button
          type="button"
          onClick={() => {
            setRotation((r) => (r - 90) % 360);
            setResult(null);
          }}
          className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" /> -90°
        </button>
        <button
          type="button"
          onClick={() => {
            setRotation((r) => (r + 90) % 360);
            setResult(null);
          }}
          className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <RotateCw className="w-3.5 h-3.5" /> +90°
        </button>
        <button
          type="button"
          onClick={() => {
            setFlip((f) => ({ ...f, horizontal: !f.horizontal }));
            setResult(null);
          }}
          className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
            flip.horizontal
              ? 'bg-blue-50 dark:bg-blue-950 text-blue-600 border-blue-500'
              : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100'
          }`}
        >
          <FlipHorizontal className="w-3.5 h-3.5" /> Flip Horiz
        </button>
        <button
          type="button"
          onClick={() => {
            setFlip((f) => ({ ...f, vertical: !f.vertical }));
            setResult(null);
          }}
          className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
            flip.vertical
              ? 'bg-blue-50 dark:bg-blue-950 text-blue-600 border-blue-500'
              : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100'
          }`}
        >
          <FlipVertical className="w-3.5 h-3.5" /> Flip Vert
        </button>
      </div>

      {/* Crop Workspace Stage */}
      <div className="flex justify-center items-center checkerboard p-4 rounded-xl border border-gray-200 dark:border-gray-800 overflow-auto max-h-[480px]">
        <ReactCrop
          crop={crop}
          onChange={(_, percentCrop) => setCrop(percentCrop)}
          onComplete={(c) => setCompletedCrop(c)}
          aspect={aspect}
          className="max-w-full"
        >
          <img
            ref={imgRef}
            src={url}
            alt="Crop area"
            onLoad={onImageLoad}
            style={{
              transform: `scaleX(${flip.horizontal ? -1 : 1}) scaleY(${flip.vertical ? -1 : 1}) rotate(${rotation}deg)`,
              transition: 'transform 0.2s ease',
            }}
            className="max-h-[400px] w-auto object-contain rounded"
          />
        </ReactCrop>
      </div>

      {/* Output Format and Crop Trigger */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Output Format:
          </label>
          <select
            value={outputFormat}
            onChange={(e) => setOutputFormat(e.target.value)}
            className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium"
          >
            <option value="png">PNG</option>
            <option value="jpg">JPG</option>
            <option value="webp">WebP</option>
          </select>
        </div>

        <button
          type="button"
          onClick={handleCropAction}
          disabled={isProcessing}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Processing Crop...
            </>
          ) : (
            <>
              <CropIcon className="w-4 h-4" />
              Apply Crop & Export
            </>
          )}
        </button>
      </div>

      {/* Cropped Output Result */}
      {result && (
        <div className="mt-6 p-4 rounded-xl border border-green-200 dark:border-green-900/40 bg-green-50/50 dark:bg-green-950/20 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-semibold text-sm">
              <Check className="w-5 h-5" />
              Crop Successful!
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
              {result.width} × {result.height} px • {(result.sizeBytes / 1024).toFixed(1)} KB
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
            <img
              src={result.url}
              alt="Cropped Result"
              className="max-h-40 w-auto rounded-lg border border-gray-200 dark:border-gray-700 checkerboard object-contain shadow-sm"
            />
            <div className="space-y-2 text-sm w-full">
              <p className="font-medium text-gray-900 dark:text-gray-100">{result.filename}</p>
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg text-sm shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Download Cropped Image
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
