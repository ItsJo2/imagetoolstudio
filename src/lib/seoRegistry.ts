export const PRODUCTION_DOMAIN = 'https://REPLACE-WITH-REAL-DOMAIN.example';

export interface RouteSeoEntry {
  title: string;
  description: string;
  keywords: string;
  schemaType: string;
  howToSteps?: string[];
}

export const ROUTE_SEO_REGISTRY: Record<string, RouteSeoEntry> = {
  '/': {
    title: 'ImageTool Studio - Fast, Free, Private Online Photo Editor & Converter',
    description: 'All-in-one browser-based image toolkit. Convert PNG, JPG, WebP, AVIF, GIF, crop, resize, compress to KB, watermark, remove backgrounds, build collages, and upscale with 100% privacy.',
    keywords: 'image editor, photo converter, crop image online, resize photo, compress image KB, remove background free, watermark photo, EXIF stripper, meme generator, photo collage maker, image upscale',
    schemaType: 'SoftwareApplication',
  },
  '/convert': {
    title: 'Free Online Image Format Converter - PNG, WEBP, JPG, AVIF, GIF - ImageTool Studio',
    description: 'Convert images instantly between PNG, JPEG, WebP, AVIF, GIF, BMP, and SVG with custom quality compression in your browser. 100% private with no server uploads.',
    keywords: 'convert PNG to WEBP, convert JPG to PNG, image format converter, AVIF converter, GIF converter, photo format converter online free',
    schemaType: 'HowTo',
    howToSteps: [
      'Upload or drag and drop your image file into the converter canvas.',
      'Select your desired output format (WebP, PNG, JPEG, AVIF, or GIF) and set quality sliders.',
      'Click Process Conversion and instantly download your converted image or send to another tool.',
    ],
  },
  '/crop': {
    title: 'Crop & Rotate Images Online Free - ImageTool Studio',
    description: 'Crop images to social media ratios (1:1, 16:9, 4:5, 9:16), rotate by degrees, flip horizontally or vertically with high-precision pixel cropping.',
    keywords: 'crop image online, image rotator, flip photo, aspect ratio crop, Instagram photo crop, Facebook banner cropper',
    schemaType: 'HowTo',
    howToSteps: [
      'Select or drop an image into the Crop & Rotate canvas.',
      'Drag the bounding handles or pick an aspect ratio preset (1:1, 16:9, 4:5, 9:16).',
      'Use rotate and flip buttons to adjust orientation, then click Apply Crop.',
    ],
  },
  '/resize': {
    title: 'Resize Image Online - Change Pixel Dimensions & Percentage - ImageTool Studio',
    description: 'Resize image dimensions by percentage or exact pixel width and height. Maintains original aspect ratio with smooth bicubic resampling.',
    keywords: 'resize image online, change image dimensions, reduce pixel size, scale photo dimensions, aspect ratio resizer',
    schemaType: 'HowTo',
    howToSteps: [
      'Upload your image into the Resize tool.',
      'Enter new target width/height in pixels or select a percentage scaling preset (25%, 50%, 75%).',
      'Click Resize Image and download your resized file instantly.',
    ],
  },
  '/compress': {
    title: 'Compress Image to Target File Size (KB/MB) - ImageTool Studio',
    description: 'Reduce image file sizes to exact KB limits (e.g. under 100KB, 200KB, 500KB) for passport forms, job portals, and web optimization.',
    keywords: 'compress image to 200KB, reduce photo file size, photo compressor online, compress image for portal upload, image optimizer',
    schemaType: 'HowTo',
    howToSteps: [
      'Upload the target image file to compress.',
      'Specify your desired target file size limit in KB or MB (e.g., 200 KB).',
      'Click Compress to Target Size and download your optimized image guaranteed under the limit.',
    ],
  },
  '/watermark': {
    title: 'Add Watermark to Photo Online - Text & Logo Overlay - ImageTool Studio',
    description: 'Protect your photos with customizable text watermarks, copyright badges, or transparent PNG logo overlays. Adjust opacity, font, color, and position.',
    keywords: 'add watermark to image, online photo watermark, logo overlay on image, text copyright badge on photo, brand protection',
    schemaType: 'HowTo',
    howToSteps: [
      'Upload your photo into the Watermark tool.',
      'Choose between Text Watermark or Logo Image Watermark mode.',
      'Customize position (corner, center, tile), font size, opacity, and color, then click Stamp Watermark.',
    ],
  },
  '/exif': {
    title: 'EXIF Data Viewer & Metadata Privacy Cleaner - ImageTool Studio',
    description: 'Inspect full camera EXIF metadata including GPS coordinates, lens model, shutter speed, and ISO, then strip metadata for total photo privacy.',
    keywords: 'EXIF viewer online, remove EXIF data, photo metadata cleaner, strip GPS coordinates from photo, privacy camera metadata',
    schemaType: 'HowTo',
    howToSteps: [
      'Drop any photo (JPEG/PNG/WebP) into the EXIF Inspector.',
      'View detailed EXIF metadata tags including camera model, exposure, and GPS geolocation.',
      'Click Strip EXIF & Save Clean Image to generate a privacy-cleared version.',
    ],
  },
  '/bg-remove': {
    title: 'Remove Background from Image Free - Chroma Key & Cutout - ImageTool Studio',
    description: 'Isolate subjects and transparently cut out white backgrounds, solid backdrops, or green screens with adjustable tolerance and edge smoothing.',
    keywords: 'remove background from image free, chroma key cutout, transparent background generator, white background remover, photo cutout',
    schemaType: 'HowTo',
    howToSteps: [
      'Upload your photo with a backdrop or green screen.',
      'Use the Eyedropper or preset color pickers to select the background color key.',
      'Adjust tolerance and edge softness sliders, then click Remove Background.',
    ],
  },
  '/meme': {
    title: 'Free Online Meme Generator - Add Impact Captions & Outlines - ImageTool Studio',
    description: 'Create viral memes with classic top and bottom Impact text captions, custom outline strokes, color fills, and popular meme templates.',
    keywords: 'meme generator online, add text to photo, meme maker free, impact font caption generator, photo meme creator',
    schemaType: 'HowTo',
    howToSteps: [
      'Upload your meme image or pick a starter template.',
      'Enter Top Text and Bottom Text captions.',
      'Adjust font size, text color, outline stroke thickness, then click Generate Meme.',
    ],
  },
  '/collage': {
    title: 'Photo Collage Maker & Grid Layout Builder - ImageTool Studio',
    description: 'Combine multiple images into stunning grid collages, side-by-side photo comparisons, quad matrices, or hero split layouts with custom spacing & borders.',
    keywords: 'photo collage maker, image grid builder, side by side photo joiner, quad photo matrix, combine images into one photo',
    schemaType: 'HowTo',
    howToSteps: [
      'Upload 2 or more photos into the Collage Builder.',
      'Select a grid layout pattern (2-column, 3-grid, quad matrix, hero split).',
      'Adjust spacing gaps, border corner rounding, and background color, then render your collage.',
    ],
  },
  '/annotate': {
    title: 'Annotate, Shape & Sensitive Blur Editor - ImageTool Studio',
    description: 'Markup screenshots, draw callout arrows & step numbers, highlight key areas, or pixelate sensitive credit cards and emails.',
    keywords: 'annotate image online, screenshot markup tool, draw arrows on photo, blur credit card, pixelate sensitive image',
    schemaType: 'HowTo',
    howToSteps: [
      'Upload or drag an image into the Annotation Editor.',
      'Select tools to draw arrows, boxes, text labels, or step numbers.',
      'Use the Pixelate tool to censor sensitive areas, then export.',
    ],
  },
  '/filters': {
    title: 'Image Filters & Photo Color Adjustments Online - ImageTool Studio',
    description: 'Apply live GPU-accelerated color filters, contrast, saturation, sepia, invert, and save your custom preset styles to browser memory or JSON.',
    keywords: 'photo filters online, image color adjustment, brightness contrast editor, vintage photo filter, save filter preset',
    schemaType: 'HowTo',
    howToSteps: [
      'Upload an image to the Filters & Color Adjustments canvas.',
      'Select a quick style preset or fine-tune sliders for brightness, contrast, hue, and sepia.',
      'Click Apply Filters to render or save your custom filter set as a reusable preset.',
    ],
  },
  '/upscale': {
    title: 'Image Upscaler & Sharpening Tool (2x/4x) - ImageTool Studio',
    description: 'Enlarge image pixel dimensions by 2x or 4x with sub-pixel interpolation and edge sharpening for crisp, high-definition prints and web graphics.',
    keywords: 'image upscaler online, enlarge image size, sharpen blurry photo, 2x 4x image enhancer, bicubic upscale',
    schemaType: 'HowTo',
    howToSteps: [
      'Upload a small or low-resolution image file.',
      'Select 2x or 4x upscale factor and adjust edge sharpening intensity.',
      'Click Render Upscale and compare before/after slider results.',
    ],
  },
  '/batch': {
    title: 'Batch Image Processing Tool - Bulk Convert, Resize & Zip - ImageTool Studio',
    description: 'Process queues of images simultaneously in bulk. Convert formats, resize, compress, and download everything as a organized ZIP package.',
    keywords: 'batch image converter, bulk photo resizer, zip image batch download, process multiple photos online, bulk image compressor',
    schemaType: 'HowTo',
    howToSteps: [
      'Upload multiple image files simultaneously into the Batch Processor.',
      'Select target format, scale dimensions, and compression level for the entire queue.',
      'Click Process All & Download ZIP archive.',
    ],
  },
  '/faq': {
    title: 'Frequently Asked Questions & Help - ImageTool Studio',
    description: 'Learn how ImageTool Studio processes images 100% locally in your browser with zero server uploads, privacy guarantees, supported file formats, and tips.',
    keywords: 'ImageTool Studio FAQ, image editing help, client side image processing privacy, supported image formats, browser photo editor security',
    schemaType: 'FAQPage',
  },
  '/about': {
    title: 'About ImageTool Studio - Private Client-Side Photo Engineering',
    description: 'Discover ImageTool Studio: built for designers, developers, photographers, and privacy-conscious users who need fast, secure photo processing without cloud server uploads.',
    keywords: 'about ImageTool Studio, private image editor story, local browser photo engine, privacy first photo tools',
    schemaType: 'SoftwareApplication',
  },
  '/sitemap': {
    title: 'Sitemap & Webmaster Tools Hub - ImageTool Studio',
    description: 'Complete directory of all ImageTool Studio online image tools, conversion guides, XML sitemap generator, and robots.txt configuration for search crawlers.',
    keywords: 'ImageTool Studio sitemap, site index, XML sitemap generator, image tools list, webmaster tools',
    schemaType: 'SoftwareApplication',
  },
  '/privacy': {
    title: 'Privacy Policy - ImageTool Studio (100% Client-Side Guarantee)',
    description: 'ImageTool Studio operates entirely inside your web browser. Your images are never uploaded to, processed on, or stored by remote servers.',
    keywords: 'ImageTool Studio privacy policy, local image processing security, browser privacy photo editor',
    schemaType: 'SoftwareApplication',
  },
  '/terms': {
    title: 'Terms of Service - ImageTool Studio',
    description: 'Terms of service and usage guidelines for ImageTool Studio client-side web application.',
    keywords: 'ImageTool Studio terms of service, user agreement, image editor terms',
    schemaType: 'SoftwareApplication',
  },
  '/contact': {
    title: 'Contact Support & Feedback - ImageTool Studio',
    description: 'Have a question or feature request? Contact the ImageTool Studio development team.',
    keywords: 'contact ImageTool Studio, image tool support, feedback photo app',
    schemaType: 'SoftwareApplication',
  },
};
