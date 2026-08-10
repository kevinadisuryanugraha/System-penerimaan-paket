export type PackageStatus = 'Menunggu' | 'Sudah Diambil';

export type CourierOption =
  | 'JNE'
  | 'J&T'
  | 'SiCepat'
  | 'Shopee Express'
  | 'Lazada'
  | 'Tokopedia'
  | 'Anteraja'
  | 'POS Indonesia'
  | 'Lainnya';

export interface Package {
  id: string;
  nomor_paket: string;
  nama_penerima: string;
  kurir: CourierOption | string;
  catatan?: string;
  foto_paket_id?: string; // IndexedDB key for photo blob
  foto_paket_dataurl?: string; // cached data URL for display
  status: PackageStatus;
  tanggal_masuk: string; // YYYY-MM-DD
  jam_masuk: string; // HH:mm
  tanggal_diambil?: string; // YYYY-MM-DD
  jam_diambil?: string; // HH:mm
  petugas_penerima?: string;
  petugas_penyerah?: string;
}

export interface UserSession {
  username: string;
  name: string;
  role: 'satpam';
  isLoggedIn: boolean;
}

export interface ScanResultValidation {
  isDuplicate: boolean;
  existingPackage?: Package;
}

export interface AuthCredentials {
  username: string;
  password: string;
}
