/**
 * ფაილების ატვირთვა Supabase Storage-ზე (უფასო).
 * ფუნქციების ხელმოწერა უცვლელია — დანარჩენი კოდი არ იცვლება.
 */
import { supabase, SUPABASE_BUCKET } from '../config/supabase';

export function humanFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function upload(path: string, body: File | Blob, contentType: string): Promise<string> {
  const { error } = await supabase.storage.from(SUPABASE_BUCKET).upload(path, body, {
    contentType,
    upsert: true,
  });
  if (error) throw error;
  const { data } = supabase.storage.from(SUPABASE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/** File ობიექტის ატვირთვა. */
export async function uploadFileTo(path: string, file: File): Promise<string> {
  return upload(path, file, file.type || 'application/octet-stream');
}

/** bytes-ის ატვირთვა (მაგ. pdf-lib-ით შექმნილი ხელმოწერილი PDF). */
export async function uploadBytesTo(
  path: string,
  bytes: Uint8Array,
  contentType = 'application/pdf',
): Promise<string> {
  const blob = new Blob([bytes as unknown as BlobPart], { type: contentType });
  return upload(path, blob, contentType);
}
