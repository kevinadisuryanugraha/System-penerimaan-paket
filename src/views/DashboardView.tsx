import React, { useState, useEffect } from 'react';
import type { Package } from '../types';
import { PackageStorageService } from '../services/packageStorage';
import { MobilePwaWidget } from '../components/MobilePwaWidget';
import { DashboardSkeleton } from '../components/LoadingSkeleton';
import {
  QrCode,
  PackageCheck,
  Clock,
  CheckCircle2,
  Calendar,
  Search,
  ArrowRight,
  Eye,
  Check,
  Truck,
  User,
  Plus,
} from 'lucide-react';

interface DashboardViewProps {
  onNavigateToScan: () => void;
  onNavigateToList: () => void;
  onSelectPackage: (pkg: Package) => void;
  onMarkCollected: (pkg: Package) => void;
  packages: Package[];
  isLoading: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateToScan,
  onNavigateToList,
  onSelectPackage,
  onMarkCollected,
  packages,
  isLoading,
}) => {
  const [quickSearch, setQuickSearch] = useState('');
  const [stats, setStats] = useState({ total: 0, waiting: 0, collected: 0, todayCount: 0 });

  useEffect(() => {
    const loadStats = async () => {
      const s = await PackageStorageService.getStatistics();
      setStats(s);
    };
    loadStats();
  }, [packages]);

  const waitingCount = stats.waiting;
  const recentPackages = packages.slice(0, 6);

  const filteredRecent = quickSearch.trim()
    ? packages.filter(
        (p) =>
          p.nomor_paket.toLowerCase().includes(quickSearch.toLowerCase()) ||
          p.nama_penerima.toLowerCase().includes(quickSearch.toLowerCase()) ||
          p.kurir.toLowerCase().includes(quickSearch.toLowerCase())
      )
    : recentPackages;

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6 pb-24 md:pb-12">
      <MobilePwaWidget
        waitingCount={waitingCount}
        onNavigateToScan={onNavigateToScan}
        onNavigateToList={onNavigateToList}
      />

      {/* Top Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="text-[11px] sm:text-xs text-slate-500 font-medium flex items-center gap-1.5">
            <span>Sistem Paket Satpam</span>
            <span>&bull;</span>
            <span className="text-slate-900 font-semibold italic">Shift Pagi</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-0.5 sm:mt-1">
            Dashboard Penerimaan Paket
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 hidden sm:block">
            Kelola penerimaan dan penyerahan paket pos satpam secara real-time
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto pt-1 sm:pt-0">
          <button
            onClick={onNavigateToScan}
            className="flex-1 sm:flex-none px-3.5 sm:px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-blue-200 transition-all flex items-center justify-center gap-2 min-h-[44px] active:scale-95"
          >
            <QrCode className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
            <span>Scan Paket Baru</span>
          </button>

          <button
            onClick={onNavigateToList}
            className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm rounded-xl transition-colors flex items-center justify-center gap-1.5 min-h-[44px] shrink-0"
          >
            <span>Daftar</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* STATISTICS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="text-slate-500 text-[11px] sm:text-xs font-medium mb-0.5 truncate">Total Paket</div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900">{stats.total}</div>
          </div>
          <div className="text-[10px] sm:text-xs text-blue-600 mt-2.5 font-medium flex items-center gap-1 min-w-0">
            <PackageCheck className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Tercatat di sistem</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 border-l-4 border-l-amber-400 rounded-xl p-3.5 sm:p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="text-slate-500 text-[11px] sm:text-xs font-medium mb-0.5 truncate">Belum Diambil</div>
            <div className="text-2xl sm:text-3xl font-bold text-amber-600">{stats.waiting}</div>
          </div>
          <div className="text-[10px] sm:text-xs text-slate-500 mt-2.5 font-medium flex items-center gap-1 min-w-0">
            <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="truncate">Menunggu pemilik</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 border-l-4 border-l-emerald-400 rounded-xl p-3.5 sm:p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="text-slate-500 text-[11px] sm:text-xs font-medium mb-0.5 truncate">Sudah Diambil</div>
            <div className="text-2xl sm:text-3xl font-bold text-emerald-600">{stats.collected}</div>
          </div>
          <div className="text-[10px] sm:text-xs text-slate-500 mt-2.5 font-medium flex items-center gap-1 min-w-0">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span className="truncate">Status Selesai</span>
          </div>
        </div>

        <div className="bg-blue-600 text-white rounded-xl p-3.5 sm:p-5 shadow-md shadow-blue-200 flex flex-col justify-between">
          <div>
            <div className="text-blue-100 text-[11px] sm:text-xs font-medium mb-0.5 truncate">Masuk Hari Ini</div>
            <div className="text-2xl sm:text-3xl font-bold text-white">{stats.todayCount}</div>
          </div>
          <div className="text-[10px] sm:text-xs text-blue-100 mt-2.5 font-medium flex items-center gap-1 min-w-0">
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Data Real-time</span>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden flex flex-col">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
            <div>
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-600" /> Paket Terbaru
              </h3>
              <p className="text-xs text-slate-500">Aktivitas penerimaan paket terakhir</p>
            </div>

            <div className="relative w-full sm:w-56">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={quickSearch}
                onChange={(e) => setQuickSearch(e.target.value)}
                placeholder="Cari resi / nama..."
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {filteredRecent.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-3">
              <PackageCheck className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-500">
                {quickSearch ? 'Tidak ada paket sesuai pencarian.' : 'Belum ada paket tercatat.'}
              </p>
              <button
                onClick={onNavigateToScan}
                className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg inline-flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4" /> Scan Paket Pertama
              </button>
            </div>
          ) : (
            <>
              {/* MOBILE CARDS */}
              <div className="block sm:hidden divide-y divide-slate-100 p-2">
                {filteredRecent.map((pkg) => {
                  const isWaiting = pkg.status === 'Menunggu';
                  return (
                    <div
                      key={pkg.id}
                      onClick={() => onSelectPackage(pkg)}
                      className="p-3 hover:bg-slate-50 rounded-lg transition-colors space-y-2 cursor-pointer"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900 truncate">{pkg.nomor_paket}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                            isWaiting ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {pkg.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-600">
                        <span className="font-semibold text-slate-800 flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-blue-600" /> {pkg.nama_penerima}
                        </span>
                        <span className="text-slate-500 font-mono text-[11px]">{pkg.kurir} &bull; {pkg.jam_masuk}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* DESKTOP TABLE */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-3.5">Nomor Resi</th>
                      <th className="px-5 py-3.5">Penerima</th>
                      <th className="px-5 py-3.5">Kurir</th>
                      <th className="px-5 py-3.5">Waktu</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {filteredRecent.map((pkg) => {
                      const isWaiting = pkg.status === 'Menunggu';
                      return (
                        <tr key={pkg.id} className="hover:bg-slate-50/80 transition-colors cursor-pointer" onClick={() => onSelectPackage(pkg)}>
                          <td className="px-5 py-4 font-mono text-xs font-bold text-slate-900">{pkg.nomor_paket}</td>
                          <td className="px-5 py-4 font-semibold text-slate-800">
                            <div className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-slate-400" /><span>{pkg.nama_penerima}</span></div>
                          </td>
                          <td className="px-5 py-4 text-xs text-slate-600"><span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">{pkg.kurir}</span></td>
                          <td className="px-5 py-4 text-xs text-slate-500 whitespace-nowrap">{pkg.jam_masuk}</td>
                          <td className="px-5 py-4">
                            <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wide inline-block ${isWaiting ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'}`}>{pkg.status}</span>
                          </td>
                          <td className="px-5 py-4 text-right space-x-1.5" onClick={(e) => e.stopPropagation()}>
                            <button onClick={() => onSelectPackage(pkg)} className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors min-h-[36px] min-w-[36px] inline-flex items-center justify-center" title="Detail Paket"><Eye className="w-4 h-4" /></button>
                            {isWaiting && (
                              <button onClick={() => onMarkCollected(pkg)} className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors inline-flex items-center gap-1 min-h-[36px]"><Check className="w-3.5 h-3.5" /> Ambil</button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

          <div className="p-4 border-t border-slate-100 bg-slate-50/50 text-center mt-auto">
            <button onClick={onNavigateToList} className="text-xs text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center gap-1">
              <span>Lihat semua {packages.length} paket</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <button
            onClick={onNavigateToScan}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-2xl flex flex-col items-center justify-center gap-4 shadow-lg shadow-blue-200 transition-all text-center group active:scale-98 cursor-pointer"
          >
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <QrCode className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="text-xl font-bold">Scan Paket Baru</div>
              <div className="text-xs text-blue-100 mt-1">Gunakan Kamera HP atau Laptop</div>
            </div>
          </button>

          <div className="bg-slate-900 text-white rounded-xl p-6 shadow-md border border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" /> Panduan Cepat
            </h3>
            <ul className="space-y-4 text-xs">
              {['Arahkan kamera ke barcode/QR pada label resi paket.', 'Pastikan nomor resi terbaca otomatis atau isi secara manual.', 'Ketik nama penerima paket dengan jelas dan pilih ekspedisi kurir.', 'Klik simpan & letakkan paket di rak penampungan sementara.'].map((text, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] flex items-center justify-center font-bold shrink-0">{i + 1}</span>
                  <span className="text-slate-300 leading-relaxed">{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
