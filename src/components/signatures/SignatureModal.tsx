import React, { useEffect, useRef, useState } from 'react';
import { X, PenLine, Upload } from 'lucide-react';
import { SignatureType } from '../../services/signatures';

interface Props {
  signerName: string;
  onClose: () => void;
  onSign: (dataUrl: string, type: SignatureType) => void;
}

type Tab = 'draw' | 'upload';

export default function SignatureModal({ onClose, onSign }: Props) {
  const [tab, setTab] = useState<Tab>('draw');
  const [uploadUrl, setUploadUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const hasDrawn = useRef(false);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d')!;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#334155';
  }, [tab]);

  const pos = (e: React.PointerEvent) => {
    const c = canvasRef.current!;
    const rect = c.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * c.width,
      y: ((e.clientY - rect.top) / rect.height) * c.height,
    };
  };

  const down = (e: React.PointerEvent) => {
    drawing.current = true;
    const ctx = canvasRef.current!.getContext('2d')!;
    const { x, y } = pos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const move = (e: React.PointerEvent) => {
    if (!drawing.current) return;
    const ctx = canvasRef.current!.getContext('2d')!;
    const { x, y } = pos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    hasDrawn.current = true;
  };

  const up = () => (drawing.current = false);

  const clearCanvas = () => {
    const c = canvasRef.current!;
    c.getContext('2d')!.clearRect(0, 0, c.width, c.height);
    hasDrawn.current = false;
  };

  const onUploadFile = (f: File | null) => {
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const c = document.createElement('canvas');
        c.width = Math.max(1, img.width);
        c.height = Math.max(1, img.height);
        c.getContext('2d')!.drawImage(img, 0, 0);
        setUploadUrl(c.toDataURL('image/png'));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(f);
  };

  const submit = () => {
    if (tab === 'draw') {
      if (!hasDrawn.current) return alert('დახატეთ ხელმოწერა.');
      onSign(canvasRef.current!.toDataURL('image/png'), 'draw');
    } else {
      if (!uploadUrl) return alert('ატვირთეთ ხელმოწერის სურათი.');
      onSign(uploadUrl, 'upload');
    }
  };

  const tabs: { id: Tab; name: string; icon: React.ElementType }[] = [
    { id: 'draw', name: 'მოხაზვა', icon: PenLine },
    { id: 'upload', name: 'ატვირთვა', icon: Upload },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <h3 className="font-black text-xl text-slate-800">ელექტრონული ხელმოწერა</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex border-b border-slate-100 px-6">
          {tabs.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center justify-center gap-2 px-6 py-3 text-sm font-black border-b-2 ${
                  tab === t.id ? 'border-emerald-500 text-slate-800' : 'border-transparent text-slate-500'
                }`}
              >
                <Icon className="h-5 w-5" />
                {t.name}
              </button>
            );
          })}
        </div>

        <div className="p-6">
          <div className="rounded-xl border-2 border-dashed border-purple-200 bg-white p-4">
            {tab === 'draw' && (
              <div className="space-y-3">
                <canvas
                  ref={canvasRef}
                  width={900}
                  height={280}
                  onPointerDown={down}
                  onPointerMove={move}
                  onPointerUp={up}
                  onPointerLeave={up}
                  className="w-full h-64 bg-white rounded-lg touch-none cursor-crosshair"
                />
                <button type="button" onClick={clearCanvas} className="text-xs font-bold text-slate-500 hover:text-slate-700">
                  გასუფთავება
                </button>
              </div>
            )}

            {tab === 'upload' && (
              <div className="space-y-3">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={(e) => onUploadFile(e.target.files?.[0] || null)}
                  className="w-full text-xs file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:bg-indigo-600 file:text-white file:font-bold"
                />
                <div className="h-64 flex items-center justify-center rounded-lg bg-white">
                  {uploadUrl ? (
                    <img src={uploadUrl} alt="ხელმოწერა" className="max-h-56 max-w-full object-contain" />
                  ) : (
                    <span className="text-xs text-slate-400">ატვირთეთ ხელმოწერის სურათი</span>
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={submit}
            className="w-full max-w-md mx-auto flex items-center justify-center gap-2 mt-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl"
          >
            <PenLine className="h-5 w-5" />
            ხელმოწერა
          </button>
        </div>
      </div>
    </div>
  );
}
