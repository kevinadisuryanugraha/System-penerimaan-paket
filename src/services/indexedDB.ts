import { openDB, type IDBPDatabase } from 'idb';
import type { Package } from '../types';

const DB_NAME = 'paket-satpam-db';
const DB_VERSION = 1;
const PACKAGES_STORE = 'packages';
const PHOTOS_STORE = 'photos';
const SETTINGS_STORE = 'settings';

interface PhotoRecord {
  id: string;
  blob: Blob;
  timestamp: number;
}

let dbInstance: IDBPDatabase | null = null;

async function getDB(): Promise<IDBPDatabase> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(PACKAGES_STORE)) {
        const store = db.createObjectStore(PACKAGES_STORE, { keyPath: 'id' });
        store.createIndex('nomor_paket', 'nomor_paket', { unique: true });
        store.createIndex('status', 'status');
        store.createIndex('tanggal_masuk', 'tanggal_masuk');
      }
      if (!db.objectStoreNames.contains(PHOTOS_STORE)) {
        db.createObjectStore(PHOTOS_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(SETTINGS_STORE)) {
        db.createObjectStore(SETTINGS_STORE, { keyPath: 'key' });
      }
    },
  });

  return dbInstance;
}

// === Package Operations ===

export async function getAllPackages(): Promise<Package[]> {
  const db = await getDB();
  const pkgs = await db.getAll(PACKAGES_STORE);
  return pkgs.sort((a, b) => {
    const dateTimeA = `${a.tanggal_masuk} ${a.jam_masuk}`;
    const dateTimeB = `${b.tanggal_masuk} ${b.jam_masuk}`;
    return dateTimeB.localeCompare(dateTimeA);
  });
}

export async function getPackageById(id: string): Promise<Package | undefined> {
  const db = await getDB();
  return db.get(PACKAGES_STORE, id);
}

export async function getPackageByNumber(nomorPaket: string): Promise<Package | undefined> {
  const db = await getDB();
  const cleanNumber = nomorPaket.trim().toUpperCase();
  return db.getFromIndex(PACKAGES_STORE, 'nomor_paket', cleanNumber);
}

export async function addPackage(pkg: Package): Promise<Package> {
  const db = await getDB();
  await db.add(PACKAGES_STORE, pkg);
  return pkg;
}

export async function updatePackage(id: string, updates: Partial<Package>): Promise<Package | undefined> {
  const db = await getDB();
  const existing = await db.get(PACKAGES_STORE, id);
  if (!existing) return undefined;

  const updated: Package = { ...existing, ...updates };
  await db.put(PACKAGES_STORE, updated);
  return updated;
}

export async function deletePackage(id: string): Promise<boolean> {
  const db = await getDB();
  const existing = await db.get(PACKAGES_STORE, id);
  if (!existing) return false;

  // Also delete associated photo
  if (existing.foto_paket_id) {
    await deletePhoto(existing.foto_paket_id);
  }

  await db.delete(PACKAGES_STORE, id);
  return true;
}

export async function getStatistics() {
  const packages = await getAllPackages();
  const today = getTodayString();

  const total = packages.length;
  const waiting = packages.filter((p) => p.status === 'Menunggu').length;
  const collected = packages.filter((p) => p.status === 'Sudah Diambil').length;
  const todayCount = packages.filter((p) => p.tanggal_masuk === today).length;

  return { total, waiting, collected, todayCount };
}

// === Photo Operations ===

export async function storePhoto(id: string, dataUrl: string): Promise<void> {
  const db = await getDB();
  const response = await fetch(dataUrl);
  const blob = await response.blob();

  const record: PhotoRecord = {
    id,
    blob,
    timestamp: Date.now(),
  };

  await db.put(PHOTOS_STORE, record);
}

export async function getPhoto(id: string): Promise<string | null> {
  const db = await getDB();
  const record = await db.get(PHOTOS_STORE, id) as PhotoRecord | undefined;
  if (!record) return null;

  return URL.createObjectURL(record.blob);
}

export async function deletePhoto(id: string): Promise<void> {
  const db = await getDB();
  await db.delete(PHOTOS_STORE, id);
}

// === Settings Operations ===

export async function getSetting(key: string): Promise<string | null> {
  const db = await getDB();
  const record = await db.get(SETTINGS_STORE, key) as { key: string; value: string } | undefined;
  return record?.value ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const db = await getDB();
  await db.put(SETTINGS_STORE, { key, value });
}

// === Seed Data ===

let seedingInProgress = false;

export async function seedInitialData(guardName: string): Promise<void> {
  if (seedingInProgress) return;
  
  const db = await getDB();
  const count = await db.count(PACKAGES_STORE);
  if (count > 0) return; // Don't seed if data exists
  
  seedingInProgress = true;

  const today = getTodayString();
  const yesterday = getTodayString(-1);
  const twoDaysAgo = getTodayString(-2);

  const seedPackages: Package[] = [
    {
      id: 'pkg-1',
      nomor_paket: 'SPX998877665',
      nama_penerima: 'Ahmad Fauzan',
      kurir: 'Shopee Express',
      catatan: 'Kotak kardus sedang, rapuh/fragile',
      status: 'Menunggu',
      tanggal_masuk: today,
      jam_masuk: '08:15',
      petugas_penerima: guardName,
    },
    {
      id: 'pkg-2',
      nomor_paket: 'JNT102938475',
      nama_penerima: 'Ustadz Abdullah',
      kurir: 'J&T',
      catatan: 'Buku pelajaran & dokumen penting',
      status: 'Menunggu',
      tanggal_masuk: today,
      jam_masuk: '09:30',
      petugas_penerima: guardName,
    },
    {
      id: 'pkg-3',
      nomor_paket: 'JNE112233445',
      nama_penerima: 'Muhammad Rizky',
      kurir: 'JNE',
      catatan: 'Paket pakaian santri',
      status: 'Sudah Diambil',
      tanggal_masuk: yesterday,
      jam_masuk: '11:20',
      tanggal_diambil: today,
      jam_diambil: '14:05',
      petugas_penerima: guardName,
      petugas_penyerah: guardName,
    },
    {
      id: 'pkg-4',
      nomor_paket: 'SCP887766554',
      nama_penerima: 'Siti Nurhaliza',
      kurir: 'SiCepat',
      catatan: 'Perlengkapan sekolah',
      status: 'Menunggu',
      tanggal_masuk: today,
      jam_masuk: '10:45',
      petugas_penerima: guardName,
    },
    {
      id: 'pkg-5',
      nomor_paket: 'TKP332211009',
      nama_penerima: 'Budi Santoso',
      kurir: 'Tokopedia',
      catatan: 'Peralatan elektronik kecil',
      status: 'Sudah Diambil',
      tanggal_masuk: twoDaysAgo,
      jam_masuk: '13:10',
      tanggal_diambil: yesterday,
      jam_diambil: '16:30',
      petugas_penerima: guardName,
      petugas_penyerah: guardName,
    },
  ];

  try {
    const tx = db.transaction(PACKAGES_STORE, 'readwrite');
    for (const pkg of seedPackages) {
      await tx.store.add(pkg);
    }
    await tx.done;
  } catch (err) {
    console.error('Failed to seed initial data:', err);
    // If seeding fails (e.g., race condition duplicate key), it's non-fatal
  } finally {
    seedingInProgress = false;
  }
}

// === Helpers ===

export function getTodayString(offsetDays = 0): string {
  const date = new Date();
  if (offsetDays !== 0) {
    date.setDate(date.getDate() + offsetDays);
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getCurrentTimeString(): string {
  const date = new Date();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}
