/**
 * PDF ხელმოწერა client-side (pdf-lib).
 * ხელმოწერა + წარწერა ერთ PNG-ად იხატება canvas-ზე (ქართული უპრობლემოდ),
 * შემდეგ ის ჩაისმება PDF-ში სურათად — pdf-lib-ის ფონტის შეზღუდვა გვერდის ავლით.
 */
import { PDFDocument } from 'pdf-lib';

export async function sha256Hex(bytes: Uint8Array): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
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
  const buf = await res.arrayBuffer();
  return new Uint8Array(buf);
}

/** ხელმოწერის სურათი + წარწერა ერთ PNG-ად (canvas). */
export function composeStamp(
  signatureDataUrl: string,
  info: { name: string; email: string; date: string },
): Promise<string> {
  return new Promise((resolve) => {
    const W = 460;
    const H = 200;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = 'rgba(255,255,255,0)';
    ctx.fillRect(0, 0, W, H);

    const img = new Image();
    img.onload = () => {
      // ხელმოწერის სურათი ზედა ნაწილში, პროპორციულად
      const maxW = W - 20;
      const maxH = 120;
      let w = img.width;
      let h = img.height;
      const scale = Math.min(maxW / w, maxH / h, 1);
      w *= scale;
      h *= scale;
      ctx.drawImage(img, (W - w) / 2, 6, w, h);

      // წარწერა
      ctx.fillStyle = '#166534';
      ctx.font = 'bold 18px "Noto Sans Georgian", Arial, sans-serif';
      ctx.fillText(`ხელმოწერილია: ${info.name}`, 12, 148);
      ctx.fillStyle = '#334155';
      ctx.font = '15px "Noto Sans Georgian", Arial, sans-serif';
      ctx.fillText(`თარიღი: ${info.date}`, 12, 170);
      ctx.fillText(`ელფოსტა: ${info.email}`, 12, 190);
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
  const pdf = await PDFDocument.load(originalBytes);
  const png = await pdf.embedPng(dataUrlToBytes(stampPngDataUrl));
  const pages = pdf.getPages();
  const idx = field?.page ? Math.min(Math.max(0, field.page - 1), pages.length - 1) : pages.length - 1;
  const page = pages[idx];
  const { height: ph } = page.getSize();

  const w = field?.width || 230;
  const h = field?.height || 100;
  const x = field?.x ?? 40;
  // field.y მოდის viewer-ის top-left სისტემიდან; PDF bottom-left-ია
  const y = field?.y != null ? Math.max(10, ph - field.y - h) : 40;

  page.drawImage(png, { x, y, width: w, height: h });
  return pdf.save();
}
