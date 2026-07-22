import React, { useState } from 'react';
import {
  Shield,
  FolderPlus,
  UserPlus,
  UserCheck,
  UserX,
  Trash2,
  KeyRound,
  Wallet,
  Lock,
} from 'lucide-react';
import { UserRole, User, Category } from '../types';
import { ROLE_DEFS, ROLE_LABELS } from '../data/defaults';
import { createUser, setUserActive, removeUser, changePassword } from '../services/auth';

interface Props {
  currentUserRole: UserRole;
  currentUserId: string;
  users: User[];
  categories: Category[];
  totalBudget: number;
  onAddCategory: (name: string, plannedBudget: number) => void;
  onDeleteCategory: (id: string) => void;
  onUpdateBudget: (amount: number) => void;
}

const gel = (n: number) => `${n.toLocaleString()} ₾`;

export default function SettingsPanel({
  currentUserRole,
  currentUserId,
  users,
  categories,
  totalBudget,
  onAddCategory,
  onDeleteCategory,
  onUpdateBudget,
}: Props) {
  const isAdmin = currentUserRole === 'admin';

  // ბიუჯეტი
  const [budget, setBudget] = useState(totalBudget);

  // კატეგორია
  const [catName, setCatName] = useState('');
  const [catBudget, setCatBudget] = useState<number>(0);

  // ახალი მომხმარებელი
  const [uName, setUName] = useState('');
  const [uUsername, setUUsername] = useState('');
  const [uPassword, setUPassword] = useState('');
  const [uRole, setURole] = useState<UserRole>('manager');
  const [busy, setBusy] = useState(false);

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
        <Lock className="h-8 w-8" />
        <p className="text-sm font-semibold">პარამეტრებზე წვდომა მხოლოდ ადმინს აქვს.</p>
      </div>
    );
  }

  const addCat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) {
      alert('შეავსეთ კატეგორიის სახელი!');
      return;
    }
    onAddCategory(catName.trim(), Number(catBudget) || 0);
    setCatName('');
    setCatBudget(0);
  };

  const addUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uName.trim() || !uUsername.trim() || !uPassword.trim()) {
      alert('შეავსეთ სახელი, მომხმარებელი და პაროლი!');
      return;
    }
    setBusy(true);
    try {
      await createUser({ name: uName, username: uUsername, password: uPassword, role: uRole });
      setUName('');
      setUUsername('');
      setUPassword('');
      setURole('manager');
      alert('მომხმარებელი დაემატა!');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'შეცდომა');
    } finally {
      setBusy(false);
    }
  };

  const toggleActive = async (u: User) => {
    if (u.id === currentUserId) return alert('საკუთარი ანგარიშის შეცვლა არ შეიძლება.');
    await setUserActive(u.id, !u.isActive);
  };

  const resetPass = async (u: User) => {
    const pw = prompt(`ახალი პაროლი „${u.name}"-სთვის:`);
    if (pw) {
      await changePassword(u.id, pw);
      alert('პაროლი განახლდა.');
    }
  };

  const delUser = async (u: User) => {
    if (u.id === currentUserId) return alert('საკუთარი ანგარიშის წაშლა არ შეიძლება.');
    if (confirm(`წავშალოთ „${u.name}"?`)) await removeUser(u.id);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-slate-800">პარამეტრები</h2>
        <p className="text-xs text-slate-500 mt-1">მომხმარებლები, ბიუჯეტი და კატეგორიები.</p>
      </div>

      {/* USERS */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase pb-2 border-b border-slate-50">
          <Shield className="h-4 w-4" /> მომხმარებლები
        </div>

        <form onSubmit={addUser} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">სახელი, გვარი</label>
            <input value={uName} onChange={(e) => setUName(e.target.value)} className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-sm" />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">მომხმარებელი</label>
            <input value={uUsername} onChange={(e) => setUUsername(e.target.value)} className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-sm" />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">პაროლი</label>
            <input value={uPassword} onChange={(e) => setUPassword(e.target.value)} className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-sm" />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">როლი</label>
            <select value={uRole} onChange={(e) => setURole(e.target.value as UserRole)} className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-sm">
              {ROLE_DEFS.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
          <button type="submit" disabled={busy} className="flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-bold rounded-xl">
            <UserPlus className="h-4 w-4" /> შექმნა
          </button>
        </form>

        <div className="divide-y divide-slate-50 border border-slate-100 rounded-xl overflow-hidden">
          {users.length === 0 && <div className="p-4 text-center text-xs text-slate-400">—</div>}
          {users.map((u) => (
            <div key={u.id} className="flex items-center justify-between p-3 gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs uppercase shrink-0 ${u.isActive ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                  {u.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-sm text-slate-800 block truncate">
                    {u.name} {u.id === currentUserId && <span className="text-indigo-500">(თქვენ)</span>}
                  </span>
                  <span className="text-[11px] text-slate-400 truncate">
                    @{u.username} · {ROLE_LABELS[u.role]}{!u.isActive && ' · გათიშული'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => resetPass(u)} title="პაროლი" className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg">
                  <KeyRound className="h-4 w-4" />
                </button>
                <button onClick={() => toggleActive(u)} title={u.isActive ? 'გათიშვა' : 'ჩართვა'} className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg">
                  {u.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                </button>
                <button onClick={() => delUser(u)} title="წაშლა" className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* BUDGET */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase pb-2 border-b border-slate-50">
            <Wallet className="h-4 w-4" /> გრანტის ბიუჯეტი
          </div>
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="block text-[11px] font-bold text-slate-500 mb-1">საერთო ბიუჯეტი (₾)</label>
              <input
                type="number"
                value={budget || ''}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-sm font-bold"
              />
            </div>
            <button
              onClick={() => {
                onUpdateBudget(Number(budget));
                alert('ბიუჯეტი განახლდა!');
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl"
            >
              შენახვა
            </button>
          </div>
        </div>

        {/* CATEGORIES */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase pb-2 border-b border-slate-50">
            <FolderPlus className="h-4 w-4" /> ხარჯის კატეგორიები
          </div>
          <form onSubmit={addCat} className="flex items-end gap-2">
            <div className="flex-1">
              <label className="block text-[11px] font-bold text-slate-500 mb-1">დასახელება</label>
              <input value={catName} onChange={(e) => setCatName(e.target.value)} placeholder="მაგ: ბეტონი" className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-sm" />
            </div>
            <div className="w-28">
              <label className="block text-[11px] font-bold text-slate-500 mb-1">ბიუჯეტი (არასავალდ.)</label>
              <input type="number" value={catBudget || ''} onChange={(e) => setCatBudget(Number(e.target.value))} placeholder="—" className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-sm font-bold" />
            </div>
            <button type="submit" className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">
              <FolderPlus className="h-4 w-4" />
            </button>
          </form>
          <div className="divide-y divide-slate-50">
            {categories.length === 0 && <p className="text-xs text-slate-400 py-2">კატეგორიები ჯერ არ არის.</p>}
            {categories.map((c) => (
              <div key={c.id} className="flex items-center justify-between py-2">
                <span className="text-sm font-semibold text-slate-700">{c.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400">{c.plannedBudget ? gel(c.plannedBudget) : '—'}</span>
                  <button onClick={() => confirm(`წავშალოთ „${c.name}"?`) && onDeleteCategory(c.id)} className="p-1 text-slate-400 hover:text-red-600 rounded">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
