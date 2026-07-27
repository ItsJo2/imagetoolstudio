import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/shared/SEO';
import { PRODUCTION_DOMAIN } from '../lib/seoRegistry';
import {
  Globe,
  FileCode,
  Check,
  Copy,
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
  Search,
  ExternalLink,
  Bot,
} from 'lucide-react';
import { toast } from 'sonner';

export function SitemapPage() {
  const [copiedXml, setCopiedXml] = useState(false);
  const [copiedRobots, setCopiedRobots] = useState(false);

  const toolsList = [
    {
      path: '/convert',
      title: 'Image Format Converter',
      keywords: 'Convert PNG, WEBP, JPG, AVIF, GIF',
      icon: Sparkles,
      desc: 'High-speed format conversion engine supporting lossy & lossless outputs.',
    },
    {
      path: '/crop',
      title: 'Smart Crop & Aspect Ratio Rotator',
      keywords: 'Crop 1:1, 16:9, rotate, flip horizontal/vertical',
      icon: Crop,
      desc: 'Precision aspect ratio cropping for Instagram, LinkedIn, YouTube thumbnails.',
    },
    {
      path: '/resize',
      title: 'Dimension & Pixel Resizer',
      keywords: 'Resize px dimensions, scale percentage, bicubic resampling',
      icon: Maximize2,
      desc: 'Scale image resolution and pixel height/width accurately.',
    },
    {
      path: '/compress',
      title: 'Target KB File Size Compressor',
      keywords: 'Compress to 100KB, 200KB, 500KB limits',
      icon: HardDrive,
      desc: 'Optimize file bytes for job applications, passport forms, and fast web loading.',
    },
    {
      path: '/watermark',
      title: 'Watermark & Brand Protection',
      keywords: 'Add text copyright, overlay transparent logo PNG',
      icon: Stamp,
      desc: 'Stamp photos with custom text or image logos to prevent unauthorized copying.',
    },
    {
      path: '/exif',
      title: 'EXIF Metadata Inspector & Cleaner',
      keywords: 'Inspect GPS coordinates, camera model, strip privacy EXIF',
      icon: ShieldCheck,
      desc: 'View technical camera metadata and wipe location tracking for privacy.',
    },
    {
      path: '/bg-remove',
      title: 'Background Remover & Chroma Key',
      keywords: 'Remove white background, cutout green screen, color key',
      icon: Eraser,
      desc: 'Cut out subjects and convert solid background colors to transparent alpha.',
    },
    {
      path: '/meme',
      title: 'Meme Generator & Caption Editor',
      keywords: 'Impact text meme captions, top bottom text, meme templates',
      icon: Smile,
      desc: 'Add custom viral meme captions with stroke outlines and template presets.',
    },
    {
      path: '/collage',
      title: 'Photo Collage Maker & Grid Builder',
      keywords: 'Side by side joiner, quad photo matrix, hero split grid',
      icon: LayoutGrid,
      desc: 'Combine multiple images into customizable side-by-side photo grids.',
    },
    {
      path: '/filters',
      title: 'Color Adjustments & Preset Manager',
      keywords: 'Brightness, contrast, hue, saturation, save custom filter JSON',
      icon: Sliders,
      desc: 'Apply live color filters and store custom presets to browser memory.',
    },
    {
      path: '/upscale',
      title: 'AI Super-Resolution Upscaler',
      keywords: '2x 4x image upscaler, sharpen blurry photo, detail recovery',
      icon: Zap,
      desc: 'Enlarge small images up to 400% with sub-pixel reconstruction.',
    },
    {
      path: '/batch',
      title: 'Batch Bulk Image Processor',
      keywords: 'Bulk convert PNG, batch resize, bulk ZIP archive export',
      icon: Layers,
      desc: 'Process entire queues of images simultaneously and download as a ZIP.',
    },
  ];

  const pagesList = [
    { path: '/', title: 'Home Page', icon: Globe, desc: 'Central image processing workspace hero.' },
    { path: '/faq', title: 'Frequently Asked Questions', icon: HelpCircle, desc: 'Detailed Q&A on privacy, client-side WASM engine, and browser limits.' },
    { path: '/about', title: 'About ImageTool Studio', icon: Info, desc: 'Our mission for zero-server upload image engineering.' },
    { path: '/privacy', title: 'Privacy Policy', icon: Lock, desc: '100% browser-only client-side privacy guarantee.' },
    { path: '/terms', title: 'Terms of Service', icon: FileText, desc: 'Usage rules and open-source licensing terms.' },
    { path: '/contact', title: 'Contact Support', icon: Mail, desc: 'Get in touch with feature requests and feedback.' },
  ];

  const xmlSitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemap.org/schemas/sitemap/0.9">
  <url>
    <loc>${PRODUCTION_DOMAIN}/</loc>
    <lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  ${toolsList
    .map(
      (t) => `  <url>
    <loc>${PRODUCTION_DOMAIN}${t.path}</loc>
    <lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`
    )
    .join('\n')}
  ${pagesList
    .map(
      (p) => `  <url>
    <loc>${PRODUCTION_DOMAIN}${p.path}</loc>
    <lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`
    )
    .join('\n')}
</urlset>`;

  const robotsTxtContent = `User-agent: *
Allow: /
Disallow: /api/

Sitemap: ${PRODUCTION_DOMAIN}/sitemap.xml`;

  const copyToClipboard = (text: string, type: 'xml' | 'robots') => {
    navigator.clipboard.writeText(text);
    if (type === 'xml') {
      setCopiedXml(true);
      setTimeout(() => setCopiedXml(false), 2000);
      toast.success('Copied XML Sitemap to clipboard!');
    } else {
      setCopiedRobots(true);
      setTimeout(() => setCopiedRobots(false), 2000);
      toast.success('Copied robots.txt to clipboard!');
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 space-y-12">
      <SEO />

      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 me-1 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
          <Globe className="w-3.5 h-3.5" />
          <span>SEO Sitemap & Search Index Directory</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-gray-100">
          ImageTool Studio Sitemap & Search Tools
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
          Index directory of all browser-based image processing tools, conversion guides, and search engine crawler metadata.
        </p>
      </div>

      {/* Tools Sitemap Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <FileCode className="w-5 h-5 text-indigo-500" />
          Image Processing Tools Index ({toolsList.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {toolsList.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.path}
                to={tool.path}
                className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-indigo-500/60 transition-all flex flex-col justify-between group shadow-2xs hover:shadow-md"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                      <Icon className="w-5 h-5" />
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{tool.desc}</p>
                </div>

                <div className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between text-[10px] text-gray-400">
                  <span className="font-mono text-indigo-500 dark:text-indigo-400">{tool.path}</span>
                  <span className="truncate max-w-[150px]">{tool.keywords}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Pages Directory */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Globe className="w-5 h-5 text-blue-500" />
          General Information & Legal Pages
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pagesList.map((page) => {
            const Icon = page.icon;
            return (
              <Link
                key={page.path}
                to={page.path}
                className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-blue-500/60 transition-all flex items-start gap-3 group"
              >
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {page.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{page.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* XML Sitemap & Robots.txt Webmaster Output */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* XML Sitemap */}
        <div className="p-5 rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <FileCode className="w-4 h-4 text-emerald-500" /> XML Sitemap (sitemap.xml)
            </h3>
            <button
              type="button"
              onClick={() => copyToClipboard(xmlSitemapContent, 'xml')}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-xs font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {copiedXml ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedXml ? 'Copied XML' : 'Copy XML'}
            </button>
          </div>

          <pre className="p-4 rounded-2xl bg-gray-950 text-gray-200 text-xs font-mono overflow-x-auto max-h-64 leading-relaxed border border-gray-800">
            {xmlSitemapContent}
          </pre>
        </div>

        {/* Robots.txt */}
        <div className="p-5 rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Bot className="w-4 h-4 text-purple-500" /> Search Crawler Policy (robots.txt)
            </h3>
            <button
              type="button"
              onClick={() => copyToClipboard(robotsTxtContent, 'robots')}
              className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800 text-xs font-bold hover:bg-purple-100 dark:hover:bg-purple-900/60 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {copiedRobots ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedRobots ? 'Copied robots.txt' : 'Copy robots.txt'}
            </button>
          </div>

          <pre className="p-4 rounded-2xl bg-gray-950 text-purple-300 text-xs font-mono overflow-x-auto max-h-64 leading-relaxed border border-gray-800">
            {robotsTxtContent}
          </pre>
        </div>
      </div>
    </div>
  );
}
