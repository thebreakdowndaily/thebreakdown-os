import sharp from 'sharp';
import { describe, expect, it } from 'vitest';
import {
  MAX_IMAGE_UPLOAD_BYTES,
  MediaSanitizationError,
  sanitizeRasterImage,
} from '@/lib/media/server/image-sanitizer';

describe('sanitizeRasterImage', () => {
  it('re-encodes JPEG input to metadata-free WebP and applies EXIF orientation', async () => {
    const source = await sharp({
      create: {
        width: 32,
        height: 16,
        channels: 3,
        background: { r: 20, g: 80, b: 160 },
      },
    })
      .jpeg()
      .withMetadata({ orientation: 6 })
      .toBuffer();

    const sourceMetadata = await sharp(source).metadata();
    expect(sourceMetadata.orientation).toBe(6);

    const sanitized = await sanitizeRasterImage(source, 'image/jpeg');
    const outputMetadata = await sharp(sanitized.buffer).metadata();

    expect(sanitized.mimeType).toBe('image/webp');
    expect(outputMetadata.format).toBe('webp');
    expect(outputMetadata.exif).toBeUndefined();
    expect(outputMetadata.iptc).toBeUndefined();
    expect(outputMetadata.xmp).toBeUndefined();
    expect(outputMetadata.orientation).toBeUndefined();
    expect(sanitized.width).toBe(16);
    expect(sanitized.height).toBe(32);
    expect(sanitized.sha256).toMatch(/^[a-f0-9]{64}$/);
  });

  it('rejects MIME declarations that do not match the detected bytes', async () => {
    const png = await sharp({
      create: {
        width: 2,
        height: 2,
        channels: 3,
        background: { r: 1, g: 2, b: 3 },
      },
    }).png().toBuffer();

    await expect(sanitizeRasterImage(png, 'image/jpeg')).rejects.toBeInstanceOf(MediaSanitizationError);
  });

  it('rejects SVG and malformed inputs instead of forwarding them to Storage', async () => {
    const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"></svg>');
    await expect(sanitizeRasterImage(svg, 'image/svg+xml')).rejects.toBeInstanceOf(MediaSanitizationError);
    await expect(sanitizeRasterImage(Buffer.from('not an image'))).rejects.toBeInstanceOf(MediaSanitizationError);
  });

  it('rejects uploads above the request-size limit before decoding', async () => {
    await expect(
      sanitizeRasterImage(Buffer.alloc(MAX_IMAGE_UPLOAD_BYTES + 1), 'image/png')
    ).rejects.toMatchObject({ status: 413 });
  });
});
