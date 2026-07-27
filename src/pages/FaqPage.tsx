import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import { SEO } from '../components/shared/SEO';

interface FaqItem {
  question: string;
  answer: string;
  category: string;
}

export function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FaqItem[] = [
    {
      question: 'Are my images uploaded to any remote server or saved in the cloud?',
      answer: 'No, absolutely not. ImageTool Studio is 100% client-side. All processing (conversion, cropping, resizing, upscaling, batch processing) occurs entirely within your browser memory using WebAssembly and HTML5 Canvas APIs. Your photos never leave your device.',
      category: 'Privacy & Security',
    },
    {
      question: 'Is ImageTool Studio free to use for commercial projects?',
      answer: 'Yes! ImageTool Studio is completely free for both personal and commercial use with zero file limit thresholds, subscription fees, or forced watermarks.',
      category: 'Licensing',
    },
    {
      question: 'What image formats are supported?',
      answer: 'We support loading and converting PNG, JPEG/JPG, WebP, AVIF, GIF, SVG, BMP, and TIFF files. Output formats include WebP, PNG, JPG, and AVIF.',
      category: 'Features',
    },
    {
      question: 'How does the Super Resolution Upscaler work?',
      answer: 'Our upscaler applies sub-pixel interpolation and an unsharp masking algorithm on canvas data to increase pixel dimensions by 200% (2x) or 400% (4x) while preserving sharp contrast along edges.',
      category: 'Features',
    },
    {
      question: 'Can I process multiple images at the same time?',
      answer: 'Yes! Use our dedicated Batch Converter tool (/batch) to queue dozens of images simultaneously and download them individually or as a compressed .ZIP file.',
      category: 'Usage',
    },
    {
      question: 'What happens if I close or refresh the browser tab?',
      answer: 'Because all image data resides in temporary client browser RAM, refreshing or closing the tab immediately clears all temporary memory buffers. Make sure to download your processed results before navigating away.',
      category: 'Privacy & Security',
    },
  ];

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-8">
      <SEO />
      <div className="border-b border-gray-200 dark:border-gray-800 pb-6 text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Frequently Asked Questions</span>
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">
          Got Questions? We Have Answers.
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
          Everything you need to know about image processing, client privacy, supported formats, and performance.
        </p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden transition-colors"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 font-bold text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 uppercase">
                    {faq.category}
                  </span>
                  <span>{faq.question}</span>
                </span>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-gray-500 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
                )}
              </button>

              {isOpen && (
                <div className="px-6 pb-5 pt-1 text-xs text-gray-600 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-gray-800">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
