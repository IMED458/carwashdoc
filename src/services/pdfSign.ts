/**
 * PDF ხელმოწერა client-side (pdf-lib).
 * ხელმოწერა + წარწერა ერთ PNG-ად იხატება canvas-ზე (ქართული უპრობლემოდ),
 * შემდეგ ის ჩაისმება PDF-ში სურათად — pdf-lib-ის ფონტის შეზღუდვა გვერდის ავლით.
 */
import { PDFDocument } from 'pdf-lib';
import { sha256Hex as sha256 } from './sha256';

export function sha256Hex(bytes: Uint8Array): Promise<string> {
  return sha256(bytes);
}

export function dataUrlToBytes(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(',')[1] || '';
  const bin = atob(base64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return arr;
}

export async function fetchBytes(url: string): Promise<Uint8Array> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`ფაილი ვერ ჩამოიტვირთა (${res.status})`);
  const buf = await res.arrayBuffer();
  return new Uint8Array(buf);
}

/** %PDF- ხელმოწერის პოზიცია (ზოგ ფაილს წინ BOM/junk აქვს). */
function findPdfStart(bytes: Uint8Array): number {
  const max = Math.min(bytes.length - 5, 8192);
  for (let i = 0; i <= max; i++) {
    if (bytes[i] === 0x25 && bytes[i + 1] === 0x50 && bytes[i + 2] === 0x44 && bytes[i + 3] === 0x46 && bytes[i + 4] === 0x2d) {
      return i;
    }
  }
  return 0;
}

/** ხელმოწერის სურათი + წარწერა ერთ PNG-ად (canvas). */
export function composeStamp(
  signatureDataUrl: string,
  info: { name: string; email: string; date: string },
): Promise<string> {
  return new Promise((resolve) => {
    const W = 720;
    const H = 260;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = 'rgba(255,255,255,0)';
    ctx.fillRect(0, 0, W, H);

    const img = new Image();
    img.onload = () => {
      // ხელმოწერის სურათი ზედა ნაწილში, პროპორციულად და მოჭრის გარეშე.
      const maxW = W - 44;
      const maxH = 150;
      let w = img.width;
      let h = img.height;
      const scale = Math.min(maxW / w, maxH / h, 1);
      w *= scale;
      h *= scale;
      ctx.drawImage(img, (W - w) / 2, 16 + (maxH - h) / 2, w, h);

      // წარწერა
      ctx.fillStyle = '#166534';
      ctx.font = '700 23px "Noto Sans Georgian", "DejaVu Sans", Arial, sans-serif';
      ctx.fillText(`ხელმოწერილია: ${info.name}`, 26, 196);
      ctx.fillStyle = '#475569';
      ctx.font = '18px "Noto Sans Georgian", "DejaVu Sans", Arial, sans-serif';
      ctx.fillText(`თარიღი: ${info.date}`, 26, 222);
      ctx.fillText(`ელფოსტა: ${info.email}`, 26, 246);
      resolve(canvas.toDataURL('image/png'));
    };
    img.src = signatureDataUrl;
  });
}

export interface StampField {
  page?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

/** ხელმოწერის PNG-ის ჩასმა PDF-ში და ხელმოწერილი bytes-ის დაბრუნება. */
export async function signPdf(
  originalBytes: Uint8Array,
  stampPngDataUrl: string,
  field?: StampField,
): Promise<Uint8Array> {
  const start = findPdfStart(originalBytes);
  const clean = start > 0 ? originalBytes.subarray(start) : originalBytes;
  const pdf = await PDFDocument.load(clean, { ignoreEncryption: true });
  const png = await pdf.embedPng(dataUrlToBytes(stampPngDataUrl));
  const pages = pdf.getPages();
  const idx = field?.page ? Math.min(Math.max(0, field.page - 1), pages.length - 1) : pages.length - 1;
  const page = pages[idx];
  const { height: ph } = page.getSize();

  const w = Math.max(field?.width || 260, 240);
  const h = Math.max(field?.height || 118, 108);
  const x = field?.x ?? 40;
  // field.y მოდის viewer-ის top-left სისტემიდან; PDF bottom-left-ია
  const y = field?.y != null ? Math.max(10, ph - field.y - h) : 40;

  page.drawImage(png, { x, y, width: w, height: h });
  return pdf.save();
}
