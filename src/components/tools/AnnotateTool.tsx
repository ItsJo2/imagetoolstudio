import React, { useState, useRef, useEffect } from 'react';
import { useImageStore } from '../../store/imageStore';
import { Dropzone } from '../shared/Dropzone';
import { createManagedObjectURL, downloadBlob } from '../../lib/imageUtils';
import {
  PenTool,
  Highlighter,
  ArrowRight,
  Square,
  Circle,
  Type,
  EyeOff,
  Hash,
  Undo2,
  Redo2,
  RotateCcw,
  Download,
  Save,
  Check,
  Sparkles,
  Sliders,
  Palette,
  Move,
  Grid,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from 'lucide-react';
import { toast } from 'sonner';

export type AnnotationToolType =
  | 'pen'
  | 'highlighter'
  | 'arrow'
  | 'rect'
  | 'circle'
  | 'text'
  | 'badge'
  | 'blur'
  | 'pixelate';

export interface AnnotationObject {
  id: string;
  type: AnnotationToolType;
  color: string;
  strokeWidth: number;
  fontSize?: number;
  text?: string;
  badgeNumber?: number;
  // For freehand path / highlighter
  points?: { x: number; y: number }[];
  // For shapes / arrows / blur box
  startX?: number;
  startY?: number;
  endX?: number;
  endY?: number;
  // Blur/pixelate intensity
  intensity?: number;
}

export const AnnotateTool: React.FC = () => {
  const { file, previewUrl, setImage, pushHistory } = useImageStore();

  const [activeTool, setActiveTool] = useState<AnnotationToolType>('arrow');
  const [color, setColor] = useState<string>('#ef4444'); // Default red
  const [strokeWidth, setStrokeWidth] = useState<number>(4);
  const [fontSize, setFontSize] = useState<number>(24);
  const [textInput, setTextInput] = useState<string>('Bug Report');
  const [badgeCounter, setBadgeCounter] = useState<number>(1);
  const [blurIntensity, setBlurIntensity] = useState<number>(12); // Pixelate block size or blur radius
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  const [annotations, setAnnotations] = useState<AnnotationObject[]>([]);
  const [undoStack, setUndoStack] = useState<AnnotationObject[][]>([]);
  const [redoStack, setRedoStack] = useState<AnnotationObject[][]>([]);

  // Current drawing object
  const [currentAnnotation, setCurrentAnnotation] = useState<AnnotationObject | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageObjRef = useRef<HTMLImageElement | null>(null);

  // Load image into HTMLImageElement
  useEffect(() => {
    if (!previewUrl) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageObjRef.current = img;
      redrawCanvas();
    };
    img.src = previewUrl;
  }, [previewUrl]);

  // Push state to undo stack
  const pushState = (newAnnotations: AnnotationObject[]) => {
    setUndoStack((prev) => [...prev, annotations]);
    setRedoStack([]);
    setAnnotations(newAnnotations);
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, prev.length - 1));
    setRedoStack((prev) => [...prev, annotations]);
    setAnnotations(previous);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, prev.length - 1));
    setUndoStack((prev) => [...prev, annotations]);
    setAnnotations(next);
  };

  const handleClearAll = () => {
    if (annotations.length === 0) return;
    pushState([]);
    toast.info('Cleared all canvas annotations.');
  };

  // Redraw complete canvas
  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    const img = imageObjRef.current;
    if (!canvas || !img) return;

    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 1. Draw base image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // 2. Render all completed annotations
    const all = [...annotations];
    if (currentAnnotation) all.push(currentAnnotation);

    all.forEach((item) => {
      renderSingleAnnotation(ctx, item, canvas);
    });
  };

  useEffect(() => {
    redrawCanvas();
  }, [annotations, currentAnnotation]);

  const renderSingleAnnotation = (
    ctx: CanvasRenderingContext2D,
    item: AnnotationObject,
    canvas: HTMLCanvasElement
  ) => {
    ctx.save();

    if (item.type === 'pen') {
      if (item.points && item.points.length > 0) {
        ctx.beginPath();
        ctx.strokeStyle = item.color;
        ctx.lineWidth = item.strokeWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.moveTo(item.points[0].x, item.points[0].y);
        for (let i = 1; i < item.points.length; i++) {
          ctx.lineTo(item.points[i].x, item.points[i].y);
        }
        ctx.stroke();
      }
    } else if (item.type === 'highlighter') {
      if (item.points && item.points.length > 0) {
        ctx.beginPath();
        ctx.globalAlpha = 0.45;
        ctx.strokeStyle = item.color;
        ctx.lineWidth = item.strokeWidth * 3;
        ctx.lineCap = 'square';
        ctx.lineJoin = 'miter';
        ctx.moveTo(item.points[0].x, item.points[0].y);
        for (let i = 1; i < item.points.length; i++) {
          ctx.lineTo(item.points[i].x, item.points[i].y);
        }
        ctx.stroke();
      }
    } else if (item.type === 'arrow') {
      if (item.startX !== undefined && item.startY !== undefined && item.endX !== undefined && item.endY !== undefined) {
        const sx = item.startX;
        const sy = item.startY;
        const ex = item.endX;
        const ey = item.endY;

        const headLength = Math.max(16, item.strokeWidth * 4);
        const angle = Math.atan2(ey - sy, ex - sx);

        // Line
        ctx.beginPath();
        ctx.strokeStyle = item.color;
        ctx.lineWidth = item.strokeWidth;
        ctx.lineCap = 'round';
        ctx.moveTo(sx, sy);
        ctx.lineTo(ex, ey);
        ctx.stroke();

        // Arrow head
        ctx.beginPath();
        ctx.fillStyle = item.color;
        ctx.moveTo(ex, ey);
        ctx.lineTo(
          ex - headLength * Math.cos(angle - Math.PI / 6),
          ey - headLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
          ex - headLength * Math.cos(angle + Math.PI / 6),
          ey - headLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fill();
      }
    } else if (item.type === 'rect') {
      if (item.startX !== undefined && item.startY !== undefined && item.endX !== undefined && item.endY !== undefined) {
        const x = Math.min(item.startX, item.endX);
        const y = Math.min(item.startY, item.endY);
        const w = Math.abs(item.endX - item.startX);
        const h = Math.abs(item.endY - item.startY);

        ctx.strokeStyle = item.color;
        ctx.lineWidth = item.strokeWidth;
        ctx.strokeRect(x, y, w, h);
      }
    } else if (item.type === 'circle') {
      if (item.startX !== undefined && item.startY !== undefined && item.endX !== undefined && item.endY !== undefined) {
        const rx = Math.abs(item.endX - item.startX) / 2;
        const ry = Math.abs(item.endY - item.startY) / 2;
        const cx = Math.min(item.startX, item.endX) + rx;
        const cy = Math.min(item.startY, item.endY) + ry;

        ctx.beginPath();
        ctx.strokeStyle = item.color;
        ctx.lineWidth = item.strokeWidth;
        ctx.ellipse(cx, cy, Math.max(1, rx), Math.max(1, ry), 0, 0, 2 * Math.PI);
        ctx.stroke();
      }
    } else if (item.type === 'text') {
      if (item.startX !== undefined && item.startY !== undefined && item.text) {
        const fontSz = item.fontSize || 24;
        ctx.font = `bold ${fontSz}px system-ui, -apple-system, sans-serif`;

        const metrics = ctx.measureText(item.text);
        const padding = 8;
        const bgWidth = metrics.width + padding * 2;
        const bgHeight = fontSz + padding * 1.5;

        // Draw background badge pill
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.beginPath();
        ctx.roundRect(item.startX - padding, item.startY - fontSz, bgWidth, bgHeight, 6);
        ctx.fill();

        ctx.fillStyle = item.color;
        ctx.textBaseline = 'bottom';
        ctx.fillText(item.text, item.startX, item.startY);
      }
    } else if (item.type === 'badge') {
      if (item.startX !== undefined && item.startY !== undefined) {
        const num = item.badgeNumber || 1;
        const radius = Math.max(18, (item.fontSize || 24) * 0.8);

        // Shadow
        ctx.shadowColor = 'rgba(0,0,0,0.4)';
        ctx.shadowBlur = 8;

        // Circle badge
        ctx.beginPath();
        ctx.fillStyle = item.color;
        ctx.arc(item.startX, item.startY, radius, 0, 2 * Math.PI);
        ctx.fill();

        ctx.shadowColor = 'transparent';

        // White border
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();

        // Number Text
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${Math.round(radius * 1.1)}px system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(num), item.startX, item.startY + 1);
      }
    } else if (item.type === 'pixelate' || item.type === 'blur') {
      if (item.startX !== undefined && item.startY !== undefined && item.endX !== undefined && item.endY !== undefined) {
        const x = Math.min(item.startX, item.endX);
        const y = Math.min(item.startY, item.endY);
        const w = Math.abs(item.endX - item.startX);
        const h = Math.abs(item.endY - item.startY);

        if (w > 2 && h > 2) {
          pixelateRegion(ctx, x, y, w, h, item.intensity || 12);

          // Subtle dashed red security border while selecting or rendering
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 4]);
          ctx.strokeRect(x, y, w, h);
          ctx.setLineDash([]);
        }
      }
    }

    ctx.restore();
  };

  // Pixelate region helper
  const pixelateRegion = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    blockSize: number
  ) => {
    try {
      const imgData = ctx.getImageData(x, y, w, h);
      const data = imgData.data;

      for (let py = 0; py < h; py += blockSize) {
        for (let px = 0; px < w; px += blockSize) {
          // Average color in block
          let rSum = 0,
            gSum = 0,
            bSum = 0,
            count = 0;

          for (let dy = 0; dy < blockSize && py + dy < h; dy++) {
            for (let dx = 0; dx < blockSize && px + dx < w; dx++) {
              const idx = ((py + dy) * w + (px + dx)) * 4;
              rSum += data[idx];
              gSum += data[idx + 1];
              bSum += data[idx + 2];
              count++;
            }
          }

          const rAvg = Math.round(rSum / count);
          const gAvg = Math.round(gSum / count);
          const bAvg = Math.round(bSum / count);

          // Fill block with average color
          for (let dy = 0; dy < blockSize && py + dy < h; dy++) {
            for (let dx = 0; dx < blockSize && px + dx < w; dx++) {
              const idx = ((py + dy) * w + (px + dx)) * 4;
              data[idx] = rAvg;
              data[idx + 1] = gAvg;
              data[idx + 2] = bAvg;
            }
          }
        }
      }

      ctx.putImageData(imgData, x, y);
    } catch (e) {
      console.error('Failed pixelating canvas region', e);
    }
  };

  // Coordinate helper relative to canvas natural size
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!previewUrl) return;

    const coords = getCanvasCoords(e);
    setIsDrawing(true);

    if (activeTool === 'badge') {
      const newBadgeNum = badgeCounter;
      setBadgeCounter((prev) => prev + 1);

      const newObj: AnnotationObject = {
        id: Math.random().toString(36).substring(2, 9),
        type: 'badge',
        color,
        strokeWidth,
        fontSize,
        startX: coords.x,
        startY: coords.y,
        badgeNumber: newBadgeNum,
      };

      pushState([...annotations, newObj]);
      setIsDrawing(false);
      return;
    }

    if (activeTool === 'text') {
      const newObj: AnnotationObject = {
        id: Math.random().toString(36).substring(2, 9),
        type: 'text',
        color,
        strokeWidth,
        fontSize,
        startX: coords.x,
        startY: coords.y,
        text: textInput || 'Callout Label',
      };

      pushState([...annotations, newObj]);
      setIsDrawing(false);
      return;
    }

    // Freehand Pen / Highlighter
    if (activeTool === 'pen' || activeTool === 'highlighter') {
      setCurrentAnnotation({
        id: Math.random().toString(36).substring(2, 9),
        type: activeTool,
        color,
        strokeWidth,
        points: [coords],
      });
      return;
    }

    // Arrow, Shape, Pixelate
    setCurrentAnnotation({
      id: Math.random().toString(36).substring(2, 9),
      type: activeTool,
      color,
      strokeWidth,
      fontSize,
      intensity: blurIntensity,
      startX: coords.x,
      startY: coords.y,
      endX: coords.x,
      endY: coords.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentAnnotation) return;

    const coords = getCanvasCoords(e);

    if (activeTool === 'pen' || activeTool === 'highlighter') {
      setCurrentAnnotation({
        ...currentAnnotation,
        points: [...(currentAnnotation.points || []), coords],
      });
    } else {
      setCurrentAnnotation({
        ...currentAnnotation,
        endX: coords.x,
        endY: coords.y,
      });
    }
  };

  const handleMouseUp = () => {
    if (!isDrawing || !currentAnnotation) return;

    pushState([...annotations, currentAnnotation]);
    setCurrentAnnotation(null);
    setIsDrawing(false);
  };

  // Export & Save Handler
  const handleExportAnnotatedImage = async (format: 'png' | 'jpg' | 'webp' = 'png') => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const mimeType = format === 'jpg' ? 'image/jpeg' : `image/${format}`;

    canvas.toBlob((blob) => {
      if (!blob) {
        toast.error('Failed generating annotated image.');
        return;
      }

      const filename = `annotated_${file?.name || 'image'}.${format}`;
      const exportedFile = new File([blob], filename, { type: mimeType });

      pushHistory(exportedFile, 'Annotated Canvas Image');
      downloadBlob(blob, filename);
      toast.success('Annotated image exported & saved to history!');
    }, mimeType, 0.95);
  };

  const QUICK_COLORS = [
    '#ef4444', // Red
    '#f97316', // Orange
    '#eab308', // Yellow
    '#22c55e', // Green
    '#3b82f6', // Blue
    '#a855f7', // Purple
    '#ffffff', // White
    '#000000', // Black
  ];

  return (
    <div className="space-y-6">
      {/* Top Toolbar Navigation */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 dark:border-gray-800 pb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Tool Selection Buttons */}
            <button
              type="button"
              onClick={() => setActiveTool('arrow')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTool === 'arrow'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <ArrowRight className="w-4 h-4" /> Arrow
            </button>

            <button
              type="button"
              onClick={() => setActiveTool('pen')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTool === 'pen'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <PenTool className="w-4 h-4" /> Pen
            </button>

            <button
              type="button"
              onClick={() => setActiveTool('highlighter')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTool === 'highlighter'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <Highlighter className="w-4 h-4" /> Highlighter
            </button>

            <button
              type="button"
              onClick={() => setActiveTool('rect')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTool === 'rect'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <Square className="w-4 h-4" /> Box
            </button>

            <button
              type="button"
              onClick={() => setActiveTool('circle')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTool === 'circle'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <Circle className="w-4 h-4" /> Circle
            </button>

            <button
              type="button"
              onClick={() => setActiveTool('text')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTool === 'text'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <Type className="w-4 h-4" /> Text
            </button>

            <button
              type="button"
              onClick={() => setActiveTool('badge')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTool === 'badge'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <Hash className="w-4 h-4" /> Step ({badgeCounter})
            </button>

            <button
              type="button"
              onClick={() => setActiveTool('pixelate')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTool === 'pixelate'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <EyeOff className="w-4 h-4" /> Blur / Pixelate
            </button>
          </div>

          {/* Stack Undo / Redo Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleUndo}
              disabled={undoStack.length === 0}
              className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-40 transition-colors cursor-pointer"
              title="Undo annotation"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleRedo}
              disabled={redoStack.length === 0}
              className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-40 transition-colors cursor-pointer"
              title="Redo annotation"
            >
              <Redo2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleClearAll}
              disabled={annotations.length === 0}
              className="px-2.5 py-1.5 rounded-lg bg-red-50 dark:bg-red-950/50 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 text-xs font-semibold disabled:opacity-40 transition-colors cursor-pointer flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Clear
            </button>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700 ml-1">
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.25))}
                disabled={zoomLevel <= 0.5}
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-40 cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-mono font-semibold px-1 text-gray-700 dark:text-gray-300 min-w-[3rem] text-center">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(3, z + 0.25))}
                disabled={zoomLevel >= 3}
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-40 cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel(1)}
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 cursor-pointer border-l border-gray-300 dark:border-gray-600 ml-0.5 pl-1"
                title="Fit to Screen"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Option Controls Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-center">
          {/* Color Palette Picker */}
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <div className="flex items-center gap-1">
              {QUICK_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{ backgroundColor: c }}
                  className={`w-6 h-6 rounded-full border border-gray-300 dark:border-gray-600 transition-transform ${
                    color === c ? 'scale-125 ring-2 ring-blue-500 ring-offset-1' : 'hover:scale-110'
                  }`}
                />
              ))}
            </div>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent p-0"
              title="Custom Hex Color"
            />
          </div>

          {/* Stroke Width Slider */}
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 whitespace-nowrap">
              Stroke: {strokeWidth}px
            </span>
            <input
              type="range"
              min="1"
              max="20"
              value={strokeWidth}
              onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
              className="w-full accent-blue-600"
            />
          </div>

          {/* Tool specific controls */}
          {activeTool === 'text' && (
            <div className="flex items-center gap-2 col-span-2">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Callout text label..."
                className="px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-medium text-gray-900 dark:text-gray-100 flex-1"
              />
              <span className="text-xs font-semibold text-gray-500 whitespace-nowrap">{fontSize}px</span>
              <input
                type="range"
                min="12"
                max="72"
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value))}
                className="w-24 accent-blue-600"
              />
            </div>
          )}

          {activeTool === 'badge' && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Next Step:</span>
              <input
                type="number"
                min="1"
                value={badgeCounter}
                onChange={(e) => setBadgeCounter(parseInt(e.target.value) || 1)}
                className="w-16 px-2 py-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-mono font-bold text-center"
              />
              <button
                type="button"
                onClick={() => setBadgeCounter(1)}
                className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
              >
                Reset (1)
              </button>
            </div>
          )}

          {activeTool === 'pixelate' && (
            <div className="flex items-center gap-2 col-span-2">
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Pixel Size: {blurIntensity}px</span>
              <input
                type="range"
                min="6"
                max="32"
                value={blurIntensity}
                onChange={(e) => setBlurIntensity(parseInt(e.target.value))}
                className="w-32 accent-rose-600"
              />
            </div>
          )}
        </div>
      </div>

      {/* Main Interactive Workspace Canvas */}
      {!previewUrl ? (
        <Dropzone
          onDrop={async (files) => {
            if (files[0]) {
              await setImage(files[0]);
              toast.success(`Loaded ${files[0].name} for markup & annotation.`);
            }
          }}
          className="py-16"
        />
      ) : (
        <div className="space-y-4">
          <div className="bg-gray-900/90 rounded-2xl border border-gray-800 p-4 flex items-center justify-center overflow-auto min-h-[300px] max-h-[65vh] shadow-inner checkerboard relative">
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={
                zoomLevel > 1
                  ? { transform: `scale(${zoomLevel})`, transformOrigin: 'center center', transition: 'transform 0.15s ease' }
                  : { transition: 'transform 0.15s ease' }
              }
              className={
                zoomLevel > 1
                  ? "cursor-crosshair rounded-lg shadow-lg border border-gray-700"
                  : "max-w-full max-h-[calc(65vh-2.5rem)] w-auto h-auto object-contain cursor-crosshair rounded-lg shadow-lg border border-gray-700"
              }
            />
          </div>

          {/* Bottom Export Action Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              <span className="font-semibold text-gray-900 dark:text-gray-200">{annotations.length}</span> active shape & text annotations on canvas.
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={() => handleExportAnnotatedImage('png')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4" /> Export PNG
              </button>

              <button
                type="button"
                onClick={() => handleExportAnnotatedImage('jpg')}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                Export JPG
              </button>

              <button
                type="button"
                onClick={() => handleExportAnnotatedImage('webp')}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                Export WebP
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
