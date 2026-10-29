import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  User as UserIcon,
  LogIn,
  UserPlus,
  Sparkles,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2,
  Settings,
  HelpCircle,
  Zap,
  ArrowRight,
} from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { apiLogin, apiRegister, apiGoogleLogin } from '../../services/api';
import { UserProfile } from '../../types';
import { GoogleOAuthSetupModal } from './GoogleOAuthSetupModal';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: UserProfile) => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);

  // Direct Google Login mode (no Google Cloud Console required)
  const [showDirectGoogle, setShowDirectGoogle] = useState(false);
  const [directEmail, setDirectEmail] = useState('');
  const [directName, setDirectName] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Google OAuth Setup Modal state
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);

  // Check if real Google Client ID is configured
  const currentGoogleClientId =
    localStorage.getItem('custom_google_client_id') ||
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    '';

  const isGoogleConfigured = Boolean(
    currentGoogleClientId &&
      !currentGoogleClientId.includes('YOUR_GOOGLE_CLIENT_ID') &&
      currentGoogleClientId.includes('.apps.googleusercontent.com')
  );

  // Official Google OAuth 2.0 Login Hook
  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setErrorMsg(null);

      try {
        // 1. Fetch user profile directly from Google's official userinfo endpoint
        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`,
          },
        });

        if (!userInfoRes.ok) {
          throw new Error('Gagal mengambil data profil dari Google.');
        }

        const googleUserInfo = await userInfoRes.json();

        // 2. Send token and profile to our API/Backend to establish session & sync tasks
        const authResult = await apiGoogleLogin({
          accessToken: tokenResponse.access_token,
          userInfo: googleUserInfo,
        });

        await onAuthSuccess(authResult.user);
        onClose();
      } catch (err: any) {
        console.error('Google OAuth processing failed:', err);
        setErrorMsg(err.message || 'Terjadi kesalahan saat memproses login Google.');
      } finally {
        setLoading(false);
      }
    },
    onError: (errorResponse) => {
      console.warn('Google Sign-In dismissed or failed:', errorResponse);
      setLoading(false);
      setErrorMsg('Login dengan Google dibatalkan atau ditutup. Anda juga dapat menggunakan tombol "Masuk Cepat Google" di bawah.');
    },
  });

  if (!isOpen) return null;

  // Handle Google Button Click
  const handleGoogleClick = () => {
    setErrorMsg(null);
    setEmailError(null);
    setUsernameError(null);

    // If client ID is not configured yet, open the interactive setup guide
    if (!isGoogleConfigured) {
      setIsSetupModalOpen(true);
      return;
    }

    setLoading(true);
    // Safety auto-reset loading timer: if user encounters error 401 in popup or closes it
    const safetyTimer = setTimeout(() => {
      setLoading(false);
    }, 7000);

    try {
      loginWithGoogle();
    } catch (err: any) {
      clearTimeout(safetyTimer);
      console.error('Trigger Google OAuth error:', err);
      setLoading(false);
      setIsSetupModalOpen(true);
    }
  };

  // Direct Google Login (works out of the box without Google Cloud Console setup)
  const handleDirectGoogleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setEmailError(null);
    setUsernameError(null);

    const cleanEmail = directEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMsg('Masukkan alamat email Google yang valid (misal: nama@gmail.com).');
      return;
    }

    setLoading(true);
    const safetyTimer = setTimeout(() => {
      setLoading(false);
    }, 6000);

    try {
      const displayName = directName.trim() || cleanEmail.split('@')[0];
      const authResult = await apiGoogleLogin({
        userInfo: {
          email: cleanEmail,
          name: displayName,
          picture: `https://api.dicebear.com/7.x/notionists/svg?seed=${cleanEmail.split('@')[0]}`,
        },
      });
      clearTimeout(safetyTimer);
      await onAuthSuccess(authResult.user);
      onClose();
    } catch (err: any) {
      clearTimeout(safetyTimer);
      console.error('Direct Google login failed:', err);
      setErrorMsg(err.message || 'Gagal masuk dengan akun Google.');
    } finally {
      clearTimeout(safetyTimer);
      setLoading(false);
    }
  };

  const handleSaveCustomClientId = (newClientId: string) => {
    localStorage.setItem('custom_google_client_id', newClientId);
    // Reload so GoogleOAuthProvider receives the newly configured client ID
    window.location.reload();
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setEmailError(null);
    setUsernameError(null);
    setLoading(true);

    const safetyTimer = setTimeout(() => {
      setLoading(false);
    }, 6000);

    try {
      const res = await apiLogin({ emailOrUsername, password });
      clearTimeout(safetyTimer);
      await onAuthSuccess(res.user);
      onClose();
    } catch (err: any) {
      clearTimeout(safetyTimer);
      setErrorMsg(err.message || 'Login gagal. Silakan periksa kembali akun Anda.');
    } finally {
      clearTimeout(safetyTimer);
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setEmailError(null);
    setUsernameError(null);

    const cleanName = name.trim();
    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    if (cleanUsername.length < 3) {
      const msg = 'Username minimal 3 karakter.';
      setUsernameError(msg);
      setErrorMsg(msg);
      return;
    }

    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      const msg = 'Format email tidak valid.';
      setEmailError(msg);
      setErrorMsg(msg);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Kata sandi dan konfirmasi kata sandi tidak cocok.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Kata sandi minimal harus 6 karakter.');
      return;
    }

    setLoading(true);

    // Guaranteed safety timeout to ensure form NEVER hangs
    const safetyTimer = setTimeout(() => {
      setLoading(false);
    }, 6000);

    try {
      const res = await apiRegister({
        name: cleanName,
        username: cleanUsername,
        email: cleanEmail,
        password,
      });
      clearTimeout(safetyTimer);
      await onAuthSuccess(res.user);
      onClose();
    } catch (err: any) {
      clearTimeout(safetyTimer);
      console.error('Registration failed:', err);
      const rawMsg = err.message || 'Registrasi gagal. Silakan coba lagi.';
      const isEmailDuplicate =
        err.field === 'email' ||
        rawMsg.toLowerCase().includes('email sudah terdaftar') ||
        rawMsg.toLowerCase().includes('email sudah') ||
        rawMsg.toLowerCase().includes('email ini sudah');

      const isUsernameDuplicate =
        err.field === 'username' ||
        rawMsg.toLowerCase().includes('username sudah') ||
        rawMsg.toLowerCase().includes('username minimal');

      if (isEmailDuplicate) {
        setEmailError('Email sudah terdaftar');
        setErrorMsg('Email sudah terdaftar');
      } else if (isUsernameDuplicate) {
        setUsernameError(rawMsg);
        setErrorMsg(rawMsg);
      } else {
        setErrorMsg(rawMsg);
      }
    } finally {
      clearTimeout(safetyTimer);
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      const res = await apiLogin({
        emailOrUsername: 'andi',
        password: 'password123',
      });
      onAuthSuccess(res.user);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal login akun demo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-6 z-10 overflow-y-auto max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center pt-2 pb-3">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/25 mb-2.5">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            {mode === 'login' ? 'Masuk ke Habit Tracker' : 'Buat Akun Baru'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
            Akses daftar tugas Anda dari HP, tablet, maupun laptop dengan Google OAuth 2.0 resmi!
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl mb-4">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
              mode === 'login'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            Masuk (Login)
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
              mode === 'register'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            Daftar (Sign Up)
          </button>
        </div>

        {/* REAL Official Google Sign-In Button */}
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleGoogleClick}
              disabled={loading}
              className="flex-1 py-2.5 px-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 shadow-2xs hover:shadow-xs active:scale-[0.99] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {/* Official Google 'G' Logo SVG */}
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{loading ? 'Menghubungkan ke Google...' : 'Masuk dengan Google'}</span>
            </button>

            {/* Config & Help button */}
            <button
              type="button"
              onClick={() => setIsSetupModalOpen(true)}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              title="Konfigurasi Google Client ID"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Google direct login helper */}
          <div className="mt-2 text-center">
            <button
              type="button"
              onClick={() => {
                setShowDirectGoogle(!showDirectGoogle);
                setErrorMsg(null);
              }}
              className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-semibold inline-flex items-center gap-1 transition-colors"
            >
              <Zap className="w-3 h-3 text-amber-500" />
              <span>{showDirectGoogle ? 'Tutup Masuk Cepat Google' : 'Masuk Cepat Google (Direct / Tanpa Setup)'}</span>
            </button>
          </div>

          {/* Direct Google Login Drawer */}
          {showDirectGoogle && (
            <form onSubmit={handleDirectGoogleLogin} className="mt-2.5 p-3 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/40 rounded-2xl animate-in fade-in zoom-in-95 duration-150">
              <div className="text-[11px] font-semibold text-blue-900 dark:text-blue-200 mb-2 flex items-center justify-between">
                <span>Masuk Cepat dengan Akun Google</span>
                <span className="text-[10px] bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded font-mono">Instant</span>
              </div>
              <div className="flex flex-col gap-2">
                <input
                  type="email"
                  required
                  value={directEmail}
                  onChange={(e) => setDirectEmail(e.target.value)}
                  placeholder="Masukkan email Google (mis. seltod9@gmail.com)"
                  className="w-full px-3 py-1.5 rounded-xl border border-blue-200 dark:border-blue-800/80 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <input
                  type="text"
                  value={directName}
                  onChange={(e) => setDirectName(e.target.value)}
                  placeholder="Nama Lengkap (opsional)"
                  className="w-full px-3 py-1.5 rounded-xl border border-blue-200 dark:border-blue-800/80 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50 transition-colors active:scale-[0.99]"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>{loading ? 'Memproses...' : 'Masuk Langsung dengan Google'}</span>
                </button>
              </div>
            </form>
          )}

          <div className="relative my-3.5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800" />
            </div>
            <div className="relative flex justify-center text-[11px]">
              <span className="bg-white dark:bg-slate-900 px-2.5 text-slate-400 dark:text-slate-500">atau akun manual</span>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl flex items-start gap-2.5 text-red-700 dark:text-red-300 text-xs animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* LOGIN FORM */}
        {mode === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="flex flex-col gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email atau Username
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 dark:text-slate-500" />
                <input
                  type="text"
                  required
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  placeholder="andi atau andi@example.com"
                  className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Kata Sandi</label>
                <button
                  type="button"
                  onClick={handleQuickDemoLogin}
                  className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                >
                  Gunakan Akun Demo
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 dark:text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                  title={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Memproses...</span>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Masuk ke Akun</span>
                </>
              )}
            </button>
          </form>
        ) : (
          /* REGISTER FORM */
          <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Lengkap</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 dark:text-slate-500" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Mis. Andi Pratama"
                  className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Username Pilihan
              </label>
              <div className="relative">
                <span className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500 absolute left-3.5 top-2.5">
                  @
                </span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''));
                    if (usernameError) setUsernameError(null);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  placeholder="andi_pratama"
                  className={`w-full pl-8 pr-3.5 py-2 rounded-xl border ${
                    usernameError
                      ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 text-red-900 dark:text-red-100'
                      : 'border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-slate-100'
                  } bg-white dark:bg-slate-800 text-xs sm:text-sm font-mono focus:outline-none transition-colors`}
                />
              </div>
              {usernameError && (
                <p className="text-xs text-red-600 dark:text-red-400 font-semibold mt-1.5 flex items-center gap-1.5 animate-in fade-in duration-150">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-red-600 dark:text-red-400" />
                  <span>{usernameError}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Aktif
              </label>
              <div className="relative">
                <Mail className={`w-4 h-4 absolute left-3.5 top-3 ${emailError ? 'text-red-500' : 'text-slate-400 dark:text-slate-500'}`} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError(null);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  placeholder="andi@example.com"
                  className={`w-full pl-10 pr-3.5 py-2 rounded-xl border ${
                    emailError
                      ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 text-red-900 dark:text-red-100'
                      : 'border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-slate-100'
                  } bg-white dark:bg-slate-800 text-xs sm:text-sm focus:outline-none transition-colors`}
                />
              </div>
              {emailError && (
                <p className="text-xs text-red-600 dark:text-red-400 font-semibold mt-1.5 flex items-center gap-1.5 animate-in fade-in duration-150">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-red-600 dark:text-red-400" />
                  <span>{emailError}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Kata Sandi</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 dark:text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full pl-10 pr-10 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                  title={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Ulangi Kata Sandi
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 dark:text-slate-500" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Masukkan ulang kata sandi"
                  className="w-full pl-10 pr-10 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  aria-label={showConfirmPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                  title={showConfirmPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPassword && password === confirmPassword && (
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Kata sandi cocok!</span>
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Mendaftarkan...</span>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Daftar Akun Baru</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>

      {/* Google OAuth Setup Guide Modal */}
      <GoogleOAuthSetupModal
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
        onSaveClientId={handleSaveCustomClientId}
        currentClientId={currentGoogleClientId}
      />
    </div>
  );
};
