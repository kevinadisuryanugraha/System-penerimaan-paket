import React, { useState, useRef } from 'react';
import type { Package, CourierOption } from '../types';
import { PackageStorageService } from '../services/packageStorage';
import { ScannerCamera } from '../components/ScannerCamera';
import { DuplicatePackageModal } from '../components/DuplicatePackageModal';
import {
  QrCode,
  Keyboard,
  User,
  Truck,
  FileText,
  Save,
  Camera,
  X,
  Sparkles,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ScanViewProps {
  onPackageAdded: () => void;
  onViewPackageDetail: (pkg: Package) => void;
  showToast: (type: 'success' | 'error' | 'warning' | 'info', text: string) => void;
  guardName: string;
}

const COURIER_OPTIONS: CourierOption[] = [
  'JNE',
  'J&T',
  'SiCepat',
  'Shopee Express',
  'Lazada',
  'Tokopedia',
  'Anteraja',
  'POS Indonesia',
  'Lainnya',
];

export const ScanView: React.FC<ScanViewProps> = ({
  onPackageAdded,
  onViewPackageDetail,
  showToast,
  guardName,
}) => {
  const [activeMode, setActiveMode] = useState<'camera' | 'manual'>('camera');
  const [nomorPaket, setNomorPaket] = useState('');
  const [namaPenerima, setNamaPenerima] = useState('');
  const [kurir, setKurir] = useState<CourierOption>('Shopee Express');
  const [catatan, setCatatan] = useState('');
  const [fotoPaket, setFotoPaket] = useState<string>('');

  const [scannedSuccessfully, setScannedSuccessfully] = useState(false);
  const [duplicatePackage, setDuplicatePackage] = useState<Package | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleScanSuccess = async (decodedCode: string) => {
    const cleanCode = decodedCode.trim().toUpperCase();
    setNomorPaket(cleanCode);
    setScannedSuccessfully(true);

    if (cleanCode.startsWith('SPX')) setKurir('Shopee Express');
    else if (cleanCode.startsWith('JNT') || cleanCode.startsWith('JP')) setKurir('J&T');
    else if (cleanCode.startsWith('JNE')) setKurir('JNE');
    else if (cleanCode.startsWith('TKP')) setKurir('Tokopedia');
    else if (cleanCode.startsWith('SCP') || cleanCode.startsWith('00')) setKurir('SiCepat');

    const existing = await PackageStorageService.getPackageByNumber(cleanCode);
    if (existing) {
      setDuplicatePackage(existing);
      showToast('warning', 'Nomor paket ini sudah terdaftar di sistem.');
    } else {
      showToast('success', `Barcode berhasil dibaca: ${cleanCode}`);
    }
  };

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('error', 'Ukuran foto maksimal 5MB.');
      return;
    }

    // Compress image before storing
    const img = new Image();
    const reader = new FileReader();
    reader.onloadend = () => {
      img.src = reader.result as string;
    };
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const maxDim = 800;
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        const ratio = Math.min(maxDim / width, maxDim / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', 0.7);
        setFotoPaket(compressed);
        showToast('info', 'Foto kondisi paket berhasil diambil.');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResetScan = () => {
    setNomorPaket('');
    setScannedSuccessfully(false);
    setDuplicatePackage(null);
  };

  const handleNomorChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const clean = e.target.value.toUpperCase();
    setNomorPaket(clean);

    if (clean.length > 5) {
      setIsCheckingDuplicate(true);
      const existing = await PackageStorageService.getPackageByNumber(clean);
      if (existing) setDuplicatePackage(existing);
      else setDuplicatePackage(null);
      setIsCheckingDuplicate(false);
    } else {
      setDuplicatePackage(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nomorPaket.trim()) {
      showToast('error', 'Nomor paket / resi wajib diisi.');
      return;
    }

    if (!namaPenerima.trim()) {
      showToast('error', 'Nama pemilik / penerima paket wajib diisi.');
      return;
    }

    setIsSubmitting(true);

    const result = await PackageStorageService.addPackage({
      nomor_paket: nomorPaket,
      nama_penerima: namaPenerima,
      kurir: kurir,
      catatan: catatan,
      foto_paket_dataurl: fotoPaket || undefined,
      petugas_penerima: guardName,
    });

    setIsSubmitting(false);

    if (!result.success && result.existingPackage) {
      setDuplicatePackage(result.existingPackage);
      showToast('warning', result.message);
      return;
    }

    if (result.success && result.newPackage) {
      showToast('success', 'Paket berhasil diterima dan dicatat.');

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });

      onPackageAdded();

      setNomorPaket('');
      setNamaPenerima('');
      setCatatan('');
      setFotoPaket('');
      setScannedSuccessfully(false);
      setDuplicatePackage(null);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-24 md:pb-12">
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <QrCode className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 shrink-0" />
            <span>Scan & Catat Paket</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pindai barcode atau input resi manual untuk penerimaan paket oleh satpam
          </p>
        </div>

        <div className="flex items-center p-1 bg-slate-100 border border-slate-200 rounded-xl w-full sm:w-auto shrink-0">
          <button
            type="button"
            onClick={() => {
              setActiveMode('camera');
              setDuplicatePackage(null);
            }}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all min-h-[40px] ${
              activeMode === 'camera' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Scan Kamera</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveMode('manual');
              setDuplicatePackage(null);
            }}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all min-h-[40px] ${
              activeMode === 'manual' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Keyboard className="w-4 h-4" />
            <span>Input Manual</span>
          </button>
        </div>
      </div>

      {activeMode === 'camera' && !scannedSuccessfully && (
        <ScannerCamera
          onScanSuccess={handleScanSuccess}
          onSwitchToManual={() => setActiveMode('manual')}
        />
      )}

      {scannedSuccessfully && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl border border-emerald-200 shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">Barcode Terdeteksi:</span>
              <span className="text-lg font-mono font-bold text-slate-900">{nomorPaket}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleResetScan}
            className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 flex items-center gap-1 shrink-0 min-h-[40px] shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Scan Ulang
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Sparkles className="w-5 h-5 text-blue-600" />
          <h3 className="text-base font-bold text-slate-900">Formulir Data Paket</h3>
          {guardName && (
            <span className="ml-auto text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">Petugas: {guardName}</span>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Nomor Paket / Resi <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              required
              value={nomorPaket}
              onChange={handleNomorChange}
              placeholder="Contoh: SPX0123456789 atau JNE1122334"
              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl font-mono text-base font-bold text-blue-600 tracking-wider placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
            />
            {isCheckingDuplicate && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            {!isCheckingDuplicate && nomorPaket && (
              <button type="button" onClick={() => setNomorPaket('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">*Dapat terisi otomatis saat barcode/QR code berhasil dipindai kamera.</p>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Nama Pemilik / Penerima Paket <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <User className="w-5 h-5" />
            </div>
            <input
              type="text"
              required
              value={namaPenerima}
              onChange={(e) => setNamaPenerima(e.target.value)}
              placeholder="Masukkan nama lengkap pemilik paket"
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Sumber / Ekspedisi Kurir</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Truck className="w-5 h-5" />
            </div>
            <select
              value={kurir}
              onChange={(e) => setKurir(e.target.value as CourierOption)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold appearance-none"
            >
              {COURIER_OPTIONS.map((opt) => (
                <option key={opt} value={opt} className="bg-white text-slate-900">{opt}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Catatan Kondisi / Keterangan (Opsional)</label>
          <div className="relative">
            <div className="absolute top-3 left-3.5 pointer-events-none text-slate-400">
              <FileText className="w-5 h-5" />
            </div>
            <textarea
              rows={2}
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Contoh: Paket kardus besar, fragile/mudah pecah, basah, dll."
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Foto Kondisi Fisik Paket (Opsional)</label>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {fotoPaket ? (
              <div className="relative w-32 h-32 rounded-xl overflow-hidden border-2 border-blue-500 shrink-0 bg-slate-100">
                <img src={fotoPaket} alt="Preview Foto" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setFotoPaket('')}
                  className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-full hover:bg-rose-700"
                  title="Hapus foto"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full sm:w-auto px-5 py-3 bg-slate-50 hover:bg-slate-100 border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl text-slate-700 text-xs font-bold flex items-center justify-center gap-2 transition-colors min-h-[52px]"
              >
                <Camera className="w-5 h-5 text-blue-600" />
                <span>Ambil Foto Paket dengan Kamera</span>
              </button>
            )}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              capture="environment"
              onChange={handlePhotoCapture}
              className="hidden"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <button
            type="submit"
            disabled={isSubmitting || !nomorPaket.trim() || !namaPenerima.trim()}
            className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-base rounded-xl shadow-md shadow-blue-200 transition-all flex items-center justify-center gap-2 active:scale-98 min-h-[52px]"
          >
            <Save className="w-5 h-5" />
            <span>{isSubmitting ? 'Menyimpan Paket...' : 'Simpan Data Paket'}</span>
          </button>
        </div>
      </form>

      <DuplicatePackageModal
        isOpen={!!duplicatePackage}
        packageData={duplicatePackage}
        onViewDetail={(pkg) => {
          setDuplicatePackage(null);
          onViewPackageDetail(pkg);
        }}
        onCancel={() => setDuplicatePackage(null)}
      />
    </div>
  );
};
