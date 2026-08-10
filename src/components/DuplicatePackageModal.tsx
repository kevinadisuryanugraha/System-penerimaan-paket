import React from 'react';
import { Package } from '../types';
import { AlertCircle, Clock, PackageCheck, User, Truck, X, Eye } from 'lucide-react';

interface DuplicatePackageModalProps {
  isOpen: boolean;
  packageData: Package | null;
  onViewDetail: (pkg: Package) => void;
  onCancel: () => void;
}

export const DuplicatePackageModal: React.FC<DuplicatePackageModalProps> = ({
  isOpen,
  packageData,
  onViewDetail,
  onCancel,
}) => {
  if (!isOpen || !packageData) return null;

  const isCollected = packageData.status === 'Sudah Diambil';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white border border-amber-200 text-slate-800 rounded-xl max-w-md w-full p-6 shadow-xl relative">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-amber-800">Paket Sudah Terdaftar</h3>
            <p className="text-xs text-slate-500">Nomor paket ini sudah ada di sistem</p>
          </div>
        </div>

        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-6 space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-slate-200">
            <span className="text-xs text-slate-500">Nomor Paket/Resi:</span>
            <span className="text-sm font-mono font-bold text-slate-900 tracking-wide">{packageData.nomor_paket}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-600" /> Penerima:
            </span>
            <span className="text-sm font-semibold text-slate-800">{packageData.nama_penerima}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500 flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-slate-500" /> Kurir:
            </span>
            <span className="text-xs font-medium bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
              {packageData.kurir}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-600" /> Waktu Masuk:
            </span>
            <span className="text-xs text-slate-700">
              {packageData.tanggal_masuk} &bull; {packageData.jam_masuk}
            </span>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-slate-200">
            <span className="text-xs text-slate-500">Status Saat Ini:</span>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wide ${
                isCollected
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : 'bg-amber-100 text-amber-800 border border-amber-200'
              }`}
            >
              <PackageCheck className="w-3.5 h-3.5" />
              {packageData.status}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors min-h-[44px]"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => onViewDetail(packageData)}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors min-h-[44px]"
          >
            <Eye className="w-4 h-4" />
            Lihat Detail
          </button>
        </div>
      </div>
    </div>
  );
};
