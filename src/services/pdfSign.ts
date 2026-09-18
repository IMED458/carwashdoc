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

/**
 * ხელმოწერის PNG-ის ჩასმა PDF-ში ზუსტად შემქმნელის მიერ მითითებულ ადგილას და
 * ზომაზე. ხელმომწერი ვერაფერს ცვლის — მხოლოდ სურათი ისმება მოცემულ ველში.
 * ხელმოწერა პროპორციულად თავსდება ველში (დამახინჯების გარეშე), ცენტრში.
 * @param signaturePngDataUrl სუფთა ხელმოწერის სურათი (გამჭვირვალე ფონით).
 */
export async function signPdf(
  originalBytes: Uint8Array,
  signaturePngDataUrl: string,
  field?: StampField,
): Promise<Uint8Array> {
  const start = findPdfStart(originalBytes);
  const clean = start > 0 ? originalBytes.subarray(start) : originalBytes;
  const pdf = await PDFDocument.load(clean, { ignoreEncryption: true });
  const png = await pdf.embedPng(dataUrlToBytes(signaturePngDataUrl));
  const pages = pdf.getPages();
  const idx = field?.page ? Math.min(Math.max(0, field.page - 1), pages.length - 1) : pages.length - 1;
  const page = pages[idx];
  const { width: pw, height: ph } = page.getSize();

  // ველი ზუსტად ისე, როგორც შემქმნელმა განათავსა (PDF წერტილები, top-left საწყისი).
  // მინიმუმებს აღარ ვაწესებთ — ზომა ზუსტად მითითებულია.
  const boxW = field?.width && field.width > 0 ? field.width : 200;
  const boxH = field?.height && field.height > 0 ? field.height : 110;
  const boxX = field?.x ?? 40;
  const boxYTop = field?.y != null ? field.y : ph - boxH - 40;

  // ხელმოწერა ვათავსებთ ველში პროპორციის დაცვით (contain), ცენტრში.
  const fit = Math.min(boxW / png.width, boxH / png.height);
  const drawW = png.width * fit;
  const drawH = png.height * fit;
  const drawXTopLeft = boxX + (boxW - drawW) / 2;
  const drawYTop = boxYTop + (boxH - drawH) / 2;

  // top-left (viewer) → bottom-left (PDF).
  const x = Math.max(0, Math.min(pw - drawW, drawXTopLeft));
  const y = Math.max(0, Math.min(ph - drawH, ph - drawYTop - drawH));

  page.drawImage(png, { x, y, width: drawW, height: drawH });
  return pdf.save();
}
