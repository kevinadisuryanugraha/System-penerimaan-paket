import { useState, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import type { UserSession, Package } from './types';
import { AuthService } from './services/authService';
import { PackageStorageService, seedInitialData } from './services/packageStorage';
import { ToastContainer, type ToastMessage } from './components/Toast';
import { ConfirmModal } from './components/ConfirmModal';
import { PackageDetailModal } from './components/PackageDetailModal';
import { Navigation } from './components/Navigation';

import { LoginView } from './views/LoginView';
import { DashboardView } from './views/DashboardView';
import { ScanView } from './views/ScanView';
import { PackageListView } from './views/PackageListView';
import { HistoryView } from './views/HistoryView';

function AppContent() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Modals state
  const [selectedPackageForDetail, setSelectedPackageForDetail] = useState<Package | null>(null);
  const [packageToConfirmCollect, setPackageToConfirmCollect] = useState<Package | null>(null);
  const [packageToDelete, setPackageToDelete] = useState<Package | null>(null);

  // Toast notifications state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Initialize session & load packages
  useEffect(() => {
    const init = async () => {
      const session = AuthService.getCurrentUser();
      if (session && session.isLoggedIn) {
        setCurrentUser(session);
        await seedInitialData(session.name);
      }
      setIsInitialized(true);
      setIsLoading(false);
    };
    init();
  }, []);

  const refreshPackagesList = useCallback(async () => {
    const list = await PackageStorageService.getAllPackages();
    setPackages(list);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      refreshPackagesList();
    }
  }, [isInitialized, refreshPackagesList]);

  const showToast = useCallback((type: 'success' | 'error' | 'warning' | 'info', text: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, text }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const handleDismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const handleLoginSuccess = useCallback(async (user: UserSession) => {
    setCurrentUser(user);
    await seedInitialData(user.name);
    setIsInitialized(true);
    navigate('/dashboard');
  }, [navigate]);

  const handleLogout = useCallback(() => {
    AuthService.logout();
    setCurrentUser(null);
    showToast('info', 'Anda telah berhasil keluar dari sistem.');
    navigate('/login');
  }, [navigate, showToast]);

  const handleConfirmMarkCollected = useCallback(async () => {
    if (!packageToConfirmCollect) return;

    const result = await PackageStorageService.markAsCollected(
      packageToConfirmCollect.id,
      currentUser?.name || 'Satpam'
    );
    if (result.success) {
      showToast('success', 'Paket berhasil ditandai sudah diambil.');
      await refreshPackagesList();

      if (selectedPackageForDetail?.id === packageToConfirmCollect.id && result.package) {
        setSelectedPackageForDetail(result.package);
      }
    } else {
      showToast('error', result.message);
    }

    setPackageToConfirmCollect(null);
  }, [packageToConfirmCollect, currentUser, selectedPackageForDetail, showToast, refreshPackagesList]);

  const handleConfirmDeletePackage = useCallback(async () => {
    if (!packageToDelete) return;

    const result = await PackageStorageService.deletePackage(packageToDelete.id);
    if (result.success) {
      showToast('success', result.message);
      await refreshPackagesList();

      if (selectedPackageForDetail?.id === packageToDelete.id) {
        setSelectedPackageForDetail(null);
      }
    } else {
      showToast('error', result.message);
    }

    setPackageToDelete(null);
  }, [packageToDelete, selectedPackageForDetail, showToast, refreshPackagesList]);

  if (!isInitialized && isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-500 font-medium">Memuat sistem...</p>
        </div>
      </div>
    );
  }

  // If user is not authenticated, display Login screen
  if (!currentUser || !currentUser.isLoggedIn) {
    return (
      <>
        <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
        <Routes>
          <Route path="*" element={<LoginView onLoginSuccess={handleLoginSuccess} showToast={showToast} />} />
        </Routes>
      </>
    );
  }

  const waitingCount = packages.filter((p) => p.status === 'Menunggu').length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row antialiased">
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />

      <Navigation currentUser={currentUser} onLogout={handleLogout} waitingCount={waitingCount} />

      <main className="flex-1 p-3 sm:p-6 md:p-8 max-w-6xl mx-auto w-full min-w-0 overflow-x-hidden">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route
            path="/dashboard"
            element={
              <DashboardView
                packages={packages}
                onNavigateToScan={() => navigate('/scan')}
                onNavigateToList={() => navigate('/paket')}
                onSelectPackage={(pkg) => setSelectedPackageForDetail(pkg)}
                onMarkCollected={(pkg) => setPackageToConfirmCollect(pkg)}
                isLoading={isLoading}
              />
            }
          />
          <Route
            path="/scan"
            element={
              <ScanView
                onPackageAdded={async () => {
                  await refreshPackagesList();
                }}
                onViewPackageDetail={(pkg) => setSelectedPackageForDetail(pkg)}
                showToast={showToast}
                guardName={currentUser.name}
              />
            }
          />
          <Route
            path="/paket"
            element={
              <PackageListView
                packages={packages}
                onSelectPackage={(pkg) => setSelectedPackageForDetail(pkg)}
                onMarkCollected={(pkg) => setPackageToConfirmCollect(pkg)}
                onDeletePackage={(pkg) => setPackageToDelete(pkg)}
                onNavigateToScan={() => navigate('/scan')}
                isLoading={isLoading}
              />
            }
          />
          <Route
            path="/riwayat"
            element={
              <HistoryView
                packages={packages}
                onSelectPackage={(pkg) => setSelectedPackageForDetail(pkg)}
                isLoading={isLoading}
              />
            }
          />
        </Routes>
      </main>

      <PackageDetailModal
        isOpen={!!selectedPackageForDetail}
        packageData={selectedPackageForDetail}
        onClose={() => setSelectedPackageForDetail(null)}
        onMarkAsCollected={(pkg) => setPackageToConfirmCollect(pkg)}
        onDeletePackage={(pkg) => setPackageToDelete(pkg)}
      />

      <ConfirmModal
        isOpen={!!packageToConfirmCollect}
        title="Konfirmasi Pengambilan Paket"
        message={`Apakah paket resi "${packageToConfirmCollect?.nomor_paket}" ini benar sudah diambil oleh ${packageToConfirmCollect?.nama_penerima}?`}
        confirmLabel="Ya, Sudah Diambil"
        cancelLabel="Batal"
        variant="success"
        onConfirm={handleConfirmMarkCollected}
        onCancel={() => setPackageToConfirmCollect(null)}
      />

      <ConfirmModal
        isOpen={!!packageToDelete}
        title="Konfirmasi Hapus Paket"
        message={`Apakah Anda yakin ingin menghapus data paket resi "${packageToDelete?.nomor_paket}" atas nama ${packageToDelete?.nama_penerima}? Action ini tidak dapat dibatalkan.`}
        confirmLabel="Ya, Hapus Data"
        cancelLabel="Batal"
        variant="danger"
        onConfirm={handleConfirmDeletePackage}
        onCancel={() => setPackageToDelete(null)}
      />
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
}
