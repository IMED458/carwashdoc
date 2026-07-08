import React, { useState } from 'react';
import {
  LayoutDashboard,
  Receipt,
  Users2,
  Building2,
  CreditCard,
  BarChart3,
  Settings,
  Menu,
  X,
  LogOut,
  Droplet,
} from 'lucide-react';
import { UserRole } from '../types';
import { ROLE_LABELS } from '../data/defaults';

interface MainLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUserRole: UserRole;
  currentUserName: string;
  totalBudget: number;
  totalSpent: number;
  onLogout: () => void;
}

const MENU = [
  { id: 'dashboard', name: 'მთავარი დაფა', icon: LayoutDashboard },
  { id: 'expenses', name: 'ხარჯების რეესტრი', icon: Receipt },
  { id: 'payroll', name: 'ხელფასები & ფიზ. პირები', icon: Users2 },
  { id: 'suppliers', name: 'მიმწოდებლები', icon: Building2 },
  { id: 'payments', name: 'გადახდების ჟურნალი', icon: CreditCard },
  { id: 'reports', name: 'ანგარიშები & ექსპორტი', icon: BarChart3 },
  { id: 'settings', name: 'პარამეტრები', icon: Settings },
];

export default function MainLayout({
  children,
  activeTab,
  setActiveTab,
  currentUserRole,
  currentUserName,
  totalBudget,
  totalSpent,
  onLogout,
}: MainLayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const go = (id: string) => {
    setActiveTab(id);
    setMenuOpen(false);
  };

  const remaining = totalBudget - totalSpent;

  const NavButtons = () => (
    <div className="space-y-1">
      {MENU.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            onClick={() => go(item.id)}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === item.id
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Icon className="h-5 w-5" />
            {item.name}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-100 px-4 md:px-8 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-500 md:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-600 text-white rounded-xl">
              <Droplet className="h-4.5 w-4.5" />
            </div>
            <div>
              <span className="font-black text-sm text-slate-900 block">საგრანტო კონტროლი</span>
              <span className="text-[10px] text-slate-400 block font-semibold">სამრეცხაო</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-5 text-xs">
          <div className="hidden sm:flex items-center gap-4 border-r border-slate-100 pr-4 md:pr-5">
            <div>
              <span className="text-slate-400 block font-medium">ბიუჯეტი</span>
              <span className="font-bold text-slate-800">{totalBudget.toLocaleString()} ₾</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">დარჩენილი</span>
              <span className={`font-black ${remaining < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                {remaining.toLocaleString()} ₾
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 p-1.5 pr-3 rounded-full border border-slate-100">
            <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs uppercase">
              {currentUserName.charAt(0)}
            </div>
            <div className="hidden sm:block text-left">
              <span className="font-bold text-slate-800 block leading-none">{currentUserName}</span>
              <span className="text-[9px] text-indigo-600 font-bold block mt-0.5">
                {ROLE_LABELS[currentUserRole]}
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              if (confirm('ნამდვილად გსურთ გამოსვლა?')) onLogout();
            }}
            title="გამოსვლა"
            className="flex items-center gap-1.5 p-2 md:px-3 md:py-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl border border-slate-100 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden md:inline font-bold">გამოსვლა</span>
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row">
        {/* DESKTOP SIDEBAR */}
        <aside className="hidden md:block md:w-60 bg-white border-r border-slate-100 p-4 h-[calc(100vh-61px)] sticky top-[61px] shrink-0">
          <NavButtons />
        </aside>

        {/* MOBILE DRAWER */}
        {menuOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden bg-slate-900/40">
            <div className="w-64 bg-white h-full p-4 shadow-xl">
              <div className="flex justify-between items-center pb-3 mb-2 border-b border-slate-100">
                <span className="font-black text-sm text-slate-800">მენიუ</span>
                <button onClick={() => setMenuOpen(false)}>
                  <X className="h-5 w-5 text-slate-500" />
                </button>
              </div>
              <NavButtons />
            </div>
            <div className="flex-1" onClick={() => setMenuOpen(false)} />
          </div>
        )}

        <main className="flex-1 p-4 md:p-8 max-w-full">{children}</main>
      </div>
    </div>
  );
}
