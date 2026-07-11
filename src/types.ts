export type UserRole = 'admin' | 'accountant' | 'manager' | 'viewer' | 'uploader';

export interface User {
  id: string;
  name: string;
  email?: string;
  username?: string;
  passwordHash?: string;
  role: UserRole;
  isActive: boolean;
  createdAt?: string;
}

export interface BudgetSettings {
  initialBudget: number;
  projectName: string;
  currency: string;
}

export interface CostEstimateItem {
  id: string;
  section: string;
  name: string;
  quantity: number;
  unitPrice: number;
  note?: string;
}

export interface CostEstimate {
  id: string;
  title: string;
  location?: string;
  items: CostEstimateItem[];
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  createdByName?: string;
}

export interface Tranche {
  id: string;
  trancheNumber: number;
  receivedDate: string;
  amount: number;
  documentName: string;
  comment: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  plannedBudget: number;
  isAllowedGrant?: boolean;
  comment?: string;
  createdAt?: string;
}

export type SupplierType = 'company' | 'entrepreneur' | 'individual';

export interface Supplier {
  id: string;
  name: string;
  type: SupplierType;
  taxId: string;
  phone?: string;
  email?: string;
  iban?: string;
  paysIncomeTax?: boolean;
  paysPension?: boolean;
  createdAt?: string;
}

export enum ExpenseStatus {
  Draft = 'Draft',
  Planned = 'Planned',
  ContractSigned = 'Contract Signed',
  WorkInProgress = 'Work in Progress',
  Delivered = 'Delivered',
  DocumentsMissing = 'Documents Missing',
  PaymentPending = 'Payment Pending',
  Paid = 'Paid',
  SentToAccountant = 'Sent to Accountant',
  AccountantReview = 'Accountant Review',
  NeedsCorrection = 'Needs Correction',
  ReadyForReporting = 'Ready for Reporting',
  UploadedToRS = 'Uploaded to RS/Grant Portal',
  Completed = 'Completed',
  Approved = 'Approved',
  Rejected = 'Rejected',
  Cancelled = 'Cancelled',
}

export interface Expense {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  supplierId: string;
  category?: string;
  supplier?: string;
  trancheId?: string;
  invoiceNumber?: string;
  invoiceDate?: string;
  amountNoVat: number;
  vat: number;
  amountWithVat: number;
  amount?: number;
  date?: string;
  note?: string;
  responsiblePerson: string;
  projectStage: string;
  internalComment?: string;
  auditComment?: string;
  status: ExpenseStatus;
  requiredDocumentTypes?: DocumentType[];
  requiredDocumentLabels?: string[];
  createdAt: string;
  createdBy: string;
  createdByName?: string;
  updatedAt: string;
  updatedBy: string;
}

export type PaymentMethod = 'bank' | 'cash' | 'card' | 'pos' | 'other';

export interface Payment {
  id: string;
  expenseId: string;
  paymentDate: string;
  date?: string;
  amount: number;
  paymentMethod: PaymentMethod;
  method?: PaymentMethod;
  payerAccount: string;
  recipientName: string;
  purpose: string;
  bankTxNumber?: string;
  fee: number;
  receiptFile?: string;
  note?: string;
  comment?: string;
  checkedBy?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export type DocumentType =
  | 'invoice'
  | 'waybill'
  | 'tax_doc'
  | 'contract'
  | 'acceptance_act'
  | 'receipt'
  | 'other';

export interface Document {
  id: string;
  expenseId: string;
  docType: DocumentType;
  docNumber: string;
  docDate: string;
  fileName: string;
  fileUrl?: string;
  fileSize: string;
  fileType?: string;
  uploadDate: string;
  uploadedBy: string;
  status: 'active' | 'cancelled';
  amount: number;
  comment?: string;
  checksum: string;
  version: number;
}

export interface PayrollOrIndividualService {
  id: string;
  name: string;
  personalId: string;
  workDescription: string;
  contractNumber: string;
  contractDate: string;
  startDate: string;
  endDate: string;
  grossAmount: number;
  netAmount: number;
  taxesAmount: number;
  pensionDeduction: number;
  paymentDate?: string;
  hasAcceptanceAct: boolean;
  hasPaymentDoc: boolean;
  accountantComment?: string;
  createdAt: string;
}

export interface TaxSettings {
  incomeTaxPercent: number;
  pensionEmployeePercent: number;
  pensionEmployerPercent: number;
}

export interface Comment {
  id: string;
  expenseId: string;
  userName: string;
  userRole: UserRole;
  text: string;
  createdAt: string;
}

export interface StatusHistory {
  id: string;
  expenseId: string;
  fromStatus: ExpenseStatus;
  toStatus: ExpenseStatus;
  changedBy: string;
  changeDate: string;
  comment?: string;
}

export interface AuditLog {
  id: string;
  userName: string;
  userRole: UserRole;
  action: string;
  details: string;
  timestamp: string;
  ipAddress: string;
  device: string;
}

export interface Notification {
  id: string;
  type: 'warning' | 'info' | 'success' | 'error';
  message: string;
  isRead: boolean;
  createdAt: string;
  expenseId?: string;
}

export interface ExportLog {
  id: string;
  reportName: string;
  exportedBy: string;
  timestamp: string;
  format: 'PDF' | 'Excel' | 'CSV' | 'ZIP';
}
