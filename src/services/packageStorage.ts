import type { Package, CourierOption } from '../types';
import {
  getAllPackages,
  getPackageByNumber,
  addPackage,
  updatePackage,
  deletePackage,
  getStatistics,
  getTodayString,
  getCurrentTimeString,
  storePhoto,
  getPhoto,
  seedInitialData,
} from './indexedDB';

export { getTodayString, getCurrentTimeString, seedInitialData };

export class PackageStorageService {
  static async getAllPackages(): Promise<Package[]> {
    return getAllPackages();
  }

  static async getPackageById(id: string): Promise<Package | undefined> {
    return (await getAllPackages()).find((p) => p.id === id);
  }

  static async getPackageByNumber(nomorPaket: string): Promise<Package | undefined> {
    return getPackageByNumber(nomorPaket);
  }

  static async addPackage(input: {
    nomor_paket: string;
    nama_penerima: string;
    kurir: CourierOption | string;
    catatan?: string;
    foto_paket_dataurl?: string;
    petugas_penerima?: string;
  }): Promise<{ success: boolean; existingPackage?: Package; newPackage?: Package; message: string }> {
    const cleanNumber = input.nomor_paket.trim().toUpperCase();

    // Check duplicate
    const existing = await getPackageByNumber(cleanNumber);
    if (existing) {
      return {
        success: false,
        existingPackage: existing,
        message: 'Paket dengan nomor ini sudah terdaftar.',
      };
    }

    // Handle photo storage
    let fotoId: string | undefined;
    if (input.foto_paket_dataurl) {
      fotoId = `photo-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      await storePhoto(fotoId, input.foto_paket_dataurl);
    }

    const newPackage: Package = {
      id: `pkg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      nomor_paket: cleanNumber,
      nama_penerima: input.nama_penerima.trim(),
      kurir: input.kurir || 'Lainnya',
      catatan: input.catatan?.trim() || '',
      foto_paket_id: fotoId,
      foto_paket_dataurl: input.foto_paket_dataurl,
      status: 'Menunggu',
      tanggal_masuk: getTodayString(),
      jam_masuk: getCurrentTimeString(),
      petugas_penerima: input.petugas_penerima || 'Satpam',
    };

    await addPackage(newPackage);

    return {
      success: true,
      newPackage,
      message: 'Paket berhasil diterima dan dicatat.',
    };
  }

  static async markAsCollected(
    id: string,
    petugasPenyerah = 'Satpam'
  ): Promise<{ success: boolean; package?: Package; message: string }> {
    const updated = await updatePackage(id, {
      status: 'Sudah Diambil',
      tanggal_diambil: getTodayString(),
      jam_diambil: getCurrentTimeString(),
      petugas_penyerah: petugasPenyerah,
    });

    if (!updated) {
      return { success: false, message: 'Data paket tidak ditemukan.' };
    }

    // Reload photo data URL if available
    if (updated.foto_paket_id) {
      const dataUrl = await getPhoto(updated.foto_paket_id);
      if (dataUrl) {
        updated.foto_paket_dataurl = dataUrl;
      }
    }

    return {
      success: true,
      package: updated,
      message: 'Paket berhasil ditandai sudah diambil.',
    };
  }

  static async updatePackageData(
    id: string,
    updates: Partial<Package>
  ): Promise<{ success: boolean; package?: Package; message: string }> {
    // Check if updating nomor_paket to another existing package's number
    if (updates.nomor_paket) {
      const cleanNum = updates.nomor_paket.trim().toUpperCase();
      const existing = await getPackageByNumber(cleanNum);
      if (existing && existing.id !== id) {
        return {
          success: false,
          message: 'Nomor paket ini sudah digunakan oleh paket lain.',
        };
      }
      updates.nomor_paket = cleanNum;
    }

    const updated = await updatePackage(id, updates);
    if (!updated) {
      return { success: false, message: 'Data paket tidak ditemukan.' };
    }

    return {
      success: true,
      package: updated,
      message: 'Data paket berhasil diperbarui.',
    };
  }

  static async deletePackage(id: string): Promise<{ success: boolean; message: string }> {
    const success = await deletePackage(id);
    if (!success) {
      return { success: false, message: 'Data paket tidak ditemukan.' };
    }
    return { success: true, message: 'Data paket berhasil dihapus.' };
  }

  static async getStatistics() {
    return getStatistics();
  }
}
