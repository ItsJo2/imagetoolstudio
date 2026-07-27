import React from 'react';
import { Scale, CheckCircle2, AlertCircle } from 'lucide-react';
import { SEO } from '../components/shared/SEO';

export function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto py-6 space-y-8">
      <SEO />
      <div className="border-b border-gray-200 dark:border-gray-800 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-3">
          <Scale className="w-3.5 h-3.5" />
          <span>User Agreement & License</span>
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">
          Terms of Service
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Last updated: July 2026 • Please read these terms carefully before using ImageTool Studio.
        </p>
      </div>

      <div className="prose dark:prose-invert max-w-none text-sm text-gray-600 dark:text-gray-300 space-y-6 leading-relaxed bg-white dark:bg-gray-900 p-8 rounded-2xl border border-gray-200 dark:border-gray-800">
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing or using ImageTool Studio, you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not use our browser-based image processing applications.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            2. License & Permitted Use
          </h2>
          <p>
            ImageTool Studio provides free, client-side web utility software for converting, cropping, resizing, upscaling, and batch-processing digital images. You are granted a personal, non-exclusive, non-transferable license to use the service for both personal and commercial image editing purposes.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            3. Disclaimer of Warranties
          </h2>
          <p>
            ImageTool Studio is provided "AS IS" and "AS AVAILABLE" without warranties of any kind, either express or implied. Since processing occurs locally on your browser hardware, output performance and speed depend on your device CPU, RAM, and browser WebAssembly capabilities.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            4. User Responsibility
          </h2>
          <p>
            You retain 100% ownership and copyright of all images you process using ImageTool Studio. You are solely responsible for ensuring you have appropriate rights and permissions for any graphics, photographs, or assets you modify.
          </p>
        </section>
      </div>
    </div>
  );
}
