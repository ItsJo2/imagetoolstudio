import React, { useState, useEffect } from 'react';
import { useImageStore, HistoryEntry } from '../../store/imageStore';
import { RotateCcw, RotateCw, History, Clock, ArrowLeft, Check, Sparkles, X, Layers } from 'lucide-react';
import { toast } from 'sonner';

export const HistoryToolbar: React.FC = () => {
  const { history, historyIndex, undo, redo, jumpToHistory, url } = useImageStore();
  const [isOpen, setIsOpen] = useState(false);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;
  const currentStep = history[historyIndex];

  // Keyboard shortcut listener for Ctrl+Z and Ctrl+Y / Ctrl+Shift+Z
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger when user is typing in inputs or textareas
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea') return;

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          if (canRedo) {
            e.preventDefault();
            redo();
            toast.info('Redone next edit step');
          }
        } else {
          if (canUndo) {
            e.preventDefault();
            undo();
            toast.info('Undone previous edit step');
          }
        }
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y') {
        if (canRedo) {
          e.preventDefault();
          redo();
          toast.info('Redone next edit step');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo, undo, redo]);

  if (!url || history.length === 0) return null;

  return (
    <>
      {/* Top Floating / Inline Toolbar for Undo, Redo & History */}
      <div className="flex items-center justify-between gap-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md px-3 py-2 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-sm my-4">
        <div className="flex items-center gap-1">
          {/* Undo Button */}
          <button
            type="button"
            onClick={() => {
              if (canUndo) {
                undo();
                toast.info(`Undone: ${history[historyIndex - 1]?.actionLabel || 'Previous Step'}`);
              }
            }}
            disabled={!canUndo}
            className={`p-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              canUndo
                ? 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200'
                : 'opacity-40 cursor-not-allowed text-gray-400 dark:text-gray-600'
            }`}
            title="Undo (Ctrl+Z)"
          >
            <RotateCcw className="w-4 h-4 text-indigo-500" />
            <span className="hidden sm:inline">Undo</span>
            <kbd className="hidden md:inline px-1.5 py-0.5 text-[10px] font-mono bg-gray-100 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 text-gray-400">
              Ctrl+Z
            </kbd>
          </button>

          {/* Redo Button */}
          <button
            type="button"
            onClick={() => {
              if (canRedo) {
                redo();
                toast.info(`Redone: ${history[historyIndex + 1]?.actionLabel || 'Next Step'}`);
              }
            }}
            disabled={!canRedo}
            className={`p-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              canRedo
                ? 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200'
                : 'opacity-40 cursor-not-allowed text-gray-400 dark:text-gray-600'
            }`}
            title="Redo (Ctrl+Y / Ctrl+Shift+Z)"
          >
            <RotateCw className="w-4 h-4 text-indigo-500" />
            <span className="hidden sm:inline">Redo</span>
            <kbd className="hidden md:inline px-1.5 py-0.5 text-[10px] font-mono bg-gray-100 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 text-gray-400">
              Ctrl+Y
            </kbd>
          </button>
        </div>

        {/* Current State Info Pill & Timeline Trigger */}
        <div className="flex items-center gap-2">
          {currentStep && (
            <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800/60 px-3 py-1 rounded-xl border border-gray-200/60 dark:border-gray-700/60 truncate max-w-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="font-semibold text-gray-800 dark:text-gray-200 truncate">
                {currentStep.actionLabel}
              </span>
              <span className="text-[10px] text-gray-400">
                ({historyIndex + 1}/{history.length})
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors text-xs font-bold flex items-center gap-2 border border-indigo-200/60 dark:border-indigo-800/60 cursor-pointer shadow-2xs"
          >
            <History className="w-4 h-4" />
            <span>History Stack</span>
            <span className="px-1.5 py-0.2 rounded-md bg-indigo-200 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-[10px] font-mono">
              {history.length}
            </span>
          </button>
        </div>
      </div>

      {/* History Slide-Over Drawer Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-gray-900 h-full shadow-2xl flex flex-col border-l border-gray-200 dark:border-gray-800 animate-in slide-in-from-right duration-250">
            {/* Drawer Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Editing History Timeline</h3>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    Jump to any previous state in your edit session
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Undo / Redo Quick Control Box inside Drawer */}
            <div className="p-3 bg-gray-50 dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                Shortcuts: <kbd className="px-1 bg-white dark:bg-gray-800 rounded border">Ctrl+Z</kbd> Undo / <kbd className="px-1 bg-white dark:bg-gray-800 rounded border">Ctrl+Y</kbd> Redo
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (canUndo) {
                      undo();
                      toast.info('Undone step');
                    }
                  }}
                  disabled={!canUndo}
                  className="p-1.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 disabled:opacity-40 cursor-pointer"
                  title="Undo step"
                >
                  <RotateCcw className="w-4 h-4 text-indigo-500" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (canRedo) {
                      redo();
                      toast.info('Redone step');
                    }
                  }}
                  disabled={!canRedo}
                  className="p-1.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 disabled:opacity-40 cursor-pointer"
                  title="Redo step"
                >
                  <RotateCw className="w-4 h-4 text-indigo-500" />
                </button>
              </div>
            </div>

            {/* Timeline List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {history.map((entry: HistoryEntry, idx: number) => {
                const isCurrent = idx === historyIndex;
                const isPast = idx < historyIndex;
                const isFuture = idx > historyIndex;

                return (
                  <div
                    key={entry.id}
                    onClick={() => {
                      jumpToHistory(idx);
                      toast.success(`Jumped to: ${entry.actionLabel}`);
                    }}
                    className={`relative p-3 rounded-2xl border transition-all flex items-center gap-3 cursor-pointer group ${
                      isCurrent
                        ? 'bg-indigo-50/80 dark:bg-indigo-950/60 border-indigo-400 dark:border-indigo-600 shadow-xs'
                        : isFuture
                        ? 'bg-gray-50/50 dark:bg-gray-900/40 border-gray-200/50 dark:border-gray-800/50 opacity-60 hover:opacity-100 hover:border-gray-300'
                        : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-indigo-200 dark:hover:border-indigo-800'
                    }`}
                  >
                    {/* Thumbnail Preview */}
                    <div className="relative w-14 h-14 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shrink-0 bg-gray-100 dark:bg-gray-800 checkerboard flex items-center justify-center">
                      <img
                        src={entry.url}
                        alt={entry.actionLabel}
                        className="w-full h-full object-contain"
                      />
                      <span className="absolute bottom-0 right-0 bg-black/70 text-white text-[9px] font-mono px-1 rounded-tl">
                        #{idx + 1}
                      </span>
                    </div>

                    {/* Step Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className={`text-xs font-bold truncate ${isCurrent ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-900 dark:text-gray-100'}`}>
                          {entry.actionLabel}
                        </p>
                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[9px] font-bold uppercase tracking-wider shrink-0 flex items-center gap-1">
                            <Check className="w-2.5 h-2.5" /> Active
                          </span>
                        )}
                      </div>

                      <p className="text-[10px] text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-0.5">
                        <span>{entry.dimensions.width} × {entry.dimensions.height} px</span>
                        <span>•</span>
                        <span>{entry.format.toUpperCase()}</span>
                      </p>

                      <p className="text-[10px] text-gray-400 dark:text-gray-500 flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" />
                        {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-full py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-bold text-xs hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              >
                Close Timeline
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
