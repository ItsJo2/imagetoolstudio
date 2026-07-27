import React, { useState, useRef, useCallback, useEffect } from 'react';
import { SlidersHorizontal, Eye, Columns } from 'lucide-react';

export interface BeforeAfterSliderProps {
  originalUrl: string;
  processedUrl: string;
  originalLabel?: string;
  processedLabel?: string;
  className?: string;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  originalUrl,
  processedUrl,
  originalLabel = 'Original',
  processedLabel = 'Processed',
  className = '',
}) => {
  const [sliderPosition, setSliderPosition] = useState<number>(50); // percentage 0 - 100
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'slider' | 'side-by-side'>('slider');
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      let pos = (x / rect.width) * 100;
      if (pos < 0) pos = 0;
      if (pos > 100) pos = 100;
      setSliderPosition(pos);
    },
    []
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDragging) return;
      if (e.touches.length > 0) {
        handleMove(e.touches[0].clientX);
      }
    },
    [isDragging, handleMove]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      handleMove(e.clientX);
    },
    [isDragging, handleMove]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      setSliderPosition((prev) => Math.max(0, prev - 5));
    } else if (e.key === 'ArrowRight') {
      setSliderPosition((prev) => Math.min(100, prev + 5));
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Top Controls: View Mode Switcher */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5 text-indigo-500" />
          Comparison View
        </span>

        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={() => setViewMode('slider')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'slider'
                ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Interactive Split
          </button>
          <button
            type="button"
            onClick={() => setViewMode('side-by-side')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'side-by-side'
                ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            Side-by-Side
          </button>
        </div>
      </div>

      {viewMode === 'slider' ? (
        <div
          ref={containerRef}
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onMouseDown={(e) => {
            setIsDragging(true);
            handleMove(e.clientX);
          }}
          onTouchStart={(e) => {
            setIsDragging(true);
            if (e.touches.length > 0) {
              handleMove(e.touches[0].clientX);
            }
          }}
          className="relative w-full h-72 sm:h-96 rounded-2xl overflow-hidden select-none cursor-ew-resize border border-gray-200 dark:border-gray-800 bg-gray-950/10 focus:outline-none focus:ring-2 focus:ring-indigo-500 checkerboard"
          aria-label="Interactive Before/After comparison slider"
        >
          {/* Underneath Layer: Processed Image */}
          <img
            src={processedUrl}
            alt={processedLabel}
            className="absolute inset-0 w-full h-full object-contain pointer-events-none"
          />

          {/* Top Layer: Original Image (Clipped) */}
          <div
            className="absolute inset-0 overflow-hidden pointer-events-none"
            style={{ width: `${sliderPosition}%` }}
          >
            <div className="relative w-full h-full" style={{ width: containerRef.current?.offsetWidth || '100%' }}>
              <img
                src={originalUrl}
                alt={originalLabel}
                className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                style={{
                  width: containerRef.current ? `${containerRef.current.offsetWidth}px` : '100%',
                  maxWidth: 'none',
                }}
              />
            </div>
          </div>

          {/* Labels */}
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-xs text-white text-[11px] font-bold uppercase tracking-wider pointer-events-none">
            {originalLabel}
          </div>
          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-xs text-white text-[11px] font-bold uppercase tracking-wider pointer-events-none">
            {processedLabel}
          </div>

          {/* Vertical Divider Bar */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] z-10 pointer-events-none"
            style={{ left: `${sliderPosition}%` }}
          >
            {/* Handle Knob */}
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-indigo-600 shadow-md border-2 border-indigo-500 flex items-center justify-center cursor-ew-resize">
              <SlidersHorizontal className="w-4 h-4 rotate-90" />
            </div>
          </div>
        </div>
      ) : (
        /* Side-by-Side Dual View */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold uppercase text-gray-500 dark:text-gray-400">
              {originalLabel}
            </span>
            <div className="relative h-64 sm:h-72 rounded-2xl border border-gray-200 dark:border-gray-800 checkerboard overflow-hidden flex items-center justify-center p-2">
              <img src={originalUrl} alt={originalLabel} className="max-h-full max-w-full object-contain rounded-lg" />
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-[11px] font-bold uppercase text-indigo-600 dark:text-indigo-400">
              {processedLabel}
            </span>
            <div className="relative h-64 sm:h-72 rounded-2xl border border-indigo-200 dark:border-indigo-900/50 checkerboard overflow-hidden flex items-center justify-center p-2">
              <img src={processedUrl} alt={processedLabel} className="max-h-full max-w-full object-contain rounded-lg" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
