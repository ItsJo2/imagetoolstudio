import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.resolve(__dirname, '../public');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

function crc32(buf: Buffer): number {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    let c = (crc ^ buf[i]) & 0xff;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    crc = (crc >>> 8) ^ c;
  }
  return (crc ^ -1) >>> 0;
}

function createPngChunk(type: string, data: Buffer): Buffer {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);

  const crcBuf = Buffer.alloc(4);
  const typeAndData = Buffer.concat([typeBuf, data]);
  crcBuf.writeUInt32BE(crc32(typeAndData), 0);

  return Buffer.concat([lenBuf, typeAndData, crcBuf]);
}

function generatePng(width: number, height: number): Buffer {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8 bits per channel
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdrChunk = createPngChunk('IHDR', ihdrData);

  // IDAT - Scanlines
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowSize);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter: None

    const ny = y / height; // 0..1
    for (let x = 0; x < width; x++) {
      const nx = x / width; // 0..1
      const pixelOffset = rowOffset + 1 + x * 4;

      // Check if we are drawing rounded corner
      const cornerRadius = 0.22;
      let inCorner = false;
      if (nx < cornerRadius && ny < cornerRadius && (nx - cornerRadius) ** 2 + (ny - cornerRadius) ** 2 > cornerRadius ** 2) inCorner = true;
      if (nx > 1 - cornerRadius && ny < cornerRadius && (nx - (1 - cornerRadius)) ** 2 + (ny - cornerRadius) ** 2 > cornerRadius ** 2) inCorner = true;
      if (nx < cornerRadius && ny > 1 - cornerRadius && (nx - cornerRadius) ** 2 + (ny - (1 - cornerRadius)) ** 2 > cornerRadius ** 2) inCorner = true;
      if (nx > 1 - cornerRadius && ny > 1 - cornerRadius && (nx - (1 - cornerRadius)) ** 2 + (ny - (1 - cornerRadius)) ** 2 > cornerRadius ** 2) inCorner = true;

      if (inCorner) {
        rawData[pixelOffset] = 0;
        rawData[pixelOffset + 1] = 0;
        rawData[pixelOffset + 2] = 0;
        rawData[pixelOffset + 3] = 0;
        continue;
      }

      // Linear gradient: #2563eb (37, 99, 235) to #4f46e5 (79, 70, 229)
      const t = (nx + (1 - ny)) / 2;
      let r = Math.round(37 + (79 - 37) * t);
      let g = Math.round(99 + (70 - 99) * t);
      let b = Math.round(235 + (229 - 235) * t);
      let a = 255;

      // Draw white image icon inside (frame, circle, mountain)
      // Normalized icon coordinates (0.2 to 0.8)
      const ix = (nx - 0.2) / 0.6;
      const iy = (ny - 0.2) / 0.6;

      if (ix >= 0 && ix <= 1 && iy >= 0 && iy <= 1) {
        // Outer frame boundary (thickness ~0.08)
        const borderWidth = 0.08;
        const isFrameBorder =
          (ix <= borderWidth || ix >= 1 - borderWidth || iy <= borderWidth || iy >= 1 - borderWidth);

        // Sun/circle at (0.35, 0.35), radius 0.12
        const distSun = Math.sqrt((ix - 0.35) ** 2 + (iy - 0.35) ** 2);
        const isSun = distSun <= 0.12;

        // Mountain line from (0.2, 0.8) to (0.5, 0.5) to (0.8, 0.8)
        const isMountain =
          (iy >= 0.72 && iy <= 0.8 && ix >= 0.2 && ix <= 0.8) ||
          (Math.abs(iy - (0.8 - (ix - 0.2))) < 0.06 && ix >= 0.2 && ix <= 0.5) ||
          (Math.abs(iy - (0.5 + (ix - 0.5))) < 0.06 && ix >= 0.5 && ix <= 0.8);

        if (isFrameBorder || isSun || isMountain) {
          r = 255;
          g = 255;
          b = 255;
        }
      }

      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = createPngChunk('IDAT', compressedData);
  const iendChunk = createPngChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function generateIco(size: number = 32): Buffer {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // Type 1 = ICO
  header.writeUInt16LE(1, 4); // 1 Image

  const imgSize = 40 + size * size * 4 + size * 4;
  const dirEntry = Buffer.alloc(16);
  dirEntry[0] = size; // Width
  dirEntry[1] = size; // Height
  dirEntry[2] = 0; // Palette
  dirEntry[3] = 0; // Reserved
  dirEntry.writeUInt16LE(1, 4); // Color planes
  dirEntry.writeUInt16LE(32, 6); // Bits per pixel
  dirEntry.writeUInt32LE(imgSize, 8); // Data size
  dirEntry.writeUInt32LE(22, 12); // Offset (6 + 16 = 22)

  const bmiHeader = Buffer.alloc(40);
  bmiHeader.writeUInt32LE(40, 0); // Header size
  bmiHeader.writeInt32LE(size, 4); // Width
  bmiHeader.writeInt32LE(size * 2, 8); // Height * 2 for XOR + AND mask
  bmiHeader.writeUInt16LE(1, 12); // Planes
  bmiHeader.writeUInt16LE(32, 14); // Bit count
  bmiHeader.writeUInt32LE(0, 16); // Compression BI_RGB
  bmiHeader.writeUInt32LE(size * size * 4, 20); // Image size

  const xorMask = Buffer.alloc(size * size * 4);

  // ICO pixels are bottom-up (y from size-1 down to 0)
  for (let y = 0; y < size; y++) {
    const py = size - 1 - y; // top-down coordinate
    const ny = py / size;

    for (let x = 0; x < size; x++) {
      const nx = x / size;
      const offset = (y * size + x) * 4;

      // Linear gradient #2563eb to #4f46e5
      const t = (nx + (1 - ny)) / 2;
      let r = Math.round(37 + (79 - 37) * t);
      let g = Math.round(99 + (70 - 99) * t);
      let b = Math.round(235 + (229 - 235) * t);

      // Icon drawing inside (ix, iy in 0..1)
      const ix = (nx - 0.2) / 0.6;
      const iy = (ny - 0.2) / 0.6;

      if (ix >= 0 && ix <= 1 && iy >= 0 && iy <= 1) {
        const isFrameBorder = ix <= 0.1 || ix >= 0.9 || iy <= 0.1 || iy >= 0.9;
        const distSun = Math.sqrt((ix - 0.35) ** 2 + (iy - 0.35) ** 2);
        const isSun = distSun <= 0.14;
        const isMountain = iy >= 0.7 && iy <= 0.85 && ix >= 0.2 && ix <= 0.8;

        if (isFrameBorder || isSun || isMountain) {
          r = 255;
          g = 255;
          b = 255;
        }
      }

      // BGRA format for ICO
      xorMask[offset] = b;
      xorMask[offset + 1] = g;
      xorMask[offset + 2] = r;
      xorMask[offset + 3] = 255; // Alpha
    }
  }

  const andMask = Buffer.alloc(size * 4); // All 0s = fully opaque

  return Buffer.concat([header, dirEntry, bmiHeader, xorMask, andMask]);
}

// Generate files
const icoBuffer = generateIco(32);
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);
console.log('Generated public/favicon.ico (32x32 binary ICO)');

const png180 = generatePng(180, 180);
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), png180);
console.log('Generated public/apple-touch-icon.png (180x180 PNG)');

const png32 = generatePng(32, 32);
fs.writeFileSync(path.join(publicDir, 'favicon-32x32.png'), png32);
console.log('Generated public/favicon-32x32.png (32x32 PNG)');
