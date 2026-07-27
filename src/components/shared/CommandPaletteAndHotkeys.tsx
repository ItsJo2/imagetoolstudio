import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useImageStore } from '../../store/imageStore';
import {
  Search,
  Command,
  Sparkles,
  Crop,
  Maximize2,
  HardDrive,
  Stamp,
  ShieldCheck,
  Eraser,
  Smile,
  LayoutGrid,
  Sliders,
  Zap,
  Layers,
  Upload,
  History,
  RotateCcw,
  RotateCw,
  Sun,
  Moon,
  Keyboard,
  X,
  ArrowRight,
  CornerDownLeft,
  Check,
  Bookmark,
} from 'lucide-react';
import { toast } from 'sonner';

export interface CommandItem {
  id: string;
  title: string;
  description: string;
  category: 'Tools' | 'Actions' | 'Navigation';
  icon: React.ElementType;
  hotkey?: string;
  action: () => void;
}

export interface CommandPaletteAndHotkeysProps {
  isDark: boolean;
  toggleTheme: () => void;
}

export const CommandPaletteAndHotkeys: React.FC<CommandPaletteAndHotkeysProps> = ({
  isDark,
  toggleTheme,
}) => {
  const navigate = useNavigate();
  const { setImage, undo, redo, historyIndex, history } = useImageStore();

  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isCheatsheetOpen, setIsCheatsheetOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  // Define commands list
  const commands: CommandItem[] = [
    // Tools
    {
      id: 'tool-convert',
      title: 'Convert Format',
      description: 'Convert between PNG, WebP, JPEG, AVIF, GIF',
      category: 'Tools',
      icon: Sparkles,
      hotkey: '1',
      action: () => navigate('/convert'),
    },
    {
      id: 'tool-crop',
      title: 'Crop & Rotate',
      description: 'Freeform or aspect-ratio crop with rotation & flip',
      category: 'Tools',
      icon: Crop,
      hotkey: '2',
      action: () => navigate('/crop'),
    },
    {
      id: 'tool-resize',
      title: 'Resize Image',
      description: 'Scale pixel dimensions or percentages',
      category: 'Tools',
      icon: Maximize2,
      hotkey: '3',
      action: () => navigate('/resize'),
    },
    {
      id: 'tool-compress',
      title: 'Compress File Size',
      description: 'Reduce file size to target KB or MB',
      category: 'Tools',
      icon: HardDrive,
      hotkey: '4',
      action: () => navigate('/compress'),
    },
    {
      id: 'tool-watermark',
      title: 'Add Watermark',
      description: 'Overlay custom text or image logos',
      category: 'Tools',
      icon: Stamp,
      hotkey: '5',
      action: () => navigate('/watermark'),
    },
    {
      id: 'tool-exif',
      title: 'EXIF Metadata Stripper',
      description: 'View or remove EXIF and camera metadata',
      category: 'Tools',
      icon: ShieldCheck,
      hotkey: '6',
      action: () => navigate('/exif'),
    },
    {
      id: 'tool-bg',
      title: 'Background Remover',
      description: 'Chroma-key and color cutout background remover',
      category: 'Tools',
      icon: Eraser,
      hotkey: '7',
      action: () => navigate('/bg-remove'),
    },
    {
      id: 'tool-meme',
      title: 'Meme Generator',
      description: 'Add top and bottom Impact text captions',
      category: 'Tools',
      icon: Smile,
      hotkey: '8',
      action: () => navigate('/meme'),
    },
    {
      id: 'tool-collage',
      title: 'Collage Grid Builder',
      description: 'Combine multiple photos into grid layouts',
      category: 'Tools',
      icon: LayoutGrid,
      hotkey: '9',
      action: () => navigate('/collage'),
    },
    {
      id: 'tool-filters',
      title: 'Color Filters & Presets',
      description: 'Apply brightness, contrast, hue, and custom presets',
      category: 'Tools',
      icon: Sliders,
      hotkey: '0',
      action: () => navigate('/filters'),
    },
    {
      id: 'tool-upscale',
      title: 'Upscale & Sharpen',
      description: 'Super-resolution 2x/4x pixel upscaling',
      category: 'Tools',
      icon: Zap,
      action: () => navigate('/upscale'),
    },
    {
      id: 'tool-batch',
      title: 'Batch Image Processing',
      description: 'Process multiple images simultaneously',
      category: 'Tools',
      icon: Layers,
      action: () => navigate('/batch'),
    },

    // Actions
    {
      id: 'action-upload',
      title: 'Upload New Image',
      description: 'Select an image file from your device',
      category: 'Actions',
      icon: Upload,
      hotkey: 'Ctrl+O',
      action: () => fileInputRef.current?.click(),
    },
    {
      id: 'action-undo',
      title: 'Undo Previous Edit',
      description: 'Step back to previous image state',
      category: 'Actions',
      icon: RotateCcw,
      hotkey: 'Ctrl+Z',
      action: () => {
        if (canUndo) {
          undo();
          toast.info('Undone step');
        } else {
          toast.info('No steps to undo');
        }
      },
    },
    {
      id: 'action-redo',
      title: 'Redo Next Edit',
      description: 'Step forward in editing history',
      category: 'Actions',
      icon: RotateCw,
      hotkey: 'Ctrl+Y',
      action: () => {
        if (canRedo) {
          redo();
          toast.info('Redone step');
        } else {
          toast.info('No steps to redo');
        }
      },
    },
    {
      id: 'action-theme',
      title: isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme',
      description: 'Toggle interface color scheme',
      category: 'Actions',
      icon: isDark ? Sun : Moon,
      hotkey: 'Ctrl+Shift+T',
      action: () => toggleTheme(),
    },
    {
      id: 'action-cheatsheet',
      title: 'Keyboard Shortcuts Cheat Sheet',
      description: 'View all global studio hotkeys',
      category: 'Navigation',
      icon: Keyboard,
      hotkey: '?',
      action: () => setIsCheatsheetOpen(true),
    },
  ];

  // Filter commands by search
  const filteredCommands = commands.filter(
    (cmd) =>
      cmd.title.toLowerCase().includes(search.toLowerCase()) ||
      cmd.description.toLowerCase().includes(search.toLowerCase()) ||
      cmd.category.toLowerCase().includes(search.toLowerCase())
  );

  // Global Keyboard Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName.toLowerCase();
      const isInputFocused = activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select';

      // Ctrl/Cmd + K opens Command Palette
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsPaletteOpen((prev) => !prev);
        setSearch('');
        setSelectedIndex(0);
        return;
      }

      // Escape closes open palette or modal
      if (e.key === 'Escape') {
        if (isPaletteOpen) {
          setIsPaletteOpen(false);
          return;
        }
        if (isCheatsheetOpen) {
          setIsCheatsheetOpen(false);
          return;
        }
      }

      // Don't trigger letter or number shortcuts when typing in input boxes
      if (isInputFocused) return;

      // ? or Shift + / opens Shortcuts Cheatsheet
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        setIsCheatsheetOpen((prev) => !prev);
        return;
      }

      // Ctrl/Cmd + O triggers file upload
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        fileInputRef.current?.click();
        return;
      }

      // Ctrl/Cmd + Shift + T toggles Theme
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 't') {
        e.preventDefault();
        toggleTheme();
        toast.info(isDark ? 'Switched to Light Mode' : 'Switched to Dark Mode');
        return;
      }

      // Number keys 1-9 for instant tool navigation
      if (!e.ctrlKey && !e.altKey && !e.metaKey) {
        if (e.key >= '1' && e.key <= '9') {
          const index = parseInt(e.key, 10) - 1;
          const targetCommand = commands.filter((c) => c.category === 'Tools')[index];
          if (targetCommand) {
            e.preventDefault();
            targetCommand.action();
            toast.info(`Hotkey [${e.key}]: ${targetCommand.title}`);
          }
        } else if (e.key === '0') {
          const filtersCommand = commands.find((c) => c.id === 'tool-filters');
          if (filtersCommand) {
            e.preventDefault();
            filtersCommand.action();
            toast.info('Hotkey [0]: Color Filters & Presets');
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPaletteOpen, isCheatsheetOpen, isDark, commands]);

  // Handle Arrow Key Navigation inside Command Palette
  const handlePaletteKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
        setIsPaletteOpen(false);
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      await setImage(selectedFile, 'Uploaded File');
      toast.success(`Loaded ${selectedFile.name}`);
      if (e.target) e.target.value = '';
    }
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Floating / Header Trigger Bar for Command Palette & Hotkeys */}
      <div className="fixed bottom-4 right-4 z-30 flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            setIsPaletteOpen(true);
            setSearch('');
            setSelectedIndex(0);
          }}
          className="px-3.5 py-2 rounded-2xl bg-gray-900/90 dark:bg-gray-100/90 text-white dark:text-gray-900 font-bold text-xs flex items-center gap-2 shadow-xl hover:scale-105 transition-all cursor-pointer backdrop-blur-md border border-white/20 dark:border-black/20"
          title="Command Palette (Ctrl+K)"
        >
          <Command className="w-4 h-4 text-indigo-400 dark:text-indigo-600" />
          <span className="hidden sm:inline">Commands</span>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white/20 dark:bg-black/10 rounded">
            Ctrl+K
          </kbd>
        </button>

        <button
          type="button"
          onClick={() => setIsCheatsheetOpen(true)}
          className="p-2 rounded-2xl bg-white/90 dark:bg-gray-900/90 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 shadow-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer backdrop-blur-md"
          title="Keyboard Shortcuts Cheatsheet (?)"
        >
          <Keyboard className="w-4 h-4" />
        </button>
      </div>

      {/* Command Palette Modal */}
      {isPaletteOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
            onKeyDown={handlePaletteKeyDown}
          >
            {/* Palette Search Input */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center gap-3 bg-gray-50/50 dark:bg-gray-950/50">
              <Search className="w-5 h-5 text-indigo-500 shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setSelectedIndex(0);
                }}
                placeholder="Type a command or search tools... (e.g. crop, convert, undo, theme)"
                autoFocus
                className="w-full bg-transparent text-sm font-semibold text-gray-900 dark:text-gray-100 focus:outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
              <button
                type="button"
                onClick={() => setIsPaletteOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Command Items List */}
            <div className="max-h-96 overflow-y-auto p-2 space-y-1">
              {filteredCommands.length === 0 ? (
                <div className="p-8 text-center text-xs text-gray-500 dark:text-gray-400">
                  No commands matching "{search}"
                </div>
              ) : (
                filteredCommands.map((cmd, idx) => {
                  const Icon = cmd.icon;
                  const isSelected = idx === selectedIndex;

                  return (
                    <div
                      key={cmd.id}
                      onClick={() => {
                        cmd.action();
                        setIsPaletteOpen(false);
                      }}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`p-3 rounded-2xl flex items-center justify-between gap-3 cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                          : 'text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800/80'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`p-2 rounded-xl shrink-0 ${
                            isSelected
                              ? 'bg-white/20 text-white'
                              : 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold truncate">{cmd.title}</p>
                          <p
                            className={`text-[11px] truncate ${
                              isSelected ? 'text-indigo-100' : 'text-gray-500 dark:text-gray-400'
                            }`}
                          >
                            {cmd.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {cmd.hotkey && (
                          <kbd
                            className={`px-1.5 py-0.5 text-[10px] font-mono rounded border ${
                              isSelected
                                ? 'bg-white/20 border-white/30 text-white'
                                : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500'
                            }`}
                          >
                            {cmd.hotkey}
                          </kbd>
                        )}
                        {isSelected && <CornerDownLeft className="w-3.5 h-3.5 text-indigo-200" />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Navigation Hints */}
            <div className="p-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 text-[11px] text-gray-500 dark:text-gray-400 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="px-1 bg-white dark:bg-gray-800 rounded border">↑</kbd>
                  <kbd className="px-1 bg-white dark:bg-gray-800 rounded border">↓</kbd> Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1 bg-white dark:bg-gray-800 rounded border">Enter</kbd> Select
                </span>
              </div>
              <span>
                <kbd className="px-1 bg-white dark:bg-gray-800 rounded border">Esc</kbd> Close
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Hotkeys Cheatsheet Modal */}
      {isCheatsheetOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-950/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                  <Keyboard className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    Studio Hotkeys & Efficiency Reference
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Boost your editing speed with global studio keyboard shortcuts
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsCheatsheetOpen(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cheat Sheet Content */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Category 1: Navigation & Tool Switching */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-3 flex items-center gap-2">
                  <Command className="w-4 h-4" /> Quick Tool Navigation
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {[
                    { key: '1', label: 'Convert Format Tool' },
                    { key: '2', label: 'Crop & Rotate Tool' },
                    { key: '3', label: 'Resize Dimensions Tool' },
                    { key: '4', label: 'Compress File Size Tool' },
                    { key: '5', label: 'Watermark Tool' },
                    { key: '6', label: 'EXIF Metadata Stripper' },
                    { key: '7', label: 'Background Remover' },
                    { key: '8', label: 'Meme Generator' },
                    { key: '9', label: 'Collage Grid Builder' },
                    { key: '0', label: 'Color Filters & Presets' },
                  ].map((item) => (
                    <div
                      key={item.key}
                      className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/50 flex items-center justify-between"
                    >
                      <span className="font-semibold text-gray-800 dark:text-gray-200">{item.label}</span>
                      <kbd className="px-2 py-0.5 text-xs font-mono font-bold bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-700 text-indigo-600 dark:text-indigo-400 shadow-2xs">
                        {item.key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category 2: History & Actions */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-3 flex items-center gap-2">
                  <RotateCcw className="w-4 h-4" /> History & Actions
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {[
                    { key: 'Ctrl + Z', label: 'Undo Previous Edit Step' },
                    { key: 'Ctrl + Y / Ctrl + Shift + Z', label: 'Redo Next Edit Step' },
                    { key: 'Ctrl + K', label: 'Open Command Palette' },
                    { key: 'Ctrl + O', label: 'Open File Selection Dialog' },
                    { key: 'Ctrl + Shift + T', label: 'Toggle Light / Dark Theme' },
                    { key: '?', label: 'Open Shortcuts Cheatsheet' },
                    { key: 'Esc', label: 'Close Active Modals & Palettes' },
                  ].map((item) => (
                    <div
                      key={item.key}
                      className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/50 flex items-center justify-between"
                    >
                      <span className="font-semibold text-gray-800 dark:text-gray-200">{item.label}</span>
                      <kbd className="px-2 py-0.5 text-xs font-mono font-bold bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-700 text-indigo-600 dark:text-indigo-400 shadow-2xs">
                        {item.key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 flex items-center justify-between">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Hotkeys automatically pause when typing inside text inputs.
              </span>
              <button
                type="button"
                onClick={() => setIsCheatsheetOpen(false)}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-colors cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
