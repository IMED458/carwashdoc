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

export type SupplierType = 'company' | 'entrepreneur' | 'individual';

export interface Supplier {
  id: string;
  name: string;
  type: SupplierType;
  taxId: string;
  phone?: string;
  createdAt?: string;
}

export interface Expense {
  id: string;
  title: string;
  category: string; // თავისუფალი ტექსტი
  supplier: string; // მიმწოდებელი / მიმღები (ხელფასის შემთხვევაში — პირის სახელი)
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
