import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { Loader2, PenLine, ZoomIn, ZoomOut, Maximize } from 'lucide-react';

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
const DEF_H = 110;
const MIN_W = 160;
const MIN_H = 82;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PdfDoc = any;

export default function PdfViewer({ source, placeable = false, field = null, onField, maxWidth }: Props) {
  const [pages, setPages] = useState<PageMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [containerW, setContainerW] = useState(360);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);
  const pdfRef = useRef<PdfDoc | null>(null);
  const [docVersion, setDocVersion] = useState(0);

  const action = useRef<
    | { type: 'move'; dx: number; dy: number }
    | { type: 'resize'; startX: number; startY: number; startW: number; startH: number }
    | null
  >(null);
  const skipClick = useRef(false);

  // კონტეინერის სიგანის გაზომვა (responsive)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setContainerW(el.clientWidth || 360);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // PDF-ის ჩატვირთვა (source-ის შეცვლისას)
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setErr(null);
    (async () => {
      try {
        const data = typeof source === 'string' ? undefined : source;
        const url = typeof source === 'string' ? source : undefined;
        const pdf = await pdfjsLib.getDocument(data ? { data } : { url: url! }).promise;
        if (cancelled) return;
        pdfRef.current = pdf;
        setDocVersion((v) => v + 1);
      } catch {
        if (!cancelled) {
          setErr('PDF ვერ ჩაიტვირთა.');
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [source]);

  // რენდერი — იცვლება docVersion / სიგანე / zoom-ის ცვლილებაზე
  useEffect(() => {
    const pdf = pdfRef.current;
    if (!pdf) return;
    let cancelled = false;
    (async () => {
      const renderWidth = Math.max(240, (maxWidth ?? containerW) * zoom);
      const metas: PageMeta[] = [];
      const renderers: (() => Promise<void>)[] = [];
      for (let n = 1; n <= pdf.numPages; n++) {
        const page = await pdf.getPage(n);
        const base = page.getViewport({ scale: 1 });
        const scale = renderWidth / base.width;
        const vp = page.getViewport({ scale });
        metas.push({ num: n, cssW: vp.width, cssH: vp.height, scale });
        renderers.push(async () => {
          const canvas = canvasRefs.current[n - 1];
          if (!canvas) return;
          canvas.width = vp.width;
          canvas.height = vp.height;
          const ctx = canvas.getContext('2d')!;
          await page.render({ canvas, canvasContext: ctx, viewport: vp } as unknown as Parameters<typeof page.render>[0]).promise;
        });
      }
      if (cancelled) return;
      setPages(metas);
      setLoading(false);
      setTimeout(() => renderers.forEach((r) => r().catch(() => {})), 30);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docVersion, containerW, zoom, maxWidth]);

  const placeOnPage = (pageNum: number, e: React.MouseEvent, meta: PageMeta) => {
    if (!placeable || !onField) return;
    if (skipClick.current) {
      skipClick.current = false;
      return;
    }
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const cssX = e.clientX - rect.left;
    const cssY = e.clientY - rect.top;
    const x = Math.max(0, Math.min(meta.cssW - DEF_W * meta.scale, cssX - (DEF_W * meta.scale) / 2) / meta.scale);
    const y = Math.max(0, Math.min(meta.cssH - DEF_H * meta.scale, cssY - (DEF_H * meta.scale) / 2) / meta.scale);
    onField({ page: pageNum, x, y, width: DEF_W, height: DEF_H });
  };

  const onBoxDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    const box = (e.currentTarget as HTMLElement).getBoundingClientRect();
    action.current = { type: 'move', dx: e.clientX - box.left, dy: e.clientY - box.top };
  };
  const onResizeDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    if (!field) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    action.current = { type: 'resize', startX: e.clientX, startY: e.clientY, startW: field.width, startH: field.height };
  };
  const onBoxMove = (e: React.PointerEvent, meta: PageMeta, wrapper: HTMLElement | null) => {
    if (!action.current || !onField || !field || !wrapper) return;
    const rect = wrapper.getBoundingClientRect();
    if (action.current.type === 'move') {
      const cssX = e.clientX - rect.left - action.current.dx;
      const cssY = e.clientY - rect.top - action.current.dy;
      onField({
        ...field,
        x: Math.max(0, Math.min(meta.cssW - field.width * meta.scale, cssX) / meta.scale),
        y: Math.max(0, Math.min(meta.cssH - field.height * meta.scale, cssY) / meta.scale),
      });
    } else {
      const nextW = Math.max(MIN_W, action.current.startW + (e.clientX - action.current.startX) / meta.scale);
      const nextH = Math.max(MIN_H, action.current.startH + (e.clientY - action.current.startY) / meta.scale);
      onField({
        ...field,
        width: Math.min(nextW, meta.cssW / meta.scale - field.x),
        height: Math.min(nextH, meta.cssH / meta.scale - field.y),
      });
    }
  };
  const onBoxUp = (e: React.PointerEvent) => {
    e.stopPropagation();
    if (action.current) {
      action.current = null;
      skipClick.current = true;
      window.setTimeout(() => {
        skipClick.current = false;
      }, 0);
    }
  };

  return (
    <div ref={containerRef} className="w-full">
      {/* zoom controls */}
      <div className="sticky top-0 z-10 flex items-center justify-center gap-2 bg-white/90 backdrop-blur py-2 border-b border-slate-100">
        <button type="button" onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.25).toFixed(2)))} className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600">
          <ZoomOut className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => setZoom(1)} className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-bold inline-flex items-center gap-1">
          <Maximize className="h-3.5 w-3.5" /> {Math.round(zoom * 100)}%
        </button>
        <button type="button" onClick={() => setZoom((z) => Math.min(3, +(z + 0.25).toFixed(2)))} className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600">
          <ZoomIn className="h-4 w-4" />
        </button>
      </div>

      {placeable && (
        <div className="text-[11px] text-indigo-600 font-semibold flex items-center justify-center gap-1.5 py-2">
          <PenLine className="h-3.5 w-3.5" /> დააჭირეთ გვერდზე ხელმოწერის დასასმელად; გადაათრიეთ და კუთხით შეცვალეთ ზომა
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center h-40 text-slate-400 gap-2">
          <Loader2 className="h-5 w-5 animate-spin" /> <span className="text-xs">PDF იტვირთება...</span>
        </div>
      )}
      {err && <div className="text-center py-10 text-red-500 text-sm">{err}</div>}

      {!loading && !err && (
        <div className="flex flex-col items-center gap-4 bg-slate-100 py-4 overflow-x-auto">
          {pages.map((m, i) => (
            <div
              key={m.num}
              onClick={(e) => placeOnPage(m.num, e, m)}
              className="relative shadow-md bg-white shrink-0"
              style={{ width: m.cssW, height: m.cssH, cursor: placeable ? 'crosshair' : 'default' }}
            >
              <canvas ref={(el) => (canvasRefs.current[i] = el)} className="block" />
              {placeable && field && field.page === m.num && (
                <div
                  onPointerDown={onBoxDown}
                  onPointerMove={(e) => onBoxMove(e, m, e.currentTarget.parentElement as HTMLElement | null)}
                  onPointerUp={onBoxUp}
                  onPointerCancel={onBoxUp}
                  className="absolute border-2 border-dashed border-emerald-500 bg-emerald-400/20 flex items-center justify-center cursor-move touch-none"
                  style={{ left: field.x * m.scale, top: field.y * m.scale, width: field.width * m.scale, height: field.height * m.scale }}
                >
                  <span className="text-[10px] font-bold text-emerald-700 pointer-events-none">ხელმოწერა</span>
                  <button
                    type="button"
                    aria-label="ზომის შეცვლა"
                    onPointerDown={onResizeDown}
                    onPointerMove={(e) => onBoxMove(e, m, e.currentTarget.parentElement?.parentElement as HTMLElement | null)}
                    onPointerUp={onBoxUp}
                    onPointerCancel={onBoxUp}
                    className="absolute -right-2 -bottom-2 h-5 w-5 rounded-full bg-emerald-600 border-2 border-white shadow cursor-nwse-resize"
                  />
                </div>
              )}
              <span className="absolute bottom-1 right-2 text-[10px] text-slate-400">{m.num}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
