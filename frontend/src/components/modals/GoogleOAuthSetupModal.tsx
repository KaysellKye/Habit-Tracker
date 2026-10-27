import React, { useState } from 'react';
import {
  X,
  ExternalLink,
  KeyRound,
  CheckCircle2,
  Copy,
  Info,
  ShieldCheck,
  Sparkles,
  HelpCircle,
} from 'lucide-react';

interface GoogleOAuthSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveClientId: (clientId: string) => void;
  currentClientId?: string;
}

export const GoogleOAuthSetupModal: React.FC<GoogleOAuthSetupModalProps> = ({
  isOpen,
  onClose,
  onSaveClientId,
  currentClientId = '',
}) => {
  const [clientIdInput, setClientIdInput] = useState(currentClientId);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = clientIdInput.trim();
    if (!cleanId) return;

    onSaveClientId(cleanId);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const currentOrigin = window.location.origin || 'http://localhost:5173';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 z-10 overflow-y-auto max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold flex-shrink-0">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Panduan Setup Google OAuth 2.0
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Langkah cepat menghubungkan autentikasi resmi akun Google
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="mt-4 flex flex-col gap-4 text-xs sm:text-sm text-slate-700">
          <div className="p-3 bg-blue-50/80 border border-blue-200/60 rounded-2xl text-blue-900 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <span className="text-xs leading-relaxed">
              Agar pengguna dapat diarahkan langsung ke halaman login resmi milik Google (<code>accounts.google.com</code>), aplikasi membutuhkan <strong>Google Client ID</strong> dari Google Cloud Console.
            </span>
          </div>

          {/* Steps */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Langkah Pembuatan (Hanya 2 Menit):
            </h4>

            {/* Step 1 */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center">1</span>
                  Buka Google Cloud Console
                </span>
                <a
                  href="https://console.cloud.google.com/apis/credentials"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"
                >
                  <span>Buka Console</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-xs text-slate-500 pl-6.5">
                Pilih atau buat project baru, lalu buka menu <strong>APIs & Services &gt; Credentials</strong>.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-1.5">
              <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center">2</span>
                Konfigurasi OAuth Consent Screen
              </span>
              <p className="text-xs text-slate-500 pl-6.5">
                Jika belum pernah, pilih User Type <strong>External</strong>, isi nama aplikasi (misal: <em>TimeBlock To-Do</em>) dan email kontak Anda.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-2">
              <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center">3</span>
                Buat OAuth Client ID (Web Application)
              </span>
              <p className="text-xs text-slate-500 pl-6.5">
                Klik <strong>+ Create Credentials</strong> &gt; pilih <strong>OAuth client ID</strong> &gt; Application type: <strong>Web application</strong>.
              </p>

              {/* Origin copy box */}
              <div className="ml-6.5 p-2 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                    Authorized JavaScript origins:
                  </span>
                  <code className="text-xs font-mono font-bold text-slate-800">
                    {currentOrigin}
                  </code>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(currentOrigin, 'origin')}
                  className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center gap-1 font-semibold transition-colors"
                >
                  {copiedText === 'origin' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedText === 'origin' ? 'Disalin!' : 'Salin'}</span>
                </button>
              </div>
            </div>

            {/* Step 4 */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-2">
              <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center">4</span>
                Tempel Client ID di Bawah Ini:
              </span>
              <p className="text-xs text-slate-500 pl-6.5">
                Salin Client ID yang berakhiran <code>.apps.googleusercontent.com</code> lalu tempel di sini:
              </p>

              <form onSubmit={handleSave} className="ml-6.5 flex flex-col gap-2">
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={clientIdInput}
                    onChange={(e) => setClientIdInput(e.target.value)}
                    placeholder="misal: 123456789-abcdef.apps.googleusercontent.com"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Atau simpan permanen di file <code>frontend/.env</code>
                  </span>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs active:scale-95 transition-all flex items-center gap-1.5"
                  >
                    {savedSuccess ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                        <span>Tersimpan!</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Simpan & Terapkan</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
