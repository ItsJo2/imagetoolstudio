import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { Routes, Route, NavLink, Link, useLocation } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { HistoryToolbar } from './components/shared/HistoryToolbar';
import { CommandPaletteAndHotkeys } from './components/shared/CommandPaletteAndHotkeys';
import { SeoFooter } from './components/shared/SeoFooter';
import { ScrollToTop } from './components/shared/ScrollToTop';
import {
  Sparkles,
  Crop,
  Maximize2,
  Zap,
  Layers,
  Image as ImageIcon,
  ShieldCheck,
  Sun,
  Moon,
  Home,
  Sliders,
  HardDrive,
  Stamp,
  Eraser,
  Smile,
  LayoutGrid,
  PenTool,
  RefreshCw,
  ChevronDown,
  Menu,
  X,
} from 'lucide-react';

const ConvertPage = lazy(() => import('./pages/ConvertPage').then(m => ({ default: m.ConvertPage })));
const CropPage = lazy(() => import('./pages/CropPage').then(m => ({ default: m.CropPage })));
const ResizePage = lazy(() => import('./pages/ResizePage').then(m => ({ default: m.ResizePage })));
const UpscalePage = lazy(() => import('./pages/UpscalePage').then(m => ({ default: m.UpscalePage })));
const BatchPage = lazy(() => import('./pages/BatchPage').then(m => ({ default: m.BatchPage })));
const FilterPage = lazy(() => import('./pages/FilterPage').then(m => ({ default: m.FilterPage })));
const CompressPage = lazy(() => import('./pages/CompressPage').then(m => ({ default: m.CompressPage })));
const WatermarkPage = lazy(() => import('./pages/WatermarkPage').then(m => ({ default: m.WatermarkPage })));
const ExifPage = lazy(() => import('./pages/ExifPage').then(m => ({ default: m.ExifPage })));
const BackgroundRemovalPage = lazy(() => import('./pages/BackgroundRemovalPage').then(m => ({ default: m.BackgroundRemovalPage })));
const MemePage = lazy(() => import('./pages/MemePage').then(m => ({ default: m.MemePage })));
const CollagePage = lazy(() => import('./pages/CollagePage').then(m => ({ default: m.CollagePage })));
const AnnotatePage = lazy(() => import('./pages/AnnotatePage').then(m => ({ default: m.AnnotatePage })));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage').then(m => ({ default: m.PrivacyPage })));
const TermsPage = lazy(() => import('./pages/TermsPage').then(m => ({ default: m.TermsPage })));
const AboutPage = lazy(() => import('./pages/AboutPage').then(m => ({ default: m.AboutPage })));
const ContactPage = lazy(() => import('./pages/ContactPage').then(m => ({ default: m.ContactPage })));
const FaqPage = lazy(() => import('./pages/FaqPage').then(m => ({ default: m.FaqPage })));
const SitemapPage = lazy(() => import('./pages/SitemapPage').then(m => ({ default: m.SitemapPage })));

interface ToolItem {
  path: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavGroup {
  groupName: string;
  tools: ToolItem[];
}

const navGroups: NavGroup[] = [
  {
    groupName: 'Basic Editing',
    tools: [
      { path: '/crop', name: 'Smart Crop & Rotate', icon: Crop },
      { path: '/resize', name: 'Precision Resize', icon: Maximize2 },
      { path: '/annotate', name: 'Annotate, Shape & Sensitive Blur Editor', icon: PenTool },
      { path: '/collage', name: 'Photo Collage & Grid Builder', icon: LayoutGrid },
    ],
  },
  {
    groupName: 'Converter',
    tools: [
      { path: '/convert', name: 'Format Converter', icon: Sparkles },
      { path: '/batch', name: 'Batch Convert & Export', icon: Layers },
    ],
  },
  {
    groupName: 'Optimize',
    tools: [
      { path: '/compress', name: 'Target File Size Compressor', icon: HardDrive },
      { path: '/upscale', name: 'Super Resolution Upscale', icon: Zap },
    ],
  },
  {
    groupName: 'Effects & Privacy',
    tools: [
      { path: '/filters', name: 'Color Adjustments & Filters', icon: Sliders },
      { path: '/watermark', name: 'Watermark & Brand Protection', icon: Stamp },
      { path: '/bg-remove', name: 'Background Removal & Chroma Key', icon: Eraser },
      { path: '/meme', name: 'Image Meme & Caption Studio', icon: Smile },
      { path: '/exif', name: 'EXIF Inspector & Privacy Cleaner', icon: ShieldCheck },
    ],
  },
];

const PageLoadingFallback = () => (
  <div className="min-h-[400px] w-full flex flex-col items-center justify-center gap-3 py-16 text-gray-500 dark:text-gray-400">
    <RefreshCw className="w-6 h-6 animate-spin text-blue-600 dark:text-blue-400" />
    <span className="text-xs font-semibold tracking-wide">Loading workspace...</span>
  </div>
);

export function App() {
  const location = useLocation();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const navRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (groupName: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setOpenDropdown(groupName);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 150);
  };

  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const openDropdownRef = useRef(openDropdown);
  openDropdownRef.current = openDropdown;

  // Close menus on route change
  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpenDropdown(null);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Only handle click outside if a dropdown menu is currently open
      if (openDropdownRef.current !== null) {
        if (navRef.current && !navRef.current.contains(event.target as Node)) {
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          setOpenDropdown(null);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown when pressing Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setOpenDropdown(null);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-50 font-sans antialiased transition-colors duration-200 flex flex-col justify-between">
      <ScrollToTop />
      {/* Top Header Navigation */}
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                ImageTool <span className="text-blue-600 dark:text-blue-400">Studio</span>
              </h1>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                Client-Side Image Suite
              </p>
            </div>
          </Link>

          {/* Desktop Navigation with 4 Dropdowns */}
          <nav ref={navRef} className="hidden lg:flex items-center gap-1 bg-gray-100/80 dark:bg-gray-800/60 p-1 rounded-2xl border border-gray-200/80 dark:border-gray-800">
            {/* Home Link */}
            <NavLink
              to="/"
              className={({ isActive }) =>
                `px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-xs border border-gray-200/60 dark:border-gray-700/60'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-900/50'
                }`
              }
            >
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </NavLink>

            {/* Dropdown Groups */}
            {navGroups.map((group) => {
              const isGroupActive = group.tools.some((t) => t.path === location.pathname);
              const isOpen = openDropdown === group.groupName;

              return (
                <div
                  key={group.groupName}
                  className="relative"
                  onMouseEnter={() => handleMouseEnter(group.groupName)}
                  onMouseLeave={handleMouseLeave}
                >
                  <button
                    type="button"
                    onClick={() => {
                      if (timeoutRef.current) clearTimeout(timeoutRef.current);
                      setOpenDropdown(isOpen ? null : group.groupName);
                    }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                      isGroupActive || isOpen
                        ? 'bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-xs border border-gray-200/60 dark:border-gray-700/60'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-900/50'
                    }`}
                  >
                    <span>{group.groupName}</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180 text-blue-600 dark:text-blue-400' : 'text-gray-400'}`} />
                  </button>

                  {/* Dropdown Menu Popup - pt-1.5 provides zero-gap hover bridge */}
                  {isOpen && (
                    <div className="absolute top-full left-0 pt-1.5 z-50">
                      <div className="w-64 p-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl shadow-gray-900/10 dark:shadow-black/40 animate-in fade-in slide-in-from-top-1 duration-150">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 px-3 py-1 mb-1 border-b border-gray-100 dark:border-gray-800">
                          {group.groupName}
                        </div>
                        <div className="space-y-0.5">
                          {group.tools.map((tool) => {
                            const Icon = tool.icon;
                            const isToolActive = location.pathname === tool.path;
                            return (
                              <Link
                                key={tool.path}
                                to={tool.path}
                                onClick={() => {
                                  if (timeoutRef.current) clearTimeout(timeoutRef.current);
                                  setOpenDropdown(null);
                                }}
                                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                                  isToolActive
                                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold'
                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                }`}
                              >
                                <Icon className={`w-4 h-4 flex-shrink-0 ${isToolActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`} />
                                <span>{tool.name}</span>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Right Section: 100% Private Badge & Dark/Light Toggle */}
          <div className="flex items-center gap-3">
            <span className="hidden sm:flex items-center gap-1 text-[11px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-900/50 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              100% Private
            </span>

            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-100/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer flex items-center gap-2 text-xs font-semibold shadow-xs"
              title="Toggle dark/light theme"
            >
              {isDark ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-slate-700" />
                  <span className="hidden sm:inline">Dark</span>
                </>
              )}
            </button>

            {/* Mobile Hamburger Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-100/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-4 space-y-4 max-h-[80vh] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Mobile Home Link */}
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                location.pathname === '/'
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                  : 'text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Home className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Home</span>
            </Link>

            {/* Mobile Tool Groups */}
            {navGroups.map((group) => (
              <div key={group.groupName} className="space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 px-3 py-1">
                  {group.groupName}
                </div>
                <div className="space-y-0.5">
                  {group.tools.map((tool) => {
                    const Icon = tool.icon;
                    const isToolActive = location.pathname === tool.path;
                    return (
                      <Link
                        key={tool.path}
                        to={tool.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                          isToolActive
                            ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        <Icon className={`w-4 h-4 flex-shrink-0 ${isToolActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`} />
                        <span>{tool.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </header>

      {/* Main Content Area Routing */}
      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <HistoryToolbar />
        <Suspense fallback={<PageLoadingFallback />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/convert" element={<ConvertPage />} />
            <Route path="/crop" element={<CropPage />} />
            <Route path="/resize" element={<ResizePage />} />
            <Route path="/compress" element={<CompressPage />} />
            <Route path="/watermark" element={<WatermarkPage />} />
            <Route path="/exif" element={<ExifPage />} />
            <Route path="/bg-remove" element={<BackgroundRemovalPage />} />
            <Route path="/meme" element={<MemePage />} />
            <Route path="/collage" element={<CollagePage />} />
            <Route path="/annotate" element={<AnnotatePage />} />
            <Route path="/filters" element={<FilterPage />} />
            <Route path="/upscale" element={<UpscalePage />} />
            <Route path="/batch" element={<BatchPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/sitemap" element={<SitemapPage />} />
          </Routes>
        </Suspense>
      </main>

      {/* SEO Footer */}
      <SeoFooter />

      {/* Global Command Palette & Hotkeys Handler */}
      <CommandPaletteAndHotkeys isDark={isDark} toggleTheme={toggleTheme} />
    </div>
  );
}

export default App;
