import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  QrCode,
  PackageSearch,
  History,
  LogOut,
  Sparkles,
} from 'lucide-react';
import type { UserSession } from '../types';

type ActiveRoute = '/dashboard' | '/scan' | '/paket' | '/riwayat';

interface NavigationProps {
  currentUser: UserSession | null;
  onLogout: () => void;
  waitingCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentUser,
  onLogout,
  waitingCount = 0,
}) => {
  const navItems: { id: ActiveRoute; label: string; icon: React.ElementType; badge: number | null }[] = [
    { id: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: '/scan', label: 'Scan Paket', icon: QrCode, badge: null },
    { id: '/paket', label: 'Daftar Paket', icon: PackageSearch, badge: waitingCount > 0 ? waitingCount : null },
    { id: '/riwayat', label: 'Riwayat', icon: History, badge: null },
  ];

  const getActiveTitle = (): string => {
    const path = window.location.hash.replace('#', '');
    if (path.startsWith('/dashboard')) return 'Dashboard Paket';
    if (path.startsWith('/scan')) return 'Scan Barcode Paket';
    if (path.startsWith('/paket')) return 'Daftar Paket';
    if (path.startsWith('/riwayat')) return 'Riwayat Paket';
    return 'Dashboard Paket';
  };

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 text-slate-900 shrink-0 min-h-screen sticky top-0 h-screen z-30 shadow-xs">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-md shadow-blue-500/20 shrink-0">
            P
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900 leading-tight">PaketSatpam</h1>
            <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
              <Sparkles className="w-3 h-3 text-blue-600" /> Sistem Paket
            </p>
          </div>
        </div>

        <div className="p-4">
          <NavLink
            to="/scan"
            className={({ isActive: active }: { isActive: boolean }) =>
              `w-full py-3 px-4 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2.5 min-h-[48px] active:scale-95 ${
                active
                  ? 'bg-blue-700 text-white shadow-blue-300 ring-2 ring-blue-500/40'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'
              }`
            }
          >
            <QrCode className="w-5 h-5 animate-pulse" />
            <span>Scan Paket Baru</span>
          </NavLink>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.id}
                to={item.id}
                className={({ isActive: active }: { isActive: boolean }) =>
                  `w-full flex items-center justify-between px-6 py-3 text-sm font-medium transition-all min-h-[44px] ${
                    active
                      ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                {({ isActive: active }: { isActive: boolean }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <Icon className={`w-5 h-5 ${active ? 'text-blue-600' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== null && item.badge !== undefined && (
                      <span className="px-2 py-0.5 text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-5 border-t border-slate-100 bg-slate-50/50 mt-auto">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center font-bold text-blue-600 shrink-0">
                {currentUser?.name?.[0] || 'A'}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">{currentUser?.name || 'Satpam'}</p>
                <p className="text-xs text-slate-500 truncate">Satpam Utama</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors shrink-0"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* MOBILE TOP BAR */}
      <header className="md:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-3.5 py-2.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-base shadow-xs shrink-0">
            P
          </div>
          <div className="min-w-0">
            <span className="text-[10px] text-blue-600 font-extrabold block uppercase tracking-wider leading-none">
              PaketSatpam
            </span>
            <span className="text-xs font-bold text-slate-900 truncate block mt-0.5">
              {getActiveTitle()}
            </span>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold shrink-0"
          title="Keluar dari sistem"
        >
          <LogOut className="w-4 h-4 text-slate-600" />
          <span className="text-[11px] text-slate-600">Keluar</span>
        </button>
      </header>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-1.5 flex items-center justify-between shadow-lg">
        <NavLink
          to="/dashboard"
          className={({ isActive: active }: { isActive: boolean }) =>
            `flex-1 flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-colors min-h-[44px] ${
              active ? 'text-blue-600 font-bold bg-blue-50/80' : 'text-slate-500 hover:text-slate-800'
            }`
          }
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 font-medium">Beranda</span>
        </NavLink>

        <NavLink
          to="/paket"
          className={({ isActive: active }: { isActive: boolean }) =>
            `flex-1 flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-colors relative min-h-[44px] ${
              active ? 'text-blue-600 font-bold bg-blue-50/80' : 'text-slate-500 hover:text-slate-800'
            }`
          }
        >
          <div className="relative">
            <PackageSearch className="w-5 h-5" />
            {waitingCount > 0 && (
              <span className="absolute -top-1 -right-2 px-1 min-w-[16px] h-4 bg-amber-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {waitingCount > 9 ? '9+' : waitingCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5 font-medium">Daftar</span>
        </NavLink>

        <div className="flex-1 flex justify-center -mt-5">
          <NavLink
            to="/scan"
            className={({ isActive: active }: { isActive: boolean }) =>
              `p-3 bg-blue-600 text-white rounded-full shadow-md shadow-blue-300 ring-4 ring-slate-50 active:scale-95 transition-all flex flex-col items-center justify-center ${
                active ? 'bg-blue-700 ring-blue-100 scale-105' : ''
              }`
            }
            title="Scan Barcode"
          >
            <QrCode className="w-5 h-5" />
            <span className="text-[9px] font-extrabold tracking-tight uppercase leading-none mt-0.5">SCAN</span>
          </NavLink>
        </div>

        <NavLink
          to="/riwayat"
          className={({ isActive: active }: { isActive: boolean }) =>
            `flex-1 flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-colors min-h-[44px] ${
              active ? 'text-blue-600 font-bold bg-blue-50/80' : 'text-slate-500 hover:text-slate-800'
            }`
          }
        >
          <History className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 font-medium">Riwayat</span>
        </NavLink>
      </nav>
    </>
  );
};
