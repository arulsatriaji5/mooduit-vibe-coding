import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, Chrome, User, Eye, EyeOff, X, CheckCircle, ArrowLeft, ShieldAlert } from 'lucide-react';
import Logo from './Logo';
import { useThemeLanguage } from '../context/ThemeLanguageContext';
import './Auth.css';

// Declare Google Identity Services global object
declare const google: any;

interface AuthProps {
  onAuth: (user: any) => void;
  onClose?: () => void;
  initialMode?: 'login' | 'register';
}

export default function Auth({ onAuth, onClose, initialMode = 'login' }: AuthProps) {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Custom Toast states
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error' | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStatus, setForgotStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const { t, language, theme } = useThemeLanguage();
  const darkMode = theme === 'dark';

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost') && !origin.includes('127.0.0.1')) {
        return;
      }

      if (event.data?.type === 'GOOGLE_AUTH_SUCCESS') {
        const userInfo = event.data.userInfo;
        try {
          const syncRes = await fetch('/api/google-login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              email: userInfo.email,
              name: userInfo.name || 'Sobat Cuan',
              picture: userInfo.picture || ''
            })
          });

          if (!syncRes.ok) {
            throw new Error(language === 'id' 
              ? "Gagal menyinkronkan akun Google dengan backend"
              : "Failed to sync Google account with backend"
            );
          }

          const backendUser = await syncRes.json();

          localStorage.setItem('userName', backendUser.name);
          localStorage.setItem('userEmail', backendUser.email);
          if (backendUser.picture) {
            localStorage.setItem('userAvatar', backendUser.picture);
          }

          onAuth({
            name: backendUser.name,
            email: backendUser.email,
            picture: backendUser.picture,
          });

          alert(
            language === 'id'
              ? `Selamat datang kembali, ${backendUser.name}! Login berhasil.`
              : `Welcome back, ${backendUser.name}! Logged in successfully.`
          );
        } catch (error: any) {
          console.error("Error retrieving Google user info:", error);
          alert(error.message || (
            language === 'id'
              ? "Gagal mengambil data profil Google Anda. Silakan coba lagi."
              : "Failed to retrieve your Google profile data. Please try again."
          ));
        }
      } else if (event.data?.type === 'GOOGLE_AUTH_FAILURE') {
        console.error("Google auth failure from popup:", event.data.error);
        alert(language === 'id'
          ? `Gagal masuk dengan Google: ${event.data.error}`
          : `Google sign-in failed: ${event.data.error}`
        );
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [language, onAuth]);

  const handleGoogleLogin = () => {
    const clientId = (import.meta as any).env.VITE_GOOGLE_CLIENT_ID;

    if (!clientId) {
      console.warn("VITE_GOOGLE_CLIENT_ID is not configured in environment variables.");
      alert(
        language === 'id'
          ? "Google Client ID belum dikonfigurasi di Pengaturan AI Studio. Silakan tambahkan VITE_GOOGLE_CLIENT_ID terlebih dahulu di panel Secrets."
          : "Google Client ID is not configured in AI Studio Secrets. Please add VITE_GOOGLE_CLIENT_ID first."
      );
      return;
    }

    const redirectUri = `${window.location.origin}/api/auth/google/callback`;

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'token',
      scope: 'openid email profile',
      prompt: 'select_account'
    });

    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

    const authWindow = window.open(
      googleAuthUrl,
      'google_oauth_popup',
      'width=600,height=700,status=no,resizable=yes,scrollbars=yes'
    );

    if (!authWindow) {
      alert(
        language === 'id'
          ? "Popup terblokir! Silakan aktifkan popup untuk situs ini agar dapat masuk menggunakan Google."
          : "Popup blocked! Please enable popups for this site to sign in with Google."
      );
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validasi Kolom Wajib Diisi
    if (!name.trim()) {
      setToastType('error');
      setToastMessage(language === 'id' ? 'Nama Lengkap wajib diisi!' : 'Full Name is required!');
      return;
    }
    if (!email.trim()) {
      setToastType('error');
      setToastMessage(language === 'id' ? 'Email wajib diisi!' : 'Email is required!');
      return;
    }
    if (!password.trim()) {
      setToastType('error');
      setToastMessage(language === 'id' ? 'Kata sandi wajib diisi!' : 'Password is required!');
      return;
    }

    // 2. Validasi Format Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setToastType('error');
      setToastMessage(language === 'id' ? 'Format email tidak valid!' : 'Invalid email format!');
      return;
    }

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setToastType('error');
        setToastMessage(data.error || (language === 'id' ? 'Pendaftaran gagal!' : 'Registration failed!'));
        return;
      }

      setToastType('success');
      setToastMessage(
        language === 'id'
          ? "Akun berhasil dibuat! Silakan masuk."
          : "Account successfully created! Please log in."
      );

      // Simpan ke localStorage
      localStorage.setItem('userName', name);
      localStorage.setItem('userEmail', email);

      // Secara otomatis alihkan (redirect / switch state) tampilan Modal dari "Daftar" ke "Masuk"
      setTimeout(() => {
        setIsLogin(true);
        // Bersihkan form register
        setName('');
        setEmail('');
        setPassword('');
        setToastMessage(null);
        setToastType(null);
      }, 2500); // Tampilkan pesan sukses sebentar agar pengguna dapat membacanya
    } catch (err: any) {
      setToastType('error');
      setToastMessage(err.message || 'Error occurred');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLogin) {
      handleRegisterSubmit(e);
      return;
    }

    // Validasi Login Dasar
    if (!email.trim() || !password.trim()) {
      setToastType('error');
      setToastMessage(language === 'id' ? 'Email dan kata sandi wajib diisi!' : 'Email and password are required!');
      return;
    }

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setToastType('error');
        setToastMessage(data.error || (language === 'id' ? 'Login gagal!' : 'Login failed!'));
        return;
      }

      // Berhasil Login
      setToastType('success');
      setToastMessage(
        language === 'id'
          ? `Selamat datang kembali, ${data.name}!`
          : `Welcome back, ${data.name}!`
      );

      // Simpan detail ke localStorage
      localStorage.setItem('userName', data.name);
      localStorage.setItem('userEmail', data.email);
      if (data.picture) {
        localStorage.setItem('userAvatar', data.picture);
      }

      setTimeout(() => {
        onAuth({ name: data.name, email: data.email, picture: data.picture });
      }, 1200);
    } catch (err: any) {
      setToastType('error');
      setToastMessage(err.message || 'Error occurred');
    }
  };

  return (
    <div className="auth-container bg-off-white dark:bg-slate-950">
      {/* Decorative Background Elements */}
      <div className="auth-bg-circle-1"></div>
      <div className="auth-bg-circle-2"></div>

      <motion.div 
        className="auth-card card shadow-lg border-0 bg-white dark:bg-slate-900" 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* HEADER MODAL AUTH (WITH BALANCED BACK AND CLOSE BUTTONS) */}
        <div className="auth-header">
          {/* Symmetrical Back Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              if (!isLogin) {
                setIsLogin(true);
              } else if (onClose) {
                onClose();
              } else if (typeof window !== 'undefined') {
                window.history.back();
              }
            }}
            className="auth-back-btn"
            title={t("Kembali", "Back")}
          >
            <ArrowLeft size={18} />
          </button>

          {/* Logo & Teks in Center of Header */}
          <div className="d-flex align-items-center">
            <Logo size={40} showText={true} variant={darkMode ? 'light' : 'dark'} />
          </div>

          {/* Symmetrical Close (X) Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              if (onClose) {
                onClose();
              } else if (typeof window !== 'undefined') {
                window.history.back();
              }
            }}
            className="auth-close-btn"
            title={t("Tutup", "Close")}
          >
            <X size={18} />
          </button>
        </div>

        <div className="text-center mb-4">
          <h2 className="fw-bold text-primary-mooduit dark:text-blue-400 mb-1">
            {isLogin ? (
              t('Masuk Sekarang 👀', 'Log In Now 👀')
            ) : (
              t('Daftar Sekarang ✨', 'Register Now ✨')
            )}
          </h2>
          {isLogin ? (
            <p className="auth-subtitle">
              {language === 'id' 
                ? 'Kelola keuanganmu lagi dengan lebih tenang bersama MOODUIT.' 
                : 'Manage your finances with peace of mind with MOODUIT.'}
            </p>
          ) : (
            <p className="auth-subtitle">
              {language === 'id' 
                ? 'Buat akun dan mulai kelola keuanganmu dengan lebih tenang.' 
                : 'Create an account and start managing your finances with peace of mind.'}
            </p>
          )}
        </div>

        {/* TOAST ALERT BANNER */}
        {toastMessage && (
          <div className="auth-toast-container mb-3">
            <div className={`auth-toast ${toastType === 'success' ? 'success' : 'error'}`}>
              {toastType === 'success' ? (
                <CheckCircle size={18} className="flex-shrink-0" />
              ) : (
                <ShieldAlert size={18} className="flex-shrink-0" />
              )}
              <span>{toastMessage}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              {/* Nama Lengkap */}
              <div className="mb-3 animate-fade-in">
                <label className="auth-input-label">{t("Nama Lengkap", "Full Name")}</label>
                <div className="auth-input-group">
                  <span className="auth-input-addon">
                    <User size={18} className="text-slate-400 dark:text-slate-500" />
                  </span>
                  <input 
                    type="text" 
                    className="auth-input-field" 
                    placeholder={t("Ketik nama lengkapmu...", "Type your full name here...")} 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required 
                  />
                </div>
              </div>
            </>
          )}
          <div className="mb-3">
            <label className="auth-input-label">{t("Email", "Email")}</label>
            <div className="auth-input-group">
              <span className="auth-input-addon">
                <Mail size={18} className="text-slate-400 dark:text-slate-500" />
              </span>
              <input 
                type="email" 
                className="auth-input-field" 
                placeholder="nama@email.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="auth-input-label">
              {language === 'id' ? 'Kata Sandi' : 'Password'}
            </label>
            <div className="auth-input-group">
              <span className="auth-input-addon">
                <Lock size={18} className="text-slate-400 dark:text-slate-500" />
              </span>
              <input 
                type={showPassword ? 'text' : 'password'} 
                className="auth-input-field" 
                placeholder={language === 'id' ? 'Masukkan kata sandi...' : 'Enter your password...'} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
              <button
                type="button"
                className="auth-eye-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff size={18} className="text-slate-400 dark:text-slate-500" />
                ) : (
                  <Eye size={18} className="text-slate-400 dark:text-slate-500" />
                )}
              </button>
            </div>
          </div>

          {/* LINK LUPA KATA SANDI */}
          {isLogin && (
            <div className="auth-forgot-wrapper">
              <button 
                type="button"
                onClick={() => setIsForgotModalOpen(true)} 
                className="auth-forgot-link"
              >
                {language === 'id' ? 'Lupa kata sandi?' : 'Forgot password?'}
              </button>
            </div>
          )}

          <button type="submit" className="btn-auth-submit">
            {isLogin ? t('Masuk Sekarang', 'Log In Now') : t('Daftar Sekarang', 'Register Now')}
          </button>
        </form>

        <div className="d-flex align-items-center my-4">
          <hr className="flex-grow-1 border-light dark:border-slate-800" />
          <span className="mx-3 text-muted dark:text-slate-500 small opacity-50">{t("Atau", "Or")}</span>
          <hr className="flex-grow-1 border-light dark:border-slate-800" />
        </div>

        <button 
          onClick={handleGoogleLogin}
          type="button"
          className="btn-auth-google"
          aria-label={t("Lanjutkan dengan Google", "Continue with Google")}
        >
          <Chrome size={20} />
          <span>{t("Lanjutkan dengan Google", "Continue with Google")}</span>
        </button>

        <div className="text-center mt-4 pt-2">
          <p className="small mb-0 text-slate-600 dark:text-slate-400">
            {isLogin ? t('Belum punya akun?', 'Don\'t have an account?') : t('Sudah punya akun?', 'Already have an account?')} {' '}
            <button className="btn btn-link p-0 fw-bold text-primary-mooduit dark:text-blue-400 text-decoration-none" onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? t('Daftar Sekarang', 'Register Now') : t('Masuk Sekarang', 'Log In Now')}
            </button>
          </p>
        </div>
      </motion.div>

      {/* MODAL LUPA PASSWORD (FINANCIAL CRISIS PROTECTION RESET FLOW) */}
      {isForgotModalOpen && (
        <div className="auth-modal-overlay">
          <motion.div 
            className="auth-modal-card card shadow-lg bg-white dark:bg-slate-900"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="auth-modal-title text-primary-mooduit dark:text-blue-400">
                {language === 'id' ? 'Atur Ulang Kata Sandi' : 'Reset Password'}
              </h4>
              <button 
                onClick={() => {
                  setIsForgotModalOpen(false);
                  setForgotStatus('idle');
                  setForgotEmail('');
                }} 
                className="auth-modal-close-btn text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={20} />
              </button>
            </div>

            {forgotStatus === 'success' ? (
              <div className="text-center py-4">
                <CheckCircle size={48} className="text-emerald-500 mb-3 mx-auto" />
                <h5 className="fw-bold text-slate-900 dark:text-white mb-2">
                  {language === 'id' ? 'Email Terkirim!' : 'Email Sent!'}
                </h5>
                <p className="small text-slate-500 dark:text-slate-400 mb-4">
                  {language === 'id' 
                    ? `Instruksi pemulihan kata sandi telah dikirim ke ${forgotEmail}. Silakan periksa kotak masuk atau folder spam Anda.` 
                    : `Password recovery instructions have been sent to ${forgotEmail}. Please check your inbox or spam folder.`}
                </p>
                <button 
                  onClick={() => {
                    setIsForgotModalOpen(false);
                    setForgotStatus('idle');
                    setForgotEmail('');
                  }} 
                  className="btn-auth-submit"
                >
                  {language === 'id' ? 'Selesai' : 'Done'}
                </button>
              </div>
            ) : (
              <form onSubmit={async (e) => {
                e.preventDefault();
                setForgotStatus('submitting');
                try {
                  const res = await fetch('/api/forgot-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: forgotEmail })
                  });
                  const data = await res.json();
                  if (!res.ok) {
                    alert(data.error || (language === 'id' ? 'Gagal mengirim email reset!' : 'Failed to send reset email!'));
                    setForgotStatus('idle');
                    return;
                  }
                  
                  if (data.debugResetUrl) {
                    console.log("DEBUG ONLY - Reset link:", data.debugResetUrl);
                  }
                  
                  setForgotStatus('success');
                } catch (err: any) {
                  alert(err.message || 'Error occurred');
                  setForgotStatus('idle');
                }
              }}>
                <p className="small text-slate-500 dark:text-slate-400 mb-4">
                  {language === 'id' 
                    ? 'Masukkan email Anda yang terdaftar. Kami akan mengirimkan tautan pemulihan aman.' 
                    : 'Enter your registered email address. We will send you a secure recovery link.'}
                </p>
                <div className="mb-4">
                  <label className="auth-input-label">
                    {language === 'id' ? 'Alamat Email' : 'Email Address'}
                  </label>
                  <div className="auth-input-group">
                    <span className="auth-input-addon">
                      <Mail size={18} className="text-slate-400 dark:text-slate-500" />
                    </span>
                    <input 
                      type="email" 
                      className="auth-input-field" 
                      placeholder="nama@email.com" 
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required 
                    />
                  </div>
                </div>
                <button 
                  type="submit" 
                  disabled={forgotStatus === 'submitting'}
                  className="btn-auth-submit"
                >
                  {forgotStatus === 'submitting' 
                    ? (language === 'id' ? 'Mengirim...' : 'Sending...') 
                    : (language === 'id' ? 'Kirim Tautan Atur Ulang' : 'Send Reset Link')}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
