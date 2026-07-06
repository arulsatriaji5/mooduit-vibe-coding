import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, Eye, EyeOff, CheckCircle, Shield, ArrowLeft } from 'lucide-react';

interface ResetPasswordProps {
  token: string;
  onClose: () => void;
}

export default function ResetPassword({ token, onClose }: ResetPasswordProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const language = localStorage.getItem('language') || 'id';

  const t = (idText: string, enText: string) => {
    return language === 'id' ? idText : enText;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!password.trim()) {
      setErrorMessage(t('Kata sandi baru wajib diisi!', 'New password is required!'));
      return;
    }

    if (password.length < 6) {
      setErrorMessage(t('Kata sandi minimal harus 6 karakter!', 'Password must be at least 6 characters!'));
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage(t('Konfirmasi kata sandi tidak cocok!', 'Password confirmation does not match!'));
      return;
    }

    setStatus('submitting');
    try {
      const res = await fetch('/api/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token,
          newPassword: password
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || t('Gagal mengatur ulang kata sandi!', 'Failed to reset password!'));
        setStatus('idle');
        return;
      }

      setStatus('success');
    } catch (err: any) {
      setErrorMessage(err.message || 'Error occurred');
      setStatus('idle');
    }
  };

  return (
    <div className="auth-container d-flex align-items-center justify-content-center min-vh-100 px-3">
      <motion.div 
        className="auth-card card shadow-lg bg-white dark:bg-slate-900 border-0 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ maxWidth: '420px', width: '100%', borderRadius: '16px' }}
      >
        <div className="p-4 sm:p-5">
          {/* Header */}
          <div className="text-center mb-4">
            <div className="mx-auto mb-3 flex items-center justify-center w-12 h-12 rounded-full bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400">
              <Shield size={24} />
            </div>
            <h3 className="auth-title text-2xl font-bold text-slate-900 dark:text-white mb-2">
              {t('Atur Ulang Kata Sandi', 'Reset Password')}
            </h3>
            <p className="small text-slate-500 dark:text-slate-400">
              {t('Masukkan kata sandi baru Anda di bawah untuk memulihkan akses akun Anda.', 'Enter your new password below to regain access to your account.')}
            </p>
          </div>

          {status === 'success' ? (
            <div className="text-center py-4">
              <div className="mx-auto mb-3 flex items-center justify-center w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500">
                <CheckCircle size={28} />
              </div>
              <h5 className="fw-bold text-slate-900 dark:text-white mb-2">
                {t('Berhasil Diperbarui!', 'Successfully Updated!')}
              </h5>
              <p className="small text-slate-500 dark:text-slate-400 mb-4">
                {t('Kata sandi baru Anda telah berhasil disimpan. Anda sekarang dapat masuk kembali ke MOODUIT.', 'Your new password has been successfully saved. You can now log back into MOODUIT.')}
              </p>
              <button 
                onClick={onClose}
                className="btn-auth-submit w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg shadow-sm transition-colors duration-200"
              >
                {t('Masuk Sekarang', 'Log In Now')}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {errorMessage && (
                <div className="mb-3 p-3 text-xs bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 rounded-lg font-medium">
                  {errorMessage}
                </div>
              )}

              {/* Password Baru */}
              <div className="mb-3">
                <label className="auth-input-label block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  {t('Kata Sandi Baru', 'New Password')}
                </label>
                <div className="auth-input-group relative flex items-center border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-950">
                  <span className="auth-input-addon px-3 text-slate-400">
                    <Lock size={18} />
                  </span>
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    className="auth-input-field w-full py-2.5 bg-transparent border-0 focus:outline-none focus:ring-0 text-slate-900 dark:text-white pr-10" 
                    placeholder={t('Kata sandi baru...', 'New password...')} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                  />
                  <button
                    type="button"
                    className="auth-eye-btn absolute right-3 text-slate-400 hover:text-slate-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Konfirmasi Password */}
              <div className="mb-4">
                <label className="auth-input-label block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  {t('Konfirmasi Kata Sandi Baru', 'Confirm New Password')}
                </label>
                <div className="auth-input-group relative flex items-center border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-950">
                  <span className="auth-input-addon px-3 text-slate-400">
                    <Lock size={18} />
                  </span>
                  <input 
                    type={showConfirm ? 'text' : 'password'} 
                    className="auth-input-field w-full py-2.5 bg-transparent border-0 focus:outline-none focus:ring-0 text-slate-900 dark:text-white pr-10" 
                    placeholder={t('Ulangi kata sandi baru...', 'Repeat new password...')} 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required 
                  />
                  <button
                    type="button"
                    className="auth-eye-btn absolute right-3 text-slate-400 hover:text-slate-600"
                    onClick={() => setShowConfirm(!showConfirm)}
                  >
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                disabled={status === 'submitting'}
                className="btn-auth-submit w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg shadow-sm transition-colors duration-200 mb-3"
              >
                {status === 'submitting' 
                  ? t('Memperbarui...', 'Updating...') 
                  : t('Perbarui Kata Sandi', 'Update Password')}
              </button>

              {/* Back to login */}
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2 bg-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-xs flex items-center justify-center gap-1 transition-colors duration-200"
              >
                <ArrowLeft size={14} />
                {t('Kembali ke Halaman Utama', 'Back to Main Page')}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
