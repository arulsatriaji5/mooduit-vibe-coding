import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Home, List, Shield, Calculator, PieChart, Settings as SettingsIcon, LogOut, Plus, Camera, Keyboard, X } from 'lucide-react';
import Logo from './Logo';
import { useThemeLanguage } from '../context/ThemeLanguageContext';
import { insertTransaction } from '../utils/api';

interface LayoutProps {
  children: React.ReactNode;
  activePage: string;
  onNavigate: (page: string, data?: any) => void;
  pendingData?: any;
  onClearPendingData?: () => void;
  key?: string;
  transactions?: any[];
  setTransactions?: React.Dispatch<React.SetStateAction<any[]>>;
}

export default function Layout({ children, activePage, onNavigate, pendingData, onClearPendingData, transactions, setTransactions }: LayoutProps) {
  const { t } = useThemeLanguage();
  const [showActionModal, setShowActionModal] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualJenis, setManualJenis] = useState<'pemasukan' | 'pengeluaran'>('pengeluaran');
  const [manualTanggal, setManualTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [manualNominal, setManualNominal] = useState("");
  const [manualKategori, setManualKategori] = useState("Kebutuhan Pokok");
  const [manualCatatan, setManualCatatan] = useState("");

  const kategoriPengeluaran = [
    { id: "Kebutuhan Pokok", icon: "🛒" },
    { id: "Transportasi", icon: "🚗" },
    { id: "Hiburan", icon: "🎬" },
    { id: "Makan & Minum", icon: "🍜" },
    { id: "Kesehatan", icon: "💊" },
    { id: "Pendidikan", icon: "📚" },
    { id: "Tagihan", icon: "📄" },
    { id: "Belanja", icon: "👕" },
    { id: "Lainnya", icon: "📦" }
  ];

  const kategoriPemasukan = [
    { id: "Gaji & Upah", icon: "💰" },
    { id: "Bonus & THR", icon: "🎉" },
    { id: "Hasil Usaha", icon: "🏪" },
    { id: "Investasi", icon: "📈" },
    { id: "Pemberian", icon: "🎁" },
    { id: "Lainnya", icon: "📦" }
  ];

  const kategoriAktif = manualJenis === "pengeluaran" ? kategoriPengeluaran : kategoriPemasukan;

  React.useEffect(() => {
    if (pendingData && pendingData.openManual) {
      setManualNominal(Number(pendingData.nominal).toLocaleString('id-ID'));
      setManualCatatan(pendingData.catatan || "");
      setManualKategori(pendingData.kategori || "Lainnya");
      setIsManualModalOpen(true);
      if (onClearPendingData) onClearPendingData();
    }
  }, [pendingData, onClearPendingData]);

  const handleNominalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    setManualNominal(rawValue ? Number(rawValue).toLocaleString('id-ID') : "");
  };

  const navItems = [
    { id: 'dashboard', icon: <Home size={18} />, label: t('Beranda', 'Home') },
    { id: 'smart-budget', icon: <Calculator size={18} />, label: t('Smart Budget', 'Smart Budget') },
    { id: 'scanner', icon: <Camera size={20} />, label: t('Scan', 'Scan'), isAction: true },
    { id: 'analisa', icon: <PieChart size={18} />, label: t('Analisa', 'Analysis') },
    { id: 'history', icon: <List size={18} />, label: t('Riwayat', 'History') },
    { id: 'settings', icon: <SettingsIcon size={18} />, label: t('Pengaturan', 'Settings') },
  ];

  const [userName, setUserName] = useState(() => {
    return localStorage.getItem('userName') || 'Arul Satriaji';
  });

  const [userAvatar, setUserAvatar] = useState(() => {
    const email = localStorage.getItem('userEmail');
    const savedLocalAvatar = email ? localStorage.getItem(`avatar_${email}`) : null;
    return localStorage.getItem('userAvatar') || savedLocalAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=Arul`;
  });

  React.useEffect(() => {
    const handleProfileChange = () => {
      const updatedName = localStorage.getItem('userName') || 'Arul Satriaji';
      const email = localStorage.getItem('userEmail');
      const savedLocalAvatar = email ? localStorage.getItem(`avatar_${email}`) : null;
      setUserName(updatedName);
      setUserAvatar(localStorage.getItem('userAvatar') || savedLocalAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=Arul`);
    };
    window.addEventListener('avatarChanged', handleProfileChange);
    window.addEventListener('profileUpdated', handleProfileChange);
    return () => {
      window.removeEventListener('avatarChanged', handleProfileChange);
      window.removeEventListener('profileUpdated', handleProfileChange);
    };
  }, []);

  return (
    <div className="min-h-screen bg-bg-light overflow-x-hidden w-full max-w-full box-border">
      <div className="d-flex h-100 overflow-hidden w-full max-w-full box-border">
        {/* Desktop Sidebar */}
        <aside className="sidebar-mooduit d-none d-lg-flex flex-column position-fixed h-100" style={{ width: '260px', zIndex: 1100, backgroundColor: '#112F58' }}>
          <div className="p-4">
            <Logo size={40} showText={true} variant="light" />
          </div>

          <nav className="flex-grow-1 px-3">
            {navItems.map((item) => {
              if (item.id === 'scanner') {
                return (
                  <button 
                    key={item.id}
                    onClick={() => setShowActionModal(true)}
                    style={{ backgroundColor: '#B9AB8C', color: '#112F58' }}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all shadow-sm group border-0 mb-2 cursor-pointer"
                  >
                    <span className="flex items-center justify-center shrink-0">
                      {item.icon}
                    </span>
                    <span className="font-bold whitespace-nowrap overflow-hidden text-ellipsis text-sm">{item.label}</span>
                  </button>
                );
              }
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`border-0 w-100 text-start px-3 py-2.5 mb-2 rounded-xl transition-all d-flex align-items-center gap-3 cursor-pointer ${
                    activePage === item.id 
                      ? 'active bg-white bg-opacity-10' 
                      : 'text-white opacity-70 hover:opacity-100'
                  }`}
                  style={{ 
                    backgroundColor: 'transparent',
                    color: 'inherit'
                  }}
                >
                  <span className="flex items-center justify-center shrink-0">
                    {item.icon}
                  </span>
                  <span className="small fw-bold whitespace-nowrap overflow-hidden text-ellipsis">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>

          <div className="nav-footer mt-auto p-4 border-top border-white border-opacity-10 d-flex align-items-center gap-3">
            <div className="rounded-circle border-2 border-white border-opacity-20 overflow-hidden" style={{ width: '40px', height: '40px' }}>
              <img src={userAvatar} alt="Avatar" className="w-100 h-100" />
            </div>
            <div className="flex-grow-1 overflow-hidden">
               <div className="text-white small fw-bold text-truncate">{userName}</div>
               <div className="text-white opacity-50 x-small" style={{ fontSize: '10px' }}>{t('Pengguna Aktif', 'Active User')}</div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-grow-1 w-full lg:w-auto overflow-x-hidden max-w-full box-border" style={{ marginLeft: 'var(--sidebar-offset, 0)' }}>
          {/* Mobile Header */}
          <div className="d-lg-none py-3 px-4 bg-primary-mooduit position-sticky top-0 w-100 d-flex justify-content-between align-items-center shadow-sm" style={{ zIndex: 1000 }}>
            <Logo size={32} showText={true} variant="light" />
            {/* Profil User di Kanan Atas - Dijadikan Tombol ke Pengaturan */}
            <div 
              onClick={() => onNavigate('settings')}
              className="p-1 cursor-pointer transition-transform active:scale-95 flex items-center justify-center rounded-full"
              title="Buka Pengaturan"
              id="header_profile_btn"
            >
              {userAvatar ? (
                <img 
                  src={userAvatar} 
                  alt="Profile" 
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-transparent hover:border-blue-200 shadow-sm transition-all" 
                />
              ) : (
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-blue-100 text-[#001F3F] font-bold flex items-center justify-center shadow-sm border border-blue-200">
                  {userName ? userName.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
            </div>
          </div>
          
          <main className="w-full max-w-full px-4 md:px-8 py-4 py-lg-5 overflow-x-hidden box-border">
            <div className="w-full max-w-7xl mx-auto">
              {/* Adjust margin for desktop sidebar */}
              <style dangerouslySetInnerHTML={{ __html: `
                :root { --sidebar-offset: 0px; }
                @media (min-width: 992px) {
                  :root { --sidebar-offset: 260px; }
                }
              ` }} />
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* Bottom Navigation (Mobile Only) */}
      <nav className="fixed-bottom bg-white d-lg-none px-1 py-2 shadow-2xl" style={{ borderTop: '1px solid rgba(0,0,0,0.05)', height: '75px', zIndex: 1050 }}>
        <div className="container-fluid d-flex justify-content-around align-items-center h-100">
          {navItems.filter(item => item.id !== 'settings').map((item) => {
            const isScanner = item.id === 'scanner';
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (isScanner) {
                    setShowActionModal(true);
                  } else {
                    onNavigate(item.id);
                  }
                }}
                className={`btn border-0 d-flex flex-column align-items-center justify-center p-2 transition-all ${
                  isScanner 
                    ? 'text-primary-mooduit rounded-circle shadow-xl mb-5' 
                    : activePage === item.id 
                    ? 'text-primary-mooduit' 
                    : 'text-muted opacity-50'
                }`}
                style={isScanner ? { 
                  width: '64px', 
                  height: '64px', 
                  backgroundColor: '#B9AB8C', 
                  color: '#FFFFFF',
                  border: '5px solid white'
                } : {}}
              >
                <div className={isScanner ? 'mb-0' : 'mb-0.5'}>{item.icon}</div>
                {!isScanner && <span className="fw-bold" style={{ fontSize: '9px' }}>{item.label}</span>}
                {isScanner && <span className="fw-800" style={{ fontSize: '10px', marginTop: '2px' }}>Scan</span>}
                {(activePage === item.id && !isScanner) && (
                  <motion.div 
                    layoutId="activeTab"
                    className="bg-primary-mooduit rounded-full mt-1" 
                    style={{ width: '4px', height: '4px' }} 
                  />
                )}
              </button>
            );
          })}
        </div>
      </nav>
      {/* Action Modal */}
      <AnimatePresence>
        {showActionModal && (
          <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ zIndex: 2000 }}>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="position-absolute top-0 start-0 w-100 h-100 bg-black bg-opacity-50"
              onClick={() => setShowActionModal(false)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl p-4 shadow-2xl position-relative overflow-hidden"
              style={{ width: '90%', maxWidth: '360px' }}
            >
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-800 text-primary-mooduit mb-0">{t('Catat Transaksi', 'Record Transaction')}</h5>
                <button className="btn btn-light rounded-circle p-1" onClick={() => setShowActionModal(false)}><X size={20}/></button>
              </div>

              <div className="d-flex flex-column">
                <button 
                  type="button"
                  className="group w-full flex items-center gap-4 p-4 rounded-xl border border-gray-200 bg-[#112F58] hover:bg-[#1a4a86] active:bg-[#0e2646] active:scale-95 transition-all duration-150 mb-3 focus:outline-none focus:ring-2 focus:ring-[#112F58]"
                  onClick={() => {
                    setShowActionModal(false);
                    onNavigate('scanner');
                  }}
                >
                  <div className="w-12 h-12 rounded-full flex shrink-0 items-center justify-center bg-blue-500 text-white shadow-sm">
                    <Camera size={24} />
                  </div>
                  <div className="text-start">
                    <h4 className="font-bold text-white mb-0" style={{ fontSize: '1.05rem' }}>{t('Scan Struk', 'Scan Receipt')}</h4>
                    <p className="text-sm text-blue-100 opacity-80 mb-0">{t('Foto nota atau screenshot mutasi', 'Photograph receipt or transaction screenshot')}</p>
                  </div>
                </button>

                <button 
                  type="button"
                  className="group w-full flex items-center gap-4 p-4 rounded-xl border border-gray-200 bg-[#112F58] hover:bg-[#1a4a86] active:bg-[#0e2646] active:scale-95 transition-all duration-150 mb-2 focus:outline-none focus:ring-2 focus:ring-[#112F58]"
                  onClick={() => {
                    setShowActionModal(false);
                    setIsManualModalOpen(true);
                  }}
                >
                  <div className="w-12 h-12 rounded-full flex shrink-0 items-center justify-center bg-teal-500 text-white shadow-sm">
                    <Keyboard size={24} />
                  </div>
                  <div className="text-start">
                    <h4 className="font-bold text-white mb-0" style={{ fontSize: '1.05rem' }}>{t('Input Manual', 'Manual Input')}</h4>
                    <p className="text-sm text-blue-100 opacity-80 mb-0">{t('Masukkan data secara detail', 'Enter detailed data')}</p>
                  </div>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Manual Input Modal */}
      <AnimatePresence>
        {isManualModalOpen && (
          <div className="fixed inset-0 z-[2100] flex items-end sm:items-center justify-center bg-[#112F58]/40 backdrop-blur-sm p-0 sm:p-4 transition-all duration-300">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#112F58]/20"
              onClick={() => setIsManualModalOpen(false)}
            />
            
            <motion.div 
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white w-full max-w-md sm:rounded-[2.5rem] rounded-t-[2.5rem] shadow-2xl overflow-hidden flex flex-col relative z-10 max-h-[90vh]"
            >
              {/* HEADER */}
              <div className="p-4 sm:p-6 pb-3 flex justify-between items-center border-b border-gray-100">
                <h2 className="text-[#112F58] text-lg sm:text-xl font-extrabold tracking-wide m-0">{t('Tambah Transaksi', 'Add Transaction')}</h2>
                <button 
                  onClick={() => setIsManualModalOpen(false)} 
                  className="bg-gray-50 p-1.5 sm:p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-all focus:outline-none border-0"
                >
                  <X size={18} />
                </button>
              </div>

              {/* KONTEN (Scrollable) */}
              <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                
                {/* TOGGLE PENGELUARAN / PEMASUKAN */}
                <div className="flex bg-gray-100 p-1 rounded-xl sm:rounded-2xl">
                  <button 
                    onClick={() => {
                      setManualJenis("pengeluaran");
                      setManualKategori("Kebutuhan Pokok");
                    }}
                    className={`w-1/2 py-2 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 border-0 ${manualJenis === "pengeluaran" ? "bg-white text-red-500 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}>
                    📉 {t('Pengeluaran', 'Expenses')}
                  </button>
                  <button 
                    onClick={() => {
                      setManualJenis("pemasukan");
                      setManualKategori("Gaji & Upah");
                    }}
                    className={`w-1/2 py-2 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 border-0 ${manualJenis === "pemasukan" ? "bg-white text-green-500 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}>
                    📈 {t('Pemasukan', 'Income')}
                  </button>
                </div>

                {/* INPUT NOMINAL BESAR */}
                <div>
                  <label className="text-gray-500 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest mb-1 sm:mb-2 block px-1">{t('Jumlah Nominal', 'Total Nominal')}</label>
                  <div className="relative flex items-center bg-gray-50 border border-gray-200 rounded-xl sm:rounded-2xl overflow-hidden focus-within:border-[#112F58] focus-within:bg-white transition-all duration-300">
                    <span className={`pl-4 sm:pl-5 text-xl sm:text-2xl font-bold ${manualJenis === "pengeluaran" ? "text-red-500" : "text-green-500"}`}>Rp</span>
                    <input 
                      type="text" 
                      value={manualNominal} 
                      onChange={handleNominalChange} 
                      placeholder="0" 
                      className={`w-full bg-transparent py-3 sm:py-5 pl-2 sm:pl-3 pr-4 sm:pr-5 text-2xl sm:text-4xl font-extrabold focus:outline-none placeholder-gray-300 ${manualJenis === "pengeluaran" ? "text-red-500" : "text-green-500"}`} 
                      autoFocus
                    />
                  </div>
                </div>

                {/* GRID KATEGORI */}
                <div>
                  <label className="text-gray-500 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest mb-2 sm:mb-3 block px-1">{t('Pilih Kategori', 'Select Category')}</label>
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    {kategoriAktif.map((kat) => (
                      <button 
                        key={kat.id}
                        type="button"
                        onClick={() => setManualKategori(kat.id)}
                        className={`flex flex-col items-center justify-center gap-1 sm:gap-2 p-2 sm:p-4 rounded-xl sm:rounded-2xl border transition-all duration-200 ${manualKategori === kat.id ? "bg-[#112F58]/5 border-[#112F58] text-[#112F58] shadow-sm scale-105" : "bg-white border-gray-100 hover:bg-gray-50 text-gray-500"}`}
                      >
                        <span className="text-xl sm:text-2xl drop-shadow-sm">{kat.icon}</span>
                        <span className="text-[9px] sm:text-[10px] text-center font-bold leading-tight break-words">{kat.id.toUpperCase()}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* TANGGAL & CATATAN */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="text-gray-500 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest mb-1 sm:mb-2 block px-1">{t('Tanggal', 'Date')}</label>
                    <input 
                      type="date" 
                      value={manualTanggal} 
                      onChange={(e) => setManualTanggal(e.target.value)} 
                      className="w-full bg-gray-50 text-gray-700 border border-gray-200 rounded-lg sm:rounded-xl p-2.5 sm:p-3.5 text-xs sm:text-sm focus:border-[#112F58] focus:bg-white focus:outline-none transition-all" 
                    />
                  </div>
                  <div>
                    <label className="text-gray-500 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest mb-1 sm:mb-2 block px-1">{t('Catatan', 'Notes')}</label>
                    <input 
                      type="text" 
                      value={manualCatatan} 
                      onChange={(e) => setManualCatatan(e.target.value)} 
                      placeholder={t('Misal: Makan siang...', 'E.g., Lunch...')} 
                      className="w-full bg-gray-50 text-gray-700 border border-gray-200 rounded-lg sm:rounded-xl p-2.5 sm:p-3.5 text-xs sm:text-sm focus:border-[#112F58] focus:bg-white focus:outline-none transition-all placeholder-gray-400" 
                    />
                  </div>
                </div>
              </div>

              {/* TOMBOL SIMPAN */}
              <div className="p-4 sm:p-6 pt-1 sm:pt-2 bg-white">
                <button 
                  className="w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-[#112F58] text-white font-bold text-base sm:text-lg shadow-lg hover:bg-[#1a4a86] active:scale-95 transition-all flex items-center justify-center gap-2 border-0"
                  onClick={async () => {
                    const tempId = Date.now();
                    const newTransaction = {
                      id: tempId,
                      nominal: Number(manualNominal.replace(/\D/g, "")),
                      catatan: manualCatatan || manualKategori,
                      kategori: manualKategori,
                      tanggal: manualTanggal,
                      jenis: manualJenis,
                      icon: kategoriAktif.find(k => k.id === manualKategori)?.icon || "🧾"
                    };

                    // Optimistic update
                    const user_email = localStorage.getItem("userEmail") || "";
                    if (setTransactions) {
                      setTransactions(prev => [newTransaction, ...prev]);
                    }

                    setIsManualModalOpen(false);
                    setManualNominal("");
                    setManualCatatan("");
                    onNavigate('dashboard');
                    
                    // Database insertion
                    try {
                      const inserted = await insertTransaction(newTransaction, user_email);
                      if (setTransactions) {
                        setTransactions(prev => {
                          const index = prev.findIndex(t => String(t.id) === String(tempId));
                          if (index !== -1) {
                            const next = [...prev];
                            next[index] = inserted;
                            return next;
                          }
                          return prev;
                        });
                      }
                      
                      // Trigger success modal with exact streak details from API response!
                      if (typeof window !== "undefined" && (window as any).triggerTransactionSuccess) {
                        (window as any).triggerTransactionSuccess(inserted.currentStreak, inserted.streakIncreasedToday);
                      }
                    } catch (err) {
                      console.error("Failed to insert transaction in background:", err);
                      // Fallback trigger in case of connection issue
                      if (typeof window !== "undefined" && (window as any).triggerTransactionSuccess) {
                        (window as any).triggerTransactionSuccess();
                      }
                    }
                  }}
                >
                  <Plus size={24} strokeWidth={3} />
                  <span>{t('Simpan Transaksi', 'Save Transaction')}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
