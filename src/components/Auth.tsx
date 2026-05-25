import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, Chrome, User, Eye, EyeOff, X, CheckCircle } from 'lucide-react';
import Logo from './Logo';
import { useThemeLanguage } from '../context/ThemeLanguageContext';

interface AuthProps {
  onAuth: (user: any) => void;
  onClose?: () => void;
}

export default function Auth({ onAuth, onClose }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStatus, setForgotStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const { t, language, theme } = useThemeLanguage();
  const darkMode = theme === 'dark';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLogin && name) {
      localStorage.setItem('userName', name);
    }
    const finalName = !isLogin ? name : (localStorage.getItem('userName') || 'Sobat Cuan');
    onAuth({ name: finalName, email: 'user@mooduit.com' });
  };

  return (
    <div className="min-h-screen d-flex align-items-center justify-center bg-off-white dark:bg-slate-950 p-4 position-relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div 
        className="position-absolute" 
        style={{ 
          width: '500px', 
          height: '500px', 
          background: 'radial-gradient(circle, rgba(185, 171, 140, 0.25) 0%, rgba(255,255,255,0) 70%)', 
          top: '-150px', 
          right: '-100px',
          zIndex: 0,
          filter: 'blur(50px)'
        }}
      ></div>
      <div 
        className="position-absolute" 
        style={{ 
          width: '400px', 
          height: '400px', 
          background: 'radial-gradient(circle, rgba(185, 171, 140, 0.2) 0%, rgba(255,255,255,0) 70%)', 
          bottom: '-100px', 
          left: '-50px',
          zIndex: 0,
          filter: 'blur(40px)'
        }}
      ></div>

      <motion.div 
        className="card shadow-lg border-0 rounded-xl p-4 p-md-5 position-relative bg-white dark:bg-slate-900" 
        style={{ maxWidth: '450px', width: '100%', zIndex: 1, position: 'relative' }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* HEADER MODAL AUTH (FIX OVERLAP) */}
        <div className="w-full d-flex align-items-center justify-content-between pb-3 mb-4 border-bottom border-light dark:border-slate-800">
          {/* Logo & Teks (Rata Kiri, Teks Diperkecil di Mobile) */}
          <div className="d-flex align-items-center">
            <Logo size={40} showText={true} variant={darkMode ? 'light' : 'dark'} />
          </div>

          {/* Tombol Close (X) - Relatif terhadap container flex, bukan absolute */}
          <button
            onClick={(e) => {
              e.preventDefault();
              if (onClose) {
                onClose();
              } else if (typeof window !== 'undefined') {
                window.history.back();
              }
            }}
            className="w-8 h-8 flex flex-shrink-0 items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer border-none p-0"
            style={{ border: 'none' }}
            title={t("Tutup / Kembali", "Close / Back")}
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
            <p style={{ color: darkMode ? '#94a3b8' : '#64748b', fontSize: '14px', marginBottom: '32px', textAlign: 'center', lineHeight: '1.5' }}>
              {language === 'id' 
                ? 'Kelola keuanganmu lagi dengan lebih tenang bersama MOODUIT.' 
                : 'Manage your finances with peace of mind with MOODUIT.'}
            </p>
          ) : (
            <p style={{ color: darkMode ? '#94a3b8' : '#64748b', fontSize: '14px', marginBottom: '32px', textAlign: 'center', lineHeight: '1.5' }}>
              {language === 'id' 
                ? 'Buat akun dan mulai kelola keuanganmu dengan lebih tenang.' 
                : 'Create an account and start managing your finances with peace of mind.'}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="mb-3">
              <label className="form-label small fw-bold text-slate-700 dark:text-slate-300">{t("Nama Lengkap", "Full Name")}</label>
              <div className="input-group">
                <span className="input-group-text bg-white dark:bg-slate-800 border-end-0 border-light dark:border-slate-700">
                  <User size={18} className="text-muted dark:text-slate-400" />
                </span>
                <input 
                  type="text" 
                  className="form-control border-start-0 border-light dark:border-slate-700 dark:bg-slate-800 dark:text-white py-2" 
                  placeholder={t("Ketik nama panggilan kerenmu...", "Type your cool nickname here...")} 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required 
                />
              </div>
            </div>
          )}
          <div className="mb-3">
            <label className="form-label small fw-bold text-slate-700 dark:text-slate-300">{t("Email", "Email")}</label>
            <div className="input-group">
              <span className="input-group-text bg-white dark:bg-slate-800 border-end-0 border-light dark:border-slate-700"><Mail size={18} className="text-muted dark:text-slate-400" /></span>
              <input type="email" className="form-control border-start-0 border-light dark:border-slate-700 dark:bg-slate-800 dark:text-white py-2" placeholder="nama@email.com" required />
            </div>
          </div>
          <div className="mb-4">
            {/* LABEL PASSWORD DINAMIS */}
            <label className="block text-sm font-medium text-slate-400 mb-1">
              {language === 'id' ? 'Kata Sandi' : 'Password'}
            </label>
            <div className="input-group">
              <span className="input-group-text bg-white dark:bg-slate-800 border-end-0 border-light dark:border-slate-700">
                <Lock size={18} className="text-muted dark:text-slate-400" />
              </span>
              <input 
                type={showPassword ? 'text' : 'password'} 
                className="form-control border-start-0 border-end-0 border-light dark:border-slate-700 dark:bg-slate-800 dark:text-white py-2" 
                placeholder={language === 'id' ? 'Masukkan kata sandi...' : 'Enter your password...'} 
                required 
              />
              <button
                type="button"
                className="input-group-text bg-white dark:bg-slate-800 border-start-0 border-light dark:border-slate-700"
                onClick={() => setShowPassword(!showPassword)}
                style={{ cursor: 'pointer', borderLeft: 'none', background: 'transparent' }}
              >
                {showPassword ? (
                  <EyeOff size={18} className="text-muted dark:text-slate-400" />
                ) : (
                  <Eye size={18} className="text-muted dark:text-slate-400" />
                )}
              </button>
            </div>
          </div>

          {/* LINK LUPA KATA SANDI (DITAMBAHKAN) */}
          {isLogin && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px', marginTop: '8px' }}>
              <button 
                type="button"
                onClick={() => setIsForgotModalOpen(true)} 
                style={{ background: 'transparent', border: 'none', color: darkMode ? '#cbd5e1' : '#112F58', fontSize: '13px', fontWeight: '600', cursor: 'pointer', padding: 0 }}
                className="hover:underline transition-all"
              >
                {language === 'id' ? 'Lupa kata sandi?' : 'Forgot password?'}
              </button>
            </div>
          )}

          <button type="submit" className="btn btn-mooduit-primary w-100 mb-3 shadow-sm py-2 fw-bold text-white hover:text-white focus:text-white active:text-white transition-all duration-200 hover:bg-opacity-90 hover:shadow-lg">
            {isLogin ? t('Masuk Sekarang', 'Log In Now') : t('Daftar Sekarang', 'Register Now')}
          </button>
        </form>

        <div className="d-flex align-items-center my-4">
          <hr className="flex-grow-1 border-light dark:border-slate-800" />
          <span className="mx-3 text-muted dark:text-slate-500 small opacity-50">{t("Atau", "Or")}</span>
          <hr className="flex-grow-1 border-light dark:border-slate-800" />
        </div>

        <button className="btn btn-white border-light dark:border-slate-800 text-primary-mooduit dark:text-blue-400 dark:bg-slate-800 w-100 d-flex align-items-center justify-center gap-2 py-2 shadow-sm fw-medium transition-all hover:bg-gray-50 dark:hover:bg-slate-700 hover:shadow-md border">
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
        <div 
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" 
          style={{ zIndex: 1050, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)' }}
        >
          <motion.div 
            className="card shadow-lg border-0 rounded-xl p-4 m-3 bg-white dark:bg-slate-900"
            style={{ maxWidth: '400px', width: '100%' }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="fw-bold text-primary-mooduit dark:text-blue-400 m-0" style={{ fontSize: '18px' }}>
                {language === 'id' ? 'Atur Ulang Kata Sandi' : 'Reset Password'}
              </h4>
              <button 
                onClick={() => {
                  setIsForgotModalOpen(false);
                  setForgotStatus('idle');
                  setForgotEmail('');
                }} 
                style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
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
                  className="btn btn-mooduit-primary w-100 text-white py-2 fw-bold"
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
                  <label className="form-label small fw-bold text-slate-700 dark:text-slate-300">
                    {language === 'id' ? 'Alamat Email' : 'Email Address'}
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-white dark:bg-slate-800 border-end-0 border-light dark:border-slate-700">
                      <Mail size={18} className="text-muted dark:text-slate-400" />
                    </span>
                    <input 
                      type="email" 
                      className="form-control border-start-0 border-light dark:border-slate-700 dark:bg-slate-800 dark:text-white py-2" 
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
                  className="btn btn-mooduit-primary w-100 text-white py-2 fw-bold"
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
