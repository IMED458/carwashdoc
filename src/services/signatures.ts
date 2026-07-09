/**
 * ელექტრონული ხელმოწერის სერვისი — Firestore-ზე დაფუძნებული (client-only).
 * კოლექციები: signatureRequests, signTokens (token→request), signAudit.
 */
import { addItem, setItem, updateItem, getItem } from './firestore';

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
export type SignatureType = 'text' | 'draw' | 'upload';

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
  recipients: SignRecipient[];
  fields: SignField[];
  createdAt: string;
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
  recipients: { name: string; email: string; role: SignRole; order: number }[];
  fields?: Omit<SignField, 'recipientId'>[];
}

/** ხელმოწერის მოთხოვნის შექმნა + token-ების გენერაცია. აბრუნებს request-ს. */
export async function createSignatureRequest(input: CreateRequestInput): Promise<SignatureRequest> {
  const recipients: SignRecipient[] = input.recipients.map((r, i) => ({
    id: `r${i}_${randomToken().slice(0, 8)}`,
    name: r.name.trim(),
    email: r.email.trim(),
    role: r.role,
    order: r.order,
    status: 'sent',
    token: randomToken(),
    sentAt: nowIso(),
  }));

  const fields: SignField[] = (input.fields || []).map((f) => ({
    ...f,
    recipientId: recipients[0]?.id || '',
  }));

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
    recipients,
    fields,
    createdAt: nowIso(),
  };

  const id = await addItem('signatureRequests', request);

  // token → request რუკა (საჯარო ძებნისთვის ავტორიზაციის გარეშე)
  await Promise.all(
    recipients.map((r) => setItem('signTokens', r.token, { requestId: id, recipientId: r.id })),
  );

  await addAudit({ requestId: id, action: 'created', meta: `${recipients.length} ხელმომწერი` });

  return { id, ...request };
}

/** token-ით მოთხოვნის და ხელმომწერის მოძებნა (საჯარო გვერდისთვის). */
export async function getByToken(
  token: string,
): Promise<{ request: SignatureRequest; recipient: SignRecipient } | null> {
  const map = await getItem<{ id: string; requestId: string; recipientId: string }>('signTokens', token);
  if (!map) return null;
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
