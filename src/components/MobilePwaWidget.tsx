import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Download, Smartphone, X, Check, Package } from 'lucide-react';

interface MobilePwaWidgetProps {
  waitingCount: number;
  onNavigateToScan?: () => void;
  onNavigateToList?: () => void;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const MobilePwaWidget: React.FC<MobilePwaWidgetProps> = ({
  waitingCount,
  onNavigateToScan,
  onNavigateToList,
}) => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState<boolean>(false);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [showIosGuide, setShowIosGuide] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone) {
      setIsInstalled(true);
      setShowInstallBanner(false);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setShowInstallBanner(false);
      }
      setDeferredPrompt(null);
    } else {
      const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as Window & { MSStream?: unknown }).MSStream;
      if (isIos) {
        setShowIosGuide(true);
      } else {
        alert('Untuk menginstall: Buka menu browser (titik tiga) lalu pilih "Tambahkan ke Layar Utama" / "Install App".');
      }
    }
  };

  return (
    <div className="space-y-3 mb-6">
      {!isOnline && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-800 text-xs flex items-center justify-between gap-2 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2 font-medium">
            <WifiOff className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Mode Offline Active - Anda masih bisa melihat data paket tersimpan.</span>
          </div>
          <span className="text-[10px] font-bold uppercase bg-amber-200/60 text-amber-900 px-2 py-0.5 rounded">Offline</span>
        </div>
      )}

      {showInstallBanner && !isInstalled && (
        <div className="p-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-md flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-white/20 rounded-lg shrink-0"><Smartphone className="w-5 h-5 text-white" /></div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold truncate">Install Aplikasi Satpam (PWA)</h4>
              <p className="text-[11px] text-blue-100 truncate">Akses cepat langsung dari layar utama HP</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button type="button" onClick={() => void handleInstallClick()} className="px-3 py-1.5 bg-white text-blue-700 text-xs font-bold rounded-lg shadow-xs hover:bg-blue-50 flex items-center gap-1 active:scale-95 transition-all min-h-[36px]"><Download className="w-3.5 h-3.5" /><span>Install</span></button>
            <button type="button" onClick={() => setShowInstallBanner(false)} className="p-1.5 text-blue-200 hover:text-white rounded-lg" title="Tutup"><X className="w-4 h-4" /></button>
          </div>
        </div>
      )}

      {showIosGuide && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 text-slate-800 shadow-xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2"><Smartphone className="w-4 h-4 text-blue-600" /> Panduan Install di iPhone/iPad</h3>
              <button onClick={() => setShowIosGuide(false)} className="text-slate-400 hover:text-slate-700 p-1"><X className="w-4 h-4" /></button>
            </div>
            <ol className="text-xs space-y-2.5 text-slate-600 list-decimal list-inside">
              <li>Ketuk tombol <strong className="text-slate-900">Bagikan (Share)</strong> di bagian bawah browser Safari.</li>
              <li>Gulir ke bawah lalu pilih menu <strong className="text-slate-900">"Tambahkan ke Layar Utama" (Add to Home Screen)</strong>.</li>
              <li>Ketuk <strong className="text-slate-900">Tambah</strong> di sudut kanan atas.</li>
            </ol>
            <button onClick={() => setShowIosGuide(false)} className="w-full py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-xs">Mengerti</button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl shadow-2xs font-medium text-slate-700">
          {isOnline ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <Wifi className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-[11px] font-semibold text-slate-700">PWA Online</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <WifiOff className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-[11px] font-semibold text-amber-800">Mode Offline</span>
            </>
          )}
        </div>

        {waitingCount > 0 ? (
          <button type="button" onClick={onNavigateToList} className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl shadow-2xs font-bold text-[11px] hover:bg-amber-100 transition-colors">
            <Package className="w-3.5 h-3.5 text-amber-600" /><span>{waitingCount} Paket Belum Diambil</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl shadow-2xs font-semibold text-[11px]">
            <Check className="w-3.5 h-3.5 text-emerald-600" /><span>Semua Paket Selesai</span>
          </div>
        )}
      </div>
    </div>
  );
};
