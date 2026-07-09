import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { Loader2, PenLine } from 'lucide-react';

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

export interface PlacedField {
  page: number; // 1-based
  x: number; // PDF points, top-left
  y: number;
  width: number;
  height: number;
}

interface PageMeta {
  num: number;
  cssW: number;
  cssH: number;
  scale: number; // css px per PDF point
}

interface Props {
  source: string | Uint8Array;
  placeable?: boolean;
  field?: PlacedField | null;
  onField?: (f: PlacedField) => void;
  maxWidth?: number;
}

const DEF_W = 200;
const DEF_H = 70;

export default function PdfViewer({ source, placeable = false, field = null, onField, maxWidth = 700 }: Props) {
  const [pages, setPages] = useState<PageMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);
  const drag = useRef<{ dx: number; dy: number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const data = typeof source === 'string' ? undefined : source;
        const url = typeof source === 'string' ? source : undefined;
        const pdf = await pdfjsLib.getDocument(data ? { data } : { url: url! }).promise;
        const metas: PageMeta[] = [];
        const rendered: { num: number; canvasW: number; canvasH: number; render: () => Promise<void> }[] = [];
        for (let n = 1; n <= pdf.numPages; n++) {
          const page = await pdf.getPage(n);
          const base = page.getViewport({ scale: 1 });
          const scale = Math.min(maxWidth / base.width, 1.6);
          const vp = page.getViewport({ scale });
          metas.push({ num: n, cssW: vp.width, cssH: vp.height, scale });
          rendered.push({
            num: n,
            canvasW: vp.width,
            canvasH: vp.height,
            render: async () => {
              const canvas = canvasRefs.current[n - 1];
              if (!canvas) return;
              canvas.width = vp.width;
              canvas.height = vp.height;
              const ctx = canvas.getContext('2d')!;
              await page.render({ canvas, canvasContext: ctx, viewport: vp } as unknown as Parameters<typeof page.render>[0]).promise;
            },
          });
        }
        if (cancelled) return;
        setPages(metas);
        setLoading(false);
        // canvases დაირენდერება DOM-ის განახლების შემდეგ
        setTimeout(() => rendered.forEach((r) => r.render().catch(() => {})), 50);
      } catch (e) {
        if (!cancelled) {
          setErr('PDF ვერ ჩაიტვირთა.');
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source]);

  const placeOnPage = (pageNum: number, e: React.MouseEvent, meta: PageMeta) => {
    if (!placeable || !onField) return;
    if (drag.current) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const cssX = e.clientX - rect.left;
    const cssY = e.clientY - rect.top;
    onField({
      page: pageNum,
      x: Math.max(0, cssX / meta.scale - DEF_W / 2),
      y: Math.max(0, cssY / meta.scale - DEF_H / 2),
      width: DEF_W,
      height: DEF_H,
    });
  };

  const onBoxDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    const box = (e.currentTarget as HTMLElement).getBoundingClientRect();
    drag.current = { dx: e.clientX - box.left, dy: e.clientY - box.top };
  };
  const onBoxMove = (e: React.PointerEvent, meta: PageMeta, wrapper: HTMLElement | null) => {
    if (!drag.current || !onField || !field || !wrapper) return;
    const rect = wrapper.getBoundingClientRect();
    const cssX = e.clientX - rect.left - drag.current.dx;
    const cssY = e.clientY - rect.top - drag.current.dy;
    onField({
      ...field,
      x: Math.max(0, Math.min(meta.cssW - field.width * meta.scale, cssX) / meta.scale),
      y: Math.max(0, Math.min(meta.cssH - field.height * meta.scale, cssY) / meta.scale),
    });
  };
  const onBoxUp = () => (drag.current = null);

  if (loading)
    return (
      <div className="flex items-center justify-center h-40 text-slate-400 gap-2">
        <Loader2 className="h-5 w-5 animate-spin" /> <span className="text-xs">PDF იტვირთება...</span>
      </div>
    );
  if (err) return <div className="text-center py-10 text-red-500 text-sm">{err}</div>;

  return (
    <div className="space-y-4 flex flex-col items-center bg-slate-100 py-4 rounded-xl">
      {placeable && (
        <div className="text-[11px] text-indigo-600 font-semibold flex items-center gap-1.5">
          <PenLine className="h-3.5 w-3.5" /> დააჭირეთ გვერდზე, სადაც ხელმოწერა უნდა ჩაჯდეს (ბლოკის გადატანა შესაძლებელია)
        </div>
      )}
      {pages.map((m, i) => {
        let wrapperEl: HTMLElement | null = null;
        return (
          <div
            key={m.num}
            ref={(el) => (wrapperEl = el)}
            onClick={(e) => placeOnPage(m.num, e, m)}
            className="relative shadow-md bg-white"
            style={{ width: m.cssW, height: m.cssH, cursor: placeable ? 'crosshair' : 'default' }}
          >
            <canvas ref={(el) => (canvasRefs.current[i] = el)} className="block" />
            {placeable && field && field.page === m.num && (
              <div
                onPointerDown={onBoxDown}
                onPointerMove={(e) => onBoxMove(e, m, wrapperEl)}
                onPointerUp={onBoxUp}
                className="absolute border-2 border-dashed border-emerald-500 bg-emerald-400/20 flex items-center justify-center cursor-move touch-none"
                style={{
                  left: field.x * m.scale,
                  top: field.y * m.scale,
                  width: field.width * m.scale,
                  height: field.height * m.scale,
                }}
              >
                <span className="text-[10px] font-bold text-emerald-700 pointer-events-none">ხელმოწერა</span>
              </div>
            )}
            <span className="absolute bottom-1 right-2 text-[10px] text-slate-400">{m.num}</span>
          </div>
        );
      })}
    </div>
  );
}
