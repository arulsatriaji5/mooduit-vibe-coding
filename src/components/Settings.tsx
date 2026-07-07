import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Bell, 
  Moon, 
  Sun,
  Languages, 
  HelpCircle, 
  LogOut,
  ChevronRight,
  Shield,
  ArrowLeft,
  Camera,
  Eye,
  EyeOff
} from 'lucide-react';
import { useThemeLanguage } from '../context/ThemeLanguageContext';
import './Settings.css';

interface SettingsProps {
  onLogout?: () => void;
}

export default function Settings({ onLogout }: SettingsProps) {
  const { theme, toggleTheme, language, setLanguage, t } = useThemeLanguage();
  const [notifEnabled, setNotifEnabled] = useState(true);
  const darkMode = theme === 'dark';

  const [currentAvatar, setCurrentAvatar] = useState(() => {
    return localStorage.getItem('userAvatar') || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Arul';
  });
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);

  // VIEW NAVIGATION STATE
  const [activeView, setActiveView] = useState<'main' | 'profile'>('main');

  // USER PROFILE FIELDS
  const [userName, setUserName] = useState(() => {
    return localStorage.getItem('userName') || 'Arul Satriaji';
  });
  const [userEmail] = useState(() => {
    return localStorage.getItem('userEmail') || 'arulsatriaji5@gmail.com';
  });
  const [authProvider] = useState(() => {
    return localStorage.getItem('authProvider') || 'local';
  });
  const isGoogleUser = authProvider === 'google';

  // CHANGE PASSWORD FIELDS
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // AVATAR FILE REF
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const resultStr = reader.result as string;
        setCurrentAvatar(resultStr);
        localStorage.setItem('userAvatar', resultStr);
        window.dispatchEvent(new Event('avatarChanged'));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  const avatarOptions = [
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Arul',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Milo',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Tinkerbell',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Snuggles'
  ];

  return (
    <div className="w-full max-w-full px-4 mx-auto box-border min-h-screen overflow-x-hidden flex flex-col items-center pb-32 md:pb-12 !bg-transparent dark:bg-slate-900">
      
      {/* CONTAINER KONTEN - BEBAS DARI WARNA ABU-ABU */}
      <div className="w-full max-w-md md:max-w-2xl lg:max-w-3xl mx-auto flex flex-col gap-5 pt-6 md:pt-10 !bg-transparent box-border">
        
        <AnimatePresence mode="wait">
          {activeView === 'main' ? (
            <motion.div
              key="main-settings"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="w-full flex flex-col gap-5 !bg-transparent"
            >
              {/* Judul Halaman */}
              <h1 className="text-2xl md:text-3xl font-bold text-[#112F58] dark:text-white mb-2 md:mb-4 text-left w-full">
                {t("Pengaturan", "Settings")}
              </h1>

              {/* BUNGKUSAN SEMUA KARTU PENGATURAN */}
              <div className="w-full flex flex-col gap-4">
                <div 
                  onClick={() => setActiveView('profile')}
                  className="w-full card-mooduit overflow-hidden mb-4 p-0 cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-all duration-200"
                >
                  <div className="p-4 d-flex align-items-center justify-content-between bg-light bg-opacity-50">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      {/* Kunci Bulat Sempurna (Anti-Melar) */}
                      <div style={{ width: '60px', height: '60px', flexShrink: 0, borderRadius: '50%', overflow: 'hidden', border: '2px solid #e2e8f0' }}>
                        <img 
                          src={currentAvatar} 
                          alt="Profile" 
                          style={{ width: '100%', height: '100%', objectFit: 'cover', backgroundColor: '#ffffff' }} 
                        />
                      </div>
                      <div>
                        <h2 
                          style={{ 
                            fontSize: '18px', 
                            fontWeight: 'bold', 
                            color: darkMode ? '#ffffff' : '#112F58', 
                            margin: 0,
                            transition: 'color 0.3s ease'
                          }}
                        >
                          {userName}
                        </h2>
                        <p 
                          style={{ 
                            fontSize: '14px', 
                            color: darkMode ? '#cbd5e1' : '#64748b', 
                            margin: 0,
                            transition: 'color 0.3s ease'
                          }}
                        >
                          {userEmail}
                        </p>
                      </div>
                    </div>
                    <button className="btn btn-light btn-sm rounded-circle p-2"><ChevronRight size={18} /></button>
                  </div>
                </div>

                <h6 className="fw-bold text-muted small text-uppercase tracking-wider mb-3 px-2">{t("Aplikasi", "Application")}</h6>
                
                {/* Container Mode Gelap Berbentuk Kapsul/Pil Halus Standalone */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem',
                  marginBottom: '1rem',
                  width: '100%',
                  backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff',
                  borderRadius: '1rem',
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                  border: theme === 'dark' ? '1px solid #334155' : '1px solid #f1f5f9'
                }}>
                  
                  {/* Bagian Kiri: Ikon dan Teks Dipaksa Muncul */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '9999px',
                      backgroundColor: theme === 'dark' ? '#334155' : '#f1f5f9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: theme === 'dark' ? '#cbd5e1' : '#64748b'
                    }}>
                      <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
                    </div>
                    
                    {/* INLINE STYLE MUTLAK UNTUK TEKS */}
                    <span style={{ 
                      color: theme === 'dark' ? '#ffffff' : '#112F58', 
                      fontWeight: 'bold', 
                      fontSize: '15px' 
                    }}>
                      {t("Mode Gelap", "Dark Mode")}
                    </span>
                  </div>

                  {/* Bagian Kanan: Toggle Kapsul Elegan */}
                  <button 
                    onClick={toggleTheme}
                    style={{
                      position: 'relative',
                      width: '3.5rem',
                      height: '1.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      backgroundColor: theme === 'dark' ? '#112F58' : '#e2e8f0',
                      borderRadius: '9999px',
                      padding: '0.25rem',
                      transition: 'background-color 0.3s',
                      border: 'none',
                      cursor: 'pointer',
                      outline: 'none'
                    }}
                  >
                    <div style={{
                      width: '1.25rem',
                      height: '1.25rem',
                      backgroundColor: '#ffffff',
                      borderRadius: '9999px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                      transform: theme === 'dark' ? 'translateX(1.75rem)' : 'translateX(0)',
                      transition: 'transform 0.3s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {theme === 'dark' ? (
                        <svg style={{ width: '0.75rem', height: '0.75rem', color: '#112F58' }} fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path></svg>
                      ) : (
                        <svg style={{ width: '0.75rem', height: '0.75rem', color: '#f97316' }} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd"></path></svg>
                      )}
                    </div>
                  </button>
                </div>

                <div className="w-full card-mooduit overflow-hidden mb-4 p-0">
                  <div className="list-group list-group-flush border-0">
                    <div className="list-group-item d-flex align-items-center justify-content-between p-3 border-0 border-bottom">
                      <div className="d-flex align-items-center gap-3">
                        <div className="p-2 bg-light rounded-lg"><Languages size={20} /></div>
                        <span className="fw-500">{t("Bahasa", "Language")}</span>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <select
                          value={language}
                          onChange={(e) => setLanguage(e.target.value as 'id' | 'en')}
                          className="bg-transparent border-0 font-bold focus:outline-none cursor-pointer pr-1 text-sm text-[#112F58]"
                          id="language_select"
                        >
                          <option value="id">{t("Bahasa Indonesia", "Indonesian")}</option>
                          <option value="en">{t("Bahasa Inggris", "English")}</option>
                        </select>
                        <ChevronRight size={18} className="text-muted" />
                      </div>
                    </div>
                    <div className="notif-row">
                      
                      {/* Bagian Kiri: Ikon & Teks */}
                      <div className="notif-left">
                        {/* Kiri: Ikon Lonceng */}
                        <div className="bell-wrapper">
                          <svg className="bell-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                          </svg>
                        </div>
                        <span className="notif-label">
                          Notification
                        </span>
                      </div>
                      
                      {/* Bagian Kanan: Toggle Kapsul Minimalis (Sejalan dengan Mode Gelap) */}
                      <button 
                        onClick={() => setNotifEnabled(!notifEnabled)} 
                        className={`notif-toggle ${notifEnabled ? 'enabled' : 'disabled'}`}
                        aria-label="Toggle Notification"
                      >
                        <div className="notif-toggle-handle">
                          {notifEnabled ? (
                            <svg className="notif-knob-icon" fill="currentColor" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                            </svg>
                          ) : (
                            <svg className="notif-knob-icon" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                            </svg>
                          )}
                        </div>
                      </button>
                      
                    </div>
                  </div>
                </div>

                <h6 className="fw-bold text-muted small text-uppercase tracking-wider mb-3 px-2">{t("Keamanan", "Security")}</h6>
                <div className="w-full card-mooduit overflow-hidden mb-4 p-0">
                  <div className="list-group list-group-flush border-0">
                    <button 
                      onClick={() => setIsPrivacyModalOpen(true)}
                      className="privacy-btn"
                      type="button"
                    >
                      <div className="privacy-left">
                        <div className="privacy-icon-wrapper"><Shield size={20} /></div>
                        <span className="privacy-text">{t("Privasi & Keamanan", "Privacy & Security")}</span>
                      </div>
                      <ChevronRight size={18} className="privacy-chevron" />
                    </button>
                  </div>
                </div>

                <button 
                  onClick={handleLogout}
                  className="w-full mooduit-logout-btn"
                >
                  <LogOut size={20} />
                  {t("Keluar Akun", "Logout")}
                </button>

                <div className="text-center mt-4">
                  <p className="text-muted small mb-0">MOODUIT v1.0.0 Alpha</p>
                  <p className="text-muted small">{t("Dibuat dengan ❤️ untuk Gen Z", "Made with ❤️ for Gen Z")}</p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="profile-settings"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="w-full flex flex-col gap-5 !bg-transparent"
            >
              {/* BACK HEADER */}
              <div className="mooduit-profile-header">
                <button 
                  onClick={() => setActiveView('main')}
                  className="mooduit-profile-back-btn"
                  title="Kembali ke Pengaturan"
                >
                  <ArrowLeft size={20} />
                  <span>{t("Kembali", "Back")}</span>
                </button>
                <h2 className="mooduit-profile-title">{t("Profil Akun", "Account Profile")}</h2>
              </div>

              {/* CHANGE AVATAR AREA */}
              <div className="mooduit-profile-avatar-section">
                <div 
                  className="mooduit-profile-avatar-container"
                  onClick={handleAvatarClick}
                >
                  <img 
                    src={currentAvatar} 
                    alt="Current Profile Avatar" 
                    className="mooduit-profile-avatar-img"
                  />
                  <div className="mooduit-profile-avatar-overlay">
                    <Camera size={24} className="text-white" />
                  </div>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleAvatarChange} 
                  accept="image/*" 
                  className="hidden" 
                />
                <p className="mooduit-profile-avatar-tip">
                  {t("Klik untuk mengubah foto profil", "Click to change profile picture")}
                </p>
              </div>

              {/* PERSONAL INFO FORM */}
              <div className="w-full card-mooduit p-4 md:p-5 flex flex-col gap-4">
                <h3 className="mooduit-section-subtitle">{t("Data Diri", "Personal Info")}</h3>
                
                <div className="mooduit-form-group">
                  <label className="mooduit-form-label">{t("Nama Lengkap", "Full Name")}</label>
                  <input 
                    type="text" 
                    value={userName} 
                    onChange={(e) => setUserName(e.target.value)}
                    className="mooduit-form-input"
                    placeholder={t("Masukkan nama lengkap", "Enter full name")}
                  />
                </div>

                <div className="mooduit-form-group">
                  <label className="mooduit-form-label">{t("Email", "Email Address")}</label>
                  <input 
                    type="email" 
                    value={userEmail} 
                    disabled 
                    readOnly
                    className="mooduit-form-input readonly-input"
                  />
                  <span className="mooduit-form-tip">{t("Email tidak dapat diubah", "Email address cannot be changed")}</span>
                </div>
              </div>

              {/* CHANGE PASSWORD SECTION */}
              <div className="w-full card-mooduit p-4 md:p-5 flex flex-col gap-4">
                <h3 className="mooduit-section-subtitle">
                  {isGoogleUser 
                    ? t("Buat Kata Sandi (Untuk Login Manual)", "Create Password (For Manual Login)") 
                    : t("Ganti Kata Sandi", "Change Password")}
                </h3>

                {/* Password Lama */}
                {!isGoogleUser && (
                  <div className="mooduit-form-group">
                    <label className="mooduit-form-label">{t("Kata Sandi Lama", "Old Password")}</label>
                    <div className="position-relative w-100">
                      <input 
                        type={showOld ? "text" : "password"} 
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        className="mooduit-form-input pr-10"
                        placeholder={t("Masukkan kata sandi lama", "Enter old password")}
                      />
                      <button 
                        type="button"
                        onClick={() => setShowOld(!showOld)}
                        className="mooduit-password-toggle-btn"
                      >
                        {showOld ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Password Baru */}
                <div className="mooduit-form-group">
                  <label className="mooduit-form-label">{t("Kata Sandi Baru", "New Password")}</label>
                  <div className="position-relative w-100">
                    <input 
                      type={showNew ? "text" : "password"} 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="mooduit-form-input pr-10"
                      placeholder={t("Masukkan kata sandi baru", "Enter new password")}
                    />
                    <button 
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="mooduit-password-toggle-btn"
                    >
                      {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Konfirmasi Password */}
                <div className="mooduit-form-group">
                  <label className="mooduit-form-label">{t("Konfirmasi Kata Sandi Baru", "Confirm New Password")}</label>
                  <div className="position-relative w-100">
                    <input 
                      type={showConfirm ? "text" : "password"} 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="mooduit-form-input pr-10"
                      placeholder={t("Ulangi kata sandi baru", "Repeat new password")}
                    />
                    <button 
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="mooduit-password-toggle-btn"
                    >
                      {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* SAVE BUTTON */}
              <button 
                onClick={() => {
                  // If any password fields are typed, validate and call change-password API
                  if (oldPassword || newPassword || confirmPassword || (isGoogleUser && (newPassword || confirmPassword))) {
                    if (!isGoogleUser && !oldPassword) {
                      alert(language === 'id' ? 'Kata sandi lama wajib diisi!' : 'Old password is required!');
                      return;
                    }
                    if (!newPassword) {
                      alert(language === 'id' ? 'Kata sandi baru wajib diisi!' : 'New password is required!');
                      return;
                    }
                    if (newPassword !== confirmPassword) {
                      alert(language === 'id' ? 'Konfirmasi kata sandi baru tidak cocok!' : 'New password confirmation does not match!');
                      return;
                    }

                    // Call backend api
                    fetch('/api/change-password', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json'
                      },
                      body: JSON.stringify({
                        email: userEmail,
                        oldPassword: isGoogleUser ? '' : oldPassword,
                        newPassword
                      })
                    })
                    .then(async (res) => {
                      const data = await res.json();
                      if (!res.ok) {
                        alert(data.error || (language === 'id' ? 'Gagal mengubah kata sandi' : 'Failed to change password'));
                        return;
                      }
                      alert(language === 'id' ? 'Kata sandi berhasil diubah!' : 'Password successfully updated!');
                      
                      // Save profile details as well
                      localStorage.setItem('userName', userName);
                      localStorage.setItem('userAvatar', currentAvatar);
                      
                      window.dispatchEvent(new Event('avatarChanged'));
                      window.dispatchEvent(new Event('profileUpdated'));
                      
                      setOldPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                      setActiveView('main');
                    })
                    .catch((err) => {
                      alert(err.message || 'Error occurred');
                    });
                    
                    return;
                  }

                  // If no password fields are filled, just save profile details
                  localStorage.setItem('userName', userName);
                  localStorage.setItem('userAvatar', currentAvatar);
                  
                  // Fire custom event to notify Sidebar/Header/Layout of changes
                  window.dispatchEvent(new Event('avatarChanged'));
                  window.dispatchEvent(new Event('profileUpdated'));
                  
                  // Optionally clear password fields
                  setOldPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                  
                  // Return back to main settings
                  setActiveView('main');
                }}
                className="w-full mooduit-save-profile-btn"
              >
                {t("Simpan Perubahan", "Save Changes")}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* Pop-up Modal Pilih Avatar */}
      <AnimatePresence>
        {isAvatarModalOpen && (
          <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ zIndex: 2000 }}>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="position-absolute top-0 start-0 w-100 h-100 bg-black bg-opacity-50 backdrop-blur-sm"
              onClick={() => setIsAvatarModalOpen(false)}
            />
            {/* Modal Box */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-2xl position-relative overflow-hidden w-[90%] max-w-[420px]"
              style={{ border: '1px solid rgba(255,255,255,0.1)' }}
            >
              {/* Header */}
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <h5 className="font-bold text-[#112F58] dark:text-white mb-1" style={{ fontSize: '18px', margin: 0 }}>
                    {t("Pilih Avatar Kamu", "Choose Your Avatar")}
                  </h5>
                  <p className="text-xs text-slate-500 dark:text-slate-400 m-0 mt-1">
                    {t("Pilih salah satu karakter lucu di bawah ini!", "Select one of the cute characters below!")}
                  </p>
                </div>
                <button 
                  onClick={() => setIsAvatarModalOpen(false)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: '#f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                  className="dark:bg-slate-700 text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Grid Pilihan Avatar */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                {avatarOptions.map((avatar, idx) => {
                  const isSelected = currentAvatar === avatar;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setCurrentAvatar(avatar);
                        localStorage.setItem('userAvatar', avatar);
                        // Trigger event to notify layout/header to update avatar in real time
                        window.dispatchEvent(new Event('avatarChanged'));
                      }}
                      className={`relative flex items-center justify-center p-2 rounded-2xl transition-all duration-200 border-2 bg-slate-50 dark:bg-slate-700/50 hover:scale-105 active:scale-95 ${
                        isSelected 
                          ? 'border-[#112F58] dark:border-white ring-4 ring-blue-100 dark:ring-slate-700' 
                          : 'border-transparent hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                      style={{ outline: 'none' }}
                    >
                      <img 
                        src={avatar} 
                        alt={`Avatar ${idx + 1}`} 
                        className="w-16 h-16 object-cover bg-white rounded-full p-1 shadow-sm"
                      />
                      {isSelected && (
                        <div className="absolute top-1 right-1 bg-[#112F58] text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold">
                          ✓
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <button 
                onClick={() => setIsAvatarModalOpen(false)}
                className="w-full text-white font-semibold py-3 rounded-full transition-all text-sm shadow-md"
                style={{ backgroundColor: '#112F58', border: 'none' }}
              >
                {t("Simpan", "Save")}
              </button>
            </motion.div>
          </div>
        )}

        {isPrivacyModalOpen && (
          <div className="security-modal-overlay">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="security-modal-backdrop"
              onClick={() => setIsPrivacyModalOpen(false)}
            />
            {/* Modal Box */}
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: "spring", duration: 0.4, bounce: 0.2 }}
              className="security-modal-content"
            >
              {/* Header */}
              <div className="security-modal-header">
                <h5 className="security-modal-title">
                  {t("Kebijakan Privasi & Keamanan", "Privacy & Security Policy")}
                </h5>
                <button 
                  onClick={() => setIsPrivacyModalOpen(false)}
                  className="security-modal-close"
                  type="button"
                >
                  ✕
                </button>
              </div>

              {/* Body */}
              <div className="security-modal-body">
                <div className="security-badge">
                  <Shield size={14} />
                  <span>AES-256 Secured</span>
                </div>

                <div className="security-section">
                  <h6 className="security-section-title">
                    🛡️ {t("Enkripsi Standar Militer", "Military-Grade Encryption")}
                  </h6>
                  <p className="security-section-text">
                    {t(
                      "MOODUIT melindungi seluruh data sensitif kamu menggunakan teknologi enkripsi AES-256 bit tingkat lanjut. Proses enkripsi dilakukan secara end-to-end, memastikan informasi keuangan, catatan, dan transaksi harian tidak dapat diakses oleh pihak luar.",
                      "MOODUIT secures all your sensitive data using advanced AES-256 bit encryption. The encryption process is executed end-to-end, ensuring that your financial information, journals, and daily transactions remain completely inaccessible to external parties."
                    )}
                  </p>
                </div>

                <div className="security-section">
                  <h6 className="security-section-title">
                    ☁️ {t("Penyimpanan Cloud & Firestore Aman", "Secure Cloud & Firestore Storage")}
                  </h6>
                  <p className="security-section-text">
                    {t(
                      "Infrastruktur backend kami berbasis Google Cloud Platform & Firebase Firestore dengan aturan keamanan (Security Rules) yang diperketat secara berlapis. Akses data diautentikasi dengan token aman dan didelegasikan secara ketat berdasarkan kepemilikan akun pengguna.",
                      "Our backend infrastructure runs on Google Cloud Platform & Firebase Firestore, fortified by multi-layered Security Rules. Data access is authenticated via secure tokens and strictly delegated based on user account ownership."
                    )}
                  </p>
                </div>

                <div className="security-section">
                  <h6 className="security-section-title">
                    🔒 {t("Jaminan Privasi Data 100%", "100% Data Privacy Guarantee")}
                  </h6>
                  <p className="security-section-text">
                    {t(
                      "Privasi kamu adalah prioritas mutlak bagi kami. Kami tidak pernah menjual, menyewakan, atau membagikan aktivitas finansial, catatan suasana hati, maupun informasi demografi kamu kepada platform iklan pihak ketiga atau perantara data.",
                      "Your privacy is our absolute priority. We never sell, rent, or share your financial logs, mood tracking records, or demographic information with third-party advertising networks or data brokers."
                    )}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="security-modal-footer">
                <button 
                  onClick={() => setIsPrivacyModalOpen(false)}
                  className="security-modal-btn"
                  type="button"
                >
                  {t("Mengerti", "I Understand")}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
