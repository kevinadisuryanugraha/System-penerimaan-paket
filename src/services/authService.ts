import type { UserSession, AuthCredentials } from '../types';
import { getSetting, setSetting } from './indexedDB';

const AUTH_SESSION_KEY = 'satpam_auth_session';

// Default credentials - can be overridden via environment variables
const DEFAULT_CREDENTIALS: AuthCredentials = {
  username: import.meta.env.VITE_DEFAULT_USERNAME || 'satpam',
  password: import.meta.env.VITE_DEFAULT_PASSWORD || '123456',
};

export class AuthService {
  static getCurrentUser(): UserSession | null {
    try {
      const data = localStorage.getItem(AUTH_SESSION_KEY);
      if (!data) return null;
      return JSON.parse(data) as UserSession;
    } catch {
      return null;
    }
  }

  static async getStoredCredentials(): Promise<AuthCredentials> {
    const storedUser = await getSetting('auth_username');
    const storedPass = await getSetting('auth_password');

    if (storedUser && storedPass) {
      return { username: storedUser, password: storedPass };
    }
    return DEFAULT_CREDENTIALS;
  }

  static async login(
    usernameInput: string,
    passwordInput: string
  ): Promise<{ success: boolean; user?: UserSession; message: string }> {
    const cleanUsername = usernameInput.trim().toLowerCase();
    const credentials = await this.getStoredCredentials();

    if (cleanUsername === credentials.username && passwordInput === credentials.password) {
      const user: UserSession = {
        username: credentials.username,
        name: `Petugas ${credentials.username.charAt(0).toUpperCase() + credentials.username.slice(1)}`,
        role: 'satpam',
        isLoggedIn: true,
      };

      try {
        localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(user));
      } catch (err) {
        console.error('Failed to save session', err);
      }

      return {
        success: true,
        user,
        message: 'Login berhasil. Selamat bertugas!',
      };
    }

    return {
      success: false,
      message: `Username atau password salah! Gunakan username: ${credentials.username} & password: ${credentials.password}`,
    };
  }

  static async changePassword(
    currentPassword: string,
    newUsername: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> {
    const credentials = await this.getStoredCredentials();

    if (currentPassword !== credentials.password) {
      return { success: false, message: 'Password saat ini tidak cocok.' };
    }

    if (!newUsername.trim() || !newPassword.trim()) {
      return { success: false, message: 'Username dan password baru tidak boleh kosong.' };
    }

    if (newPassword.length < 4) {
      return { success: false, message: 'Password baru minimal 4 karakter.' };
    }

    await setSetting('auth_username', newUsername.trim().toLowerCase());
    await setSetting('auth_password', newPassword.trim());

    return { success: true, message: 'Kredensial berhasil diubah. Silakan login ulang.' };
  }

  static logout(): void {
    try {
      localStorage.removeItem(AUTH_SESSION_KEY);
    } catch (err) {
      console.error('Failed to logout', err);
    }
  }

  static isAuthenticated(): boolean {
    const session = this.getCurrentUser();
    return !!session && session.isLoggedIn;
  }
}
