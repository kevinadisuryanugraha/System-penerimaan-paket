import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats, type CameraDevice, type Html5QrcodeCameraScanConfig } from 'html5-qrcode';
import { Camera, RefreshCw, AlertCircle, Zap, Sparkles } from 'lucide-react';
import { playBeepSuccess } from '../utils/audio';

interface ScannerCameraProps {
  onScanSuccess: (decodedText: string) => void;
  onSwitchToManual: () => void;
}

// Extended interface for torch support
// Extended type for torch/flashlight support
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Html5QrcodeWithTorch = Html5Qrcode & {
  applyVideoConstraints?: (videoConstraints: MediaTrackConstraints) => Promise<void>;
};

export const ScannerCamera: React.FC<ScannerCameraProps> = ({
  onScanSuccess,
  onSwitchToManual,
}) => {
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [isTorchOn, setIsTorchOn] = useState<boolean>(false);
  const [hasTorchSupport, setHasTorchSupport] = useState<boolean>(false);

  const html5QrcodeRef = useRef<Html5QrcodeWithTorch | null>(null);
  const scannerContainerId = 'satpam-qr-reader-container';

  const sampleBarcodes = [
    { label: 'Shopee Express', code: 'SPX998877665' },
    { label: 'J&T Express', code: 'JNT102938475' },
    { label: 'JNE Reguler', code: 'JNE112233445' },
    { label: 'SiCepat Halu', code: 'SCP887766554' },
    { label: 'Tokopedia', code: 'TKP332211009' },
  ];

  useEffect(() => {
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length > 0) {
          setCameras(devices);
          const backCam = devices.find(
            (d) =>
              d.label.toLowerCase().includes('back') ||
              d.label.toLowerCase().includes('rear') ||
              d.label.toLowerCase().includes('environment')
          );
          setSelectedCameraId(backCam ? backCam.id : devices[0].id);
        } else {
          setCameraError('Kamera tidak ditemukan di perangkat ini.');
        }
      })
      .catch(() => {
        setCameraError('Akses kamera ditolak atau tidak tersedia. Silakan izinkan akses kamera atau gunakan Input Manual.');
      });

    return () => {
      void stopScanning();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopScanning = async () => {
    if (html5QrcodeRef.current && html5QrcodeRef.current.isScanning) {
      try {
        await html5QrcodeRef.current.stop();
        html5QrcodeRef.current.clear();
      } catch {
        // ignore cleanup errors
      }
    }
    setIsScanning(false);
    setIsTorchOn(false);
  };

  const startScanning = async (cameraIdToUse?: string) => {
    setCameraError(null);
    const targetCameraId = cameraIdToUse || selectedCameraId;

    if (!targetCameraId && cameras.length === 0) {
      setCameraError('Kamera tidak dapat digunakan. Silakan izinkan akses kamera atau gunakan Input Manual.');
      return;
    }

    try {
      if (html5QrcodeRef.current) {
        await stopScanning();
      }

      const html5Qrcode = new Html5Qrcode(scannerContainerId, {
        formatsToSupport: [
          Html5QrcodeSupportedFormats.QR_CODE,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
        ],
        verbose: false,
      }) as Html5QrcodeWithTorch;

      html5QrcodeRef.current = html5Qrcode;

      const config: Html5QrcodeCameraScanConfig = {
        fps: 10,
        qrbox: { width: 280, height: 160 },
        aspectRatio: 1.0,
      };

      const cameraParam: string | MediaTrackConstraints = targetCameraId || { facingMode: 'environment' };

      await html5Qrcode.start(
        cameraParam,
        config,
        (decodedText: string) => {
          playBeepSuccess();
          void stopScanning();
          onScanSuccess(decodedText.trim());
        },
        () => {
          // ignore scan frame errors
        }
      );

      setIsScanning(true);

      // Check torch capability via media stream track
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        const track = stream.getVideoTracks()[0];
        if (track) {
          const capabilities = track.getCapabilities();
          if (capabilities && 'torch' in capabilities) {
            setHasTorchSupport(true);
          }
          // Stop the temporary stream
          track.stop();
        }
      } catch {
        setHasTorchSupport(false);
      }
    } catch {
      setIsScanning(false);
      setCameraError('Kamera tidak dapat digunakan. Silakan izinkan akses kamera pada browser Anda atau gunakan Input Manual.');
    }
  };

  const toggleTorch = async () => {
    if (!html5QrcodeRef.current || !hasTorchSupport) return;
    try {
      const nextState = !isTorchOn;
      if (typeof html5QrcodeRef.current.applyVideoConstraints === 'function') {
        await html5QrcodeRef.current.applyVideoConstraints({
          advanced: [{ torch: nextState } as MediaTrackConstraintSet],
        } as MediaTrackConstraints);
      }
      setIsTorchOn(nextState);
    } catch {
      // Torch toggle failed silently
    }
  };

  const handleSimulatedScan = (code: string) => {
    playBeepSuccess();
    onScanSuccess(code);
  };

  return (
    <div className="space-y-4">
      <div className="relative bg-slate-950 border-2 border-dashed border-slate-700 rounded-2xl overflow-hidden shadow-2xl min-h-[320px] flex flex-col items-center justify-center">
        <div id={scannerContainerId} className="w-full h-full max-w-md mx-auto overflow-hidden"></div>

        {!isScanning && !cameraError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-950/90 z-10 space-y-4">
            <div className="p-4 bg-blue-600/20 text-blue-400 rounded-2xl border border-blue-500/30">
              <Camera className="w-10 h-10 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Kamera Siap Pemindaian</h3>
              <p className="text-xs text-slate-400 max-w-xs mt-1">
                Arahkan kamera ke Barcode (Code 128) atau QR Code pada paket untuk membaca nomor resi secara otomatis.
              </p>
            </div>
            <button
              onClick={() => void startScanning()}
              className="px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2 min-h-[48px] active:scale-95"
            >
              <Camera className="w-5 h-5" />
              Mulai Scan Kamera
            </button>
          </div>
        )}

        {cameraError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-950/95 z-20 space-y-4">
            <div className="p-4 bg-rose-500/20 text-rose-400 rounded-2xl border border-rose-500/30">
              <AlertCircle className="w-10 h-10" />
            </div>
            <div className="max-w-xs">
              <h3 className="text-base font-bold text-white">Akses Kamera Terkendala</h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">{cameraError}</p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={() => void startScanning()}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 min-h-[44px]"
              >
                <RefreshCw className="w-4 h-4" /> Coba Lagi
              </button>
              <button
                onClick={onSwitchToManual}
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl shadow transition-colors min-h-[44px]"
              >
                Gunakan Input Manual
              </button>
            </div>
          </div>
        )}

        {isScanning && (
          <div className="absolute inset-x-0 bottom-4 z-20 flex items-center justify-center gap-3 px-4">
            {cameras.length > 1 && (
              <button
                onClick={() => {
                  const currentIndex = cameras.findIndex((c) => c.id === selectedCameraId);
                  const nextIndex = (currentIndex + 1) % cameras.length;
                  const nextCamId = cameras[nextIndex].id;
                  setSelectedCameraId(nextCamId);
                  void startScanning(nextCamId);
                }}
                className="p-3 bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl backdrop-blur-md shadow-lg min-h-[44px] flex items-center gap-1 text-xs font-semibold"
                title="Ganti Kamera"
              >
                <RefreshCw className="w-4 h-4" /> Ganti Kamera
              </button>
            )}

            {hasTorchSupport && (
              <button
                onClick={() => void toggleTorch()}
                className={`p-3 rounded-xl border backdrop-blur-md shadow-lg min-h-[44px] flex items-center gap-1 text-xs font-semibold transition-colors ${
                  isTorchOn ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold' : 'bg-slate-900/90 text-slate-200 border-slate-700 hover:bg-slate-800'
                }`}
              >
                <Zap className="w-4 h-4" /> Senter
              </button>
            )}

            <button
              onClick={() => void stopScanning()}
              className="px-4 py-3 bg-rose-600/90 hover:bg-rose-600 text-white text-xs font-bold rounded-xl backdrop-blur-md shadow-lg min-h-[44px]"
            >
              Hentikan
            </button>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
        <div className="flex items-center gap-2 mb-1.5">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Simulasi Scan Cepat (Pengujian Tanpa Fisik Paket)
          </span>
        </div>
        <p className="text-xs text-slate-500 mb-3">
          Klik salah satu contoh resi di bawah ini jika Anda ingin menguji proses pemindaian tanpa memegang paket fisik:
        </p>
        <div className="flex flex-wrap gap-2">
          {sampleBarcodes.map((sample) => (
            <button
              key={sample.code}
              type="button"
              onClick={() => handleSimulatedScan(sample.code)}
              className="px-3 py-2 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 border border-slate-200 rounded-lg text-xs font-mono text-slate-700 transition-all flex items-center gap-1.5 active:scale-95 shadow-2xs"
            >
              <span className="text-blue-600 font-bold">{sample.label}:</span>
              <span>{sample.code}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
