import React from 'react';
import { Sparkles, Cpu, ShieldCheck, Zap, Layers, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/shared/SEO';

export function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto py-6 space-y-10">
      <SEO />
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>The Next-Gen Web Image Engine</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
          About ImageTool Studio
        </h1>
        <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
          We believe high-performance image optimization should be free, instantaneous, and private — without forcing users to upload private photos to external cloud servers or pay subscriptions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Privacy First Architecture</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            Traditional image converters upload your files to remote cloud servers, exposing sensitive photographs, personal receipts, or graphic assets. ImageTool Studio runs 100% locally in your browser memory via modern HTML Canvas and WebAssembly.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Hardware Accelerated</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            Leveraging client-side GPU acceleration and bicubic sub-pixel resampling algorithms, our suite processes 4K photos and multi-image queues instantly without waiting for server queues or network latency.
          </p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white space-y-4 shadow-lg">
        <h2 className="text-2xl font-bold">Ready to process your images?</h2>
        <p className="text-sm text-blue-100 max-w-xl">
          Convert WebP to PNG, crop social media photos, resize dimensions, or upscale graphic details in seconds.
        </p>
        <div className="pt-2">
          <Link
            to="/convert"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-blue-600 hover:bg-blue-50 font-bold text-xs transition-all shadow-md"
          >
            <span>Open Image Tools</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
