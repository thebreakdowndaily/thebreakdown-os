import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export type ImageFormat = 'jpeg' | 'png' | 'webp' | 'svg' | 'unknown' | 'corrupt-html';

export interface ImageFileValidationResult {
  isValid: boolean;
  valid: boolean;
  format: ImageFormat;
  sizeBytes: number;
  isHtmlError?: boolean;
  error?: string;
  width?: number;
  height?: number;
  digest?: string;
  isPathContained?: boolean;
  isFormatExtensionMismatch?: boolean;
}

export type DetailedAssetValidationResult = ImageFileValidationResult;

/**
 * Ensures relative paths do not escape the public directory via directory traversal,
 * malformed characters, unsupported remote protocols, or symlink bypasses.
 */
export function isPathContained(
  relativePath: string,
  rootDir: string = process.cwd()
): { isContained: boolean; fullPath: string; cleanPath: string; error?: string } {
  if (!relativePath || typeof relativePath !== 'string') {
    return { isContained: false, fullPath: '', cleanPath: '', error: 'Empty or non-string asset path' };
  }

  // Reject malformed paths containing null bytes
  if (relativePath.includes('\0')) {
    return { isContained: false, fullPath: '', cleanPath: relativePath, error: 'Malformed path containing null byte' };
  }

  // Reject remote URLs where a local binary asset is required
  if (/^https?:\/\/|^\/\//i.test(relativePath)) {
    return {
      isContained: false,
      fullPath: '',
      cleanPath: relativePath,
      error: `Remote URL "${relativePath}" is unsupported where local binary asset is required.`,
    };
  }

  const cleanPath = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;
  const publicDir = path.resolve(rootDir, 'public');
  const fullPath = path.resolve(publicDir, cleanPath);

  // Logical path traversal containment check
  let isContained = fullPath.startsWith(publicDir + path.sep) || fullPath === publicDir;
  if (!isContained) {
    return {
      isContained: false,
      fullPath,
      cleanPath,
      error: `Path traversal violation: "${relativePath}" escapes public directory.`,
    };
  }

  // Symlink resolution containment check
  if (fs.existsSync(fullPath)) {
    try {
      const realPath = fs.realpathSync(fullPath);
      const realPublicDir = fs.realpathSync(publicDir);
      if (!realPath.startsWith(realPublicDir + path.sep) && realPath !== realPublicDir) {
        return {
          isContained: false,
          fullPath,
          cleanPath,
          error: `Symlink traversal violation: "${relativePath}" resolves outside public directory to "${realPath}".`,
        };
      }
    } catch (err: any) {
      return {
        isContained: false,
        fullPath,
        cleanPath,
        error: `Failed to resolve real path for "${relativePath}": ${err.message}`,
      };
    }
  }

  return { isContained: true, fullPath, cleanPath };
}

/**
 * Computes deterministic SHA-256 digest of binary buffer.
 */
export function calculateContentDigest(buffer: Buffer): string {
  return 'sha256:' + crypto.createHash('sha256').update(buffer).digest('hex');
}

/**
 * Maps standard file extensions to expected image formats.
 */
export function getExpectedFormatFromExtension(filePath: string): ImageFormat | 'unknown' {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.jpg' || ext === '.jpeg') return 'jpeg';
  if (ext === '.png') return 'png';
  if (ext === '.webp') return 'webp';
  if (ext === '.svg') return 'svg';
  return 'unknown';
}

/**
 * Inspects binary buffers or SVG text to parse underlying dimensions without external dependencies.
 */
export function readImageDimensions(
  buffer: Buffer,
  format: ImageFormat
): { width: number; height: number } | null {
  if (!buffer || buffer.length === 0) return null;

  if (format === 'svg') {
    const text = buffer.toString('utf8');
    const vbMatch = text.match(/viewBox=["']\s*([0-9.-]+)\s+([0-9.-]+)\s+([0-9.]+)\s+([0-9.]+)[\s"']/i);
    if (vbMatch) {
      const w = Math.round(parseFloat(vbMatch[3]));
      const h = Math.round(parseFloat(vbMatch[4]));
      if (w > 0 && h > 0) return { width: w, height: h };
    }
    const wMatch = text.match(/width=["']([0-9.]+)(?:px)?["']/i);
    const hMatch = text.match(/height=["']([0-9.]+)(?:px)?["']/i);
    if (wMatch && hMatch) {
      const w = Math.round(parseFloat(wMatch[1]));
      const h = Math.round(parseFloat(hMatch[1]));
      if (w > 0 && h > 0) return { width: w, height: h };
    }
    return null;
  }

  if (format === 'png') {
    if (buffer.length >= 24 && buffer.toString('ascii', 12, 16) === 'IHDR') {
      const width = buffer.readUInt32BE(16);
      const height = buffer.readUInt32BE(20);
      if (width > 0 && height > 0) return { width, height };
    }
    return null;
  }

  if (format === 'jpeg') {
    let offset = 2;
    while (offset < buffer.length - 8) {
      if (buffer[offset] !== 0xff) break;
      const marker = buffer[offset + 1];
      if (
        (marker >= 0xc0 && marker <= 0xc3) ||
        (marker >= 0xc5 && marker <= 0xc7) ||
        (marker >= 0xc9 && marker <= 0xcb)
      ) {
        const height = buffer.readUInt16BE(offset + 5);
        const width = buffer.readUInt16BE(offset + 7);
        if (width > 0 && height > 0) return { width, height };
      }
      const len = buffer.readUInt16BE(offset + 2);
      offset += 2 + len;
    }
    return null;
  }

  if (format === 'webp') {
    if (buffer.length < 30) return null;
    const tag = buffer.toString('ascii', 12, 16);
    if (tag === 'VP8 ') {
      const width = buffer.readUInt16LE(26) & 0x3fff;
      const height = buffer.readUInt16LE(28) & 0x3fff;
      if (width > 0 && height > 0) return { width, height };
    }
    if (tag === 'VP8L') {
      const b1 = buffer[21];
      const b2 = buffer[22];
      const b3 = buffer[23];
      const b4 = buffer[24];
      const width = 1 + (((b2 & 0x3f) << 8) | b1);
      const height = 1 + (((b4 & 0x0f) << 10) | (b3 << 2) | ((b2 & 0xc0) >> 6));
      if (width > 0 && height > 0) return { width, height };
    }
    if (tag === 'VP8X') {
      const width = 1 + buffer.readUIntLE(24, 3);
      const height = 1 + buffer.readUIntLE(27, 3);
      if (width > 0 && height > 0) return { width, height };
    }
  }

  return null;
}

/**
 * Thorough local asset validation: checks path containment, existence on disk,
 * non-empty size, corruption / HTML error text, format via magic bytes, extension parity,
 * actual dimensions, and content digest.
 */
export function validateLocalAssetDetailed(
  relativePath: string,
  rootDir: string = process.cwd()
): DetailedAssetValidationResult {
  const { isContained, fullPath, cleanPath, error: containmentError } = isPathContained(relativePath, rootDir);

  if (!isContained) {
    return {
      isValid: false,
      valid: false,
      isPathContained: false,
      format: 'unknown',
      sizeBytes: 0,
      error: containmentError || `Path traversal violation: "${relativePath}" escapes public directory.`,
    };
  }

  if (!fs.existsSync(fullPath)) {
    return {
      isValid: false,
      valid: false,
      isPathContained: true,
      format: 'unknown',
      sizeBytes: 0,
      error: `File does not exist on disk: ${cleanPath}`,
    };
  }

  const stat = fs.statSync(fullPath);
  if (stat.size === 0) {
    return {
      isValid: false,
      valid: false,
      isPathContained: true,
      format: 'unknown',
      sizeBytes: 0,
      error: `File is 0 bytes (empty file): ${cleanPath}`,
    };
  }

  const fullBuffer = fs.readFileSync(fullPath);
  const isSvg = cleanPath.toLowerCase().endsWith('.svg');
  // For text-based formats (SVG), canonicalize CRLF to LF so line endings do not break digest validation across OS environments
  const canonicalBuffer = isSvg
    ? Buffer.from(fullBuffer.toString('utf8').replace(/\r\n/g, '\n'), 'utf8')
    : fullBuffer;
  const digest = calculateContentDigest(canonicalBuffer);

  // Check for HTML document pretending to be an image
  const textHeader = fullBuffer.toString('utf8', 0, Math.min(512, fullBuffer.length)).toLowerCase();
  if (
    textHeader.includes('<!doctype html') ||
    textHeader.includes('<html') ||
    textHeader.includes('<title>wikimedia error') ||
    textHeader.includes('404 not found') ||
    textHeader.includes('500 internal server error')
  ) {
    return {
      isValid: false,
      valid: false,
      isPathContained: true,
      format: 'corrupt-html',
      isHtmlError: true,
      sizeBytes: stat.size,
      digest,
      error: `File contains HTML text error response instead of binary image data: ${cleanPath}`,
    };
  }

  // Determine format via magic bytes
  let format: ImageFormat = 'unknown';
  if (fullBuffer.length >= 3 && fullBuffer[0] === 0xff && fullBuffer[1] === 0xd8 && fullBuffer[2] === 0xff) {
    format = 'jpeg';
  } else if (
    fullBuffer.length >= 8 &&
    fullBuffer[0] === 0x89 &&
    fullBuffer[1] === 0x50 &&
    fullBuffer[2] === 0x4e &&
    fullBuffer[3] === 0x47 &&
    fullBuffer[4] === 0x0d &&
    fullBuffer[5] === 0x0a &&
    fullBuffer[6] === 0x1a &&
    fullBuffer[7] === 0x0a
  ) {
    format = 'png';
  } else if (
    fullBuffer.length >= 12 &&
    fullBuffer.toString('ascii', 0, 4) === 'RIFF' &&
    fullBuffer.toString('ascii', 8, 12) === 'WEBP'
  ) {
    format = 'webp';
  } else if (textHeader.includes('<svg') || textHeader.includes('<?xml')) {
    format = 'svg';
  }

  if (format === 'unknown') {
    return {
      isValid: false,
      valid: false,
      isPathContained: true,
      format: 'unknown',
      sizeBytes: stat.size,
      digest,
      error: `Unrecognized file signature for image: ${cleanPath}`,
    };
  }

  // Check file extension vs detected binary format
  const expectedFormat = getExpectedFormatFromExtension(cleanPath);
  if (expectedFormat !== 'unknown' && format !== expectedFormat) {
    return {
      isValid: false,
      valid: false,
      isPathContained: true,
      format,
      sizeBytes: stat.size,
      digest,
      isFormatExtensionMismatch: true,
      error: `File extension "${path.extname(cleanPath)}" conflicts with detected binary format "${format}".`,
    };
  }

  const dimensions = readImageDimensions(fullBuffer, format);
  const width = dimensions?.width;
  const height = dimensions?.height;

  if (!width || !height || width <= 0 || height <= 0) {
    return {
      isValid: false,
      valid: false,
      isPathContained: true,
      format,
      sizeBytes: stat.size,
      digest,
      error: `Corrupt or invalid dimensions in ${format} file: ${cleanPath}`,
    };
  }

  return {
    isValid: true,
    valid: true,
    isPathContained: true,
    format,
    sizeBytes: stat.size,
    width,
    height,
    digest,
  };
}

/**
 * Inspects a file on disk using its magic bytes (file signature)
 * to verify it is genuinely a valid image and not an HTML error page,
 * truncated file, or corrupt text response.
 */
export function validateImageFile(relativePath: string, rootDir: string = process.cwd()): ImageFileValidationResult {
  return validateLocalAssetDetailed(relativePath, rootDir);
}
