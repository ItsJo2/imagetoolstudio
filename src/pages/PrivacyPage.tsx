import React from 'react';
import { Shield, Lock, HardDrive, EyeOff } from 'lucide-react';
import { SEO } from '../components/shared/SEO';

export function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto py-6 space-y-8">
      <SEO />
      <div className="border-b border-gray-200 dark:border-gray-800 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-3">
          <Shield className="w-3.5 h-3.5" />
          <span>Zero-Data-Collection Guarantee</span>
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">
          Privacy Policy
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Last updated: July 2026 • Effective immediately
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 space-y-2">
          <HardDrive className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm">100% Client-Side</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            Your images stay strictly inside your browser memory. They are never uploaded or transmitted to remote servers.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 space-y-2">
          <Lock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm">No Third-Party Analytics</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            We do not use tracking pixels, ad networks, or sell telemetry data. Your editing session is completely isolated.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 space-y-2">
          <EyeOff className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm">Zero File Storage</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            Once you close or refresh your browser tab, all temporary image buffers and memory blobs are immediately wiped.
          </p>
        </div>
      </div>

      <div className="prose dark:prose-invert max-w-none text-sm text-gray-600 dark:text-gray-300 space-y-6 leading-relaxed bg-white dark:bg-gray-900 p-8 rounded-2xl border border-gray-200 dark:border-gray-800">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">1. Information We Do Not Collect</h2>
          <p>
            ImageTool Studio operates on a decentralized, web-native architecture powered by HTML5 Canvas, WebAssembly, and local JavaScript workers. We do not maintain user databases, login systems, or backend storage buckets. When you drop an image into our tools, it is processed directly by your computer or phone CPU/GPU hardware.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">2. Local Browser Storage</h2>
          <p>
            The app may save small UI configuration preferences (such as your preferred color theme preference: Light or Dark mode) in your browser’s standard <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">localStorage</code>. No personal information or image data is stored in cookie trackers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">3. Compliance for Sensitive Images</h2>
          <p>
            Because no data leaves your client device, ImageTool Studio is inherently compliant with strict data privacy guidelines including GDPR, HIPAA, and CCPA for personal document and photo editing.
          </p>
        </section>
      </div>
    </div>
  );
}
