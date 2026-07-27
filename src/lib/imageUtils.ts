/**
 * Helper utility functions for client-side image processing.
 */

// Global registry to track created Object URLs and avoid memory leaks
const trackedObjectUrls = new Set<string>();

export function createManagedObjectURL(blob: Blob): string {
  const url = URL.createObjectURL(blob);
  trackedObjectUrls.add(url);
  return url;
}

export function revokeManagedObjectURL(url: string): void {
  if (trackedObjectUrls.has(url)) {
    URL.revokeObjectURL(url);
    trackedObjectUrls.delete(url);
  } else if (url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
}

export function revokeAllTrackedObjectURLs(): void {
  trackedObjectUrls.forEach((url) => URL.revokeObjectURL(url));
  trackedObjectUrls.clear();
}

export interface ProcessedResult {
  blob: Blob;
  url: string;
  filename: string;
  width: number;
  height: number;
  sizeBytes: number;
}

/**
 * Downloads a Blob directly to the user's browser.
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = createManagedObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => revokeManagedObjectURL(url), 10000);
}

/**
 * Converts image source URL to a specified format and quality.
 */
export async function convertImageFormat(
  imageUrl: string,
  targetFormat: string, // e.g. 'png', 'jpeg', 'webp', 'avif'
  quality: number = 0.92, // 0 to 1
  backgroundColor: string = '#ffffff', // for transparent formats converting to jpeg
  originalFilename: string = 'image',
  smoothing: boolean = true
): Promise<ProcessedResult> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Could not create canvas context'));
        return;
      }

      ctx.imageSmoothingEnabled = smoothing;
      if (smoothing) {
        ctx.imageSmoothingQuality = 'high';
      }

      const mimeType = targetFormat === 'jpg' ? 'image/jpeg' : `image/${targetFormat}`;

      // If converting transparent image to JPEG, fill background with background color
      if (mimeType === 'image/jpeg') {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(img, 0, 0);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to create image blob'));
            return;
          }

          const baseName = originalFilename.substring(0, originalFilename.lastIndexOf('.')) || originalFilename;
          const ext = targetFormat === 'jpeg' ? 'jpg' : targetFormat;
          const filename = `${baseName}_converted.${ext}`;
          const url = createManagedObjectURL(blob);

          resolve({
            blob,
            url,
            filename,
            width: canvas.width,
            height: canvas.height,
            sizeBytes: blob.size,
          });
        },
        mimeType,
        quality
      );
    };

    img.onerror = () => reject(new Error('Failed to load source image'));
    img.src = imageUrl;
  });
}

/**
 * Resizes an image to specified dimensions with optional aspect ratio constraint.
 */
export async function resizeImage(
  imageUrl: string,
  targetWidth: number,
  targetHeight: number,
  format: string = 'png',
  quality: number = 0.92,
  originalFilename: string = 'image',
  smoothing: boolean = true,
  smoothingQuality: ImageSmoothingQuality = 'high'
): Promise<ProcessedResult> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Could not create canvas context'));
        return;
      }

      // Smooth resizing algorithm configuration
      ctx.imageSmoothingEnabled = smoothing;
      if (smoothing) {
        ctx.imageSmoothingQuality = smoothingQuality;
      }

      const mimeType = format === 'jpg' || format === 'jpeg' ? 'image/jpeg' : `image/${format}`;
      if (mimeType === 'image/jpeg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, targetWidth, targetHeight);
      }

      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to resize image'));
            return;
          }

          const baseName = originalFilename.substring(0, originalFilename.lastIndexOf('.')) || originalFilename;
          const ext = format === 'jpeg' ? 'jpg' : format;
          const filename = `${baseName}_resized_${targetWidth}x${targetHeight}.${ext}`;
          const url = createManagedObjectURL(blob);

          resolve({
            blob,
            url,
            filename,
            width: targetWidth,
            height: targetHeight,
            sizeBytes: blob.size,
          });
        },
        mimeType,
        quality
      );
    };

    img.onerror = () => reject(new Error('Failed to load image for resizing'));
    img.src = imageUrl;
  });
}

/**
 * Upscales an image using high-quality Canvas interpolation + unsharp mask algorithm.
 */
export async function upscaleImage(
  imageUrl: string,
  scaleFactor: number = 2, // 2x, 4x
  sharpenAmount: number = 0.3,
  format: string = 'png',
  quality: number = 0.95,
  originalFilename: string = 'image'
): Promise<ProcessedResult> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const originalW = img.naturalWidth || img.width;
      const originalH = img.naturalHeight || img.height;
      const targetW = Math.round(originalW * scaleFactor);
      const targetH = Math.round(originalH * scaleFactor);

      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Could not create canvas context'));
        return;
      }

      // Step-down/step-up multi-pass high quality scaling
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      const mimeType = format === 'jpg' || format === 'jpeg' ? 'image/jpeg' : `image/${format}`;
      if (mimeType === 'image/jpeg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, targetW, targetH);
      }

      // Draw upscaled
      ctx.drawImage(img, 0, 0, targetW, targetH);

      // Apply subtle sharpening filter pass if requested
      if (sharpenAmount > 0) {
        try {
          const imageData = ctx.getImageData(0, 0, targetW, targetH);
          applySharpenFilter(imageData, sharpenAmount);
          ctx.putImageData(imageData, 0, 0);
        } catch {
          // Cross-origin fallback safety
        }
      }

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to upscale image'));
            return;
          }

          const baseName = originalFilename.substring(0, originalFilename.lastIndexOf('.')) || originalFilename;
          const ext = format === 'jpeg' ? 'jpg' : format;
          const filename = `${baseName}_upscaled_${scaleFactor}x.${ext}`;
          const url = createManagedObjectURL(blob);

          resolve({
            blob,
            url,
            filename,
            width: targetW,
            height: targetH,
            sizeBytes: blob.size,
          });
        },
        mimeType,
        quality
      );
    };

    img.onerror = () => reject(new Error('Failed to load image for upscaling'));
    img.src = imageUrl;
  });
}

/**
 * 3x3 Sharpen Kernel Convolution for crisp detailed upscaling
 */
function applySharpenFilter(imageData: ImageData, factor: number): void {
  const data = imageData.data;
  const w = imageData.width;
  const h = imageData.height;

  // Lightweight 3x3 sharpen kernel matrix
  // [  0, -f,  0 ]
  // [ -f, 1+4f, -f ]
  // [  0, -f,  0 ]
  const copy = new Uint8ClampedArray(data);

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = (y * w + x) * 4;

      for (let c = 0; c < 3; c++) { // R, G, B
        const top = copy[((y - 1) * w + x) * 4 + c];
        const bottom = copy[((y + 1) * w + x) * 4 + c];
        const left = copy[(y * w + (x - 1)) * 4 + c];
        const right = copy[(y * w + (x + 1)) * 4 + c];
        const center = copy[idx + c];

        const val = center * (1 + 4 * factor) - (top + bottom + left + right) * factor;
        data[idx + c] = Math.min(255, Math.max(0, val));
      }
    }
  }
}

/**
 * Generates cropped image Blob from canvas coordinates
 */
export async function getCroppedImg(
  image: HTMLImageElement,
  cropPixel: { x: number; y: number; width: number; height: number },
  rotation: number = 0,
  flip: { horizontal: boolean; vertical: boolean } = { horizontal: false, vertical: false },
  format: string = 'png',
  quality: number = 0.95,
  originalFilename: string = 'image'
): Promise<ProcessedResult> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context');
  }

  const rotRad = (rotation * Math.PI) / 180;

  // Calculate bounding box of rotated image
  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(image.naturalWidth, image.naturalHeight, rotation);

  // set canvas size to match the bounding box
  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;

  // translate canvas center point to image center
  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(rotRad);
  ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
  ctx.translate(-image.naturalWidth / 2, -image.naturalHeight / 2);

  // draw rotated image
  ctx.drawImage(image, 0, 0);

  // cropped canvas
  const croppedCanvas = document.createElement('canvas');
  const croppedCtx = croppedCanvas.getContext('2d');

  if (!croppedCtx) {
    throw new Error('No 2d context for crop');
  }

  // Set crop target dimensions
  croppedCanvas.width = cropPixel.width;
  croppedCanvas.height = cropPixel.height;

  const mimeType = format === 'jpg' || format === 'jpeg' ? 'image/jpeg' : `image/${format}`;
  if (mimeType === 'image/jpeg') {
    croppedCtx.fillStyle = '#ffffff';
    croppedCtx.fillRect(0, 0, cropPixel.width, cropPixel.height);
  }

  // Draw cropped image segment onto target croppedCanvas
  croppedCtx.drawImage(
    canvas,
    cropPixel.x,
    cropPixel.y,
    cropPixel.width,
    cropPixel.height,
    0,
    0,
    cropPixel.width,
    cropPixel.height
  );

  return new Promise((resolve, reject) => {
    croppedCanvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Canvas is empty'));
          return;
        }

        const baseName = originalFilename.substring(0, originalFilename.lastIndexOf('.')) || originalFilename;
        const ext = format === 'jpeg' ? 'jpg' : format;
        const filename = `${baseName}_cropped.${ext}`;
        const url = createManagedObjectURL(blob);

        resolve({
          blob,
          url,
          filename,
          width: cropPixel.width,
          height: cropPixel.height,
          sizeBytes: blob.size,
        });
      },
      mimeType,
      quality
    );
  });
}

function rotateSize(width: number, height: number, rotation: number) {
  const rotRad = (rotation * Math.PI) / 180;

  return {
    width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
}

export interface ImageFilterOptions {
  brightness: number; // 0 to 200 (100 = normal)
  contrast: number;   // 0 to 200 (100 = normal)
  saturate: number;   // 0 to 200 (100 = normal)
  blur: number;       // 0 to 20 (0 = sharp)
  hueRotate: number;  // 0 to 360 (0 = normal)
  sepia: number;      // 0 to 100 (0 = normal)
  grayscale: number;  // 0 to 100 (0 = normal)
  invert: number;     // 0 to 100 (0 = normal)
}

export async function applyImageFilters(
  imageUrl: string,
  filters: ImageFilterOptions,
  format: string = 'png',
  quality: number = 0.95,
  originalFilename: string = 'image'
): Promise<ProcessedResult> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const w = img.naturalWidth || img.width;
      const h = img.naturalHeight || img.height;

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Could not create canvas context'));
        return;
      }

      const mimeType = format === 'jpg' || format === 'jpeg' ? 'image/jpeg' : `image/${format}`;
      if (mimeType === 'image/jpeg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);
      }

      // Build CSS filter string for canvas
      const filterStr = [
        `brightness(${filters.brightness}%)`,
        `contrast(${filters.contrast}%)`,
        `saturate(${filters.saturate}%)`,
        `blur(${filters.blur}px)`,
        `hue-rotate(${filters.hueRotate}deg)`,
        `sepia(${filters.sepia}%)`,
        `grayscale(${filters.grayscale}%)`,
        `invert(${filters.invert}%)`,
      ].join(' ');

      ctx.filter = filterStr;
      ctx.drawImage(img, 0, 0, w, h);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to process image filters'));
            return;
          }

          const baseName = originalFilename.substring(0, originalFilename.lastIndexOf('.')) || originalFilename;
          const ext = format === 'jpeg' ? 'jpg' : format;
          const filename = `${baseName}_filtered.${ext}`;
          const url = createManagedObjectURL(blob);

          resolve({
            blob,
            url,
            filename,
            width: w,
            height: h,
            sizeBytes: blob.size,
          });
        },
        mimeType,
        quality
      );
    };

    img.onerror = () => reject(new Error('Failed to load image for filter application'));
    img.src = imageUrl;
  });
}

export interface CompressResult extends ProcessedResult {
  targetSizeBytes: number;
  originalSizeBytes: number;
  qualityAchieved: number;
  scaleAchieved: number;
  formatUsed: string;
}

export async function compressImageToTargetSize(
  imageUrl: string,
  targetSizeBytes: number, // in bytes
  format: string = 'webp',
  originalFilename: string = 'image',
  originalSizeBytes: number = 0
): Promise<CompressResult> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = async () => {
      const origW = img.naturalWidth || img.width;
      const origH = img.naturalHeight || img.height;

      // Effective MIME type
      const effectiveFormat = format === 'png' ? 'webp' : format; // PNG doesn't support quality compression in canvas toBlob, so default to WebP or JPG
      const mimeType = effectiveFormat === 'jpg' || effectiveFormat === 'jpeg' ? 'image/jpeg' : `image/${effectiveFormat}`;

      let bestBlob: Blob | null = null;
      let bestW = origW;
      let bestH = origH;
      let bestQuality = 0.95;
      let bestScale = 1.0;

      // Helper to render canvas to blob
      const renderToBlob = (w: number, h: number, q: number): Promise<Blob | null> => {
        return new Promise((res) => {
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            res(null);
            return;
          }

          if (mimeType === 'image/jpeg') {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, w, h);
          }

          ctx.drawImage(img, 0, 0, w, h);
          canvas.toBlob((b) => res(b), mimeType, q);
        });
      };

      // Scales to test if quality alone doesn't suffice (1.0, 0.85, 0.7, 0.5, 0.35, 0.2)
      const scales = [1.0, 0.85, 0.7, 0.5, 0.35, 0.2];

      for (const scale of scales) {
        const w = Math.max(16, Math.round(origW * scale));
        const h = Math.max(16, Math.round(origH * scale));

        let lowQ = 0.05;
        let highQ = 0.98;
        let closestBlobForScale: Blob | null = null;
        let closestQualityForScale = 0.95;

        // Binary search 7 steps
        for (let i = 0; i < 7; i++) {
          const midQ = (lowQ + highQ) / 2;
          const blob = await renderToBlob(w, h, midQ);

          if (!blob) continue;

          closestBlobForScale = blob;
          closestQualityForScale = midQ;

          if (blob.size <= targetSizeBytes) {
            // Under target, try to increase quality
            lowQ = midQ;
          } else {
            // Over target, decrease quality
            highQ = midQ;
          }
        }

        if (closestBlobForScale) {
          bestBlob = closestBlobForScale;
          bestW = w;
          bestH = h;
          bestQuality = closestQualityForScale;
          bestScale = scale;

          // If we managed to get under or close to target, stop reducing scale
          if (bestBlob.size <= targetSizeBytes) {
            break;
          }
        }
      }

      if (!bestBlob) {
        reject(new Error('Failed to compress image to target size.'));
        return;
      }

      const baseName = originalFilename.substring(0, originalFilename.lastIndexOf('.')) || originalFilename;
      const ext = effectiveFormat === 'jpeg' ? 'jpg' : effectiveFormat;
      const filename = `${baseName}_compressed_${Math.round(targetSizeBytes / 1024)}KB.${ext}`;
      const url = createManagedObjectURL(bestBlob);

      resolve({
        blob: bestBlob,
        url,
        filename,
        width: bestW,
        height: bestH,
        sizeBytes: bestBlob.size,
        targetSizeBytes,
        originalSizeBytes: originalSizeBytes || bestBlob.size,
        qualityAchieved: Math.round(bestQuality * 100),
        scaleAchieved: Math.round(bestScale * 100),
        formatUsed: effectiveFormat,
      });
    };

    img.onerror = () => reject(new Error('Failed to load image for target size compression'));
    img.src = imageUrl;
  });
}

export type WatermarkPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'center-left'
  | 'center'
  | 'center-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'
  | 'tiled';

export interface WatermarkOptions {
  type: 'text' | 'image';
  text: string;
  fontFamily: string;
  fontSize: number; // in pixels relative to standard image or percentage
  color: string;
  opacity: number; // 0 to 1
  position: WatermarkPosition;
  rotation: number; // in degrees
  logoUrl?: string;
  logoScale: number; // 0.1 to 0.8 scale of image width
  margin: number; // in pixels
}

export async function applyWatermark(
  imageUrl: string,
  options: WatermarkOptions,
  format: string = 'png',
  quality: number = 0.95,
  originalFilename: string = 'image'
): Promise<ProcessedResult> {
  return new Promise((resolve, reject) => {
    const mainImg = new Image();
    mainImg.crossOrigin = 'anonymous';

    mainImg.onload = async () => {
      const w = mainImg.naturalWidth || mainImg.width;
      const h = mainImg.naturalHeight || mainImg.height;

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      const mimeType = format === 'jpg' || format === 'jpeg' ? 'image/jpeg' : `image/${format}`;
      if (mimeType === 'image/jpeg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);
      }

      // Draw original image
      ctx.drawImage(mainImg, 0, 0, w, h);

      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, options.opacity));

      if (options.type === 'text') {
        const scaledFontSize = Math.max(12, Math.round((options.fontSize / 1000) * Math.min(w, h)));
        ctx.font = `bold ${scaledFontSize}px ${options.fontFamily || 'sans-serif'}`;
        ctx.fillStyle = options.color || '#ffffff';
        ctx.textBaseline = 'middle';

        const metrics = ctx.measureText(options.text || 'WATERMARK');
        const textWidth = metrics.width;
        const textHeight = scaledFontSize;

        if (options.position === 'tiled') {
          // Draw tiled pattern across the canvas
          ctx.translate(w / 2, h / 2);
          ctx.rotate((options.rotation * Math.PI) / 180);
          ctx.translate(-w / 2, -h / 2);

          const stepX = textWidth + options.margin * 2 + 40;
          const stepY = textHeight + options.margin * 2 + 40;

          for (let x = -w; x < w * 2; x += stepX) {
            for (let y = -h; y < h * 2; y += stepY) {
              ctx.fillText(options.text || 'WATERMARK', x, y);
            }
          }
        } else {
          // Calculate X and Y based on position
          let x = options.margin;
          let y = options.margin + textHeight / 2;

          // Horizontal alignment
          if (options.position.includes('center')) {
            x = (w - textWidth) / 2;
          } else if (options.position.includes('right')) {
            x = w - textWidth - options.margin;
          }

          // Vertical alignment
          if (options.position.startsWith('center')) {
            y = h / 2;
          } else if (options.position.startsWith('bottom')) {
            y = h - options.margin - textHeight / 2;
          }

          ctx.translate(x + textWidth / 2, y);
          ctx.rotate((options.rotation * Math.PI) / 180);
          ctx.fillText(options.text || 'WATERMARK', -textWidth / 2, 0);
        }
      } else if (options.type === 'image' && options.logoUrl) {
        // Load logo image
        const logoImg = new Image();
        logoImg.crossOrigin = 'anonymous';

        await new Promise<void>((resLogo, rejLogo) => {
          logoImg.onload = () => resLogo();
          logoImg.onerror = () => rejLogo(new Error('Failed to load watermark logo image'));
          logoImg.src = options.logoUrl!;
        });

        const logoAspect = logoImg.naturalWidth / logoImg.naturalHeight;
        const logoW = Math.max(20, Math.round(w * options.logoScale));
        const logoH = Math.round(logoW / logoAspect);

        if (options.position === 'tiled') {
          ctx.translate(w / 2, h / 2);
          ctx.rotate((options.rotation * Math.PI) / 180);
          ctx.translate(-w / 2, -h / 2);

          const stepX = logoW + options.margin + 40;
          const stepY = logoH + options.margin + 40;

          for (let x = -w; x < w * 2; x += stepX) {
            for (let y = -h; y < h * 2; y += stepY) {
              ctx.drawImage(logoImg, x, y, logoW, logoH);
            }
          }
        } else {
          let x = options.margin;
          let y = options.margin;

          if (options.position.includes('center')) {
            x = (w - logoW) / 2;
          } else if (options.position.includes('right')) {
            x = w - logoW - options.margin;
          }

          if (options.position.startsWith('center')) {
            y = (h - logoH) / 2;
          } else if (options.position.startsWith('bottom')) {
            y = h - logoH - options.margin;
          }

          ctx.translate(x + logoW / 2, y + logoH / 2);
          ctx.rotate((options.rotation * Math.PI) / 180);
          ctx.drawImage(logoImg, -logoW / 2, -logoH / 2, logoW, logoH);
        }
      }

      ctx.restore();

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to render watermarked blob'));
            return;
          }

          const baseName = originalFilename.substring(0, originalFilename.lastIndexOf('.')) || originalFilename;
          const ext = format === 'jpeg' ? 'jpg' : format;
          const filename = `${baseName}_watermarked.${ext}`;
          const url = createManagedObjectURL(blob);

          resolve({
            blob,
            url,
            filename,
            width: w,
            height: h,
            sizeBytes: blob.size,
          });
        },
        mimeType,
        quality
      );
    };

    mainImg.onerror = () => reject(new Error('Failed to load image for watermarking'));
    mainImg.src = imageUrl;
  });
}

export interface ImageExifInfo {
  filename: string;
  width: number;
  height: number;
  aspectRatio: string;
  megapixels: string;
  sizeBytes: number;
  mimeType: string;
  hasExifMetadata: boolean;
  estimatedColorDepth: string;
  hasAlphaChannel: boolean;
  lastModified?: string;
}

export async function inspectImageExif(file: File, imageUrl: string): Promise<ImageExifInfo> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const w = img.naturalWidth || img.width;
      const h = img.naturalHeight || img.height;

      // Calculate aspect ratio label
      const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
      const divisor = gcd(w, h);
      const ratioStr = `${Math.round(w / divisor)}:${Math.round(h / divisor)}`;

      const mp = ((w * h) / 1000000).toFixed(2);

      // Simple heuristic for EXIF metadata presence in JPEG/TIFF headers
      const isJpeg = file.type === 'image/jpeg' || file.name.endsWith('.jpg') || file.name.endsWith('.jpeg');
      
      const canvas = document.createElement('canvas');
      canvas.width = Math.min(100, w);
      canvas.height = Math.min(100, h);
      const ctx = canvas.getContext('2d');
      let hasAlpha = false;

      if (ctx) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        try {
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
          for (let i = 3; i < imgData.length; i += 4) {
            if (imgData[i] < 255) {
              hasAlpha = true;
              break;
            }
          }
        } catch {
          // ignore CORS if any
        }
      }

      resolve({
        filename: file.name,
        width: w,
        height: h,
        aspectRatio: ratioStr,
        megapixels: mp,
        sizeBytes: file.size,
        mimeType: file.type || 'image/jpeg',
        hasExifMetadata: isJpeg && file.size > 15000,
        estimatedColorDepth: '24-bit TrueColor (RGB)',
        hasAlphaChannel: hasAlpha,
        lastModified: file.lastModified ? new Date(file.lastModified).toLocaleString() : undefined,
      });
    };

    img.onerror = () => {
      resolve({
        filename: file.name,
        width: 0,
        height: 0,
        aspectRatio: 'N/A',
        megapixels: '0',
        sizeBytes: file.size,
        mimeType: file.type || 'unknown',
        hasExifMetadata: false,
        estimatedColorDepth: 'Unknown',
        hasAlphaChannel: false,
      });
    };

    img.src = imageUrl;
  });
}

export async function stripExifMetadata(
  imageUrl: string,
  format: string = 'png',
  quality: number = 0.95,
  originalFilename: string = 'image'
): Promise<ProcessedResult> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const w = img.naturalWidth || img.width;
      const h = img.naturalHeight || img.height;

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      const mimeType = format === 'jpg' || format === 'jpeg' ? 'image/jpeg' : `image/${format}`;
      if (mimeType === 'image/jpeg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);
      }

      // Re-draw pixels onto canvas (this completely discards EXIF, GPS, camera model tags)
      ctx.drawImage(img, 0, 0, w, h);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to process sanitized image'));
            return;
          }

          const baseName = originalFilename.substring(0, originalFilename.lastIndexOf('.')) || originalFilename;
          const ext = format === 'jpeg' ? 'jpg' : format;
          const filename = `${baseName}_cleaned.${ext}`;
          const url = createManagedObjectURL(blob);

          resolve({
            blob,
            url,
            filename,
            width: w,
            height: h,
            sizeBytes: blob.size,
          });
        },
        mimeType,
        quality
      );
    };

    img.onerror = () => reject(new Error('Failed to load image for EXIF stripping'));
    img.src = imageUrl;
  });
}

export interface ColorKeyOptions {
  keyColor: string; // hex string e.g. '#ffffff' or '#00ff00'
  tolerance: number; // 0 - 150
  smoothness: number; // 0 - 50 (feather edge)
  replacementType: 'transparent' | 'color';
  replacementColor?: string; // hex string e.g. '#1e293b'
}

export async function removeBackgroundKeyColor(
  imageUrl: string,
  options: ColorKeyOptions,
  format: string = 'png',
  quality: number = 0.95,
  originalFilename: string = 'image'
): Promise<ProcessedResult> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const w = img.naturalWidth || img.width;
      const h = img.naturalHeight || img.height;

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0, w, h);
      const imgData = ctx.getImageData(0, 0, w, h);
      const pixels = imgData.data;

      // Parse key color RGB
      const keyHex = options.keyColor.replace('#', '');
      const keyR = parseInt(keyHex.substring(0, 2), 16) || 255;
      const keyG = parseInt(keyHex.substring(2, 4), 16) || 255;
      const keyB = parseInt(keyHex.substring(4, 6), 16) || 255;

      // Parse replacement color RGB if any
      let repR = 0, repG = 0, repB = 0;
      if (options.replacementType === 'color' && options.replacementColor) {
        const repHex = options.replacementColor.replace('#', '');
        repR = parseInt(repHex.substring(0, 2), 16) || 0;
        repG = parseInt(repHex.substring(2, 4), 16) || 0;
        repB = parseInt(repHex.substring(4, 6), 16) || 0;
      }

      const tol = options.tolerance;
      const smooth = options.smoothness;

      for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        const a = pixels[i + 3];

        if (a === 0) continue;

        // Euclidean color distance
        const dist = Math.sqrt(
          (r - keyR) * (r - keyR) +
          (g - keyG) * (g - keyG) +
          (b - keyB) * (b - keyB)
        );

        if (dist <= tol) {
          if (options.replacementType === 'transparent') {
            pixels[i + 3] = 0;
          } else {
            pixels[i] = repR;
            pixels[i + 1] = repG;
            pixels[i + 2] = repB;
            pixels[i + 3] = 255;
          }
        } else if (dist < tol + smooth && smooth > 0) {
          // Soft edge feathering
          const factor = (dist - tol) / smooth; // 0 to 1
          if (options.replacementType === 'transparent') {
            pixels[i + 3] = Math.round(a * factor);
          } else {
            pixels[i] = Math.round(r * factor + repR * (1 - factor));
            pixels[i + 1] = Math.round(g * factor + repG * (1 - factor));
            pixels[i + 2] = Math.round(b * factor + repB * (1 - factor));
          }
        }
      }

      ctx.putImageData(imgData, 0, 0);

      const effectiveFormat = options.replacementType === 'transparent' && format === 'jpg' ? 'png' : format;
      const mimeType = effectiveFormat === 'jpg' || effectiveFormat === 'jpeg' ? 'image/jpeg' : `image/${effectiveFormat}`;

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to render background removal result'));
            return;
          }

          const baseName = originalFilename.substring(0, originalFilename.lastIndexOf('.')) || originalFilename;
          const ext = effectiveFormat === 'jpeg' ? 'jpg' : effectiveFormat;
          const filename = `${baseName}_bg_removed.${ext}`;
          const url = createManagedObjectURL(blob);

          resolve({
            blob,
            url,
            filename,
            width: w,
            height: h,
            sizeBytes: blob.size,
          });
        },
        mimeType,
        quality
      );
    };

    img.onerror = () => reject(new Error('Failed to load image for background removal'));
    img.src = imageUrl;
  });
}

export interface CollageOptions {
  layout: '2-horizontal' | '2-vertical' | '2x2-grid' | '3-horizontal' | '3-vertical' | '1-large-2-small' | '3x3-grid';
  aspectRatio: '1:1' | '4:3' | '16:9' | '9:16' | '3:2';
  gap: number;
  padding: number;
  borderRadius: number;
  bgColor: string;
  fitMode: 'cover' | 'contain';
}

export interface CellBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function computeCollageCells(
  layout: CollageOptions['layout'],
  canvasW: number,
  canvasH: number,
  gap: number,
  padding: number
): CellBounds[] {
  const contentW = canvasW - padding * 2;
  const contentH = canvasH - padding * 2;
  const cells: CellBounds[] = [];

  switch (layout) {
    case '2-horizontal': {
      // 2 columns side-by-side
      const cellW = (contentW - gap) / 2;
      cells.push({ x: padding, y: padding, width: cellW, height: contentH });
      cells.push({ x: padding + cellW + gap, y: padding, width: cellW, height: contentH });
      break;
    }
    case '2-vertical': {
      // 2 rows stacked
      const cellH = (contentH - gap) / 2;
      cells.push({ x: padding, y: padding, width: contentW, height: cellH });
      cells.push({ x: padding, y: padding + cellH + gap, width: contentW, height: cellH });
      break;
    }
    case '2x2-grid': {
      // 2x2 grid
      const cellW = (contentW - gap) / 2;
      const cellH = (contentH - gap) / 2;
      cells.push({ x: padding, y: padding, width: cellW, height: cellH });
      cells.push({ x: padding + cellW + gap, y: padding, width: cellW, height: cellH });
      cells.push({ x: padding, y: padding + cellH + gap, width: cellW, height: cellH });
      cells.push({ x: padding + cellW + gap, y: padding + cellH + gap, width: cellW, height: cellH });
      break;
    }
    case '3-horizontal': {
      // 3 columns in a row
      const cellW = (contentW - gap * 2) / 3;
      for (let i = 0; i < 3; i++) {
        cells.push({ x: padding + i * (cellW + gap), y: padding, width: cellW, height: contentH });
      }
      break;
    }
    case '3-vertical': {
      // 3 rows stacked
      const cellH = (contentH - gap * 2) / 3;
      for (let i = 0; i < 3; i++) {
        cells.push({ x: padding, y: padding + i * (cellH + gap), width: contentW, height: cellH });
      }
      break;
    }
    case '1-large-2-small': {
      // 1 big on left, 2 stacked on right
      const cellW = (contentW - gap) / 2;
      const cellH = (contentH - gap) / 2;
      cells.push({ x: padding, y: padding, width: cellW, height: contentH });
      cells.push({ x: padding + cellW + gap, y: padding, width: cellW, height: cellH });
      cells.push({ x: padding + cellW + gap, y: padding + cellH + gap, width: cellW, height: cellH });
      break;
    }
    case '3x3-grid': {
      // 3x3 grid (9 cells)
      const cellW = (contentW - gap * 2) / 3;
      const cellH = (contentH - gap * 2) / 3;
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          cells.push({
            x: padding + c * (cellW + gap),
            y: padding + r * (cellH + gap),
            width: cellW,
            height: cellH,
          });
        }
      }
      break;
    }
  }

  return cells;
}

export async function generateCollageGrid(
  imageUrls: string[],
  options: CollageOptions,
  outputFormat: string = 'png',
  quality: number = 0.95
): Promise<ProcessedResult> {
  // Determine canvas base dimensions based on aspect ratio
  const baseSize = 2048;
  let canvasW = baseSize;
  let canvasH = baseSize;

  switch (options.aspectRatio) {
    case '1:1':
      canvasW = 2048;
      canvasH = 2048;
      break;
    case '4:3':
      canvasW = 2048;
      canvasH = 1536;
      break;
    case '16:9':
      canvasW = 2048;
      canvasH = 1152;
      break;
    case '9:16':
      canvasW = 1152;
      canvasH = 2048;
      break;
    case '3:2':
      canvasW = 2048;
      canvasH = 1365;
      break;
  }

  const canvas = document.createElement('canvas');
  canvas.width = canvasW;
  canvas.height = canvasH;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Could not get canvas 2D context');
  }

  // Draw background
  if (options.bgColor === 'transparent') {
    ctx.clearRect(0, 0, canvasW, canvasH);
  } else {
    ctx.fillStyle = options.bgColor || '#ffffff';
    ctx.fillRect(0, 0, canvasW, canvasH);
  }

  // Load all images in parallel
  const loadedImages: (HTMLImageElement | null)[] = await Promise.all(
    imageUrls.map(
      (src) =>
        new Promise<HTMLImageElement | null>((resolve) => {
          if (!src) {
            resolve(null);
            return;
          }
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => resolve(img);
          img.onerror = () => resolve(null);
          img.src = src;
        })
    )
  );

  const cellBounds = computeCollageCells(
    options.layout,
    canvasW,
    canvasH,
    options.gap,
    options.padding
  );

  // Render each cell
  cellBounds.forEach((cell, idx) => {
    const img = loadedImages[idx % loadedImages.length];
    if (!img) return;

    ctx.save();

    // Clip rounded cell rectangle if borderRadius > 0
    if (options.borderRadius > 0) {
      const r = Math.min(options.borderRadius, cell.width / 2, cell.height / 2);
      ctx.beginPath();
      ctx.moveTo(cell.x + r, cell.y);
      ctx.lineTo(cell.x + cell.width - r, cell.y);
      ctx.quadraticCurveTo(cell.x + cell.width, cell.y, cell.x + cell.width, cell.y + r);
      ctx.lineTo(cell.x + cell.width, cell.y + cell.height - r);
      ctx.quadraticCurveTo(cell.x + cell.width, cell.y + cell.height, cell.x + cell.width - r, cell.y + cell.height);
      ctx.lineTo(cell.x + r, cell.y + cell.height);
      ctx.quadraticCurveTo(cell.x, cell.y + cell.height, cell.x, cell.y + cell.height - r);
      ctx.lineTo(cell.x, cell.y + r);
      ctx.quadraticCurveTo(cell.x, cell.y, cell.x + r, cell.y);
      ctx.closePath();
      ctx.clip();
    } else {
      ctx.beginPath();
      ctx.rect(cell.x, cell.y, cell.width, cell.height);
      ctx.clip();
    }

    const imgW = img.naturalWidth || img.width;
    const imgH = img.naturalHeight || img.height;

    let drawX = cell.x;
    let drawY = cell.y;
    let drawW = cell.width;
    let drawH = cell.height;

    if (options.fitMode === 'cover') {
      const scale = Math.max(cell.width / imgW, cell.height / imgH);
      drawW = imgW * scale;
      drawH = imgH * scale;
      drawX = cell.x + (cell.width - drawW) / 2;
      drawY = cell.y + (cell.height - drawH) / 2;
    } else if (options.fitMode === 'contain') {
      const scale = Math.min(cell.width / imgW, cell.height / imgH);
      drawW = imgW * scale;
      drawH = imgH * scale;
      drawX = cell.x + (cell.width - drawW) / 2;
      drawY = cell.y + (cell.height - drawH) / 2;
    }

    ctx.drawImage(img, drawX, drawY, drawW, drawH);
    ctx.restore();
  });

  return new Promise((resolve, reject) => {
    const effectiveFormat = options.bgColor === 'transparent' && outputFormat === 'jpg' ? 'png' : outputFormat;
    const mimeType = effectiveFormat === 'jpg' || effectiveFormat === 'jpeg' ? 'image/jpeg' : `image/${effectiveFormat}`;

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Failed to generate collage grid blob'));
          return;
        }

        const ext = effectiveFormat === 'jpeg' ? 'jpg' : effectiveFormat;
        const filename = `photo_collage_${Date.now()}.${ext}`;
        const url = createManagedObjectURL(blob);

        resolve({
          blob,
          url,
          filename,
          width: canvasW,
          height: canvasH,
          sizeBytes: blob.size,
        });
      },
      mimeType,
      quality
    );
  });
}


export interface MemeOptions {
  topText: string;
  bottomText: string;
  fontFamily: string;
  fontSize: number; // percentage or relative size
  textColor: string;
  strokeColor: string;
  strokeWidth: number;
  allCaps: boolean;
  topOffset: number; // margin in px
  bottomOffset: number; // margin in px
}

export async function generateMemeImage(
  imageUrl: string,
  options: MemeOptions,
  format: string = 'png',
  quality: number = 0.95,
  originalFilename: string = 'image'
): Promise<ProcessedResult> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const w = img.naturalWidth || img.width;
      const h = img.naturalHeight || img.height;

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      const mimeType = format === 'jpg' || format === 'jpeg' ? 'image/jpeg' : `image/${format}`;
      if (mimeType === 'image/jpeg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);
      }

      // Draw original image
      ctx.drawImage(img, 0, 0, w, h);

      // Scaled font calculation relative to image size
      const baseFontSize = Math.max(16, Math.round((options.fontSize / 1000) * Math.min(w, h)));
      ctx.font = `900 ${baseFontSize}px ${options.fontFamily || 'Impact, sans-serif'}`;
      ctx.textAlign = 'center';
      ctx.fillStyle = options.textColor || '#ffffff';
      ctx.strokeStyle = options.strokeColor || '#000000';
      ctx.lineWidth = Math.max(2, Math.round((options.strokeWidth / 100) * baseFontSize));
      ctx.lineJoin = 'round';

      // Helper for wrapped text rendering
      const drawWrappedText = (text: string, yPos: number, isBottom: boolean) => {
        let processedText = text;
        if (options.allCaps) {
          processedText = processedText.toUpperCase();
        }

        const words = processedText.split(' ');
        const lines: string[] = [];
        let currentLine = '';
        const maxWidth = w * 0.92;

        for (let n = 0; n < words.length; n++) {
          const testLine = currentLine + (currentLine ? ' ' : '') + words[n];
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxWidth && n > 0) {
            lines.push(currentLine);
            currentLine = words[n];
          } else {
            currentLine = testLine;
          }
        }
        lines.push(currentLine);

        const lineHeight = baseFontSize * 1.15;
        let startY = yPos;

        if (isBottom) {
          startY = h - options.bottomOffset - (lines.length - 1) * lineHeight;
        }

        lines.forEach((line, index) => {
          const curY = startY + index * lineHeight;
          if (options.strokeWidth > 0) {
            ctx.strokeText(line, w / 2, curY);
          }
          ctx.fillText(line, w / 2, curY);
        });
      };

      if (options.topText.trim()) {
        ctx.textBaseline = 'top';
        drawWrappedText(options.topText, options.topOffset, false);
      }

      if (options.bottomText.trim()) {
        ctx.textBaseline = 'alphabetic';
        drawWrappedText(options.bottomText, h - options.bottomOffset, true);
      }

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to generate meme blob'));
            return;
          }

          const baseName = originalFilename.substring(0, originalFilename.lastIndexOf('.')) || originalFilename;
          const ext = format === 'jpeg' ? 'jpg' : format;
          const filename = `${baseName}_meme.${ext}`;
          const url = createManagedObjectURL(blob);

          resolve({
            blob,
            url,
            filename,
            width: w,
            height: h,
            sizeBytes: blob.size,
          });
        },
        mimeType,
        quality
      );
    };

    img.onerror = () => reject(new Error('Failed to load image for meme generator'));
    img.src = imageUrl;
  });
}






