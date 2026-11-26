import 'server-only';

import { createHash } from 'node:crypto';
import sharp from 'sharp';

export const MAX_IMAGE_UPLOAD_BYTES = 4 * 1024 * 1024;
export const MAX_IMAGE_OUTPUT_BYTES = 4 * 1024 * 1024;
export const MAX_IMAGE_INPUT_PIXELS = 20_000_000;
export const MAX_IMAGE_DIMENSION = 2_560;

export class MediaSanitizationError extends Error {
  constructor(
    message: string,
    public readonly status: 413 | 415 | 422 = 415
  ) {
    super(message);
    this.name = 'MediaSanitizationError';
  }
}

const INPUT_MIME_TYPES: Record<string, string> = {
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  avif: 'image/avif',
};

export interface SanitizedImage {
  buffer: Buffer;
  mimeType: 'image/webp';
  width: number;
  height: number;
  fileSize: number;
  sha256: string;
  sourceFormat: string;
}

/**
 * Converts untrusted raster bytes into a new, metadata-free WebP image.
 *
 * This function intentionally accepts only single-frame JPEG, PNG, WebP and AVIF.
 * It never trusts the filename or the browser's MIME declaration, and it never
 * persists the original upload. Sharp's re-encode step drops EXIF/XMP/IPTC data,
 * including GPS coordinates and camera details.
 */
export async function sanitizeRasterImage(
  input: Buffer,
  declaredMimeType?: string
): Promise<SanitizedImage> {
  if (!Buffer.isBuffer(input) || input.length === 0) {
    throw new MediaSanitizationError('The uploaded file is empty.', 422);
  }

  if (input.byteLength > MAX_IMAGE_UPLOAD_BYTES) {
    throw new MediaSanitizationError('Image uploads must be 4 MB or smaller.', 413);
  }

  type Metadata = Awaited<ReturnType<ReturnType<typeof sharp>['metadata']>>;
  let metadata: Metadata;

  try {
    metadata = await sharp(input, {
      failOn: 'error',
      limitInputPixels: MAX_IMAGE_INPUT_PIXELS,
      sequentialRead: true,
    }).metadata();
  } catch {
    throw new MediaSanitizationError('The uploaded file is not a valid supported image.', 415);
  }

  const sourceFormat = metadata.format ?? '';
  const expectedMimeType = sourceFormat === 'heif' && metadata.compression === 'av1'
    ? 'image/avif'
    : INPUT_MIME_TYPES[sourceFormat];
  if (!expectedMimeType) {
    throw new MediaSanitizationError('Only JPEG, PNG, WebP and AVIF images are accepted.', 415);
  }

  const normalizedDeclaredMime = (declaredMimeType ?? '').split(';', 1)[0].trim().toLowerCase();
  if (
    normalizedDeclaredMime &&
    normalizedDeclaredMime !== expectedMimeType &&
    !(normalizedDeclaredMime === 'image/jpg' && expectedMimeType === 'image/jpeg')
  ) {
    throw new MediaSanitizationError('The declared file type does not match the actual image format.', 415);
  }

  if (
    !metadata.width ||
    !metadata.height ||
    metadata.width < 1 ||
    metadata.height < 1 ||
    metadata.width * metadata.height > MAX_IMAGE_INPUT_PIXELS
  ) {
    throw new MediaSanitizationError('The image dimensions are invalid or exceed the processing limit.', 422);
  }

  if ((metadata.pages ?? 1) > 1) {
    throw new MediaSanitizationError('Animated and multi-page images are not accepted.', 415);
  }

  let output: { data: Buffer; info: sharp.OutputInfo };
  try {
    output = await sharp(input, {
      failOn: 'error',
      limitInputPixels: MAX_IMAGE_INPUT_PIXELS,
      sequentialRead: true,
    })
      .rotate()
      .resize({
        width: MAX_IMAGE_DIMENSION,
        height: MAX_IMAGE_DIMENSION,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 82, effort: 4, smartSubsample: true })
      .toBuffer({ resolveWithObject: true });
  } catch {
    throw new MediaSanitizationError('The image could not be safely decoded and re-encoded.', 415);
  }

  if (
    output.info.format !== 'webp' ||
    output.info.width < 1 ||
    output.info.height < 1 ||
    output.data.byteLength === 0
  ) {
    throw new MediaSanitizationError('The image processor returned an invalid output.', 422);
  }

  if (output.data.byteLength > MAX_IMAGE_OUTPUT_BYTES) {
    throw new MediaSanitizationError('The processed image exceeds the 4 MB storage limit.', 413);
  }

  return {
    buffer: output.data,
    mimeType: 'image/webp',
    width: output.info.width,
    height: output.info.height,
    fileSize: output.data.byteLength,
    sha256: createHash('sha256').update(output.data).digest('hex'),
    sourceFormat,
  };
}
