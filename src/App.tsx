/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Toaster } from 'react-hot-toast';
import LandingPage from './components/LandingPage';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import Scanner from './components/Scanner';
import Transactions from './components/Transactions';
import Wishlist from './components/Wishlist';
import Settings from './components/Settings';
import SmartBudget from './components/SmartBudget';
import Layout from './components/Layout';
import { fetchAllTransactions } from './utils/api';
import ResetPassword from './components/ResetPassword';

import Analysis from './components/Analysis';

type Page = 'landing' | 'auth' | 'dashboard' | 'scanner' | 'history' | 'wishlist' | 'settings' | 'smart-budget' | 'analisa';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [user, setUser] = useState<any>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  
  // Logic Gate Data Simulation
  const [saldoDanaDarurat, setSaldoDanaDarurat] = useState(0);

  const [pendingOcrData, setPendingOcrData] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
    // 1. Periksa sesi tersimpan menggunakan key 'mooduit_session' dengan Session Expiry 24 Jam (Rolling)
    const savedSessionString = localStorage.getItem('mooduit_session');
    let authenticatedUser = null;
    
    if (savedSessionString) {
      try {
        const savedSession = JSON.parse(savedSessionString);
        const currentTime = Date.now();

        // Cek apakah waktu 24 jam sudah terlewati (tidak aktif > 24 jam)
        if (currentTime > savedSession.expiresAt) {
          // Sesi habis: Hapus memori dan paksa ke halaman Login
          localStorage.removeItem('mooduit_session');
          localStorage.removeItem('mooduit_user');
          const savedTheme = localStorage.getItem('theme');
          const savedLanguage = localStorage.getItem('language');
          localStorage.clear();
          if (savedTheme) localStorage.setItem('theme', savedTheme);
          if (savedLanguage) localStorage.setItem('language', savedLanguage);
          setUser(null);
          setCurrentPage('landing');
          alert("Sesi keamanan 24 jam Anda telah berakhir. Silakan login kembali untuk keamanan keuanganmu!");
        } else {
          // Sesi masih valid: Masuk otomatis ke Beranda DAN PERPANJANG durasi sesi 24 jam lagi dari sekarang (Rolling Session)
          authenticatedUser = savedSession.user;
          setUser(authenticatedUser);
          savedSession.expiresAt = Date.now() + TWENTY_FOUR_HOURS;
          localStorage.setItem('mooduit_session', JSON.stringify(savedSession));
          localStorage.setItem('mooduit_user', JSON.stringify(authenticatedUser));
          
          // Sinkronisasi data ke key lain untuk kompatibilitas penuh dengan komponen lain
          localStorage.setItem('userName', authenticatedUser.name);
          localStorage.setItem('userEmail', authenticatedUser.email);
          localStorage.setItem('authProvider', authenticatedUser.authProvider || 'local');
          if (authenticatedUser.picture) {
            localStorage.setItem('userAvatar', authenticatedUser.picture);
          }
        }
      } catch (e) {
        console.error("Gagal membaca data sesi 'mooduit_session'", e);
      }
    } else {
      // Fallback kompatibilitas jika key 'mooduit_user' yang terisi
      const savedUserStr = localStorage.getItem('mooduit_user');
      if (savedUserStr) {
        try {
          authenticatedUser = JSON.parse(savedUserStr);
          setUser(authenticatedUser);
          
          const sessionData = {
            user: authenticatedUser,
            expiresAt: Date.now() + TWENTY_FOUR_HOURS
          };
          localStorage.setItem('mooduit_session', JSON.stringify(sessionData));

          // Sinkronisasi data ke key lain untuk kompatibilitas penuh dengan komponen lain
          localStorage.setItem('userName', authenticatedUser.name);
          localStorage.setItem('userEmail', authenticatedUser.email);
          localStorage.setItem('authProvider', authenticatedUser.authProvider || 'local');
          if (authenticatedUser.picture) {
            localStorage.setItem('userAvatar', authenticatedUser.picture);
          }
        } catch (e) {
          console.error("Gagal membaca data sesi 'mooduit_user'", e);
        }
      } else {
        // Fallback legacy name & email
        const legacyName = localStorage.getItem('userName');
        const legacyEmail = localStorage.getItem('userEmail');
        if (legacyName && legacyEmail) {
          authenticatedUser = {
            name: legacyName,
            email: legacyEmail,
            picture: localStorage.getItem('userAvatar'),
            authProvider: localStorage.getItem('authProvider') || 'local'
          };
          setUser(authenticatedUser);
          const sessionData = {
            user: authenticatedUser,
            expiresAt: Date.now() + TWENTY_FOUR_HOURS
          };
          localStorage.setItem('mooduit_session', JSON.stringify(sessionData));
          localStorage.setItem('mooduit_user', JSON.stringify(authenticatedUser));
        }
      }
    }

    // 2. Tentukan halaman tujuan (OAuth Callback, Halaman Terakhir, Dashboard, atau Landing)
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const oauthEmail = params.get('oauth_email') || params.get('email');
    const oauthName = params.get('oauth_name');
    const oauthPicture = params.get('oauth_picture');

    if (token && !oauthEmail) {
      setResetToken(token);
    }

    if (oauthEmail) {
      const nameToUse = oauthName || oauthEmail.split('@')[0];
      const oauthUser = {
        name: nameToUse,
        email: oauthEmail,
        picture: oauthPicture || null,
        token: token || null,
        authProvider: 'google'
      };
      
      localStorage.setItem('userName', nameToUse);
      localStorage.setItem('userEmail', oauthEmail);
      localStorage.setItem('authProvider', 'google');
      if (token) {
        localStorage.setItem('userToken', token);
      }
      if (oauthPicture) {
        localStorage.setItem('userAvatar', oauthPicture);
      }
      localStorage.setItem('mooduit_user', JSON.stringify(oauthUser));
      
      const sessionData = {
        user: oauthUser,
        expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 Jam (Rolling)
      };
      localStorage.setItem('mooduit_session', JSON.stringify(sessionData));
      
      setUser(oauthUser);
      setCurrentPage('dashboard');
      localStorage.setItem('mooduit_current_page', 'dashboard');
      
      // Bersihkan parameter dari URL
      const url = new URL(window.location.href);
      url.searchParams.delete('token');
      url.searchParams.delete('email');
      url.searchParams.delete('oauth_email');
      url.searchParams.delete('oauth_name');
      url.searchParams.delete('oauth_picture');
      window.history.replaceState({}, document.title, url.pathname + url.search);
    } else if (authenticatedUser) {
      const lastPage = localStorage.getItem('mooduit_current_page');
      if (lastPage && ['dashboard', 'scanner', 'history', 'wishlist', 'settings', 'smart-budget', 'analisa'].includes(lastPage)) {
        setCurrentPage(lastPage as Page);
      } else {
        setCurrentPage('dashboard');
        localStorage.setItem('mooduit_current_page', 'dashboard');
      }
    } else {
      setCurrentPage('landing');
    }
    
    setIsAuthLoading(false);
  }, []);

  const handleCloseResetPassword = () => {
    setResetToken(null);
    const url = new URL(window.location.href);
    url.searchParams.delete('token');
    window.history.replaceState({}, document.title, url.pathname + url.search);
    handleStart('login');
  };

  useEffect(() => {
    async function initDB() {
      if (!user?.email) {
        setTransactions([]);
        return;
      }
      try {
        const data = await fetchAllTransactions(user.email);
        // Strictly purge any legacy or dummy transactions with dummy-like IDs or content keywords
        const cleaned = data.filter(t => {
          if (!t || typeof t !== 'object') return false;
          
          // Check IDs - strictly purge explicitly designated legacy template-level dummy transactions with IDs 1-5
          const isDummyId = [1, 2, 3, 4, 5].includes(Number(t.id));
          
          return !isDummyId;
        });
        
        setTransactions(cleaned);
      } catch (e) {
        console.error("DB Initialization error:", e);
      }
    }
    initDB();
  }, [user?.email]);

  const handleStart = (mode: 'login' | 'register' = 'login') => {
    setAuthMode(mode);
    setCurrentPage('auth');
  };

  const handleAuth = (userData: any) => {
    setUser(userData);
    const sessionData = {
      user: userData,
      expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 Jam (Rolling)
    };
    localStorage.setItem('mooduit_session', JSON.stringify(sessionData));
    localStorage.setItem('mooduit_user', JSON.stringify(userData));
    localStorage.setItem('authProvider', userData.authProvider || 'local');
    localStorage.setItem('userName', userData.name);
    localStorage.setItem('userEmail', userData.email);
    if (userData.picture) {
      localStorage.setItem('userAvatar', userData.picture);
    }
    setCurrentPage('dashboard');
    localStorage.setItem('mooduit_current_page', 'dashboard');
  };

  const handleLogout = () => {
    // Simpan preferensi tema dan bahasa agar tidak ikut terhapus
    const savedTheme = localStorage.getItem('theme');
    const savedLanguage = localStorage.getItem('language');
    
    // Hapus sesi secara eksplisit sesuai instruksi
    localStorage.removeItem('mooduit_user');
    localStorage.removeItem('mooduit_session');
    
    // Bersihkan seluruh data sesi (termasuk userName, profil, dll)
    localStorage.clear();
    
    // Kembalikan preferensi tema dan bahasa
    if (savedTheme) localStorage.setItem('theme', savedTheme);
    if (savedLanguage) localStorage.setItem('language', savedLanguage);

    // Hapus status user di state React
    setUser(null);

    // Redirect ke Landing Page
    setCurrentPage('landing');
  };

  // Auth guard effect untuk mengunci halaman dashboard/fitur jika tidak login
  useEffect(() => {
    if (isAuthLoading) return;
    
    const isPublicPage = ['landing', 'auth'].includes(currentPage);
    const hasSession = localStorage.getItem('userName') !== null;
    if (!isPublicPage && !user && !hasSession) {
      setCurrentPage('landing');
    }
  }, [currentPage, user, isAuthLoading]);

  const handleNavigate = (page: string, data?: any) => {
    if (data) {
       setPendingOcrData(data);
    }
    setCurrentPage(page as Page);
    localStorage.setItem('mooduit_current_page', page);
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage onStart={handleStart} />;
      case 'auth':
        return <Auth onAuth={handleAuth} onClose={() => setCurrentPage('landing')} initialMode={authMode} />;
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} saldoDanaDarurat={saldoDanaDarurat} transactions={transactions} setTransactions={setTransactions} />;
      case 'scanner':
        return <Scanner onNavigate={handleNavigate} setTransactions={setTransactions} />;
      case 'history':
        return <Transactions transactions={transactions} setTransactions={setTransactions} />;
      case 'wishlist':
        return <Wishlist />;
      case 'settings':
        return <Settings onLogout={handleLogout} />;
      case 'smart-budget':
        return <SmartBudget onNavigate={handleNavigate} />; 
      case 'analisa':
        return <Analysis transactions={transactions} />;
      default:
        return <Dashboard onNavigate={handleNavigate} saldoDanaDarurat={saldoDanaDarurat} transactions={transactions} setTransactions={setTransactions} />;
    }
  };

  const needsLayout = !['landing', 'auth', 'scanner'].includes(currentPage);

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-t-[#112F58] border-[#112F58]/20 rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-[#112F58]/75 dark:text-white/75 text-center">Memeriksa sesi...</p>
        </div>
      </div>
    );
  }

  if (resetToken) {
    return (
      <div className="mooduit-app">
        <Toaster position="top-center" reverseOrder={false} />
        <ResetPassword token={resetToken} onClose={handleCloseResetPassword} />
      </div>
    );
  }

  return (
    <div className="mooduit-app">
      <Toaster position="top-center" reverseOrder={false} />
      <AnimatePresence mode="wait">
        {needsLayout ? (
          <Layout 
            key="app-layout" 
            activePage={currentPage} 
            onNavigate={handleNavigate}
            pendingData={pendingOcrData}
            onClearPendingData={() => setPendingOcrData(null)}
            transactions={transactions}
            setTransactions={setTransactions}
          >
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.25 }}
            >
              {renderContent()}
            </motion.div>
          </Layout>
        ) : (
          <motion.div
            key={currentPage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderContent()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
