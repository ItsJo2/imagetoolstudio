import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useImageStore } from '../../store/imageStore';
import { ProcessedResult } from '../../lib/imageUtils';
import {
  Send,
  Crop,
  Maximize2,
  HardDrive,
  Stamp,
  Eraser,
  Smile,
  Sliders,
  Zap,
  ShieldCheck,
  RefreshCw,
  ChevronDown,
} from 'lucide-react';
import { toast } from 'sonner';

export interface SendToMenuProps {
  result: ProcessedResult;
  buttonVariant?: 'primary' | 'secondary' | 'outline';
  className?: string;
}

interface ToolOption {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  color: string;
}

const TOOL_OPTIONS: ToolOption[] = [
  { path: '/crop', label: 'Crop & Rotate', icon: Crop, description: 'Crop or rotate framing', color: 'text-blue-500' },
  { path: '/resize', label: 'Resize & Rescale', icon: Maximize2, description: 'Change dimensions or DPI', color: 'text-indigo-500' },
  { path: '/compress', label: 'Compress Size', icon: HardDrive, description: 'Optimize file size', color: 'text-emerald-500' },
  { path: '/watermark', label: 'Add Watermark', icon: Stamp, description: 'Text or logo overlay', color: 'text-purple-500' },
  { path: '/bg-remove', label: 'Remove BG', icon: Eraser, description: 'Cutout background', color: 'text-rose-500' },
  { path: '/meme', label: 'Meme Generator', icon: Smile, description: 'Top/bottom captions', color: 'text-amber-500' },
  { path: '/filters', label: 'Filters & Color', icon: Sliders, description: 'Adjust brightness/contrast', color: 'text-pink-500' },
  { path: '/upscale', label: 'AI Upscaler', icon: Zap, description: 'Sharpen pixel details', color: 'text-cyan-500' },
  { path: '/convert', label: 'Convert Format', icon: RefreshCw, description: 'Convert WebP/PNG/JPG', color: 'text-sky-500' },
  { path: '/exif', label: 'EXIF Metadata', icon: ShieldCheck, description: 'Clean camera metadata', color: 'text-teal-500' },
];

export const SendToMenu: React.FC<SendToMenuProps> = ({
  result,
  buttonVariant = 'secondary',
  className = '',
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setImage, pushHistory, history } = useImageStore();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter out current page tool from the list
  const filteredTools = TOOL_OPTIONS.filter((t) => t.path !== location.pathname);

  const handleSendToTool = async (targetTool: ToolOption) => {
    try {
      const newFile = new File([result.blob], result.filename, { type: result.blob.type });
      if (history.length > 0) {
        await pushHistory(newFile, `Chain -> ${targetTool.label}`);
      } else {
        await setImage(newFile, `Chain -> ${targetTool.label}`);
      }
      setIsOpen(false);
      toast.success(`Sent result to ${targetTool.label}!`);
      navigate(targetTool.path);
    } catch (err) {
      console.error(err);
      toast.error('Failed to chain image to target tool.');
    }
  };

  const buttonStyle =
    buttonVariant === 'primary'
      ? 'bg-indigo-600 hover:bg-indigo-700 text-white font-bold'
      : buttonVariant === 'outline'
      ? 'border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 font-bold'
      : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 font-bold';

  return (
    <div className={`relative inline-block text-left ${className}`} ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`px-4 py-2.5 rounded-xl text-xs transition-all flex items-center gap-2 cursor-pointer shadow-2xs ${buttonStyle}`}
      >
        <Send className="w-3.5 h-3.5 text-indigo-500" />
        Send To Tool...
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl z-50 p-2 space-y-1 max-h-80 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-3 py-1.5 border-b border-gray-100 dark:border-gray-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Chain Image to Next Step
            </span>
          </div>

          {filteredTools.map((tool) => {
            const IconComp = tool.icon;
            return (
              <button
                key={tool.path}
                type="button"
                onClick={() => handleSendToTool(tool)}
                className="w-full px-3 py-2 rounded-xl text-left hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors flex items-center gap-3 cursor-pointer group"
              >
                <div className={`p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 group-hover:bg-white dark:group-hover:bg-gray-700 ${tool.color}`}>
                  <IconComp className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    {tool.label}
                  </p>
                  <p className="text-[10px] text-gray-400 truncate">{tool.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
