import { ImageFilterOptions, WatermarkOptions } from '../lib/imageUtils';

export type RecipeStepType = 'resize' | 'watermark' | 'filter' | 'exif_strip' | 'format';

export interface ResizeStepConfig {
  enabled: boolean;
  mode: 'exact' | 'max_width' | 'max_height' | 'percentage';
  width: number;
  height: number;
  percentage: number; // e.g. 50%
  fitMode: 'contain' | 'cover' | 'stretch';
  bgColor: string; // e.g. #ffffff
}

export interface WatermarkStepConfig {
  enabled: boolean;
  type: 'text' | 'image';
  text: string;
  fontFamily: string;
  fontSize: number; // e.g. 36
  color: string;
  opacity: number; // 0 to 1
  position: 'top-left' | 'top-center' | 'top-right' | 'center-left' | 'center' | 'center-right' | 'bottom-left' | 'bottom-center' | 'bottom-right' | 'tiled';
  rotation: number;
  logoUrl?: string;
  logoScale: number;
  margin: number;
}

export interface FilterStepConfig {
  enabled: boolean;
  filters: ImageFilterOptions;
}

export interface ExifStripStepConfig {
  enabled: boolean;
}

export interface FormatStepConfig {
  targetFormat: 'webp' | 'png' | 'jpg' | 'avif';
  quality: number; // 0.1 to 1.0
}

export interface ExportRecipe {
  id: string;
  name: string;
  description: string;
  icon?: string;
  isBuiltIn?: boolean;
  createdAt: number;
  steps: {
    resize: ResizeStepConfig;
    watermark: WatermarkStepConfig;
    filter: FilterStepConfig;
    exifStrip: ExifStripStepConfig;
    format: FormatStepConfig;
  };
}

export interface SocialMediaPreset {
  id: string;
  platform: 'YouTube' | 'Instagram' | 'Twitter / X' | 'Facebook' | 'LinkedIn' | 'Pinterest' | 'TikTok';
  title: string;
  width: number;
  height: number;
  aspectRatioLabel: string;
  format: 'jpg' | 'png' | 'webp';
  quality: number;
  description: string;
  recommendedFit: 'cover' | 'contain';
  badgeColor: string;
}
