/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Shield,
  Percent,
  FolderPlus,
  UserPlus,
  UserCheck,
  UserX,
  Trash2,
  KeyRound,
  Lock,
} from 'lucide-react';
import { UserRole, TaxSettings, Category, User } from '../types';
import { ROLE_DEFS } from '../data/defaults';
import {
  createUser,
  setUserActive,
  removeUser,
  changePassword,
} from '../services/auth';

interface SettingsPanelProps {
  currentUserRole: UserRole;
  currentUserName: string;
  currentUserId: string;
  users: User[];
  taxSettings: TaxSettings;
  categories: Category[];
  onUpdateTaxSettings: (settings: TaxSettings) => void;
  onAddCategory: (category: Omit<Category, 'id' | 'createdAt' | 'comment' | 'description'>) => void;
}

export default function SettingsPanel({
  currentUserRole,
  currentUserId,
  users,
  taxSettings,
  onUpdateTaxSettings,
  onAddCategory,
}: SettingsPanelProps) {
  const isAdmin = currentUserRole === 'admin';

  // საგადასახადო ფორმა
  const [incomeTax, setIncomeTax] = useState(taxSettings.incomeTaxPercent);
  const [pensionEmployee, setPensionEmployee] = useState(taxSettings.pensionEmployeePercent);
  const [pensionEmployer, setPensionEmployer] = useState(taxSettings.pensionEmployerPercent);

  // კატეგორიის ფორმა
  const [catName, setCatName] = useState('');
  const [catBudget, setCatBudget] = useState<number>(0);
  const [catIsGrant, setCatIsGrant] = useState(true);

  // ახალი მომხმარებლის ფორმა
  const [uName, setUName] = useState('');
  const [uUsername, setUUsername] = useState('');
  const [uPassword, setUPassword] = useState('');
  const [uRole, setURole] = useState<UserRole>('manager');
  const [uBusy, setUBusy] = useState(false);

  const handleSaveTax = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateTaxSettings({
      incomeTaxPercent: Number(incomeTax),
      pensionEmployeePercent: Number(pensionEmployee),
      pensionEmployerPercent: Number(pensionEmployer),
    });
    alert('საგადასახადო განაკვეთები წარმატებით განახლდა!');
  };

  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName || !catBudget) {
      alert('გთხოვთ შეავსოთ კატეგორიის სახელი და ბიუჯეტი!');
      return;
    }
    onAddCategory({ name: catName, plannedBudget: Number(catBudget), isAllowedGrant: catIsGrant });
    setCatName('');
    setCatBudget(0);
    setCatIsGrant(true);
    alert('ახალი ბიუჯეტის კატეგორია წარმატებით დაემატა!');
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uName.trim() || !uUsername.trim() || !uPassword.trim()) {
      alert('შეავსეთ სახელი, მომხმარებელი და პაროლი!');
      return;
    }
    setUBusy(true);
    try {
      await createUser({
        name: uName,
        username: uUsername,
        password: uPassword,
        role: uRole,
      });
      setUName('');
      setUUsername('');
      setUPassword('');
      setURole('manager');
      alert('ახალი მომხმარებელი წარმატებით შეიქმნა!');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'შეცდომა მომხმარებლის შექმნისას');
    } finally {
      setUBusy(false);
    }
  };

  const handleToggleActive = async (u: User) => {
    if (u.id === currentUserId) {
      alert('საკუთარი ანგარიშის დეაქტივაცია შეუძლებელია.');
      return;
    }
    await setUserActive(u.id, !u.isActive);
  };

  const handleResetPassword = async (u: User) => {
    const pw = prompt(`ახალი პაროლი მომხმარებლისთვის „${u.name}":`);
    if (!pw) return;
    await changePassword(u.id, pw);
    alert('პაროლი განახლდა.');
  };

  const handleDeleteUser = async (u: User) => {
    if (u.id === currentUserId) {
      alert('საკუთარი ანგარიშის წაშლა შეუძლებელია.');
      return;
    }
    if (!confirm(`წავშალოთ მომხმარებელი „${u.name}"?`)) return;
    await removeUser(u.id);
  };

  return (
    <div className="space-y-6" id="settings-section-root">
      <div>
        <h2 className="text-xl font-bold text-slate-800 tracking-tight font-sans">
          პარამეტრები & ადმინისტრირება
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          მომხმარებელთა მართვა, საგადასახადო განაკვეთები და ბიუჯეტის კატეგორიები.
        </p>
      </div>

      {/* USER MANAGEMENT (admin only) */}
      {isAdmin && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-50">
            <Shield className="h-4 w-4" />
            მომხმარებელთა მართვა (როლების მინიჭება)
          </div>

          {/* Create user form */}
          <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
            <div className="md:col-span-1">
              <label className="block text-[10px] font-bold text-slate-500 mb-1">სახელი, გვარი *</label>
              <input
                type="text"
                value={uName}
                onChange={(e) => setUName(e.target.value)}
                placeholder="ნინო ხარატიშვილი"
                className="w-full px-2.5 py-1.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-800"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1">მომხმარებელი *</label>
              <input
                type="text"
                value={uUsername}
                onChange={(e) => setUUsername(e.target.value)}
                placeholder="nino"
                className="w-full px-2.5 py-1.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-800"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1">პაროლი *</label>
              <input
                type="text"
                value={uPassword}
                onChange={(e) => setUPassword(e.target.value)}
                placeholder="••••••"
                className="w-full px-2.5 py-1.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-800"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1">როლი *</label>
              <select
                value={uRole}
                onChange={(e) => setURole(e.target.value as UserRole)}
                className="w-full px-2.5 py-1.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-800"
              >
                {ROLE_DEFS.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={uBusy}
              className="flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
            >
              <UserPlus className="h-4 w-4" />
              შექმნა
            </button>
          </form>

          {/* Users list */}
          <div className="divide-y divide-slate-50 border border-slate-100 rounded-xl overflow-hidden">
            {users.length === 0 && (
              <div className="p-4 text-center text-xs text-slate-400">მომხმარებლები არ არის</div>
            )}
            {users.map((u) => {
              const role = ROLE_DEFS.find((r) => r.id === u.role);
              return (
                <div key={u.id} className="flex items-center justify-between p-3 gap-3 bg-white">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs uppercase shrink-0 ${
                        u.isActive ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-400'
                      }`}
                    >
                      {u.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-xs text-slate-800 block truncate">
                        {u.name}{' '}
                        {u.id === currentUserId && <span className="text-indigo-500">(თქვენ)</span>}
                      </span>
                      <span className="text-[10px] text-slate-400 block truncate">
                        @{u.username} · {role?.name || u.role}
                        {!u.isActive && ' · დეაქტივირებული'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleResetPassword(u)}
                      title="პაროლის შეცვლა"
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      <KeyRound className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleToggleActive(u)}
                      title={u.isActive ? 'დეაქტივაცია' : 'აქტივაცია'}
                      className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                    >
                      {u.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => handleDeleteUser(u)}
                      title="წაშლა"
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* TAX SETTINGS */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-50">
            <Percent className="h-4 w-4" />
            გლობალური საგადასახადო განაკვეთები
          </div>

          <form onSubmit={handleSaveTax} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1">საშემოსავლო (%)</label>
                <input
                  type="number"
                  value={incomeTax}
                  onChange={(e) => setIncomeTax(Number(e.target.value))}
                  disabled={!isAdmin}
                  className="w-full px-2.5 py-1.5 bg-slate-50 rounded-lg border border-slate-200 text-xs font-bold font-mono text-slate-800 disabled:opacity-60"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1">საპენსიო დასაქმ. (%)</label>
                <input
                  type="number"
                  value={pensionEmployee}
                  onChange={(e) => setPensionEmployee(Number(e.target.value))}
                  disabled={!isAdmin}
                  className="w-full px-2.5 py-1.5 bg-slate-50 rounded-lg border border-slate-200 text-xs font-bold font-mono text-slate-800 disabled:opacity-60"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1">საპენსიო დამსაქ. (%)</label>
                <input
                  type="number"
                  value={pensionEmployer}
                  onChange={(e) => setPensionEmployer(Number(e.target.value))}
                  disabled={!isAdmin}
                  className="w-full px-2.5 py-1.5 bg-slate-50 rounded-lg border border-slate-200 text-xs font-bold font-mono text-slate-800 disabled:opacity-60"
                />
              </div>
            </div>

            {isAdmin && (
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
                >
                  განაკვეთების შენახვა
                </button>
              </div>
            )}
          </form>
        </div>

        {/* BUDGET CATEGORIES */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-50">
            <FolderPlus className="h-4 w-4" />
            ახალი ბიუჯეტის კატეგორია
          </div>

          {isAdmin ? (
            <form onSubmit={handleAddCategorySubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">დასახელება *</label>
                  <input
                    type="text"
                    placeholder="მაგ: სამშენებლო სამუშაოები"
                    value={catName}
                    onChange={(e) => setCatName(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">ბიუჯეტი (GEL) *</label>
                  <input
                    type="number"
                    value={catBudget || ''}
                    onChange={(e) => setCatBudget(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-slate-50 rounded-lg border border-slate-200 text-xs font-bold font-mono text-indigo-700"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={catIsGrant}
                    onChange={(e) => setCatIsGrant(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-xs text-slate-600 font-semibold">დასაშვებია გრანტით დაფინანსება</span>
                </label>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
                >
                  კატეგორიის შექმნა
                </button>
              </div>
            </form>
          ) : (
            <div className="flex items-center gap-2 text-xs text-slate-400 py-4">
              <Lock className="h-4 w-4" />
              მხოლოდ ადმინისტრატორს შეუძლია კატეგორიების მართვა.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
