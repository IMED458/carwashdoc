import React, { useMemo, useState } from 'react';
import { PenTool, Plus, X, Upload, Trash2, Download, Send, Loader2, Ban, RefreshCw, FileSignature, Paperclip } from 'lucide-react';
import { useCollection } from '../../hooks/useFirestore';
import { uploadFileTo } from '../../services/storage';
import { fetchBytes, sha256Hex } from '../../services/pdfSign';
import { sendSignEmail } from '../../config/emailjs';
import PdfViewer, { PlacedField } from './PdfViewer';
import {
  createSignatureRequest,
  saveSignatureDraft,
  updateSignatureDraft,
  sendSignatureRequest,
  cancelRequest,
  deleteSignatureRequest,
  attachSignedToExpense,
  SignatureRequest,
  SignRole,
  SignRequestStatus,
  AuditEntry,
  randomToken,
} from '../../services/signatures';
import { DocumentType, Expense, Supplier } from '../../types';

const SIGN_DOCUMENT_TYPES: { value: DocumentType; label: string }[] = [
  { value: 'invoice', label: 'საგადასახადო ინვოისი / ფაქტურა' },
  { value: 'waybill', label: 'სასაქონლო ზედნადები (RS.GE)' },
  { value: 'tax_doc', label: 'საგადასახადო დოკუმენტი' },
  { value: 'contract', label: 'ხელშეკრულება' },
  { value: 'acceptance_act', label: 'მიღება-ჩაბარების აქტი' },
  { value: 'receipt', label: 'გადარიცხვის ქვითარი' },
  { value: 'other', label: 'სხვა ტიპის ფაილი' },
];

const REQ_STATUS: Record<SignRequestStatus, { t: string; c: string }> = {
  draft: { t: 'მონახაზი', c: 'bg-slate-100 text-slate-600' },
  sent: { t: 'გაგზავნილი', c: 'bg-blue-50 text-blue-600' },
  opened: { t: 'გახსნილი', c: 'bg-indigo-50 text-indigo-600' },
  partially_signed: { t: 'ნაწილობრივ', c: 'bg-amber-50 text-amber-700' },
  signed: { t: 'ხელმოწერილი', c: 'bg-emerald-50 text-emerald-700' },
  declined: { t: 'უარყოფილი', c: 'bg-red-50 text-red-600' },
  expired: { t: 'ვადაგასული', c: 'bg-red-50 text-red-600' },
  cancelled: { t: 'გაუქმებული', c: 'bg-slate-100 text-slate-500' },
};
const ROLE_LABEL: Record<SignRole, string> = { signer: 'ხელმომწერი', viewer: 'დამთვალიერებელი', approver: 'დამმოწმებელი' };

interface Row {
  name: string;
  email: string;
  role: SignRole;
}

export default function SignaturesPage({ currentUser }: { currentUser: { id: string; name: string } }) {
  const requests = useCollection<SignatureRequest>('signatureRequests');
  const audit = useCollection<AuditEntry & { id: string }>('signAudit');
  const suppliers = useCollection<Supplier>('suppliers');
  const expenses = useCollection<Expense>('expenses');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<SignatureRequest | null>(null);
  const [detail, setDetail] = useState<SignatureRequest | null>(null);

  const detailReq = detail ? requests.find((r) => r.id === detail.id) || detail : null;

  const sorted = useMemo(() => [...requests].sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1)), [requests]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-xl font-black text-slate-800">ხელმოწერები</h2>
          <p className="text-xs text-slate-500 mt-1">PDF დოკუმენტების ელექტრონული ხელმოწერა და გაგზავნა.</p>
        </div>
        <button onClick={() => { setEditing(null); setModal(true); }} className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-sm">
          <Plus className="h-4 w-4" /> ახალი ხელმოწერა
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-50">
        {sorted.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm flex flex-col items-center gap-2">
            <FileSignature className="h-8 w-8 text-slate-300" /> ხელმოწერის მოთხოვნები ჯერ არ არის.
          </div>
        ) : (
          sorted.map((r) => {
            const st = REQ_STATUS[r.status] || REQ_STATUS.sent;
            const signed = r.recipients.filter((x) => x.status === 'signed').length;
            return (
              <button key={r.id} onClick={() => setDetail(r)} className="w-full flex items-center justify-between p-4 gap-3 text-left hover:bg-slate-50/50">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <PenTool className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-sm text-slate-800 block truncate">{r.title}</span>
                    <span className="text-[11px] text-slate-400">{signed}/{r.recipients.length} ხელმოწერილი · {new Date(r.createdAt).toLocaleDateString('ka-GE')}</span>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${st.c}`}>{st.t}</span>
              </button>
            );
          })
        )}
      </div>

      {modal && (
        <RequestModal
          currentUser={currentUser}
          suppliers={suppliers}
          expenses={expenses}
          editing={editing}
          onClose={() => {
            setModal(false);
            setEditing(null);
          }}
        />
      )}
      {detailReq && (
        <RequestDetail
          request={detailReq}
          expenses={expenses}
          audit={audit.filter((a) => a.requestId === detailReq.id)}
          onEdit={(request) => {
            setDetail(null);
            setEditing(request);
            setModal(true);
          }}
          onDelete={() => setDetail(null)}
          onClose={() => setDetail(null)}
        />
      )}
    </div>
  );
}

/* ---------- NEW REQUEST ---------- */
function RequestModal({
  currentUser,
  suppliers,
  expenses,
  editing,
  onClose,
}: {
  currentUser: { id: string; name: string };
  suppliers: Supplier[];
  expenses: Expense[];
  editing?: SignatureRequest | null;
  onClose: () => void;
}) {
  const editingExpense = editing?.expenseId ? expenses.find((e) => e.id === editing.expenseId) : undefined;
  const [title, setTitle] = useState(editing?.title || '');
  const [linkedSupplierId, setLinkedSupplierId] = useState(editingExpense?.supplierId || '');
  const [linkedExpenseId, setLinkedExpenseId] = useState(editing?.expenseId || '');
  const [docType, setDocType] = useState<DocumentType>(editing?.docType || 'contract');
  const [docTypeLabel, setDocTypeLabel] = useState(editing?.docTypeLabel || '');
  const [file, setFile] = useState<File | null>(null);
  const [fileBytes, setFileBytes] = useState<Uint8Array | null>(null);
  const [field, setField] = useState<PlacedField | null>(
    editing?.fields?.[0]
      ? {
          page: editing.fields[0].page,
          x: editing.fields[0].x,
          y: editing.fields[0].y,
          width: editing.fields[0].width,
          height: editing.fields[0].height,
        }
      : null,
  );
  const [rows, setRows] = useState<Row[]>(
    editing?.recipients?.length
      ? editing.recipients.map((r) => ({ name: r.name, email: r.email, role: r.role }))
      : [{ name: '', email: '', role: 'signer' }],
  );
  const [message, setMessage] = useState(editing?.message || 'გთხოვთ მოაწეროთ ხელი დოკუმენტს.');
  const [days, setDays] = useState(() => {
    if (!editing?.expiresAt) return 7;
    return Math.max(1, Math.round((new Date(editing.expiresAt).getTime() - Date.now()) / 864e5));
  });
  const [busy, setBusy] = useState(false);

  const onPickFile = async (f: File | null) => {
    setFile(f);
    setField(null);
    setFileBytes(null);
    if (f && f.type === 'application/pdf') {
      setFileBytes(new Uint8Array(await f.arrayBuffer()));
    }
  };

  const setRow = (i: number, patch: Partial<Row>) => setRows((rs) => rs.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  const addRow = () => setRows((rs) => [...rs, { name: '', email: '', role: 'signer' }]);
  const delRow = (i: number) => setRows((rs) => rs.filter((_, j) => j !== i));
  const supplierExpenses = expenses.filter((e) => !linkedSupplierId || e.supplierId === linkedSupplierId);

  const addSupplierRecipient = (supplierId: string) => {
    const supplier = suppliers.find((s) => s.id === supplierId);
    if (!supplier) return;
    setRows((rs) => [...rs, { name: supplier.name, email: supplier.email || '', role: 'signer' }]);
  };

  const handleLinkedSupplier = (supplierId: string) => {
    setLinkedSupplierId(supplierId);
    const nextExpense = expenses.find((e) => e.supplierId === supplierId);
    setLinkedExpenseId(nextExpense?.id || '');
  };

  const validEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const persist = async (mode: 'draft' | 'send') => {
    if (!file && !editing?.originalUrl) return alert('ატვირთეთ PDF ფაილი.');
    if (file && file.type !== 'application/pdf') return alert('დაშვებულია მხოლოდ PDF.');
    const cleanRows = rows
      .map((r) => ({ ...r, name: r.name.trim(), email: r.email.trim() }))
      .filter((r) => r.name || r.email);
    const validRows = cleanRows.filter((r) => r.name && validEmail(r.email));
    if (mode === 'send' && validRows.length === 0) return alert('გაგზავნისთვის დაამატეთ მინიმუმ ერთი ხელმომწერი სწორი ელფოსტით.');
    if (mode === 'draft' && cleanRows.some((r) => r.email && !validEmail(r.email))) return alert('ელფოსტის ფორმატი არასწორია.');

    setBusy(true);
    try {
      const reqTitle = title.trim() || file?.name.replace(/\.pdf$/i, '') || editing?.title || 'ხელმოსაწერი დოკუმენტი';
      const tmpId = editing?.id || randomToken().slice(0, 10);
      let path = editing?.originalPath || `documents/sign/${tmpId}/original.pdf`;
      let url = editing?.originalUrl || '';
      let hash = editing?.originalHash || '';
      if (file) {
        path = `documents/sign/${tmpId}/original.pdf`;
        url = await uploadFileTo(path, file);
        hash = await sha256Hex(await fetchBytes(url));
      }
      const expiresAt = new Date(Date.now() + days * 864e5).toISOString();

      const input = {
        title: reqTitle,
        originalUrl: url,
        originalPath: path,
        originalHash: hash,
        senderId: currentUser.id,
        senderName: currentUser.name,
        message,
        expiresAt,
        expenseId: linkedExpenseId,
        docType,
        docTypeLabel: docType === 'other'
          ? docTypeLabel.trim()
          : SIGN_DOCUMENT_TYPES.find((d) => d.value === docType)?.label || '',
        recipients: (mode === 'send' ? validRows : cleanRows).map((r, i) => ({ name: r.name, email: r.email, role: r.role, order: i + 1 })),
        fields: field ? [{ page: field.page, x: field.x, y: field.y, width: field.width, height: field.height }] : [],
      };

      let request: SignatureRequest | null;
      if (editing) {
        request = await updateSignatureDraft(editing.id, input);
      } else if (mode === 'draft') {
        request = await saveSignatureDraft(input);
      } else {
        request = await createSignatureRequest(input);
      }

      if (mode === 'draft') {
        alert('დრაფტი შენახულია.');
        onClose();
        return;
      }

      if (editing) request = await sendSignatureRequest(editing.id);
      if (!request) throw new Error('მოთხოვნა ვერ მოიძებნა.');

      // მეილების გაგზავნა
      const base = `${window.location.origin}${import.meta.env.BASE_URL}#/sign/`;
      const expLabel = new Date(expiresAt).toLocaleDateString('ka-GE');
      for (const rec of request.recipients.filter((r) => r.email && r.role !== 'viewer')) {
        try {
          await sendSignEmail({
            to_email: rec.email,
            recipient_name: rec.name,
            sender_name: currentUser.name,
            document_name: reqTitle,
            expiration_date: expLabel,
            message,
            sign_url: `${base}${rec.token}`,
          });
        } catch (e) {
          console.error('email failed', rec.email, e);
        }
      }
      alert('დოკუმენტი გაიგზავნა ხელმოსაწერად!');
      onClose();
    } catch (e) {
      alert('ვერ გაიგზავნა: ' + ((e as Error)?.message || 'შეცდომა'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 sticky top-0 bg-white">
          <h3 className="font-bold text-slate-800">
            {editing ? 'ხელმოწერის მოთხოვნის რედაქტირება' : 'ახალი ხელმოწერის მოთხოვნა'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">PDF დოკუმენტი *</label>
            <input type="file" accept="application/pdf" onChange={(e) => onPickFile(e.target.files?.[0] || null)}
              className="w-full text-xs file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:bg-indigo-600 file:text-white file:font-bold" />
            {editing?.originalUrl && !file && <p className="text-[11px] text-slate-400 mt-1">მიმდინარე PDF შენარჩუნდება, თუ ახალს არ ატვირთავთ.</p>}
          </div>

          {(fileBytes || editing?.originalUrl) && (
            <div className="border border-slate-200 rounded-xl overflow-y-auto max-h-72">
              <PdfViewer source={fileBytes || editing!.originalUrl} placeable field={field} onField={setField} maxWidth={460} />
            </div>
          )}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">დასახელება</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="(ავტომატურად ფაილის სახელი)" className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-sm" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">მიმწოდებელი</label>
              <select
                value={linkedSupplierId}
                onChange={(e) => handleLinkedSupplier(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-sm"
              >
                <option value="">აირჩიეთ მიმწოდებელი</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">ხარჯზე მიბმა</label>
              <select
                value={linkedExpenseId}
                onChange={(e) => setLinkedExpenseId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-sm"
              >
                <option value="">არ გადავიტანო რეესტრში</option>
                {supplierExpenses.map((e) => (
                  <option key={e.id} value={e.id}>{e.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">დოკუმენტის ტიპი</label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value as DocumentType)}
                className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-sm"
              >
                {SIGN_DOCUMENT_TYPES.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>
            {docType === 'other' && (
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">სხვა ტიპის დასახელება</label>
                <input
                  value={docTypeLabel}
                  onChange={(e) => setDocTypeLabel(e.target.value)}
                  placeholder="ჩაწერეთ დოკუმენტის ტიპი"
                  className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-sm"
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <label className="block text-xs font-bold text-slate-500">ხელმომწერები</label>
              <select
                defaultValue=""
                onChange={(e) => {
                  addSupplierRecipient(e.target.value);
                  e.currentTarget.value = '';
                }}
                className="px-2 py-1.5 bg-white rounded-lg border border-slate-200 text-xs text-slate-600"
              >
                <option value="">მომწოდებლიდან დამატება</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}{s.email ? ` · ${s.email}` : ''}</option>
                ))}
              </select>
            </div>
            {rows.map((r, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-center">
                <input value={r.name} onChange={(e) => setRow(i, { name: e.target.value })} placeholder="სახელი გვარი" className="col-span-4 px-2 py-1.5 bg-slate-50 rounded-lg border border-slate-200 text-xs" />
                <input value={r.email} onChange={(e) => setRow(i, { email: e.target.value })} placeholder="ელფოსტა" className="col-span-4 px-2 py-1.5 bg-slate-50 rounded-lg border border-slate-200 text-xs" />
                <select value={r.role} onChange={(e) => setRow(i, { role: e.target.value as SignRole })} className="col-span-3 px-1 py-1.5 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                  <option value="signer">ხელმომწერი</option>
                  <option value="viewer">დამთვალიერებელი</option>
                  <option value="approver">დამმოწმებელი</option>
                </select>
                <button onClick={() => delRow(i)} className="col-span-1 text-slate-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
            <button onClick={addRow} className="text-xs font-bold text-indigo-600 flex items-center gap-1"><Plus className="h-3.5 w-3.5" /> ხელმომწერის დამატება</button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">ვადა</label>
              <select value={days} onChange={(e) => setDays(Number(e.target.value))} className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-sm">
                <option value={3}>3 დღე</option>
                <option value={7}>7 დღე</option>
                <option value={14}>14 დღე</option>
                <option value={30}>30 დღე</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">შეტყობინება</label>
            <textarea rows={2} value={message} onChange={(e) => setMessage(e.target.value)} className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-sm resize-none" />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl">გაუქმება</button>
            <button onClick={() => persist('draft')} disabled={busy} className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-900 disabled:opacity-60 text-white text-sm font-bold rounded-xl">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSignature className="h-4 w-4" />}
              დრაფტად შენახვა
            </button>
            <button onClick={() => persist('send')} disabled={busy} className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-bold rounded-xl">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {busy ? 'იგზავნება...' : editing?.status === 'signed' ? 'ხელახლა გაგზავნა' : 'გაგზავნა'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- DETAIL ---------- */
function RequestDetail({
  request,
  expenses,
  audit,
  onEdit,
  onDelete,
  onClose,
}: {
  request: SignatureRequest;
  expenses: Expense[];
  audit: (AuditEntry & { id: string })[];
  onEdit: (request: SignatureRequest) => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const [attachOpen, setAttachOpen] = useState(false);
  const [attachSearch, setAttachSearch] = useState('');
  const [attachBusy, setAttachBusy] = useState(false);
  const linkedExpense = request.expenseId ? expenses.find((e) => e.id === request.expenseId) : undefined;

  const doAttach = async (expenseId: string) => {
    setAttachBusy(true);
    try {
      await attachSignedToExpense(request.id, expenseId, request.docType, request.docTypeLabel);
      setAttachOpen(false);
      setAttachSearch('');
      alert('ხელმოწერილი დოკუმენტი მიება ხარჯს (ხელმომწერთან ხელახლა არ გაგზავნილა).');
    } catch (e) {
      alert('ვერ მიება: ' + ((e as Error)?.message || 'შეცდომა'));
    } finally {
      setAttachBusy(false);
    }
  };

  const resend = async (email: string, token: string) => {
    const base = `${window.location.origin}${import.meta.env.BASE_URL}#/sign/`;
    try {
      const rec = request.recipients.find((r) => r.token === token)!;
      await sendSignEmail({
        to_email: email,
        recipient_name: rec.name,
        sender_name: request.senderName,
        document_name: request.title,
        expiration_date: new Date(request.expiresAt).toLocaleDateString('ka-GE'),
        message: request.message,
        sign_url: `${base}${token}`,
      });
      alert('ხელახლა გაიგზავნა.');
    } catch (e) {
      alert('ვერ გაიგზავნა: ' + ((e as Error)?.message || ''));
    }
  };

  const handleDelete = async () => {
    if (!confirm(`ნამდვილად გსურთ „${request.title}”-ის სრულად წაშლა? წაიშლება ხელმოწერის მოთხოვნა, ხელმოწერილი PDF და ხარჯზე მიბმული დოკუმენტიც.`)) return;
    setDeleting(true);
    try {
      await deleteSignatureRequest(request.id);
      alert('ხელმოწერის მოთხოვნა სრულად წაიშალა.');
      onDelete();
    } catch (e) {
      alert('ვერ წაიშალა: ' + ((e as Error)?.message || 'შეცდომა'));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 sticky top-0 bg-white">
          <h3 className="font-bold text-slate-800 truncate">{request.title}</h3>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 disabled:opacity-60 text-red-600 text-xs font-bold rounded-lg"
            >
              {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
              წაშლა
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
          </div>
        </div>
        <div className="p-5 space-y-5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${REQ_STATUS[request.status]?.c}`}>{REQ_STATUS[request.status]?.t}</span>
            {request.signedUrl && (
              <a href={request.signedUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg">
                <Download className="h-3.5 w-3.5" /> ხელმოწერილი PDF
              </a>
            )}
            <a href={request.originalUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg">
              ორიგინალი
            </a>
            {request.status !== 'cancelled' && (
              <button onClick={() => onEdit(request)} className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-lg">
                <FileSignature className="h-3.5 w-3.5" />
                {request.status === 'signed' ? 'რედაქტირება / ხელახლა გაგზავნა' : 'რედაქტირება'}
              </button>
            )}
            {request.status !== 'cancelled' && request.status !== 'signed' && (
              <button onClick={() => confirm('გაუქმდეს მოთხოვნა?') && cancelRequest(request.id)} className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 text-xs font-bold rounded-lg">
                <Ban className="h-3.5 w-3.5" /> გაუქმება
              </button>
            )}
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-xs font-bold rounded-lg"
            >
              {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
              წაშლა
            </button>

            {request.signedUrl && (
              linkedExpense ? (
                <>
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg">
                    <Paperclip className="h-3.5 w-3.5" /> მიბმულია: {linkedExpense.title}
                  </span>
                  <button
                    onClick={() => setAttachOpen((o) => !o)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold rounded-lg"
                  >
                    <RefreshCw className="h-3.5 w-3.5" /> სხვა ხარჯზე გადატანა
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setAttachOpen((o) => !o)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold rounded-lg"
                >
                  <Paperclip className="h-3.5 w-3.5" /> ხარჯზე მიბმა
                </button>
              )
            )}
          </div>

          {/* Attach / move signed doc to an expense (no re-send) */}
          {request.signedUrl && attachOpen && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
              <span className="text-xs font-bold text-slate-600 block">
                {linkedExpense ? 'აირჩიეთ ახალი ხარჯი — დოკუმენტი ძველიდან მოიხსნება' : 'აირჩიეთ ხარჯი, რომელსაც მიება ხელმოწერილი დოკუმენტი'}
              </span>
              <input
                value={attachSearch}
                onChange={(e) => setAttachSearch(e.target.value)}
                placeholder="ძებნა ხარჯის დასახელებით..."
                className="w-full px-3 py-2 bg-white rounded-lg border border-slate-200 text-xs"
              />
              <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 border border-slate-100 rounded-lg bg-white">
                {expenses
                  .filter((e) => e.title.toLowerCase().includes(attachSearch.toLowerCase()))
                  .slice(0, 50)
                  .map((e) => (
                    <button
                      key={e.id}
                      disabled={attachBusy}
                      onClick={() => doAttach(e.id)}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-indigo-50 disabled:opacity-60 flex items-center justify-between gap-2"
                    >
                      <span className="truncate font-semibold text-slate-700">{e.title}</span>
                      <span className="text-[10px] text-slate-400 shrink-0">{(e.amountWithVat ?? e.amount ?? 0).toLocaleString()} ₾</span>
                    </button>
                  ))}
                {expenses.filter((e) => e.title.toLowerCase().includes(attachSearch.toLowerCase())).length === 0 && (
                  <div className="px-3 py-3 text-[11px] text-slate-400 text-center">ხარჯი ვერ მოიძებნა.</div>
                )}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-500">ხელმომწერები</span>
            {request.recipients.map((r) => (
              <div key={r.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs gap-2">
                <div className="min-w-0">
                  <span className="font-bold text-slate-800 block truncate">{r.name} <span className="text-slate-400 font-normal">({ROLE_LABEL[r.role]})</span></span>
                  <span className="text-[10px] text-slate-400">{r.email}</span>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {r.openedAt && `გახსნა: ${new Date(r.openedAt).toLocaleString('ka-GE')} · `}
                    {r.signedAt && `ხელი: ${new Date(r.signedAt).toLocaleString('ka-GE')}`}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${r.status === 'signed' ? 'bg-emerald-50 text-emerald-600' : r.status === 'opened' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
                    {r.status === 'signed' ? 'ხელმოწერილი' : r.status === 'opened' ? 'გახსნილი' : 'გაგზავნილი'}
                  </span>
                  {r.status !== 'signed' && request.status !== 'cancelled' && (
                    <button onClick={() => resend(r.email, r.token)} title="ხელახლა გაგზავნა" className="text-slate-400 hover:text-indigo-600"><RefreshCw className="h-3.5 w-3.5" /></button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-500">ისტორია (Audit)</span>
            <div className="space-y-1">
              {audit.length === 0 ? (
                <p className="text-[11px] text-slate-400">ჩანაწერები არ არის.</p>
              ) : (
                audit.slice().sort((a, b) => (a.at > b.at ? 1 : -1)).map((a) => (
                  <div key={a.id} className="text-[11px] text-slate-500 border-l-2 border-slate-200 pl-2">
                    <strong className="text-slate-700">{a.action}</strong> {a.meta && `· ${a.meta}`} · {new Date(a.at).toLocaleString('ka-GE')}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
