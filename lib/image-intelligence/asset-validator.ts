import fs from 'fs';
import path from 'path';

export type ImageFormat = 'jpeg' | 'png' | 'webp' | 'svg' | 'unknown' | 'corrupt-html';

export interface ImageFileValidationResult {
  isValid: boolean;
  valid: boolean;
  format: ImageFormat;
  sizeBytes: number;
  isHtmlError?: boolean;
  error?: string;
}

/**
 * Inspects a file on disk using its magic bytes (file signature)
 * to verify it is genuinely a valid image and not an HTML error page,
 * truncated file, or corrupt text response.
 */
export function validateImageFile(relativePath: string, rootDir: string = process.cwd()): ImageFileValidationResult {
  const cleanPath = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;
  const fullPath = path.join(rootDir, 'public', cleanPath);

  if (!fs.existsSync(fullPath)) {
    return {
      isValid: false,
      valid: false,
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
      format: 'unknown',
      sizeBytes: 0,
      error: `File is 0 bytes (empty file): ${cleanPath}`,
    };
  }

  const fd = fs.openSync(fullPath, 'r');
  const buffer = Buffer.alloc(Math.min(512, stat.size));
  fs.readSync(fd, buffer, 0, buffer.length, 0);
  fs.closeSync(fd);

  // Check for HTML document pretending to be an image
  const textHeader = buffer.toString('utf8', 0, Math.min(256, buffer.length)).toLowerCase();
  if (
    textHeader.includes('<!doctype html') ||
    textHeader.includes('<html') ||
    textHeader.includes('<title>wikimedia error') ||
    textHeader.includes('404 not found')
  ) {
    return {
      isValid: false,
      valid: false,
      format: 'corrupt-html',
      isHtmlError: true,
      sizeBytes: stat.size,
      error: `File contains HTML text error response instead of binary image data: ${cleanPath}`,
    };
  }

  // Check magic bytes
  // JPEG: FF D8 FF
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return {
      isValid: true,
      valid: true,
      format: 'jpeg',
      sizeBytes: stat.size,
    };
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return {
      isValid: true,
      valid: true,
      format: 'png',
      sizeBytes: stat.size,
    };
  }

  // WebP: RIFF .... WEBP
  if (
    buffer.length >= 12 &&
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP'
  ) {
    return {
      isValid: true,
      valid: true,
      format: 'webp',
      sizeBytes: stat.size,
    };
  }

  // SVG: text containing <svg
  if (textHeader.includes('<svg') || textHeader.includes('<?xml')) {
    return {
      isValid: true,
      valid: true,
      format: 'svg',
      sizeBytes: stat.size,
    };
  }

  return {
    isValid: false,
    valid: false,
    format: 'unknown',
    sizeBytes: stat.size,
    error: `Unrecognized file signature for image: ${cleanPath}`,
  };
}
