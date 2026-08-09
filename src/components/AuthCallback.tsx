import React, { useEffect, useState } from 'react';
import { Sparkles, Loader2, AlertCircle } from 'lucide-react';

interface AuthCallbackProps {
  onSuccess?: () => void;
}

export const AuthCallback: React.FC<AuthCallbackProps> = ({ onSuccess }) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function processCallback() {
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));

        const code = searchParams.get('code') || hashParams.get('code');
        const token = searchParams.get('token') || hashParams.get('token');
        const oauthEmail = searchParams.get('oauth_email') || searchParams.get('email');
        const oauthName = searchParams.get('oauth_name') || searchParams.get('name');
        const oauthPicture = searchParams.get('oauth_picture') || searchParams.get('picture');
        const userId = searchParams.get('id');

        // Case 1: Params already extracted and passed back in query string
        if (oauthEmail || token) {
          if (token) localStorage.setItem('mooduit_session', token);
          if (oauthEmail) {
            localStorage.setItem('userEmail', oauthEmail);
            localStorage.setItem('mooduit_user', JSON.stringify({ email: oauthEmail, name: oauthName }));
          }
          if (oauthName) localStorage.setItem('userName', oauthName);
          if (oauthPicture) localStorage.setItem('userAvatar', oauthPicture);
          if (userId) localStorage.setItem('userId', userId);

          localStorage.setItem('mooduit_current_page', 'dashboard');
          
          if (onSuccess) {
            onSuccess();
          } else {
            window.location.href = '/dashboard';
          }
          return;
        }

        // Case 2: Authorization code present, perform backend exchange
        if (code) {
          const res = await fetch(`/api/auth/google/callback?code=${encodeURIComponent(code)}`);
          if (!res.ok && res.status >= 400) {
            const errText = await res.text();
            throw new Error(errText || 'Gagal memproses verifikasi otentikasi Google.');
          }

          // Fetch automatically follows Express redirect response to /dashboard?...
          const finalUrl = res.url;
          if (finalUrl && finalUrl.includes('/dashboard')) {
            const redirectParams = new URLSearchParams(finalUrl.split('?')[1] || '');
            const newToken = redirectParams.get('token');
            const newEmail = redirectParams.get('oauth_email') || redirectParams.get('email');
            const newName = redirectParams.get('oauth_name');
            const newPic = redirectParams.get('oauth_picture');
            const newId = redirectParams.get('id');

            if (newToken) localStorage.setItem('mooduit_session', newToken);
            if (newEmail) {
              localStorage.setItem('userEmail', newEmail);
              localStorage.setItem('mooduit_user', JSON.stringify({ email: newEmail, name: newName }));
            }
            if (newName) localStorage.setItem('userName', newName);
            if (newPic) localStorage.setItem('userAvatar', newPic);
            if (newId) localStorage.setItem('userId', newId);

            localStorage.setItem('mooduit_current_page', 'dashboard');

            if (onSuccess) {
              onSuccess();
            } else {
              window.location.href = '/dashboard';
            }
            return;
          }

          // Fallback if res.url is same
          const data = await res.json().catch(() => null);
          if (data && data.email) {
            localStorage.setItem('userEmail', data.email);
            if (data.name) localStorage.setItem('userName', data.name);
            if (data.picture) localStorage.setItem('userAvatar', data.picture);
            if (data.id) localStorage.setItem('userId', data.id);
            localStorage.setItem('mooduit_session', 'google_' + Date.now());
            localStorage.setItem('mooduit_current_page', 'dashboard');

            if (onSuccess) {
              onSuccess();
            } else {
              window.location.href = '/dashboard';
            }
            return;
          }

          // Direct redirect fallback
          window.location.href = '/dashboard';
          return;
        }

        // Case 3: Implicit token in access_token
        const accessToken = searchParams.get('access_token') || hashParams.get('access_token');
        if (accessToken) {
          const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${accessToken}` }
          });
          if (profileRes.ok) {
            const profile = await profileRes.json();
            // sync with server
            const loginRes = await fetch('/api/google-login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: profile.email, name: profile.name, picture: profile.picture })
            });
            const loginData = await loginRes.json();

            localStorage.setItem('mooduit_session', 'google_' + Date.now());
            localStorage.setItem('userEmail', profile.email);
            localStorage.setItem('userName', loginData.user?.name || profile.name || 'Sobat Cuan');
            if (profile.picture) localStorage.setItem('userAvatar', profile.picture);
            if (loginData.user?.id) localStorage.setItem('userId', loginData.user.id);
            localStorage.setItem('mooduit_current_page', 'dashboard');

            if (onSuccess) {
              onSuccess();
            } else {
              window.location.href = '/dashboard';
            }
            return;
          }
        }

        // If no code, token, or session found, throw error or fallback
        throw new Error('Kode otentikasi Google tidak ditemukan pada callback URL.');
      } catch (err: any) {
        if (isMounted) {
          console.error('OAuth Callback Error:', err);
          setErrorMsg(err.message || 'Terjadi kesalahan saat memverifikasi login Google.');
        }
      }
    }

    processCallback();

    return () => {
      isMounted = false;
    };
  }, [onSuccess]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-slate-950 text-white font-sans">
      <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-600 to-indigo-500 p-0.5 mb-6 shadow-lg shadow-pink-500/25 flex items-center justify-center">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-pink-400 animate-pulse" />
          </div>
        </div>

        {errorMsg ? (
          <>
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mb-4">
              <AlertCircle size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Gagal Verifikasi Login</h3>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">{errorMsg}</p>
            <button
              type="button"
              onClick={() => {
                window.location.href = '/';
              }}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold text-sm shadow-lg shadow-pink-500/20 transition-all border-0 cursor-pointer"
            >
              Kembali ke Halaman Login
            </button>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-4">
              <Loader2 className="w-6 h-6 text-pink-400 animate-spin" />
              <span className="text-sm font-semibold text-pink-300 uppercase tracking-wider">MOODUIT AUTH</span>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Memverifikasi Sesi Google Anda</h2>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
              Mohon tunggu sebentar, sistem sedang menyiapkan akun dan mengarahkan Anda ke Dashboard...
            </p>
          </>
        )}
      </div>
    </div>
  );
};
