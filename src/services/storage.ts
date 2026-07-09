/**
 * Firebase Storage — ფაილების ატვირთვა (ორიგინალი PDF, ხელმოწერილი PDF, ხელმოწერის სურათი).
 */
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';

export function humanFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** File ობიექტის ატვირთვა. */
export async function uploadFileTo(path: string, file: File): Promise<string> {
  const r = ref(storage, path);
  await uploadBytes(r, file, { contentType: file.type || 'application/octet-stream' });
  return getDownloadURL(r);
}

/** bytes-ის ატვირთვა (მაგ. pdf-lib-ით შექმნილი ხელმოწერილი PDF). */
export async function uploadBytesTo(
  path: string,
  bytes: Uint8Array,
  contentType = 'application/pdf',
): Promise<string> {
  const r = ref(storage, path);
  await uploadBytes(r, bytes as unknown as Blob, { contentType });
  return getDownloadURL(r);
}
