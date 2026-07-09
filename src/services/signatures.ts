/**
 * ელექტრონული ხელმოწერის სერვისი — Firestore-ზე დაფუძნებული (client-only).
 * კოლექციები: signatureRequests, signTokens (token→request), signAudit.
 */
import { addItem, setItem, updateItem, getItem, deleteItem } from './firestore';
import { deleteField } from 'firebase/firestore';
import { DocumentType } from '../types';

export type SignRole = 'signer' | 'viewer' | 'approver';
export type SignRecipientStatus = 'pending' | 'sent' | 'opened' | 'signed' | 'declined';
export type SignRequestStatus =
  | 'draft'
  | 'sent'
  | 'opened'
  | 'partially_signed'
  | 'signed'
  | 'declined'
  | 'expired'
  | 'cancelled';
export type SignatureType = 'draw' | 'upload';

export interface SignField {
  recipientId: string;
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SignRecipient {
  id: string;
  name: string;
  email: string;
  role: SignRole;
  order: number;
  status: SignRecipientStatus;
  token: string;
  sentAt?: string;
  openedAt?: string;
  signedAt?: string;
  declinedAt?: string;
  signatureType?: SignatureType;
  signatureUrl?: string;
  ip?: string;
  ua?: string;
}

export interface SignatureRequest {
  id: string;
  title: string;
  originalUrl: string;
  originalPath: string;
  signedUrl?: string;
  originalHash?: string;
  signedHash?: string;
  status: SignRequestStatus;
  senderId: string;
  senderName: string;
  message: string;
  expiresAt: string;
  expenseId?: string;
  docType?: DocumentType;
  docTypeLabel?: string;
  recipients: SignRecipient[];
  fields: SignField[];
  createdAt: string;
  updatedAt?: string;
}

export interface AuditEntry {
  requestId: string;
  recipientId?: string;
  action: string;
  meta?: string;
  ip?: string;
  ua?: string;
  at: string;
}

const nowIso = () => new Date().toISOString();

export function randomToken(): string {
  const arr = new Uint8Array(24);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, '0')).join('');
}

export function isExpired(r: SignatureRequest): boolean {
  return !!r.expiresAt && new Date(r.expiresAt).getTime() < Date.now();
}

export async function addAudit(e: Omit<AuditEntry, 'at'>): Promise<void> {
  await addItem('signAudit', { ...e, at: nowIso() });
}

export interface CreateRequestInput {
  title: string;
  originalUrl: string;
  originalPath: string;
  originalHash?: string;
  senderId: string;
  senderName: string;
  message: string;
  expiresAt: string;
  expenseId?: string;
  docType?: DocumentType;
  docTypeLabel?: string;
  recipients: { name: string; email: string; role: SignRole; order: number }[];
  fields?: Omit<SignField, 'recipientId'>[];
}

function buildRecipients(input: CreateRequestInput, status: SignRecipientStatus): SignRecipient[] {
  return input.recipients.map((r, i) => ({
    id: `r${i}_${randomToken().slice(0, 8)}`,
    name: r.name.trim(),
    email: r.email.trim(),
    role: r.role,
    order: r.order,
    status,
    token: randomToken(),
    ...(status === 'sent' ? { sentAt: nowIso() } : {}),
  }));
}

function buildFields(input: CreateRequestInput, recipients: SignRecipient[]): SignField[] {
  return (input.fields || []).map((f) => ({
    ...f,
    recipientId: recipients[0]?.id || '',
  }));
}

async function writeTokenMap(requestId: string, recipients: SignRecipient[]): Promise<void> {
  await Promise.all(
    recipients.map((r) => setItem('signTokens', r.token, { requestId, recipientId: r.id, used: false })),
  );
}

async function invalidateRecipientTokens(recipients: SignRecipient[]): Promise<void> {
  await Promise.all(recipients.map((r) => updateItem('signTokens', r.token, { used: true }).catch(() => undefined)));
}

/** ხელმოწერის მოთხოვნის დრაფტად შენახვა. */
export async function saveSignatureDraft(input: CreateRequestInput): Promise<SignatureRequest> {
  const recipients = buildRecipients(input, 'pending');
  const fields = buildFields(input, recipients);

  const request: Omit<SignatureRequest, 'id'> = {
    title: input.title,
    originalUrl: input.originalUrl,
    originalPath: input.originalPath,
    originalHash: input.originalHash || '',
    status: 'draft',
    senderId: input.senderId,
    senderName: input.senderName,
    message: input.message,
    expiresAt: input.expiresAt,
    expenseId: input.expenseId || '',
    docType: input.docType || 'other',
    docTypeLabel: input.docTypeLabel || '',
    recipients,
    fields,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };

  const id = await addItem('signatureRequests', request);
  await addAudit({ requestId: id, action: 'draft_saved', meta: `${recipients.length} ხელმომწერი` });
  return { id, ...request };
}

/** დრაფტის მონაცემების განახლება. ხელმომწერების token-ები თავიდან გენერირდება. */
export async function updateSignatureDraft(requestId: string, input: CreateRequestInput): Promise<SignatureRequest> {
  const existing = await getItem<SignatureRequest>('signatureRequests', requestId);
  if (existing) await invalidateRecipientTokens(existing.recipients);
  const recipients = buildRecipients(input, 'pending');
  const fields = buildFields(input, recipients);
  const patch = {
    title: input.title,
    originalUrl: input.originalUrl,
    originalPath: input.originalPath,
    originalHash: input.originalHash || '',
    message: input.message,
    expiresAt: input.expiresAt,
    expenseId: input.expenseId || '',
    docType: input.docType || 'other',
    docTypeLabel: input.docTypeLabel || '',
    recipients,
    fields,
    status: 'draft' as SignRequestStatus,
    signedUrl: deleteField(),
    signedHash: deleteField(),
    updatedAt: nowIso(),
  };
  await updateItem('signatureRequests', requestId, patch);
  await addAudit({
    requestId,
    action: existing?.status === 'signed' ? 'reopened_for_signature' : 'draft_updated',
    meta: `${recipients.length} ხელმომწერი`,
  });
  return {
    id: requestId,
    senderId: existing?.senderId || input.senderId,
    senderName: existing?.senderName || input.senderName,
    createdAt: existing?.createdAt || nowIso(),
    title: patch.title,
    originalUrl: patch.originalUrl,
    originalPath: patch.originalPath,
    originalHash: patch.originalHash,
    message: patch.message,
    expiresAt: patch.expiresAt,
    expenseId: patch.expenseId,
    docType: patch.docType,
    docTypeLabel: patch.docTypeLabel,
    recipients,
    fields,
    status: 'draft',
    updatedAt: patch.updatedAt,
  };
}

/** დრაფტის გაგზავნილ სტატუსში გადაყვანა და token-ების გამოქვეყნება. */
export async function sendSignatureRequest(requestId: string): Promise<SignatureRequest | null> {
  const req = await getItem<SignatureRequest>('signatureRequests', requestId);
  if (!req) return null;
  const sentAt = nowIso();
  const recipients = req.recipients.map((r) => ({
    ...r,
    status: r.status === 'signed' ? r.status : ('sent' as SignRecipientStatus),
    sentAt: r.sentAt || sentAt,
  }));
  await updateItem('signatureRequests', requestId, { recipients, status: 'sent', updatedAt: sentAt });
  await writeTokenMap(requestId, recipients);
  await addAudit({ requestId, action: 'sent', meta: `${recipients.length} ხელმომწერი` });
  return { ...req, recipients, status: 'sent', updatedAt: sentAt };
}

/** ხელმოწერის მოთხოვნის შექმნა + token-ების გენერაცია. აბრუნებს request-ს. */
export async function createSignatureRequest(input: CreateRequestInput): Promise<SignatureRequest> {
  const recipients = buildRecipients(input, 'sent');
  const fields = buildFields(input, recipients);

  const request: Omit<SignatureRequest, 'id'> = {
    title: input.title,
    originalUrl: input.originalUrl,
    originalPath: input.originalPath,
    originalHash: input.originalHash || '',
    status: 'sent',
    senderId: input.senderId,
    senderName: input.senderName,
    message: input.message,
    expiresAt: input.expiresAt,
    expenseId: input.expenseId || '',
    docType: input.docType || 'other',
    docTypeLabel: input.docTypeLabel || '',
    recipients,
    fields,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };

  const id = await addItem('signatureRequests', request);

  // token → request რუკა (საჯარო ძებნისთვის ავტორიზაციის გარეშე)
  await writeTokenMap(id, recipients);

  await addAudit({ requestId: id, action: 'created', meta: `${recipients.length} ხელმომწერი` });

  return { id, ...request };
}

/** token-ით მოთხოვნის და ხელმომწერის მოძებნა (საჯარო გვერდისთვის). */
export async function getByToken(
  token: string,
): Promise<{ request: SignatureRequest; recipient: SignRecipient } | null> {
  const map = await getItem<{ id: string; requestId: string; recipientId: string }>('signTokens', token);
  if (!map || (map as { used?: boolean }).used) return null;
  const request = await getItem<SignatureRequest>('signatureRequests', map.requestId);
  if (!request) return null;
  const recipient = request.recipients.find((r) => r.id === map.recipientId);
  if (!recipient) return null;
  return { request, recipient };
}

function recomputeStatus(recipients: SignRecipient[]): SignRequestStatus {
  const signers = recipients.filter((r) => r.role !== 'viewer');
  const signed = signers.filter((r) => r.status === 'signed').length;
  if (recipients.some((r) => r.status === 'declined')) return 'declined';
  if (signers.length > 0 && signed === signers.length) return 'signed';
  if (signed > 0) return 'partially_signed';
  if (recipients.some((r) => r.status === 'opened')) return 'opened';
  return 'sent';
}

/** ბმულის გახსნის აღრიცხვა. */
export async function markOpened(requestId: string, recipientId: string, ua: string): Promise<void> {
  const req = await getItem<SignatureRequest>('signatureRequests', requestId);
  if (!req) return;
  const recipients = req.recipients.map((r) =>
    r.id === recipientId && r.status === 'sent'
      ? { ...r, status: 'opened' as SignRecipientStatus, openedAt: nowIso(), ua }
      : r,
  );
  await updateItem('signatureRequests', requestId, { recipients, status: recomputeStatus(recipients) });
  await addAudit({ requestId, recipientId, action: 'opened', ua });
}

/** ხელმოწერის დაფიქსირება — signed PDF-ისა და ჰეშების ჩათვლით. */
export async function recordSignature(
  requestId: string,
  recipientId: string,
  data: { signatureType: SignatureType; signatureUrl: string; signedUrl: string; signedHash: string; ua: string },
): Promise<void> {
  const req = await getItem<SignatureRequest>('signatureRequests', requestId);
  if (!req) return;
  const recipients = req.recipients.map((r) =>
    r.id === recipientId
      ? {
          ...r,
          status: 'signed' as SignRecipientStatus,
          signedAt: nowIso(),
          signatureType: data.signatureType,
          signatureUrl: data.signatureUrl,
        }
      : r,
  );
  const status = recomputeStatus(recipients);
  await updateItem('signatureRequests', requestId, {
    recipients,
    status,
    signedUrl: data.signedUrl,
    signedHash: data.signedHash,
  });
  if (status === 'signed' && req.expenseId) {
    await addItem('documents', {
      expenseId: req.expenseId,
      docType: req.docType || 'other',
      docNumber: `SIGN-${requestId.slice(0, 8)}`,
      docDate: nowIso().slice(0, 10),
      fileName: `${req.title || 'signed-document'}.pdf`,
      fileSize: '',
      fileType: 'application/pdf',
      uploadDate: nowIso(),
      uploadedBy: 'ელექტრონული ხელმოწერა',
      status: 'active',
      amount: 0,
      comment: req.docTypeLabel ? `ხელმოწერილი დოკუმენტი: ${req.docTypeLabel}` : 'ხელმოწერილი დოკუმენტი',
      checksum: data.signedHash,
      version: 1,
      signatureRequestId: requestId,
      signedUrl: data.signedUrl,
    });
  }
  // გამოყენებული token აღარ იმუშავებს
  const rec = req.recipients.find((r) => r.id === recipientId);
  if (rec) await updateItem('signTokens', rec.token, { used: true });
  await addAudit({ requestId, recipientId, action: 'signed', meta: data.signatureType, ua: data.ua });
}

export async function declineByRecipient(requestId: string, recipientId: string): Promise<void> {
  const req = await getItem<SignatureRequest>('signatureRequests', requestId);
  if (!req) return;
  const recipients = req.recipients.map((r) =>
    r.id === recipientId ? { ...r, status: 'declined' as SignRecipientStatus, declinedAt: nowIso() } : r,
  );
  await updateItem('signatureRequests', requestId, { recipients, status: 'declined' });
  await addAudit({ requestId, recipientId, action: 'declined' });
}

export async function cancelRequest(requestId: string): Promise<void> {
  const req = await getItem<SignatureRequest>('signatureRequests', requestId);
  if (req) {
    await Promise.all(req.recipients.map((r) => updateItem('signTokens', r.token, { used: true })));
  }
  await updateItem('signatureRequests', requestId, { status: 'cancelled' });
  await addAudit({ requestId, action: 'cancelled' });
}

export async function deleteSignatureRequest(requestId: string): Promise<void> {
  const req = await getItem<SignatureRequest>('signatureRequests', requestId);
  if (req) await invalidateRecipientTokens(req.recipients);
  await deleteItem('signatureRequests', requestId);
  await addAudit({ requestId, action: 'deleted' });
}
