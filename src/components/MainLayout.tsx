/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Receipt, 
  Users2, 
  Building2, 
  CreditCard, 
  Landmark, 
  BarChart3, 
  Settings, 
  FileCode, 
  Menu, 
  X,
  User,
  Shield,
  Clock,
  Sparkles
} from 'lucide-react';
import { UserRole } from '../types';

interface MainLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUserRole: UserRole;
  currentUserName: string;
  totalBudget: number;
  totalSpent: number;
}

export default function MainLayout({
  children,
  activeTab,
  setActiveTab,
  currentUserRole,
  currentUserName,
  totalBudget,
  totalSpent
}: MainLayoutProps) {
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Time formatted UTC clock
  const currentUtcDate = "2026-07-08 20:47:00"; // Based on prompt context timeline

  const menuItems = [
    { id: 'dashboard', name: 'მთავარი დაფა', icon: LayoutDashboard },
    { id: 'expenses', name: 'ხარჯების რეესტრი', icon: Receipt },
    { id: 'payroll', name: 'ხელფასები & ფიზ. პირები', icon: Users2 },
    { id: 'suppliers', name: 'მიმწოდებლები', icon: Building2 },
    { id: 'payments', name: 'გადახდების ჟურნალი', icon: CreditCard },
    { id: 'tranches', name: 'გრანტის ტრანშები', icon: Landmark },
    { id: 'reports', name: 'ანგარიშები & ექსპორტი', icon: BarChart3 },
    { id: 'settings', name: 'პარამეტრები', icon: Settings },
    { id: 'docs', name: 'ტექნიკური დოკუმენტები', icon: FileCode },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans text-slate-800" id="main-layout-root">
      
      {/* HEADER BAR */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-100 px-4 md:px-8 py-3.5 flex items-center justify-between shadow-sm">
        
        {/* Left Side: Brand and Mobile Toggle */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-500 md:hidden transition-colors"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-sm shadow-indigo-600/10">
              <Sparkles className="h-4.5 w-4.5" />
            </div>
            <div>
              <span className="font-black text-sm tracking-tight text-slate-900 block font-sans">საგრანტო კონტროლი</span>
              <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">აწარმოე საქართველოში</span>
            </div>
          </div>
        </div>

        {/* Right Side: Quick Stats, Real Time, Profile */}
        <div className="flex items-center gap-6 text-xs font-sans">
          
          {/* Budget quick info */}
          <div className="hidden lg:flex items-center gap-4 border-r border-slate-100 pr-6">
            <div>
              <span className="text-slate-400 block font-medium">საწყისი ბიუჯეტი</span>
              <span className="font-bold text-slate-800">{totalBudget.toLocaleString()} GEL</span>
            </div>
            <div className="w-px h-6 bg-slate-100" />
            <div>
              <span className="text-slate-400 block font-medium">სულ ათვისებული</span>
              <span className="font-black text-indigo-600">{totalSpent.toLocaleString()} GEL</span>
            </div>
          </div>

          {/* Time indicator */}
          <div className="hidden sm:flex items-center gap-1.5 text-slate-400 font-medium">
            <Clock className="h-3.5 w-3.5" />
            <span className="font-mono">{currentUtcDate} UTC</span>
          </div>

          {/* Profile pill */}
          <div className="flex items-center gap-2.5 bg-slate-50 hover:bg-slate-100/80 p-1.5 pr-3 rounded-full border border-slate-100 transition-colors">
            <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
              {currentUserName.charAt(0)}
            </div>
            <div className="text-left">
              <span className="font-bold text-slate-800 block leading-none">{currentUserName}</span>
              <span className="text-[9px] text-indigo-600 font-bold uppercase tracking-wider block mt-0.5 inline-flex items-center gap-0.5">
                <Shield className="h-2.5 w-2.5" />
                {currentUserRole}
              </span>
            </div>
          </div>

        </div>

      </header>

      {/* CORE FRAMEWORK: SIDEBAR + MAIN CONTENT */}
      <div className="flex-1 flex flex-col md:flex-row relative">
        
        {/* DESKTOP SIDEBAR */}
        <aside className="hidden md:flex md:w-64 bg-white border-r border-slate-100 flex-col p-4 justify-between h-[calc(100vh-65px)] sticky top-[65px] shrink-0">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block px-3 mb-3">მენიუ</span>
            
            {menuItems.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === item.id
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/10'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="h-4.5 w-4.5" />
                  {item.name}
                </button>
              );
            })}
          </div>

          {/* Sidebar Footer context */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100/50 text-[10px] text-slate-500 leading-relaxed font-sans">
            <p>პროექტი ხორციელდება სახელმწიფო თანადაფინანსებით.</p>
            <strong className="text-slate-700 block mt-1">ID: #0b6ce977</strong>
          </div>
        </aside>

        {/* MOBILE SIDEBAR DRAWERS */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-100">
            <div className="w-64 bg-white h-full p-4 flex flex-col justify-between shadow-xl animate-in slide-in-from-left duration-150">
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <span className="font-black text-sm tracking-tight text-slate-800">საგრანტო კონტროლი</span>
                  <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 hover:bg-slate-100 rounded">
                    <X className="h-5 w-5 text-slate-500" />
                  </button>
                </div>
                
                <div className="space-y-1">
                  {menuItems.map(item => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavClick(item.id)}
                        className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                          activeTab === item.id
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className="h-4.5 w-4.5" />
                        {item.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl text-[10px] text-slate-500">
                <p>პროექტი ხორციელდება სახელმწიფო თანადაფინანსებით.</p>
              </div>
            </div>
            {/* Click outside to close */}
            <div className="flex-1" onClick={() => setIsMobileMenuOpen(false)} />
          </div>
        )}

        {/* MAIN BODY WINDOW */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-full">
          {children}
        </main>

      </div>

    </div>
  );
}
