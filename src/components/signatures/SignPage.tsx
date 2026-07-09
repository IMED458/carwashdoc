import React, { useEffect, useState } from 'react';
import { Loader2, ShieldCheck, Download, CheckCircle2, AlertTriangle } from 'lucide-react';
import {
  getByToken,
  markOpened,
  recordSignature,
  SignatureRequest,
  SignRecipient,
  SignatureType,
  isExpired,
} from '../../services/signatures';
import { fetchBytes, composeStamp, signPdf, sha256Hex } from '../../services/pdfSign';
import { uploadBytesTo } from '../../services/storage';
import SignatureModal from './SignatureModal';
import PdfViewer, { PlacedField } from './PdfViewer';

export default function SignPage({ token }: { token: string }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{ request: SignatureRequest; recipient: SignRecipient } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [field, setField] = useState<PlacedField | null>(null);
  const [consent, setConsent] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await getByToken(token);
        if (!res) {
          setError('ბმული არასწორია ან აღარ არსებობს.');
        } else if (res.request.status === 'cancelled') {
          setError('ხელმოწერის მოთხოვნა გაუქმებულია.');
        } else if (isExpired(res.request)) {
          setError('ხელმოწერის ვადა ამოიწურა.');
        } else if (res.recipient.status === 'signed') {
          setData(res);
          setDone(true);
          setSignedUrl(res.request.signedUrl || null);
        } else {
          setData(res);
          const pre = res.request.fields.find((f) => f.recipientId === res.recipient.id) || res.request.fields[0];
          if (pre) setField({ page: pre.page, x: pre.x, y: pre.y, width: pre.width, height: pre.height });
          await markOpened(res.request.id, res.recipient.id, navigator.userAgent);
        }
      } catch (e) {
        setError('შეცდომა ჩატვირთვისას: ' + ((e as Error)?.message || ''));
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const handleSign = async (sigDataUrl: string, type: SignatureType) => {
    if (!data) return;
    setModalOpen(false);
    setBusy(true);
    try {
      const base = data.request.signedUrl || data.request.originalUrl;
      const original = await fetchBytes(base);
      const stamp = await composeStamp(sigDataUrl, {
        name: data.recipient.name,
        email: data.recipient.email,
        date: new Date().toLocaleString('ka-GE'),
      });
      const signedBytes = await signPdf(original, stamp, field || undefined);
      const path = `documents/sign/${data.request.id}/signed_${Date.now()}.pdf`;
      const url = await uploadBytesTo(path, signedBytes);
      const hash = await sha256Hex(signedBytes);
      await recordSignature(data.request.id, data.recipient.id, {
        signatureType: type,
        signatureUrl: url,
        signedUrl: url,
        signedHash: hash,
        ua: navigator.userAgent,
      });
      setSignedUrl(url);
      setDone(true);
    } catch (e) {
      alert('ხელმოწერა ვერ დასრულდა: ' + ((e as Error)?.message || 'შეცდომა'));
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-slate-50 font-sans">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
        <span className="text-xs text-slate-400">იტვირთება...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-slate-50 font-sans p-6 text-center">
        <AlertTriangle className="h-10 w-10 text-amber-500" />
        <p className="text-sm font-bold text-slate-700">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-slate-100 font-sans flex flex-col">
      <header className="bg-white border-b border-slate-200 px-4 md:px-8 py-3 flex items-center justify-between">
        <div>
          <h1 className="font-black text-sm text-slate-800">{data.request.title}</h1>
          <p className="text-[11px] text-slate-400">გამომგზავნი: {data.request.senderName}</p>
        </div>
        <span className="text-[11px] text-slate-500">ხელმომწერი: <strong>{data.recipient.name}</strong></span>
      </header>

      <div className="flex-1 p-3 md:p-6 max-w-4xl w-full mx-auto space-y-4">
        <div className="bg-white rounded-xl border border-slate-200 overflow-y-auto max-h-[65vh]">
          <PdfViewer
            source={signedUrl || data.request.originalUrl}
            placeable={!done}
            field={field}
            onField={setField}
          />
        </div>

        {done ? (
          <div className="bg-white rounded-2xl border border-emerald-200 p-6 text-center space-y-3">
            <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
            <p className="font-bold text-slate-800">დოკუმენტი წარმატებით მოიწერა ხელი.</p>
            {signedUrl && (
              <a href={signedUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-xl">
                <Download className="h-4 w-4" /> ხელმოწერილი PDF
              </a>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
            {data.request.message && <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl">{data.request.message}</p>}
            <label className="flex items-start gap-2 text-sm text-slate-700 cursor-pointer">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 rounded border-slate-300 text-indigo-600" />
              ვადასტურებ, რომ წავიკითხე დოკუმენტი და თანახმა ვარ ელექტრონულად მოვაწერო ხელი.
            </label>
            <button
              disabled={!consent || busy}
              onClick={() => setModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl"
            >
              {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShieldCheck className="h-5 w-5" />}
              {busy ? 'მუშავდება...' : 'ხელმოწერა'}
            </button>
          </div>
        )}
      </div>

      {modalOpen && <SignatureModal signerName={data.recipient.name} onClose={() => setModalOpen(false)} onSign={handleSign} />}
    </div>
  );
}
