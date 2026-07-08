/**
 * კონფიგურაცია და ქართული ლეიბლები.
 */
import { UserRole, ExpenseStatus, PaymentMethod, SupplierType } from '../types';

export const DEFAULT_BUDGET = 50000;

export const ROLE_DEFS: { id: UserRole; name: string; desc: string }[] = [
  { id: 'admin', name: 'ადმინი', desc: 'სრული წვდომა — ყველაფრის მართვა და მომხმარებლები.' },
  { id: 'manager', name: 'მენეჯერი', desc: 'ხარჯების, მიმწოდებლების და გადახდების დამატება/რედაქტირება.' },
  { id: 'viewer', name: 'მნახველი', desc: 'მხოლოდ ნახვა, რედაქტირების გარეშე.' },
];

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'ადმინი',
  manager: 'მენეჯერი',
  viewer: 'მნახველი',
};

export const STATUS_LABELS: Record<ExpenseStatus, string> = {
  draft: 'მონახაზი',
  approved: 'დამტკიცებული',
  paid: 'გადახდილი',
  rejected: 'უარყოფილი',
};

export const STATUS_STYLES: Record<ExpenseStatus, string> = {
  draft: 'bg-slate-100 text-slate-600',
  approved: 'bg-blue-50 text-blue-600',
  paid: 'bg-emerald-50 text-emerald-600',
  rejected: 'bg-red-50 text-red-600',
};

export const SUPPLIER_TYPE_LABELS: Record<SupplierType, string> = {
  company: 'იურიდიული პირი',
  entrepreneur: 'ინდ. მეწარმე',
  individual: 'ფიზიკური პირი',
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  bank: 'ბანკი',
  cash: 'ნაღდი',
  card: 'ბარათი',
  other: 'სხვა',
};

/** რედაქტირების უფლება — ადმინი და მენეჯერი. */
export const canEdit = (role: UserRole): boolean => role === 'admin' || role === 'manager';
