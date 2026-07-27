import React, { useState, useEffect } from 'react';
import { useImageStore } from '../../store/imageStore';
import { inspectImageExif, stripExifMetadata, ImageExifInfo, ProcessedResult, downloadBlob } from '../../lib/imageUtils';
import { SendToMenu } from '../shared/SendToMenu';
import { ShieldCheck, Download, RefreshCw, Check, ArrowRight, ShieldAlert, FileText, Camera, MapPin, Eye, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export const ExifTool: React.FC = () => {
  const { file, url, setImage, pushHistory, history } = useImageStore();

  const [exifInfo, setExifInfo] = useState<ImageExifInfo | null>(null);
  const [outputFormat, setOutputFormat] = useState<string>('png');
  const [isStripping, setIsStripping] = useState<boolean>(false);
  const [result, setResult] = useState<ProcessedResult | null>(null);

  useEffect(() => {
    if (file && url) {
      inspectImageExif(file, url).then((info) => {
        setExifInfo(info);
      });
    }
  }, [file, url]);

  if (!url || !file) return null;

  const handleStripExif = async () => {
    setIsStripping(true);
    setResult(null);

    try {
      const res = await stripExifMetadata(url, outputFormat, 0.95, file.name);
      setResult(res);
      toast.success('Successfully stripped all EXIF tags, GPS coordinates & camera metadata!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to sanitize image metadata.');
    } finally {
      setIsStripping(false);
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
        await pushHistory(newFile, 'Stripped EXIF & Metadata');
      } else {
        await setImage(newFile, 'Stripped EXIF & Metadata');
      }
      setResult(null);
      toast.success('Updated active studio image in history stack!');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          EXIF Metadata Inspector & Privacy Cleaner
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Inspect embedded image technical properties and scrub hidden EXIF data, camera hardware serials, and GPS location tags prior to sharing online.
        </p>
      </div>

      {/* EXIF Data Report Grid */}
      {exifInfo && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200/80 dark:border-gray-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">
              <FileText className="w-4 h-4 text-blue-500" />
              File & Format Info
            </div>
            <div className="space-y-1 text-xs">
              <p className="text-gray-900 dark:text-gray-100 font-semibold truncate">{exifInfo.filename}</p>
              <p className="text-gray-500 dark:text-gray-400">Type: <span className="font-mono text-gray-800 dark:text-gray-200">{exifInfo.mimeType}</span></p>
              <p className="text-gray-500 dark:text-gray-400">Size: <span className="font-mono text-gray-800 dark:text-gray-200">{(exifInfo.sizeBytes / 1024 / 1024).toFixed(2)} MB ({Math.round(exifInfo.sizeBytes / 1024)} KB)</span></p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200/80 dark:border-gray-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">
              <Camera className="w-4 h-4 text-indigo-500" />
              Dimensions & Quality
            </div>
            <div className="space-y-1 text-xs">
              <p className="text-gray-900 dark:text-gray-100 font-semibold">{exifInfo.width} × {exifInfo.height} px</p>
              <p className="text-gray-500 dark:text-gray-400">Aspect Ratio: <span className="font-mono text-gray-800 dark:text-gray-200">{exifInfo.aspectRatio}</span></p>
              <p className="text-gray-500 dark:text-gray-400">Resolution: <span className="font-mono text-gray-800 dark:text-gray-200">{exifInfo.megapixels} Megapixels</span></p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200/80 dark:border-gray-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">
              <MapPin className="w-4 h-4 text-amber-500" />
              Privacy & EXIF Tags
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-1.5 font-bold">
                {exifInfo.hasExifMetadata ? (
                  <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" /> EXIF Metadata Detected
                  </span>
                ) : (
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Clean / No Standard EXIF
                  </span>
                )}
              </div>
              <p className="text-gray-500 dark:text-gray-400">Color Space: <span className="font-mono text-gray-800 dark:text-gray-200">{exifInfo.estimatedColorDepth}</span></p>
              <p className="text-gray-500 dark:text-gray-400">Alpha Transparency: <span className="font-mono text-gray-800 dark:text-gray-200">{exifInfo.hasAlphaChannel ? 'Yes' : 'No'}</span></p>
            </div>
          </div>
        </div>
      )}

      {/* Scrub Action Card */}
      <div className="p-5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/70 dark:border-blue-900/50 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              1-Click Privacy Sanitizer
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
              Exports a pristine version of your image with all EXIF header metadata, GPS location coordinates, lens tags, and thumbnail payloads completely removed.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Format:</span>
            {['png', 'webp', 'jpg'].map((fmt) => (
              <button
                key={fmt}
                type="button"
                onClick={() => setOutputFormat(fmt)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase cursor-pointer transition-colors ${
                  outputFormat === fmt
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                }`}
              >
                {fmt}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={handleStripExif}
          disabled={isStripping}
          className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isStripping ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Sanitizing Metadata...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Sanitize & Strip All EXIF/GPS Metadata
            </>
          )}
        </button>
      </div>

      {/* Processed Result Output */}
      {result && (
        <div className="p-6 rounded-2xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-4">
          <div className="flex items-center justify-between border-b border-emerald-200/60 dark:border-emerald-900/60 pb-3">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-base">
              <Check className="w-5 h-5" />
              Privacy Sanitization Complete!
            </div>
            <div className="text-xs text-gray-500 font-mono">
              {(result.sizeBytes / 1024 / 1024).toFixed(2)} MB
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-5 pt-1">
            <div className="relative checkerboard rounded-xl border border-gray-300 dark:border-gray-700 p-2 overflow-hidden flex-shrink-0">
              <img
                src={result.url}
                alt="Sanitized Result"
                className="max-h-48 w-auto object-contain rounded-lg"
              />
            </div>

            <div className="space-y-3 w-full">
              <div>
                <p className="font-bold text-gray-900 dark:text-gray-100 text-sm">{result.filename}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Dimensions: {result.width} × {result.height} px • EXIF/GPS Tags: <span className="font-bold text-emerald-600 dark:text-emerald-400">SCRUBBED CLEAN</span>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Download Sanitized Image
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
