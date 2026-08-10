import React, { useState } from 'react';
import { Package } from '../types';
import {
  X,
  PackageCheck,
  Clock,
  User,
  Truck,
  FileText,
  Calendar,
  Share2,
  Printer,
  CheckCircle,
  AlertCircle,
  Camera,
  Trash2,
} from 'lucide-react';

interface PackageDetailModalProps {
  isOpen: boolean;
  packageData: Package | null;
  onClose: () => void;
  onMarkAsCollected: (pkg: Package) => void;
  onDeletePackage?: (pkg: Package) => void;
}

export const PackageDetailModal: React.FC<PackageDetailModalProps> = ({
  isOpen,
  packageData,
  onClose,
  onMarkAsCollected,
  onDeletePackage,
}) => {
  const [showPhotoMax, setShowPhotoMax] = useState(false);

  if (!isOpen || !packageData) return null;

  const isCollected = packageData.status === 'Sudah Diambil';

  const handleShareWhatsApp = () => {
    const text = `📦 *SISTEM PENERIMAAN PAKET SATPAM*\n\nHalo *${packageData.nama_penerima}*,\nPaket Anda telah tiba dan dicatat oleh Satpam.\n\n• *Nomor Paket/Resi:* ${packageData.nomor_paket}\n• *Kurir:* ${packageData.kurir}\n• *Waktu Masuk:* ${packageData.tanggal_masuk} (${packageData.jam_masuk})\n• *Status:* ${packageData.status}\n${packageData.catatan ? `• *Catatan:* ${packageData.catatan}\n` : ''}\nSilakan ambil paket di Pos Satpam. Terima kasih!`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handlePrintSlip = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Bukti Paket - ${packageData.nomor_paket}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; max-width: 400px; margin: 0 auto; color: #000; }
            .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 10px; margin-bottom: 15px; }
            .header h2 { margin: 0; font-size: 18px; }
            .header p { margin: 4px 0 0 0; font-size: 12px; }
            .row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
            .label { color: #555; }
            .val { font-weight: bold; text-align: right; }
            .badge { display: inline-block; padding: 4px 10px; border: 1px solid #000; font-weight: bold; margin-top: 10px; }
            .footer { text-align: center; margin-top: 20px; border-top: 1px solid #ccc; padding-top: 10px; font-size: 11px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>POS SATPAM - BUKTI PAKET</h2>
            <p>Sistem Informasi Penerimaan Paket</p>
          </div>
          <div class="row"><span class="label">No. Paket / Resi:</span><span class="val">${packageData.nomor_paket}</span></div>
          <div class="row"><span class="label">Penerima:</span><span class="val">${packageData.nama_penerima}</span></div>
          <div class="row"><span class="label">Kurir:</span><span class="val">${packageData.kurir}</span></div>
          <div class="row"><span class="label">Tanggal Masuk:</span><span class="val">${packageData.tanggal_masuk} ${packageData.jam_masuk}</span></div>
          <div class="row"><span class="label">Status:</span><span class="val">${packageData.status}</span></div>
          ${packageData.tanggal_diambil ? `<div class="row"><span class="label">Tanggal Diambil:</span><span class="val">${packageData.tanggal_diambil} ${packageData.jam_diambil}</span></div>` : ''}
          ${packageData.catatan ? `<div class="row"><span class="label">Catatan:</span><span class="val">${packageData.catatan}</span></div>` : ''}
          <div style="text-align: center;">
            <div class="badge">${isCollected ? 'SUDAH DISERAHKAN' : 'MENUNGGU DIAMBIL'}</div>
          </div>
          <div class="footer">
            Dicetak pada: ${new Date().toLocaleString('id-ID')}<br/>
            Harap tunjukkan identitas saat mengambil paket.
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="bg-white border border-slate-200 text-slate-800 rounded-xl max-w-lg w-full shadow-xl relative my-8 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl border ${
                isCollected
                  ? 'bg-emerald-100 border-emerald-200 text-emerald-800'
                  : 'bg-amber-100 border-amber-200 text-amber-800'
              }`}
            >
              <PackageCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Detail Paket</h2>
              <p className="text-xs text-slate-500">Pos Satpam Penerimaan Barang</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Status Banner */}
          <div
            className={`p-4 rounded-xl border flex items-center justify-between ${
              isCollected
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}
          >
            <div className="flex items-center gap-3">
              {isCollected ? (
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 animate-bounce" />
              )}
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider block opacity-75">
                  Status Paket
                </span>
                <span className="text-base font-bold">{packageData.status}</span>
              </div>
            </div>

            {!isCollected && (
              <button
                type="button"
                onClick={() => onMarkAsCollected(packageData)}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 min-h-[40px]"
              >
                <CheckCircle className="w-4 h-4" />
                Ambil Paket
              </button>
            )}
          </div>

          {/* Photo Preview if available */}
          {packageData.foto_paket_dataurl ? (
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-blue-600" /> Foto Fisik Paket
                </span>
                <button
                  onClick={() => setShowPhotoMax(!showPhotoMax)}
                  className="text-xs text-blue-600 hover:underline font-semibold"
                >
                  {showPhotoMax ? 'Kecilkan' : 'Perbesar'}
                </button>
              </div>
              <div className="relative group overflow-hidden rounded-lg bg-slate-100 border border-slate-200 flex justify-center">
                <img
                  src={packageData.foto_paket_dataurl}
                  alt="Foto Paket"
                  className={`object-cover rounded-lg transition-all duration-300 ${
                    showPhotoMax ? 'max-h-96 w-full object-contain' : 'h-48 w-full object-cover'
                  }`}
                />
              </div>
            </div>
          ) : null}

          {/* Details Table */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200/80">
              <span className="text-xs font-medium text-slate-500">Nomor Paket / Resi</span>
              <span className="text-sm font-mono font-bold text-blue-600 tracking-wider">
                {packageData.nomor_paket}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-slate-500 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" /> Penerima / Pemilik
              </span>
              <span className="text-sm font-semibold text-slate-900">{packageData.nama_penerima}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-slate-500 flex items-center gap-2">
                <Truck className="w-4 h-4 text-slate-600" /> Ekspedisi / Kurir
              </span>
              <span className="text-xs font-bold bg-slate-200 text-slate-800 px-2.5 py-1 rounded-md">
                {packageData.kurir}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-slate-500 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-600" /> Waktu Masuk
              </span>
              <span className="text-xs font-medium text-slate-700">
                {packageData.tanggal_masuk} pukul {packageData.jam_masuk}
              </span>
            </div>

            {packageData.petugas_penerima && (
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-slate-500">Petugas Penerima</span>
                <span className="text-xs text-slate-700">{packageData.petugas_penerima}</span>
              </div>
            )}

            {isCollected && (
              <>
                <div className="flex justify-between items-center pt-2 border-t border-slate-200/80">
                  <span className="text-xs font-medium text-slate-500 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-600" /> Waktu Diambil
                  </span>
                  <span className="text-xs font-bold text-emerald-700">
                    {packageData.tanggal_diambil} pukul {packageData.jam_diambil}
                  </span>
                </div>
                {packageData.petugas_penyerah && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-slate-500">Petugas Penyerah</span>
                    <span className="text-xs text-slate-700">{packageData.petugas_penyerah}</span>
                  </div>
                )}
              </>
            )}

            {packageData.catatan && (
              <div className="pt-2 border-t border-slate-200/80">
                <span className="text-xs font-medium text-slate-500 flex items-center gap-2 mb-1">
                  <FileText className="w-4 h-4 text-amber-600" /> Catatan Tambahan
                </span>
                <p className="text-xs text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200 italic">
                  "{packageData.catatan}"
                </p>
              </div>
            )}
          </div>

          {/* Utilities Bar */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleShareWhatsApp}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold transition-colors min-h-[44px]"
            >
              <Share2 className="w-4 h-4" />
              Kirim WA Penerima
            </button>
            <button
              onClick={handlePrintSlip}
              className="flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors min-h-[44px]"
            >
              <Printer className="w-4 h-4" />
              Cetak Slip
            </button>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          {onDeletePackage ? (
            <button
              onClick={() => onDeletePackage(packageData)}
              className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1 px-3 py-2 hover:bg-rose-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" /> Hapus Data
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-medium text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-xl transition-colors min-h-[44px]"
            >
              Tutup
            </button>

            {!isCollected && (
              <button
                type="button"
                onClick={() => onMarkAsCollected(packageData)}
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors min-h-[44px]"
              >
                <CheckCircle className="w-4 h-4" />
                Tandai Sudah Diambil
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
