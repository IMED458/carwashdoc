/**
 * გამარტივებული მონაცემთა მოდელი — ყველაფერი ქართულად.
 */

export type UserRole = 'admin' | 'manager' | 'viewer';

export interface User {
  id: string;
  name: string;
  username: string;
  passwordHash?: string;
  role: UserRole;
  isActive: boolean;
  createdAt?: string;
}

export type ExpenseStatus = 'draft' | 'approved' | 'paid' | 'rejected';

export interface Category {
  id: string;
  name: string;
  plannedBudget: number;
  createdAt?: string;
}

export interface Supplier {
  id: string;
  name: string;
  type: 'company' | 'individual';
  taxId: string;
  phone?: string;
  createdAt?: string;
}

export interface Expense {
  id: string;
  title: string;
  categoryId: string;
  supplierId: string;
  amount: number;
  date: string; // YYYY-MM-DD
  status: ExpenseStatus;
  note?: string;
  createdByName?: string;
  createdAt?: string;
}

export type PaymentMethod = 'bank' | 'cash' | 'card' | 'other';

export interface Payment {
  id: string;
  expenseId: string;
  amount: number;
  date: string; // YYYY-MM-DD
  method: PaymentMethod;
  note?: string;
  createdAt?: string;
}
