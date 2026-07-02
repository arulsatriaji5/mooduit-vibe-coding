/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
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

import Analysis from './components/Analysis';

type Page = 'landing' | 'auth' | 'dashboard' | 'scanner' | 'history' | 'wishlist' | 'settings' | 'smart-budget' | 'analisa';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [user, setUser] = useState<any>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  
  // Logic Gate Data Simulation
  const [saldoDanaDarurat, setSaldoDanaDarurat] = useState(0);

  const [pendingOcrData, setPendingOcrData] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    async function initDB() {
      try {
        const data = await fetchAllTransactions();
        // Strictly purge any legacy or dummy transactions with dummy-like IDs or content keywords
        const cleaned = data.filter(t => {
          if (!t || typeof t !== 'object') return false;
          
          // Check IDs - strictly purge explicitly designated legacy template-level dummy transactions with IDs 1-5
          const isDummyId = [1, 2, 3, 4, 5].includes(Number(t.id));
          
          return !isDummyId;
        });
        
        setTransactions(cleaned);
        localStorage.setItem('transactions', JSON.stringify(cleaned));
      } catch (e) {
        console.error("DB Initialization error:", e);
      }
    }
    initDB();
  }, []);

  const handleStart = (mode: 'login' | 'register' = 'login') => {
    setAuthMode(mode);
    setCurrentPage('auth');
  };

  const handleAuth = (userData: any) => {
    setUser(userData);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    // Simpan preferensi tema dan bahasa agar tidak ikut terhapus
    const savedTheme = localStorage.getItem('theme');
    const savedLanguage = localStorage.getItem('language');
    
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
    const isPublicPage = ['landing', 'auth'].includes(currentPage);
    const hasSession = localStorage.getItem('userName') !== null;
    if (!isPublicPage && !user && !hasSession) {
      setCurrentPage('landing');
    }
  }, [currentPage, user]);

  const handleNavigate = (page: string, data?: any) => {
    if (data) {
      setPendingOcrData(data);
    }
    setCurrentPage(page as Page);
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

  return (
    <div className="mooduit-app">
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
