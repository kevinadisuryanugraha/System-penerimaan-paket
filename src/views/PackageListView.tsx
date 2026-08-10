import React, { useState } from 'react';
import type { Package, PackageStatus } from '../types';
import { ListSkeleton } from '../components/LoadingSkeleton';
import {
  Search,
  CheckCircle,
  Eye,
  Trash2,
  Calendar,
  Download,
  PackageCheck,
  User,
  Truck,
  Plus,
} from 'lucide-react';

interface PackageListViewProps {
  packages: Package[];
  onSelectPackage: (pkg: Package) => void;
  onMarkCollected: (pkg: Package) => void;
  onDeletePackage: (pkg: Package) => void;
  onNavigateToScan: () => void;
  isLoading: boolean;
}

export const PackageListView: React.FC<PackageListViewProps> = ({
  packages,
  onSelectPackage,
  onMarkCollected,
  onDeletePackage,
  onNavigateToScan,
  isLoading,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Semua' | PackageStatus>('Semua');
  const [dateFilter, setDateFilter] = useState('');

  const filteredPackages = packages.filter((pkg) => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !term ||
      pkg.nomor_paket.toLowerCase().includes(term) ||
      pkg.nama_penerima.toLowerCase().includes(term) ||
      pkg.kurir.toLowerCase().includes(term) ||
      (pkg.catatan && pkg.catatan.toLowerCase().includes(term));

    const matchesStatus = statusFilter === 'Semua' || pkg.status === statusFilter;
    const matchesDate = !dateFilter || pkg.tanggal_masuk === dateFilter;

    return matchesSearch && matchesStatus && matchesDate;
  });

  const handleExportCSV = () => {
    if (filteredPackages.length === 0) return;

    const headers = ['Nomor Paket/Resi', 'Nama Penerima', 'Kurir', 'Tanggal Masuk', 'Jam Masuk', 'Status', 'Tanggal Diambil', 'Jam Diambil', 'Catatan'];
    const rows = filteredPackages.map((p) => [
      `"${p.nomor_paket}"`, `"${p.nama_penerima}"`, `"${p.kurir}"`, `"${p.tanggal_masuk}"`,
      `"${p.jam_masuk}"`, `"${p.status}"`, `"${p.tanggal_diambil || ''}"`, `"${p.jam_diambil || ''}"`, `"${p.catatan || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `rekap_paket_satpam_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return <ListSkeleton />;
  }

  return (
    <div className="space-y-6 pb-24 md:pb-12">
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <PackageCheck className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 shrink-0" />
            <span>Daftar Rekapitulasi Paket</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Seluruh catatan penerimaan dan penyerahan paket oleh pos satpam</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto pt-1 sm:pt-0">
          <button onClick={handleExportCSV} className="flex-1 sm:flex-none px-3 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 shadow-xs transition-colors flex items-center justify-center gap-1.5 min-h-[42px]">
            <Download className="w-4 h-4 text-slate-500" /><span>Export CSV</span>
          </button>
          <button onClick={onNavigateToScan} className="flex-1 sm:flex-none px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-200 transition-colors flex items-center justify-center gap-1.5 min-h-[42px]">
            <Plus className="w-4 h-4" /><span>Scan Paket</span>
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative sm:col-span-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Cari nomor resi / penerima / kurir..." className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex items-center p-1 bg-slate-100 border border-slate-200 rounded-xl">
            {(['Semua', 'Menunggu', 'Sudah Diambil'] as const).map((st) => (
              <button key={st} onClick={() => setStatusFilter(st)} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${statusFilter === st ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}>{st}</button>
            ))}
          </div>
          <div className="relative">
            <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            {dateFilter && <button onClick={() => setDateFilter('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 px-1">Reset</button>}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>Menampilkan <strong className="text-slate-900">{filteredPackages.length}</strong> dari {packages.length} paket</span>
        {(searchTerm || statusFilter !== 'Semua' || dateFilter) && (
          <button onClick={() => { setSearchTerm(''); setStatusFilter('Semua'); setDateFilter(''); }} className="text-blue-600 hover:underline font-semibold">Reset Semua Filter</button>
        )}
      </div>

      {filteredPackages.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-3 shadow-xs">
          <PackageCheck className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">Tidak Ada Paket Ditemukan</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">Gunakan pencarian lain atau tekan tombol Scan Paket untuk menambahkan paket baru.</p>
          <button onClick={onNavigateToScan} className="mt-2 px-5 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5 shadow-xs"><Plus className="w-4 h-4" /> Scan Paket Baru</button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 sm:hidden">
            {filteredPackages.map((pkg) => {
              const isWaiting = pkg.status === 'Menunggu';
              return (
                <div key={pkg.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">{pkg.nomor_paket}</span>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wide ${isWaiting ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'}`}>{pkg.status}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900"><User className="w-4 h-4 text-blue-600" /><span>{pkg.nama_penerima}</span></div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Truck className="w-3.5 h-3.5 text-slate-400" /> {pkg.kurir}</span>
                      <span>{pkg.tanggal_masuk} &bull; {pkg.jam_masuk}</span>
                    </div>
                    {pkg.catatan && <p className="text-xs text-slate-600 italic bg-slate-50 p-2 rounded-lg border border-slate-100 mt-2">"{pkg.catatan}"</p>}
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button onClick={() => onDeletePackage(pkg)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg" title="Hapus"><Trash2 className="w-4 h-4" /></button>
                    <div className="flex items-center gap-2">
                      <button onClick={() => onSelectPackage(pkg)} className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1 min-h-[40px]"><Eye className="w-3.5 h-3.5" /> Detail</button>
                      {isWaiting && <button onClick={() => onMarkCollected(pkg)} className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-xs min-h-[40px]"><CheckCircle className="w-3.5 h-3.5" /> Tandai Diambil</button>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="hidden sm:block overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr><th className="p-4">Nomor Resi</th><th className="p-4">Nama Penerima</th><th className="p-4">Kurir</th><th className="p-4">Waktu Masuk</th><th className="p-4">Status</th><th className="p-4 text-right">Aksi</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPackages.map((pkg) => {
                  const isWaiting = pkg.status === 'Menunggu';
                  return (
                    <tr key={pkg.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 font-mono font-bold text-slate-900">{pkg.nomor_paket}</td>
                      <td className="p-4 font-semibold text-slate-800">{pkg.nama_penerima}</td>
                      <td className="p-4"><span className="bg-slate-100 text-slate-700 font-medium px-2.5 py-1 rounded-md">{pkg.kurir}</span></td>
                      <td className="p-4 text-slate-500 whitespace-nowrap">{pkg.tanggal_masuk} ({pkg.jam_masuk})</td>
                      <td className="p-4"><span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wide inline-block ${isWaiting ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'}`}>{pkg.status}</span></td>
                      <td className="p-4 text-right space-x-1.5">
                        <button onClick={() => onSelectPackage(pkg)} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1 min-h-[36px]"><Eye className="w-3.5 h-3.5" /> Detail</button>
                        {isWaiting && <button onClick={() => onMarkCollected(pkg)} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors inline-flex items-center gap-1 min-h-[36px]"><CheckCircle className="w-3.5 h-3.5" /> Ambil</button>}
                        <button onClick={() => onDeletePackage(pkg)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors inline-flex items-center" title="Hapus"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};
