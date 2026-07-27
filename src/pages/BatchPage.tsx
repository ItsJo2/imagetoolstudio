import React, { useState } from 'react';
import { BatchTool } from '../components/tools/BatchTool';
import { RecipeManager } from '../components/tools/RecipeManager';
import { SocialMediaExporter } from '../components/tools/SocialMediaExporter';
import { SEO } from '../components/shared/SEO';
import { Layers, Workflow, Share2, Sparkles } from 'lucide-react';

export function BatchPage() {
  const [activeTab, setActiveTab] = useState<'batch' | 'recipes' | 'social'>('batch');

  return (
    <div className="space-y-6">
      <SEO />

      {/* Service Header Info */}
      <div className="border-b border-gray-200 dark:border-gray-800 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-violet-600 dark:text-violet-400 mb-1">
            <Layers className="w-4 h-4" />
            <span>Batch Automation & Export Studio</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">
            Batch Workflow Automation & Export Templates
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Execute bulk format conversions, automated multi-step pipeline recipes, or 1-click social media asset exports.
          </p>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-3 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab('batch')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'batch'
              ? 'bg-violet-600 text-white shadow-sm'
              : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
          }`}
        >
          <Layers className="w-4 h-4" /> Batch Format Converter
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('recipes')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'recipes'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
          }`}
        >
          <Workflow className="w-4 h-4" /> Custom Export Recipes
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('social')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'social'
              ? 'bg-pink-600 text-white shadow-sm'
              : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
          }`}
        >
          <Share2 className="w-4 h-4" /> Social Media Presets
        </button>
      </div>

      {/* Active Tab Panel */}
      <div>
        {activeTab === 'batch' && <BatchTool />}
        {activeTab === 'recipes' && <RecipeManager />}
        {activeTab === 'social' && <SocialMediaExporter />}
      </div>
    </div>
  );
}
