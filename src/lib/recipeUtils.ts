import {
  ProcessedResult,
  createManagedObjectURL,
  resizeImage,
  applyImageFilters,
  applyWatermark,
  stripExifMetadata,
  convertImageFormat,
} from './imageUtils';
import { ExportRecipe, SocialMediaPreset } from '../types/recipe';

/**
 * Built-in Social Media Presets mapping exact platform requirements.
 */
export const BUILTIN_SOCIAL_PRESETS: SocialMediaPreset[] = [
  {
    id: 'youtube_thumbnail',
    platform: 'YouTube',
    title: 'YouTube Thumbnail',
    width: 1280,
    height: 720,
    aspectRatioLabel: '16:9',
    format: 'jpg',
    quality: 0.92,
    description: 'Standard 1280x720 cover image for videos',
    recommendedFit: 'cover',
    badgeColor: 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 border-red-200 dark:border-red-900/50',
  },
  {
    id: 'instagram_square',
    platform: 'Instagram',
    title: 'Instagram Post (1:1)',
    width: 1080,
    height: 1080,
    aspectRatioLabel: '1:1',
    format: 'jpg',
    quality: 0.92,
    description: 'Classic square feed post format',
    recommendedFit: 'cover',
    badgeColor: 'bg-pink-50 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300 border-pink-200 dark:border-pink-900/50',
  },
  {
    id: 'instagram_story',
    platform: 'Instagram',
    title: 'Instagram Story / Reel',
    width: 1080,
    height: 1920,
    aspectRatioLabel: '9:16',
    format: 'jpg',
    quality: 0.92,
    description: 'Full vertical screen story & reel dimensions',
    recommendedFit: 'cover',
    badgeColor: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-900/50',
  },
  {
    id: 'twitter_header',
    platform: 'Twitter / X',
    title: 'Twitter Header Banner',
    width: 1500,
    height: 500,
    aspectRatioLabel: '3:1',
    format: 'jpg',
    quality: 0.92,
    description: 'Profile background banner',
    recommendedFit: 'cover',
    badgeColor: 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-900/50',
  },
  {
    id: 'facebook_cover',
    platform: 'Facebook',
    title: 'Facebook Page Cover',
    width: 820,
    height: 312,
    aspectRatioLabel: '2.6:1',
    format: 'jpg',
    quality: 0.92,
    description: 'Desktop and mobile Facebook page cover',
    recommendedFit: 'cover',
    badgeColor: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-900/50',
  },
  {
    id: 'linkedin_banner',
    platform: 'LinkedIn',
    title: 'LinkedIn Profile Banner',
    width: 1584,
    height: 396,
    aspectRatioLabel: '4:1',
    format: 'png',
    quality: 0.95,
    description: 'Professional personal profile background banner',
    recommendedFit: 'cover',
    badgeColor: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900/50',
  },
  {
    id: 'pinterest_pin',
    platform: 'Pinterest',
    title: 'Pinterest Vertical Pin',
    width: 1000,
    height: 1500,
    aspectRatioLabel: '2:3',
    format: 'jpg',
    quality: 0.92,
    description: 'Optimized vertical pin ratio for search feed',
    recommendedFit: 'cover',
    badgeColor: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-900/50',
  },
  {
    id: 'tiktok_cover',
    platform: 'TikTok',
    title: 'TikTok Cover Image',
    width: 1080,
    height: 1920,
    aspectRatioLabel: '9:16',
    format: 'webp',
    quality: 0.90,
    description: 'High resolution vertical preview image',
    recommendedFit: 'cover',
    badgeColor: 'bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200 dark:border-teal-900/50',
  },
];

/**
 * Executes a custom multi-step export recipe pipeline on an image.
 */
export async function executeRecipePipeline(
  imageUrl: string,
  recipe: ExportRecipe,
  originalFilename: string = 'image'
): Promise<ProcessedResult> {
  let currentUrl = imageUrl;
  const steps = recipe.steps;

  // Step 1: Resize Step
  if (steps.resize.enabled) {
    const imgInfo = await loadImageDimensions(currentUrl);
    let targetW = imgInfo.width;
    let targetH = imgInfo.height;

    if (steps.resize.mode === 'percentage') {
      const scale = Math.max(0.01, steps.resize.percentage / 100);
      targetW = Math.round(imgInfo.width * scale);
      targetH = Math.round(imgInfo.height * scale);
    } else if (steps.resize.mode === 'max_width') {
      if (imgInfo.width > steps.resize.width) {
        targetW = steps.resize.width;
        targetH = Math.round((imgInfo.height * steps.resize.width) / imgInfo.width);
      }
    } else if (steps.resize.mode === 'max_height') {
      if (imgInfo.height > steps.resize.height) {
        targetH = steps.resize.height;
        targetW = Math.round((imgInfo.width * steps.resize.height) / imgInfo.height);
      }
    } else {
      targetW = steps.resize.width || imgInfo.width;
      targetH = steps.resize.height || imgInfo.height;
    }

    const resized = await resizeImage(
      currentUrl,
      targetW,
      targetH,
      'png',
      1.0,
      originalFilename,
      true,
      'high'
    );
    currentUrl = resized.url;
  }

  // Step 2: Filters / Adjustments Step
  if (steps.filter.enabled) {
    const filtered = await applyImageFilters(
      currentUrl,
      steps.filter.filters,
      'png',
      1.0,
      originalFilename
    );
    currentUrl = filtered.url;
  }

  // Step 3: Watermark Step
  if (steps.watermark.enabled) {
    const watermarked = await applyWatermark(
      currentUrl,
      {
        type: steps.watermark.type,
        text: steps.watermark.text,
        fontFamily: steps.watermark.fontFamily,
        fontSize: steps.watermark.fontSize,
        color: steps.watermark.color,
        opacity: steps.watermark.opacity,
        position: steps.watermark.position,
        rotation: steps.watermark.rotation,
        logoUrl: steps.watermark.logoUrl,
        logoScale: steps.watermark.logoScale,
        margin: steps.watermark.margin,
      },
      'png',
      1.0,
      originalFilename
    );
    currentUrl = watermarked.url;
  }

  // Step 4: Strip EXIF
  if (steps.exifStrip.enabled) {
    const stripped = await stripExifMetadata(currentUrl, 'png', 1.0, originalFilename);
    currentUrl = stripped.url;
  }

  // Step 5: Final Target Format & Quality
  const finalResult = await convertImageFormat(
    currentUrl,
    steps.format.targetFormat,
    steps.format.quality,
    '#ffffff',
    `${originalFilename}_recipe_${cleanRecipeSlug(recipe.name)}`
  );

  return finalResult;
}

/**
 * Executes a single social media preset export on an image.
 */
export async function executeSocialMediaPreset(
  imageUrl: string,
  preset: SocialMediaPreset,
  originalFilename: string = 'image'
): Promise<ProcessedResult> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const origW = img.naturalWidth || img.width;
      const origH = img.naturalHeight || img.height;

      const canvas = document.createElement('canvas');
      canvas.width = preset.width;
      canvas.height = preset.height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Could not get 2D canvas context'));
        return;
      }

      const mimeType = preset.format === 'jpg' ? 'image/jpeg' : `image/${preset.format}`;

      // Fill background for JPG
      if (mimeType === 'image/jpeg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, preset.width, preset.height);
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      let drawX = 0;
      let drawY = 0;
      let drawW = preset.width;
      let drawH = preset.height;

      if (preset.recommendedFit === 'cover') {
        const scale = Math.max(preset.width / origW, preset.height / origH);
        drawW = origW * scale;
        drawH = origH * scale;
        drawX = (preset.width - drawW) / 2;
        drawY = (preset.height - drawH) / 2;
      } else {
        const scale = Math.min(preset.width / origW, preset.height / origH);
        drawW = origW * scale;
        drawH = origH * scale;
        drawX = (preset.width - drawW) / 2;
        drawY = (preset.height - drawH) / 2;
      }

      ctx.drawImage(img, drawX, drawY, drawW, drawH);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error(`Failed to generate ${preset.title}`));
            return;
          }

          const baseName = originalFilename.substring(0, originalFilename.lastIndexOf('.')) || originalFilename;
          const ext = preset.format;
          const filename = `${baseName}_${preset.id}.${ext}`;
          const url = createManagedObjectURL(blob);

          resolve({
            blob,
            url,
            filename,
            width: preset.width,
            height: preset.height,
            sizeBytes: blob.size,
          });
        },
        mimeType,
        preset.quality
      );
    };

    img.onerror = () => reject(new Error('Failed to load image for social media preset export'));
    img.src = imageUrl;
  });
}

function loadImageDimensions(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve({ width: img.naturalWidth || img.width, height: img.naturalHeight || img.height });
    img.onerror = () => reject(new Error('Failed to load image dimensions'));
    img.src = url;
  });
}

function cleanRecipeSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-0]/g, '_').replace(/_+/g, '_').substring(0, 15);
}
