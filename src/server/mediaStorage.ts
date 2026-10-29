import fs from 'node:fs/promises';
import path from 'node:path';

const IMAGE_LIMIT = 10 * 1024 * 1024;
const VIDEO_LIMIT = 100 * 1024 * 1024;

export interface DetectedMedia {
  mediaType: 'IMAGE' | 'VIDEO';
  extension: 'jpg' | 'png' | 'webp' | 'mp4' | 'webm';
  contentType: string;
}

export function getMediaDirectory(): string | null {
  const configured = process.env.MEDIA_STORAGE_PATH?.trim();
  return configured ? path.resolve(configured) : null;
}

export function detectMedia(buffer: Buffer): DetectedMedia | null {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { mediaType: 'IMAGE', extension: 'jpg', contentType: 'image/jpeg' };
  }
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return { mediaType: 'IMAGE', extension: 'png', contentType: 'image/png' };
  }
  if (buffer.length >= 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') {
    return { mediaType: 'IMAGE', extension: 'webp', contentType: 'image/webp' };
  }
  if (buffer.length >= 12 && buffer.toString('ascii', 4, 8) === 'ftyp') {
    return { mediaType: 'VIDEO', extension: 'mp4', contentType: 'video/mp4' };
  }
  if (buffer.length >= 4 && buffer.subarray(0, 4).equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3]))) {
    return { mediaType: 'VIDEO', extension: 'webm', contentType: 'video/webm' };
  }
  return null;
}

export async function storeMedia(id: string, media: DetectedMedia, buffer: Buffer): Promise<string> {
  const directory = getMediaDirectory();
  if (!directory) throw new Error('Media storage is not configured. Set MEDIA_STORAGE_PATH on the server.');
  const maxSize = media.mediaType === 'IMAGE' ? IMAGE_LIMIT : VIDEO_LIMIT;
  if (buffer.length === 0 || buffer.length > maxSize) {
    throw new Error(`This ${media.mediaType.toLowerCase()} file exceeds the ${Math.floor(maxSize / 1024 / 1024)} MB limit or is empty.`);
  }
  const key = `${id}.${media.extension}`;
  await fs.mkdir(directory, { recursive: true });
  await fs.writeFile(path.join(directory, key), buffer, { flag: 'wx' });
  return key;
}

export async function resolveStoredMedia(key: string): Promise<string | null> {
  const directory = getMediaDirectory();
  if (!directory || path.basename(key) !== key || !/^[a-f0-9-]+\.(jpg|png|webp|mp4|webm)$/i.test(key)) return null;
  const filePath = path.join(directory, key);
  try {
    await fs.access(filePath);
    return filePath;
  } catch {
    return null;
  }
}

export async function deleteStoredMedia(key: string): Promise<void> {
  const filePath = await resolveStoredMedia(key);
  if (filePath) await fs.unlink(filePath);
}

export function mediaContentType(key: string): string {
  const extension = path.extname(key).toLowerCase();
  return ({ '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.mp4': 'video/mp4', '.webm': 'video/webm' })[extension] || 'application/octet-stream';
}