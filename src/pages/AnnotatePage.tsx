import React from 'react';
import { AnnotateTool } from '../components/tools/AnnotateTool';
import { SEO } from '../components/shared/SEO';
import { PenTool, Highlighter, EyeOff, Hash, ArrowRight, ShieldCheck } from 'lucide-react';

export function AnnotatePage() {
  return (
    <div className="space-y-6">
      <SEO />

      {/* Page Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">
            <PenTool className="w-4 h-4" />
            <span>Markup & Security Canvas Editor</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">
            Annotate, Shape & Sensitive Blur Editor
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Markup screenshots, draw callout arrows & step numbers, highlight key areas, or pixelate sensitive credit cards and emails.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-900/50 font-medium">
          <ShieldCheck className="w-4 h-4" /> Client-Side Pixel Blur
        </div>
      </div>

      {/* Feature Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 flex items-center gap-2.5">
          <ArrowRight className="w-4 h-4 text-blue-500 flex-shrink-0" />
          <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">Arrows & Shapes</span>
        </div>
        <div className="p-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 flex items-center gap-2.5">
          <Highlighter className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">Freehand Highlighter</span>
        </div>
        <div className="p-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 flex items-center gap-2.5">
          <Hash className="w-4 h-4 text-purple-500 flex-shrink-0" />
          <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">Numbered Callouts</span>
        </div>
        <div className="p-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 flex items-center gap-2.5">
          <EyeOff className="w-4 h-4 text-rose-500 flex-shrink-0" />
          <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">Pixelate Sensitive Data</span>
        </div>
      </div>

      {/* Main Annotate Tool */}
      <AnnotateTool />
    </div>
  );
}
