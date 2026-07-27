import React from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/shared/SEO';
import { Sparkles, Crop, Maximize2, Zap, Layers, ArrowRight, Sliders, HardDrive, Stamp, ShieldCheck, Eraser, Smile, LayoutGrid, Shield, Cpu, Lock, CheckCircle2, PenTool } from 'lucide-react';

export function HomePage() {
  const services = [
    {
      path: '/convert',
      title: 'Format Converter',
      description: 'Convert PNG, JPG, WebP, AVIF, GIF, SVG, BMP in high quality.',
      icon: Sparkles,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950/50',
      borderColor: 'hover:border-blue-500/60',
      badge: 'Popular',
    },
    {
      path: '/crop',
      title: 'Smart Crop & Rotate',
      description: 'Crop to social ratios (1:1, 16:9, 4:5), rotate 90°, or flip axis.',
      icon: Crop,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/50',
      borderColor: 'hover:border-emerald-500/60',
      badge: 'Precise',
    },
    {
      path: '/resize',
      title: 'Precision Resize',
      description: 'Change dimensions by percentage or exact px with bicubic resampling.',
      icon: Maximize2,
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/50',
      borderColor: 'hover:border-indigo-500/60',
      badge: 'High DPI',
    },
    {
      path: '/compress',
      title: 'Target File Size Compressor',
      description: 'Specify an exact byte limit (100 KB, 500 KB, 1 MB) for portal uploads.',
      icon: HardDrive,
      color: 'text-teal-600 dark:text-teal-400',
      bgColor: 'bg-teal-50 dark:bg-teal-950/50',
      borderColor: 'hover:border-teal-500/60',
      badge: 'KB Target',
    },
    {
      path: '/watermark',
      title: 'Watermark & Brand Protection',
      description: 'Stamp custom text copyright badges or transparent logo overlays on photos.',
      icon: Stamp,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-950/50',
      borderColor: 'hover:border-purple-500/60',
      badge: 'Branding',
    },
    {
      path: '/exif',
      title: 'EXIF Inspector & Privacy Cleaner',
      description: 'Inspect image technical metadata and strip camera/GPS tags for privacy.',
      icon: ShieldCheck,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950/50',
      borderColor: 'hover:border-blue-500/60',
      badge: 'Privacy',
    },
    {
      path: '/bg-remove',
      title: 'Background Removal & Chroma Key',
      description: 'Isolate subjects and cut out solid backgrounds, white backdrops, or green screens.',
      icon: Eraser,
      color: 'text-rose-600 dark:text-rose-400',
      bgColor: 'bg-rose-50 dark:bg-rose-950/50',
      borderColor: 'hover:border-rose-500/60',
      badge: 'Chroma Key',
    },
    {
      path: '/meme',
      title: 'Image Meme & Caption Studio',
      description: 'Add top/bottom impact captions with custom fonts, stroke outlines, and presets.',
      icon: Smile,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-950/50',
      borderColor: 'hover:border-amber-500/60',
      badge: 'Captions',
    },
    {
      path: '/collage',
      title: 'Photo Collage & Grid Builder',
      description: 'Combine multiple photos into customizable side-by-side grids, quad matrices, or hero splits.',
      icon: LayoutGrid,
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/50',
      borderColor: 'hover:border-indigo-500/60',
      badge: 'Grid Layouts',
    },
    {
      path: '/annotate',
      title: 'Annotate, Shape & Sensitive Blur Editor',
      description: 'Draw callout arrows, text labels, step badges, highlighter pen, or pixelate sensitive credit cards and faces.',
      icon: PenTool,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950/50',
      borderColor: 'hover:border-blue-500/60',
      badge: 'Markup & Blur',
    },
    {
      path: '/filters',
      title: 'Color Adjustments & Filters',
      description: 'Adjust brightness, contrast, saturation, hue, sepia, and artistic style presets.',
      icon: Sliders,
      color: 'text-pink-600 dark:text-pink-400',
      bgColor: 'bg-pink-50 dark:bg-pink-950/50',
      borderColor: 'hover:border-pink-500/60',
      badge: 'Live GPU',
    },
    {
      path: '/upscale',
      title: 'Super Resolution Upscale',
      description: 'Enlarge image dimensions up to 2x or 4x with bicubic interpolation and adjustable edge sharpening.',
      icon: Zap,
      color: 'text-amber-500 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-950/50',
      borderColor: 'hover:border-amber-500/60',
      badge: 'Bicubic + Sharpen',
    },
    {
      path: '/batch',
      title: 'Batch Convert & Export',
      description: 'Process queues of images simultaneously and download as a ZIP.',
      icon: Layers,
      color: 'text-violet-600 dark:text-violet-400',
      bgColor: 'bg-violet-50 dark:bg-violet-950/50',
      borderColor: 'hover:border-violet-500/60',
      badge: 'Bulk ZIP',
    },
  ];

  return (
    <div className="space-y-16 py-4">
      <SEO />

      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>100% Client-Side • Ultra Fast • Private Canvas Engine</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50 leading-tight">
          Professional Private Image Studio in Your Browser
        </h1>
        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
          Select a dedicated image service below to start transforming instantly without uploading files to remote servers.
        </p>
      </div>

      {/* Services Grid Navigation Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Image Processing Tools Index
          </h2>
          <span className="text-xs text-gray-500 font-medium">Click any service to open tool page</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((s) => {
            const Icon = s.icon;
            return (
              <Link
                key={s.path}
                to={s.path}
                className={`group p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between ${s.borderColor}`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-xl ${s.bgColor} ${s.color} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                      {s.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {s.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">
                      {s.description}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800/80 flex items-center text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
                  <span>Open {s.title}</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* SEO Content & Feature Comparison Matrix Section */}
      <section className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-8 sm:p-10 space-y-8 shadow-xs">
        <div className="max-w-3xl space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Why ImageTool Studio?
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
            Next-Generation Client-Side Photo Processing Engine
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            Traditional online image editors upload your personal photos and sensitive documents to external cloud servers, exposing you to privacy risks, bandwidth caps, and server lag. ImageTool Studio executes 100% of image rendering locally in your browser hardware using modern WebAssembly and HTML5 Canvas APIs.
          </p>
        </div>

        {/* Feature Grid Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-950 border border-gray-200/80 dark:border-gray-800 space-y-2">
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 w-fit">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">100% Private & Local</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Your images never leave your computer. Complete confidentiality for medical records, passports, personal photos, and sensitive assets.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-950 border border-gray-200/80 dark:border-gray-800 space-y-2">
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 w-fit">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">GPU & Hardware Speed</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Leverages your device’s GPU for instant color adjustments, multi-file batch processing, and high-fidelity upscaling without waiting for server queues.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-950 border border-gray-200/80 dark:border-gray-800 space-y-2">
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 w-fit">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">No Signup & Free Limits</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              No account required, no subscription paywalls, no watermark force-stamps, and unlimited file exports in PNG, WEBP, AVIF, and JPG.
            </p>
          </div>
        </div>

        {/* Supported Formats Table */}
        <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            Supported File Format Compatibility Matrix
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-400 uppercase font-semibold">
                  <th className="py-2.5 px-3">Format</th>
                  <th className="py-2.5 px-3">Primary Use Case</th>
                  <th className="py-2.5 px-3">Transparency (Alpha)</th>
                  <th className="py-2.5 px-3">Browser Compression</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-700 dark:text-gray-300 font-medium">
                <tr>
                  <td className="py-3 px-3 font-bold text-indigo-600 dark:text-indigo-400">WebP</td>
                  <td className="py-3 px-3">Modern web performance, ultra-small file sizes</td>
                  <td className="py-3 px-3"><CheckCircle2 className="w-4 h-4 text-emerald-500 inline" /> Supported</td>
                  <td className="py-3 px-3">Lossy & Lossless adjustable</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-bold text-indigo-600 dark:text-indigo-400">PNG</td>
                  <td className="py-3 px-3">High-fidelity graphics, logos, illustrations</td>
                  <td className="py-3 px-3"><CheckCircle2 className="w-4 h-4 text-emerald-500 inline" /> Supported</td>
                  <td className="py-3 px-3">Lossless crisp details</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-bold text-indigo-600 dark:text-indigo-400">JPEG / JPG</td>
                  <td className="py-3 px-3">Standard photography, social media uploads</td>
                  <td className="py-3 px-3 text-gray-400">Solid canvas background</td>
                  <td className="py-3 px-3">0-100% quality slider</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-bold text-indigo-600 dark:text-indigo-400">AVIF</td>
                  <td className="py-3 px-3">Next-gen web format with high compression efficiency</td>
                  <td className="py-3 px-3"><CheckCircle2 className="w-4 h-4 text-emerald-500 inline" /> Supported</td>
                  <td className="py-3 px-3">Ultra-compressed bytes</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-bold text-indigo-600 dark:text-indigo-400">GIF</td>
                  <td className="py-3 px-3">Memes, simple animations, badge icons</td>
                  <td className="py-3 px-3"><CheckCircle2 className="w-4 h-4 text-emerald-500 inline" /> Supported</td>
                  <td className="py-3 px-3">Palette color quantizing</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}

