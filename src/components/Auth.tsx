import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, Chrome, User, Eye, EyeOff, X, CheckCircle, ArrowLeft } from 'lucide-react';
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
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStatus, setForgotStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const { t, language, theme } = useThemeLanguage();
  const darkMode = theme === 'dark';

  const handleGoogleLogin = () => {
    // 1. Get Google Client ID from environment variables dynamically
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

    // 2. Check if the Google Identity Services library is loaded
    if (typeof google === 'undefined' || !google.accounts?.oauth2) {
      alert(
        language === 'id'
          ? "Pustaka Google Identity Services gagal dimuat. Silakan muat ulang halaman atau periksa koneksi internet Anda."
          : "Google Identity Services library failed to load. Please refresh the page or check your internet connection."
      );
      return;
    }

    try {
      // 3. Initialize GSI Token Client for programmatic OAuth popup
      const tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'openid email profile',
        callback: async (tokenResponse: any) => {
          if (tokenResponse && tokenResponse.access_token) {
            try {
              // 4. Fetch user profile from Google UserInfo endpoint securely using the access token
              const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: {
                  Authorization: `Bearer ${tokenResponse.access_token}`,
                }
              });

              if (!userInfoResponse.ok) {
                throw new Error("Failed to fetch user info from Google");
              }

              const userInfo = await userInfoResponse.json();
              
              // 5. Store user details in local storage for persistence
              if (userInfo.name) {
                localStorage.setItem('userName', userInfo.name);
              }
              if (userInfo.picture) {
                localStorage.setItem('userAvatar', userInfo.picture);
              }

              // 6. Complete authentication and trigger the state callback
              onAuth({
                name: userInfo.name || 'Sobat Cuan',
                email: userInfo.email || 'user@mooduit.com',
                picture: userInfo.picture,
              });

              // Success announcement
              alert(
                language === 'id'
                  ? `Selamat datang kembali, ${userInfo.name}! Login berhasil.`
                  : `Welcome back, ${userInfo.name}! Logged in successfully.`
              );

            } catch (error) {
              console.error("Error retrieving Google user info:", error);
              alert(
                language === 'id'
                  ? "Gagal mengambil data profil Google Anda. Silakan coba lagi."
                  : "Failed to retrieve your Google profile data. Please try again."
              );
            }
          }
        },
        error_callback: (error: any) => {
          console.error("Google authentication error:", error);
        }
      });

      // 4. Trigger the standard, secure Google Account Chooser pop-up
      tokenClient.requestAccessToken();

    } catch (err) {
      console.error("Error initializing Google Token Client:", err);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLogin && name) {
      localStorage.setItem('userName', name);
    }
    const finalName = !isLogin ? name : (localStorage.getItem('userName') || 'Sobat Cuan');
    onAuth({ name: finalName, email: 'user@mooduit.com' });
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

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="mb-3">
              <label className="auth-input-label">{t("Nama Lengkap", "Full Name")}</label>
              <div className="auth-input-group">
                <span className="auth-input-addon">
                  <User size={18} className="text-slate-400 dark:text-slate-500" />
                </span>
                <input 
                  type="text" 
                  className="auth-input-field" 
                  placeholder={t("Ketik nama panggilan kerenmu...", "Type your cool nickname here...")} 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required 
                />
              </div>
            </div>
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
              <form onSubmit={(e) => {
                e.preventDefault();
                setForgotStatus('submitting');
                setTimeout(() => {
                  setForgotStatus('success');
                }, 1200);
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
