import React, { useEffect, useRef, useState } from 'react';
import { X, Type, PenLine, Upload } from 'lucide-react';
import { SignatureType } from '../../services/signatures';

interface Props {
  signerName: string;
  onClose: () => void;
  onSign: (dataUrl: string, type: SignatureType) => void;
}

type Tab = 'text' | 'draw' | 'upload';

export default function SignatureModal({ signerName, onClose, onSign }: Props) {
  const [tab, setTab] = useState<Tab>('draw');

  // TEXT
  const [typed, setTyped] = useState(signerName);
  // UPLOAD
  const [uploadUrl, setUploadUrl] = useState<string | null>(null);
  // DRAW
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const hasDrawn = useRef(false);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d')!;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1e293b';
  }, [tab]);

  const pos = (e: React.PointerEvent) => {
    const c = canvasRef.current!;
    const rect = c.getBoundingClientRect();
    return { x: ((e.clientX - rect.left) / rect.width) * c.width, y: ((e.clientY - rect.top) / rect.height) * c.height };
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

  // ტექსტის რენდერი PNG-ად (cursive)
  const textToPng = (): string => {
    const c = document.createElement('canvas');
    c.width = 460;
    c.height = 140;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#1e293b';
    ctx.font = 'italic 54px "Brush Script MT", "Segoe Script", cursive';
    ctx.textBaseline = 'middle';
    ctx.fillText(typed || signerName, 16, 74);
    return c.toDataURL('image/png');
  };

  const onUploadFile = (f: File | null) => {
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      // normalize → PNG via canvas
      const img = new Image();
      img.onload = () => {
        const c = document.createElement('canvas');
        c.width = img.width;
        c.height = img.height;
        c.getContext('2d')!.drawImage(img, 0, 0);
        setUploadUrl(c.toDataURL('image/png'));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(f);
  };

  const submit = () => {
    if (tab === 'text') {
      if (!typed.trim()) return alert('ჩაწერეთ სახელი.');
      onSign(textToPng(), 'text');
    } else if (tab === 'draw') {
      if (!hasDrawn.current) return alert('დახატეთ ხელმოწერა.');
      onSign(canvasRef.current!.toDataURL('image/png'), 'draw');
    } else {
      if (!uploadUrl) return alert('ატვირთეთ სურათი.');
      onSign(uploadUrl, 'upload');
    }
  };

  const tabs: { id: Tab; name: string; icon: React.ElementType }[] = [
    { id: 'text', name: 'ტექსტი', icon: Type },
    { id: 'draw', name: 'მოხაზვა', icon: PenLine },
    { id: 'upload', name: 'ატვირთვა', icon: Upload },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-800">ელექტრონული ხელმოწერა</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex border-b border-slate-100">
          {tabs.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-bold border-b-2 ${
                  tab === t.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500'
                }`}
              >
                <Icon className="h-4 w-4" />
                {t.name}
              </button>
            );
          })}
        </div>

        <div className="p-5">
          <div className="rounded-xl border-2 border-emerald-400 bg-emerald-50/20 p-3">
            {tab === 'text' && (
              <div className="space-y-3">
                <input
                  value={typed}
                  onChange={(e) => setTyped(e.target.value)}
                  placeholder="სახელი და გვარი"
                  className="w-full px-3 py-2 bg-white rounded-lg border border-slate-200 text-sm"
                />
                <div className="h-28 flex items-center justify-center border border-dashed border-purple-300 rounded-lg bg-white">
                  <span style={{ fontFamily: '"Brush Script MT","Segoe Script",cursive', fontStyle: 'italic', fontSize: 40, color: '#1e293b' }}>
                    {typed || signerName}
                  </span>
                </div>
              </div>
            )}
            {tab === 'draw' && (
              <div className="space-y-2">
                <canvas
                  ref={canvasRef}
                  width={460}
                  height={180}
                  onPointerDown={down}
                  onPointerMove={move}
                  onPointerUp={up}
                  onPointerLeave={up}
                  className="w-full h-44 bg-white border border-dashed border-purple-300 rounded-lg touch-none cursor-crosshair"
                />
                <button onClick={clearCanvas} className="text-xs font-bold text-slate-500 hover:text-slate-700">
                  გასუფთავება
                </button>
              </div>
            )}
            {tab === 'upload' && (
              <div className="space-y-2">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={(e) => onUploadFile(e.target.files?.[0] || null)}
                  className="w-full text-xs file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:bg-indigo-600 file:text-white file:font-bold"
                />
                <div className="h-28 flex items-center justify-center border border-dashed border-purple-300 rounded-lg bg-white">
                  {uploadUrl ? <img src={uploadUrl} alt="ხელმოწერა" className="max-h-24" /> : <span className="text-xs text-slate-400">preview</span>}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={submit}
            className="w-full mt-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"
          >
            ხელმოწერა
          </button>
        </div>
      </div>
    </div>
  );
}
