import React, { useState } from 'react';
import type { Package } from '../types';
import { ListSkeleton } from '../components/LoadingSkeleton';
import {
  History,
  Search,
  Calendar,
  CheckCircle2,
  Clock,
  User,
  Eye,
  Download,
} from 'lucide-react';

interface HistoryViewProps {
  packages: Package[];
  onSelectPackage: (pkg: Package) => void;
  isLoading: boolean;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ packages, onSelectPackage, isLoading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const historyPackages = packages.filter((p) => p.status === 'Sudah Diambil');

  const filteredHistory = historyPackages.filter((pkg) => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !term ||
      pkg.nomor_paket.toLowerCase().includes(term) ||
      pkg.nama_penerima.toLowerCase().includes(term) ||
      pkg.kurir.toLowerCase().includes(term);

    let matchesDate = true;
    if (startDate) {
      matchesDate = matchesDate && (pkg.tanggal_diambil || pkg.tanggal_masuk) >= startDate;
    }
    if (endDate) {
      matchesDate = matchesDate && (pkg.tanggal_diambil || pkg.tanggal_masuk) <= endDate;
    }

    return matchesSearch && matchesDate;
  });

  const handleExportCSV = () => {
    if (filteredHistory.length === 0) return;

    const headers = ['Nomor Paket/Resi', 'Nama Penerima', 'Kurir', 'Tanggal Masuk', 'Jam Masuk', 'Tanggal Diambil', 'Jam Diambil', 'Petugas Penyerah'];
    const rows = filteredHistory.map((p) => [
      `"${p.nomor_paket}"`, `"${p.nama_penerima}"`, `"${p.kurir}"`,
      `"${p.tanggal_masuk}"`, `"${p.jam_masuk}"`, `"${p.tanggal_diambil || ''}"`,
      `"${p.jam_diambil || ''}"`, `"${p.petugas_penyerah || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `riwayat_paket_selesai_${new Date().toISOString().slice(0, 10)}.csv`);
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
            <History className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 shrink-0" />
            <span>Riwayat Paket Selesai</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Catatan arsip seluruh paket yang telah berhasil diserahkan kepada pemilik</p>
        </div>
        <button onClick={handleExportCSV} className="w-full sm:w-auto px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 shadow-xs transition-colors flex items-center justify-center gap-1.5 min-h-[42px]">
          <Download className="w-4 h-4 text-slate-500" /><span>Export Lap. Riwayat</span>
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Cari resi / nama penerima..." className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div className="relative">
            <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div className="relative">
            <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
        </div>
        {(searchTerm || startDate || endDate) && (
          <div className="flex justify-end pt-1">
            <button onClick={() => { setSearchTerm(''); setStartDate(''); setEndDate(''); }} className="text-xs text-emerald-600 hover:underline font-semibold">Reset Filter Tanggal</button>
          </div>
        )}
      </div>

      {filteredHistory.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-3 shadow-xs">
          <CheckCircle2 className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">Belum Ada Riwayat Paket</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">Paket yang telah ditandai "Sudah Diambil" oleh penerima akan otomatis masuk ke daftar riwayat ini.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 sm:hidden">
            {filteredHistory.map((pkg) => (
              <div key={pkg.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">{pkg.nomor_paket}</span>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wide bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Sudah Diambil</span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900"><User className="w-4 h-4 text-emerald-600" /><span>{pkg.nama_penerima}</span></div>
                  <div className="text-xs text-slate-500 space-y-1 pt-1">
                    <div className="flex justify-between"><span>Kurir: <strong className="text-slate-800">{pkg.kurir}</strong></span><span>Masuk: {pkg.tanggal_masuk}</span></div>
                    <div className="flex justify-between text-emerald-700 font-semibold"><span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Diambil:</span><span>{pkg.tanggal_diambil} ({pkg.jam_diambil})</span></div>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-100 flex justify-end">
                  <button onClick={() => onSelectPackage(pkg)} className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1 min-h-[40px]"><Eye className="w-3.5 h-3.5" /> Lihat Detail</button>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden sm:block overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr><th className="p-4">Nomor Resi</th><th className="p-4">Penerima</th><th className="p-4">Kurir</th><th className="p-4">Waktu Masuk</th><th className="p-4">Waktu Diambil</th><th className="p-4 text-right">Aksi</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredHistory.map((pkg) => (
                  <tr key={pkg.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-mono font-bold text-slate-900">{pkg.nomor_paket}</td>
                    <td className="p-4 font-semibold text-slate-800">{pkg.nama_penerima}</td>
                    <td className="p-4"><span className="bg-slate-100 text-slate-700 font-medium px-2.5 py-1 rounded-md">{pkg.kurir}</span></td>
                    <td className="p-4 text-slate-500">{pkg.tanggal_masuk} ({pkg.jam_masuk})</td>
                    <td className="p-4 font-bold text-emerald-700">{pkg.tanggal_diambil} ({pkg.jam_diambil})</td>
                    <td className="p-4 text-right">
                      <button onClick={() => onSelectPackage(pkg)} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1 min-h-[36px]"><Eye className="w-3.5 h-3.5" /> Detail</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};
