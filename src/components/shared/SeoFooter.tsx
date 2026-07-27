import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Image as ImageIcon,
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
  HelpCircle,
  Info,
  Lock,
  FileText,
  Mail,
  Globe,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

export const SeoFooter: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;

  const toolLinks = [
    { path: '/convert', name: 'PNG / WEBP / JPG Converter' },
    { path: '/crop', name: 'Smart Crop & Aspect Ratio' },
    { path: '/resize', name: 'Dimension & Pixel Resizer' },
    { path: '/compress', name: 'Target KB File Size Compressor' },
    { path: '/watermark', name: 'Watermark & Brand Overlay' },
    { path: '/exif', name: 'EXIF Viewer & Privacy Cleaner' },
    { path: '/bg-remove', name: 'Background Removal & Chroma' },
    { path: '/meme', name: 'Meme Generator Studio' },
    { path: '/collage', name: 'Photo Collage Grid Builder' },
    { path: '/filters', name: 'Color Adjustments & Filters' },
    { path: '/upscale', name: 'Super Resolution AI Upscale' },
    { path: '/batch', name: 'Batch Bulk Image Processor' },
  ];

  const popularSearches = [
    'Convert PNG to WEBP',
    'Crop Photo for Instagram',
    'Resize Image to 1920x1080',
    'Compress Photo under 200KB',
    'Add Copyright Watermark',
    'Remove Photo Metadata GPS',
    'Cutout Green Screen Background',
    'Make Side-by-Side Photo Grid',
    'Create Meme with Impact Font',
    'Upscale Low-Res Image 4x',
    'Bulk Convert PNG to JPG',
  ];

  // Breadcrumbs text helper
  const getBreadcrumbName = (p: string) => {
    switch (p) {
      case '/': return 'Home Workspace';
      case '/convert': return 'Format Converter';
      case '/crop': return 'Crop & Rotate';
      case '/resize': return 'Dimension Resizer';
      case '/compress': return 'KB Compressor';
      case '/watermark': return 'Photo Watermark';
      case '/exif': return 'EXIF Metadata';
      case '/bg-remove': return 'Background Remover';
      case '/meme': return 'Meme Studio';
      case '/collage': return 'Collage Builder';
      case '/filters': return 'Color Filters';
      case '/upscale': return 'Super Resolution';
      case '/batch': return 'Batch Processing';
      case '/faq': return 'FAQ & Help';
      case '/about': return 'About ImageTool Studio';
      case '/privacy': return 'Privacy Policy';
      case '/terms': return 'Terms of Service';
      case '/contact': return 'Contact Support';
      case '/sitemap': return 'Sitemap Directory';
      default: return p.replace('/', '');
    }
  };

  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 pt-10 pb-8 text-xs text-gray-500 dark:text-gray-400 mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Dynamic SEO Breadcrumbs Navigation */}
        <nav aria-label="Breadcrumb" className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-950/60 border border-gray-200/80 dark:border-gray-800 flex items-center gap-2 text-xs font-medium overflow-x-auto no-scrollbar">
          <Link to="/" className="text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shrink-0">
            Home
          </Link>
          {path !== '/' && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span className="text-indigo-600 dark:text-indigo-400 font-bold shrink-0">
                {getBreadcrumbName(path)}
              </span>
            </>
          )}
        </nav>

        {/* Major Directory Categories */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-gray-200 dark:border-gray-800">
          {/* Col 1: Brand & Privacy Core */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                <ImageIcon className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-sm text-gray-900 dark:text-gray-100">ImageTool Studio</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Fast, free, 100% client-side online image suite. Process, convert, resize, and edit photos directly in your web browser with absolute privacy.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-semibold text-[11px] border border-emerald-200 dark:border-emerald-800">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Zero Server Uploads</span>
            </div>
          </div>

          {/* Col 2: Image Tools Links */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-gray-900 dark:text-gray-100">
              Image Editing Suite
            </h4>
            <ul className="space-y-1">
              {toolLinks.slice(0, 6).map((tool) => (
                <li key={tool.path}>
                  <Link
                    to={tool.path}
                    className="py-1.5 px-2 -mx-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5"
                  >
                    <span>{tool.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Advanced Tools */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-gray-900 dark:text-gray-100">
              Advanced Tools
            </h4>
            <ul className="space-y-1">
              {toolLinks.slice(6).map((tool) => (
                <li key={tool.path}>
                  <Link
                    to={tool.path}
                    className="py-1.5 px-2 -mx-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5"
                  >
                    <span>{tool.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Info, Legal & Index */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-gray-900 dark:text-gray-100">
              Resources & Legal
            </h4>
            <ul className="space-y-1">
              <li>
                <Link to="/sitemap" className="py-1.5 px-2 -mx-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5 font-bold text-indigo-600 dark:text-indigo-400">
                  <Globe className="w-3.5 h-3.5" /> XML Sitemap Directory
                </Link>
              </li>
              <li>
                <Link to="/about" className="py-1.5 px-2 -mx-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5" /> About ImageTool Studio
                </Link>
              </li>
              <li>
                <Link to="/faq" className="py-1.5 px-2 -mx-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5" /> Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="py-1.5 px-2 -mx-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" /> Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="py-1.5 px-2 -mx-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" /> Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/contact" className="py-1.5 px-2 -mx-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" /> Contact Support
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Popular Search Keyword Cloud for SEO Indexing */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            Popular Image Workflows:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {popularSearches.map((term) => (
              <span
                key={term}
                className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-[10px] text-gray-600 dark:text-gray-400 font-medium"
              >
                {term}
              </span>
            ))}
          </div>
        </div>

        {/* Copyright & Technical Footnote */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-200/60 dark:border-gray-800/60 text-[11px]">
          <p>© {new Date().getFullYear()} ImageTool Studio. All rights reserved. Powered by client-side Canvas and WebAssembly engine.</p>
          <div className="flex items-center gap-2 font-mono font-semibold text-[10px]">
            <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">WEBP</span>
            <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">PNG</span>
            <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">AVIF</span>
            <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">JPEG</span>
            <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">GIF</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
