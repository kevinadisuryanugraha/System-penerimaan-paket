import React, { useState } from 'react';
import { Shield, Lock, User, CheckCircle2, ArrowRight, Settings, X, Save } from 'lucide-react';
import { AuthService } from '../services/authService';
import type { UserSession } from '../types';

interface LoginViewProps {
  onLoginSuccess: (user: UserSession) => void;
  showToast: (type: 'success' | 'error' | 'warning', text: string) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess, showToast }) => {
  const [username, setUsername] = useState('satpam');
  const [password, setPassword] = useState('123456');
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Change Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await AuthService.login(username, password);
      if (result.success && result.user) {
        showToast('success', result.message);
        onLoginSuccess(result.user);
      } else {
        showToast('error', result.message);
      }
    } catch {
      showToast('error', 'Terjadi kesalahan saat login.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsChangingPassword(true);

    try {
      const result = await AuthService.changePassword(currentPassword, newUsername, newPassword);
      if (result.success) {
        showToast('success', result.message);
        setShowSettings(false);
        setCurrentPassword('');
        setNewUsername('');
        setNewPassword('');
        // Auto-fill new credentials for login
        setUsername(newUsername);
        setPassword(newPassword);
      } else {
        showToast('error', result.message);
      }
    } catch {
      showToast('error', 'Terjadi kesalahan saat mengubah kredensial.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const [showCredentials, setShowCredentials] = useState(true);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-100 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs relative z-10">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex p-4 bg-blue-600 text-white rounded-xl shadow-md shadow-blue-200 mb-4">
            <Shield className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Sistem Penerimaan Paket</h1>
          <p className="text-xs text-slate-500 mt-1">Portal Khusus Petugas Keamanan / Satpam</p>
        </div>

        {/* Login Form */}
        {!showSettings ? (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Username</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Masukkan username"
                    className="w-full pl-11 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan password"
                    className="w-full pl-11 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-200 transition-all flex items-center justify-center gap-2 min-h-[48px] active:scale-98 disabled:opacity-50 mt-2"
              >
                {isLoading ? (
                  <span className="text-sm font-semibold">Memproses Login...</span>
                ) : (
                  <>
                    <span className="text-sm font-bold">Masuk ke Sistem</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            {/* Credentials Info */}
            <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Kredensial Sistem
                </span>
                <button
                  type="button"
                  onClick={() => setShowCredentials(!showCredentials)}
                  className="text-xs text-blue-600 hover:text-blue-700 font-bold underline"
                >
                  {showCredentials ? 'Sembunyikan' : 'Tampilkan'}
                </button>
              </div>
              {showCredentials && (
                <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-white p-2.5 rounded-lg border border-slate-200 text-slate-700">
                  <div>
                    <span className="text-slate-400 block">Username:</span>
                    <span className="font-bold text-slate-900">{username || 'satpam'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Password:</span>
                    <span className="font-bold text-slate-900">{password || '123456'}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Settings Button */}
            <button
              type="button"
              onClick={() => setShowSettings(true)}
              className="mt-4 w-full py-2.5 px-4 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              <Settings className="w-4 h-4" /> Ubah Username & Password
            </button>
          </>
        ) : (
          /* Change Password Form */
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="text-center mb-4">
              <h3 className="text-lg font-bold text-slate-900">Ubah Kredensial</h3>
              <p className="text-xs text-slate-500">Ganti username & password untuk login</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Password Saat Ini</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Masukkan password saat ini"
                  className="w-full pl-11 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Username Baru</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  required
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="Masukkan username baru"
                  className="w-full pl-11 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Password Baru</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 4 karakter"
                  className="w-full pl-11 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium transition-all"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowSettings(false)}
                className="flex-1 py-3 px-4 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center justify-center gap-1.5 min-h-[48px]"
              >
                <X className="w-4 h-4" /> Batal
              </button>
              <button
                type="submit"
                disabled={isChangingPassword}
                className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-200 transition-all flex items-center justify-center gap-1.5 min-h-[48px] disabled:opacity-50"
              >
                {isChangingPassword ? (
                  <span className="text-sm">Menyimpan...</span>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Simpan
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        <p className="text-[11px] text-center text-slate-400 mt-6">
          Sistem Informasi Penerimaan & Pencatatan Paket &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
};
