/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'admin' | 'accountant' | 'manager' | 'viewer' | 'uploader';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
}

export interface BudgetSettings {
  initialBudget: number; // Default 50000 GEL
  projectName: string;
  currency: string;
}

export interface Tranche {
  id: string;
  trancheNumber: number;
  receivedDate: string; // YYYY-MM-DD
  amount: number;
  documentName: string; // Simulated file
  comment: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string; // Georgian
  description: string;
  plannedBudget: number;
  isAllowedGrant: boolean; // whether allowed in grant scope
  comment: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  type: 'company' | 'individual'; // იურიდიული თუ ფიზიკური პირი
  taxId: string; // საიდენტიფიკაციო / პირადი ნომერი
  phone?: string;
  email?: string;
  createdAt: string;
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
  Approved = 'Approved',
  Rejected = 'Rejected',
  Cancelled = 'Cancelled'
}

export interface Expense {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  supplierId: string;
  trancheId?: string; // Associated grant tranche, if any
  invoiceNumber?: string;
  invoiceDate?: string; // Document date
  amountNoVat: number;
  vat: number; // 0 if no VAT
  amountWithVat: number; // Total amount in GEL
  responsiblePerson: string;
  projectStage: string; // Phase (e.g., Phase 1)
  internalComment?: string;
  status: ExpenseStatus;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

export interface Payment {
  id: string;
  expenseId: string;
  paymentDate: string;
  amount: number;
  paymentMethod: 'bank' | 'cash' | 'pos' | 'other';
  payerAccount: string;
  recipientName: string;
  purpose: string;
  bankTxNumber?: string;
  fee: number;
  receiptFile?: string; // Simulated file name
  comment?: string;
  checkedBy?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface Document {
  id: string;
  expenseId: string;
  docType: 'invoice' | 'waybill' | 'tax_doc' | 'contract' | 'acceptance_act' | 'receipt' | 'other';
  docNumber: string;
  docDate: string;
  fileName: string;
  fileSize: string;
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
  name: string; // სახელი, გვარი
  personalId: string; // პირადი ნომერი
  workDescription: string; // შესრულებული სამუშაო
  contractNumber: string;
  contractDate: string;
  startDate: string;
  endDate: string;
  grossAmount: number; // დარიცხული
  netAmount: number; // გადასარიცხი
  taxesAmount: number; // საშემოსავლო
  pensionDeduction: number; // საპენსიო
  paymentDate?: string;
  hasAcceptanceAct: boolean;
  hasPaymentDoc: boolean;
  accountantComment?: string;
  createdAt: string;
}

export interface TaxSettings {
  incomeTaxPercent: number; // Default 20%
  pensionEmployeePercent: number; // Default 2%
  pensionEmployerPercent: number; // Default 2%
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
