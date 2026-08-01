import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronRight, 
  ShieldCheck, 
  Sparkles, 
  Lock, 
  ArrowRight, 
  Camera, 
  Brain, 
  PiggyBank,
  CheckCircle2,
  X,
  Menu,
  TrendingUp,
  AlertTriangle,
  Wallet
} from 'lucide-react';
import Logo from './Logo';
import { useThemeLanguage } from '../context/ThemeLanguageContext';

interface LandingPageProps {
  onStart: (mode: 'login' | 'register') => void;
}

export default function LandingPage({ onStart }: LandingPageProps) {
  const { language, t, theme } = useThemeLanguage();
  const darkMode = theme === 'dark';
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="w-full min-h-screen scroll-smooth font-sans mooduit-landing-page" style={{ backgroundColor: darkMode ? '#0f172a' : '#f8fafc', display: 'flex', flexDirection: 'column', transition: 'background-color 0.3s ease' }}>
      <style>{`
        @keyframes floatSmooth {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
          100% { transform: translateY(0px); }
        }
        .animate-float {
          animation: floatSmooth 3.5s ease-in-out infinite;
        }
      `}</style>
      
      {/* --- 1. HEADER (RESPONSIF DENGAN HAMBURGER MENU) --- */}
      <header 
        className="relative sticky top-0 z-[999] w-full transition-all duration-300 mooduit-landing-navbar" 
        style={{ 
          backgroundColor: isScrolled 
            ? (darkMode ? 'rgba(30, 41, 59, 0.75)' : 'rgba(255, 255, 255, 0.75)') 
            : (darkMode ? '#1e293b' : '#ffffff'), 
          backdropFilter: isScrolled ? 'blur(12px)' : 'none',
          WebkitBackdropFilter: isScrolled ? 'blur(12px)' : 'none',
          boxShadow: isScrolled 
            ? '0 4px 12px rgba(17, 47, 88, 0.08)' 
            : '0 10px 15px -3px rgba(17, 47, 88, 0.05), 0 4px 6px -2px rgba(17, 47, 88, 0.03)',
          borderBottom: isScrolled 
            ? (darkMode ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(17, 47, 88, 0.06)') 
            : 'none'
        }}
      >
        <div className="flex justify-between items-center px-4 py-4 md:px-[6%] box-border">
          <div className="flex items-center gap-2 md:gap-3">
            <img src="https://raw.githubusercontent.com/arulsatriaji5/mooduit-vibe-coding/main/Logo_mooduit.png" alt="Logo" className="w-8 h-8 md:w-10 md:h-10 object-contain" />
            <h1 className="text-lg sm:text-xl md:text-2xl font-black m-0 flex">
              <span style={{ color: darkMode ? '#ffffff' : '#112F58' }}>MOO</span>
              <span style={{ color: '#B9AB8C' }}>DUIT</span>
            </h1>
          </div>
 
          {/* Navigation Links - Desktop Only */}
          <nav className="hidden md:flex items-center gap-[30px]">
            {['Krisis', 'Fitur', 'Manfaat', 'Keamanan'].map((item) => {
              const targetId = item === 'Keamanan' ? 'keamanan' : (item === 'Fitur' ? 'fitur' : (item === 'Manfaat' ? 'manfaat' : 'krisis'));
              return (
                <a 
                  key={item}
                  href={`#${targetId}`}
                  onClick={(e) => {
                    e.preventDefault();
                    const element = document.getElementById(targetId);
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  style={{ color: darkMode ? '#cbd5e1' : '#112F58', fontWeight: '600', cursor: 'pointer', fontSize: '15px', textDecoration: 'none' }}
                  className="hover:opacity-70 transition-opacity"
                >
                  {item}
                </a>
              );
            })}
          </nav>
 
          {/* CTAs - Desktop Only */}
          <div className="hidden md:flex items-center gap-[12px]">
            <button 
              style={{ backgroundColor: 'transparent', border: darkMode ? '1px solid #cbd5e1' : '1px solid #112F58', color: darkMode ? '#cbd5e1' : '#112F58', padding: '8px 16px', borderRadius: '10px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', transition: 'all 0.2s' }}
              onClick={() => onStart('login')}
            >
              {language === 'id' ? 'Masuk' : 'Login'}
            </button>
            <button 
              style={{ backgroundColor: darkMode ? '#f8fafc' : '#112F58', color: darkMode ? '#0f172a' : '#ffffff', padding: '8px 16px', borderRadius: '10px', fontWeight: 'bold', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}
              onClick={() => onStart('register')}
            >
              {language === 'id' ? 'Daftar' : 'Register'}
            </button>
          </div>
 
          {/* Mobile Actions Menu */}
          <div className="flex md:hidden items-center gap-2">
            <button 
              style={{ backgroundColor: darkMode ? '#f8fafc' : '#112F58', color: darkMode ? '#0f172a' : '#ffffff', padding: '6px 12px', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '13px' }}
              onClick={() => onStart('login')}
            >
              {language === 'id' ? 'Masuk' : 'Login'}
            </button>
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1 px-2 rounded-lg transition"
              aria-label="Toggle menu"
              style={{ color: darkMode ? '#ffffff' : '#112F58', border: 'none', background: 'transparent', cursor: 'pointer' }}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
 
        {/* DROPDOWN MENU MOBILE (DIPERBAIKI FUNGSI SCROLL-NYA) */}
        {isMobileMenuOpen && (
          <div 
            className="md:hidden absolute top-[100%] left-0 w-full shadow-xl border-t flex flex-col py-2 px-6 z-50 transition-all"
            style={{ 
              backgroundColor: darkMode ? '#1e293b' : '#ffffff', 
              borderTopColor: darkMode ? '#334155' : '#f1f5f9'
            }}
          >
            <a 
              href="#krisis"
              onClick={(e) => { e.preventDefault(); document.getElementById('krisis')?.scrollIntoView({ behavior: 'smooth' }); setIsMobileMenuOpen(false); }} 
              style={{ color: darkMode ? '#cbd5e1' : '#112F58', fontWeight: '600', cursor: 'pointer', fontSize: '16px', padding: '14px 0', textAlign: 'left', borderBottom: darkMode ? '1px solid #334155' : '1px solid #f1f5f9', textDecoration: 'none' }}
              className="w-full flex items-center gap-2"
            >
              ⚠️ Krisis Finansial
            </a>
 
            <a 
              href="#fitur"
              onClick={(e) => { e.preventDefault(); document.getElementById('fitur')?.scrollIntoView({ behavior: 'smooth' }); setIsMobileMenuOpen(false); }} 
              style={{ color: darkMode ? '#cbd5e1' : '#112F58', fontWeight: '600', cursor: 'pointer', fontSize: '16px', padding: '14px 0', textAlign: 'left', borderBottom: darkMode ? '1px solid #334155' : '1px solid #f1f5f9', textDecoration: 'none' }}
              className="w-full flex items-center gap-2"
            >
              💡 Fitur Unggulan
            </a>
 
            <a 
              href="#manfaat"
              onClick={(e) => { e.preventDefault(); document.getElementById('manfaat')?.scrollIntoView({ behavior: 'smooth' }); setIsMobileMenuOpen(false); }} 
              style={{ color: darkMode ? '#cbd5e1' : '#112F58', fontWeight: '600', cursor: 'pointer', fontSize: '16px', padding: '14px 0', textAlign: 'left', borderBottom: darkMode ? '1px solid #334155' : '1px solid #f1f5f9', textDecoration: 'none' }}
              className="w-full flex items-center gap-2"
            >
              🧘‍♂️ Manfaat Nyata
            </a>

            <a 
              href="#keamanan"
              onClick={(e) => { e.preventDefault(); document.getElementById('keamanan')?.scrollIntoView({ behavior: 'smooth' }); setIsMobileMenuOpen(false); }} 
              style={{ color: darkMode ? '#cbd5e1' : '#112F58', fontWeight: '600', cursor: 'pointer', fontSize: '16px', padding: '14px 0', textAlign: 'left', borderBottom: darkMode ? '1px solid #334155' : '1px solid #f1f5f9', textDecoration: 'none' }}
              className="w-full flex items-center gap-2"
            >
              🛡️ Keamanan Kelas Dunia
            </a>

            {/* Tombol Auth di dalam menu mobile */}
            <div className="flex flex-col gap-3 mt-4 mb-3">
              <button 
                onClick={() => { setIsMobileMenuOpen(false); onStart('login'); }} 
                style={{ 
                  border: darkMode ? '1px solid #cbd5e1' : '1px solid #112F58', 
                  color: darkMode ? '#cbd5e1' : '#112F58', 
                  padding: '10px', 
                  borderRadius: '8px', 
                  fontWeight: 'bold', 
                  background: 'transparent', 
                  cursor: 'pointer' 
                }}
              >
                {language === 'id' ? 'Masuk ke Akun' : 'Sign In'}
              </button>
              <button 
                onClick={() => { setIsMobileMenuOpen(false); onStart('register'); }} 
                style={{ 
                  backgroundColor: darkMode ? '#f8fafc' : '#112F58', 
                  color: darkMode ? '#0f172a' : '#ffffff', 
                  padding: '10px', 
                  borderRadius: '8px', 
                  fontWeight: 'bold', 
                  border: 'none', 
                  cursor: 'pointer' 
                }}
              >
                {language === 'id' ? 'Daftar Sekarang' : 'Daftar Sekarang'}
              </button>
            </div>
          </div>
        )}
      </header>
      
      <section style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '80px 6% 40px', marginTop: '20px' }}>
        <div className="animate-float" style={{ width: '120px', height: '120px', marginBottom: '32px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <img src="https://raw.githubusercontent.com/arulsatriaji5/mooduit-vibe-coding/main/Logo_mooduit.png" alt="Ikon Dompet" style={{ width: '200px', height: '200px', objectFit: 'contain' }} referrerPolicy="no-referrer" />
        </div>
        <h1 style={{ color: darkMode ? '#ffffff' : '#112F58', fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: '900', marginBottom: '24px', maxWidth: '800px', lineHeight: '1.2' }}>
          {language === 'id' ? 'Atur Uangmu, Bukan Uang yang Mengaturmu.' : 'Manage Your Money, Don\'t Let It Manage You.'}
        </h1>
        <p className="max-w-2xl mx-auto text-base md:text-xl leading-relaxed mb-8 px-4 text-center" style={{ color: darkMode ? '#cbd5e1' : '#475569', maxWidth: '700px' }}>
          {language === 'id' 
            ? 'Aplikasi asisten keuangan cerdas berbasis AI yang siap bantu kamu atur budget, wujudkan impian, dan nikmati hidup tanpa rasa bersalah.' 
            : 'An AI-powered smart financial assistant ready to help you budget, achieve your dreams, and enjoy life without the guilt.'}
        </p>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button 
            style={{ backgroundColor: '#112F58', color: '#ffffff', padding: '14px 32px', fontSize: '16px', fontWeight: 'bold', borderRadius: '12px', border: 'none', cursor: 'pointer' }}
            onClick={() => onStart('register')}
          >
            {language === 'id' ? 'Daftar / Masuk Sekarang' : 'Sign Up / Login Now'}
          </button>
          <button 
            style={{ backgroundColor: 'transparent', color: darkMode ? '#ffffff' : '#112F58', padding: '14px 32px', fontSize: '16px', fontWeight: 'bold', borderRadius: '12px', border: darkMode ? '1px solid #ffffff' : '1px solid #112F58', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
            onClick={() => {
              const element = document.getElementById('krisis');
              if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            {language === 'id' ? 'Pelajari Lebih Lanjut' : 'Learn More'}
            <svg style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </button>
        </div>
      </section>

      {/* --- 3. PROBLEM SECTION --- */}
      <section id="krisis" style={{ padding: '80px 6%', maxWidth: '1200px', margin: '0 auto', width: '100%', display: 'flex', flexWrap: 'wrap', gap: '40px', alignItems: 'center' }}>
        <div style={{ flex: '1 1 400px' }}>
          <h2 style={{ color: darkMode ? '#ffffff' : '#112F58', fontSize: '32px', fontWeight: 'bold', marginBottom: '24px' }}>
            {language === 'id' ? 'Kenyataan Pahit Tentang Uang.' : 'The Bitter Truth About Money.'}
          </h2>
          <p style={{ color: darkMode ? '#cbd5e1' : '#475569', fontSize: '18px', lineHeight: '1.7', marginBottom: '32px' }}>
            {language === 'id' 
              ? 'Data menunjukkan jutaan anak muda di Indonesia dan dunia terjebak stres finansial, gaya hidup konsumtif (FOMO), hingga jeratan pinjaman online. Uang seharusnya menjadi alat untuk merdeka, bukan sumber kecemasan tiap akhir bulan.'
              : 'Data shows millions of young adults globally are trapped in financial stress, FOMO-driven consumerism, and debt. Money should be a tool for freedom, not a source of anxiety.'}
          </p>
          <div style={{ display: 'flex', gap: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: darkMode ? '#cbd5e1' : '#475569', fontSize: '14px', fontWeight: '600' }}><span style={{ fontSize: '20px' }}>⚠️</span> {language === 'id' ? 'Krisis Literasi Finansial' : 'Financial Literacy Crisis'}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: darkMode ? '#cbd5e1' : '#475569', fontSize: '14px', fontWeight: '600' }}><span style={{ fontSize: '20px' }}>💸</span> {language === 'id' ? 'Terjebak Tren FOMO' : 'Trapped in FOMO Trends'}</div>
          </div>
        </div>
        {/* Visual Krisis Keuangan Nyata (DIPERBAIKI SECARA MUTLAK) */}
        <div style={{ flex: '1 1 400px', borderRadius: '24px', overflow: 'hidden', aspectRatio: '4/3', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }} className="md:order-first">
          {/* Foto Manusia Realistis Unsplash (Menonjolkan Stres Krisis Finansial Gen Z Nyata) */}
          <img 
            src="https://images.unsplash.com/photo-1518186285589-2f7649de83e0?auto=format&fit=crop&q=80&w=800" 
            alt="Anak Muda Gen Z Memegang Kepala Frustrasi di Depan Smartphone" 
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} 
            referrerPolicy="no-referrer"
          />
        </div>
      </section>

      {/* --- 4. FEATURES SECTION --- */}
      <section id="fitur" className="mooduit-landing-section-features" style={{ backgroundColor: darkMode ? '#1e293b' : '#ffffff', padding: '80px 6%', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <h2 style={{ color: darkMode ? '#ffffff' : '#112F58', fontSize: '32px', fontWeight: 'bold', marginBottom: '16px' }}>
          {language === 'id' ? 'Waktunya Slay Finansial Bersama MOODUIT' : 'Time to Slay Your Finances with MOODUIT'}
        </h2>
        <p style={{ color: darkMode ? '#cbd5e1' : '#475569', fontSize: '18px', marginBottom: '48px', maxWidth: '700px' }}>
          {language === 'id' ? 'Fitur-fitur andalan yang didesain intuitif dan friendly untuk mengubah kebiasaan buruk finansialmu.' : 'Core features designed intuitively and friendly to transform your financial habits.'}
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', maxWidth: '1200px', width: '100%', marginBottom: '48px' }}>
          {[
            { 
              icon: '🧠', 
              title: 'Ambient AI Advisor', 
              desc: language === 'id' ? 'Bukan sekadar pencatat kas. AI kami menganalisa kebiasaanmu dan memberi saran personal secara real-time.' : 'Not just an expense logger. Our AI analyzes your habits and provides real-time personal advice.'
            },
            { 
              icon: '📸', 
              title: 'Smart Receipt Scanner', 
              desc: language === 'id' ? 'Males ngetik pengeluaran? Foto struk belanjamu dan biarkan AI kami mengkategorikannya otomatis.' : 'Lazy to type expenses? Just snap a photo of your receipt and let our AI categorize it automatically.'
            },
            { 
              icon: '🎯', 
              title: 'Anti-Boncos 50/30/20', 
              desc: language === 'id' ? 'Sistem budgeting cerdas yang mengunci rasio pengeluaranmu agar masa depan dan lifestyle tetap seimbang.' : 'Smart budgeting system that locks your spending ratio to keep your future and lifestyle balanced.'
            }
          ].map((f, i) => (
            <div key={i} style={{ backgroundColor: darkMode ? '#0f172a' : '#f8fafc', padding: '40px 32px', borderRadius: '24px', border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0', textAlign: 'center' }}>
              <div style={{ fontSize: '40px', marginBottom: '20px' }}>{f.icon}</div>
              <h3 style={{ color: darkMode ? '#ffffff' : '#112F58', fontSize: '20px', fontWeight: '800', marginBottom: '16px' }}>{f.title}</h3>
              <p style={{ color: darkMode ? '#cbd5e1' : '#475569', fontSize: '15px', lineHeight: '1.6' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- SEKSI MANFAAT (BENEFITS) --- */}
      <section id="manfaat" className="py-20 px-6 md:px-12 bg-white dark:bg-slate-900/40 w-full flex flex-col items-center mooduit-landing-section-benefits">
        <div className="max-w-6xl w-full">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#112F58] dark:text-white mb-4">
              Lebih dari Sekadar Pencatat Keuangan
            </h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-lg">
              MOODUIT dirancang untuk mengubah cara kamu melihat uang, membantumu mengambil kendali penuh tanpa perlu pusing memikirkan rumus rumit.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Manfaat 1 */}
            <div className="bg-white dark:bg-slate-800/80 p-8 rounded-[24px] shadow-[0_15px_40px_-5px_rgba(17,47,88,0.08)] dark:shadow-none border border-slate-100/80 dark:border-slate-800 hover:shadow-[0_25px_50px_-10px_rgba(17,47,88,0.14)] dark:hover:border-slate-700 hover:-translate-y-2 transition-all duration-300 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center text-3xl mb-6">
                🧘‍♂️
              </div>
              <h3 className="text-xl font-bold text-[#112F58] dark:text-white mb-3">Bebas Stres Finansial</h3>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                Tidak perlu lagi cemas memikirkan sisa uang. AI Advisor siap memberikan saran kontekstual agar kondisi dompetmu tetap sehat setiap hari.
              </p>
            </div>

            {/* Manfaat 2 */}
            <div className="bg-white dark:bg-slate-800/80 p-8 rounded-[24px] shadow-[0_15px_40px_-5px_rgba(17,47,88,0.08)] dark:shadow-none border border-slate-100/80 dark:border-slate-800 hover:shadow-[0_25px_50px_-10px_rgba(17,47,88,0.14)] dark:hover:border-slate-700 hover:-translate-y-2 transition-all duration-300 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center text-3xl mb-6">
                🚀
              </div>
              <h3 className="text-xl font-bold text-[#112F58] dark:text-white mb-3">Impian Cepat Terwujud</h3>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                Pisahkan uangmu ke Kantong Masa Depan. Lacak target impianmu dan nikmati sensasi menabung yang menyenangkan dan terarah.
              </p>
            </div>

            {/* Manfaat 3 */}
            <div className="bg-white dark:bg-slate-800/80 p-8 rounded-[24px] shadow-[0_15px_40px_-5px_rgba(17,47,88,0.08)] dark:shadow-none border border-slate-100/80 dark:border-slate-800 hover:shadow-[0_25px_50px_-10px_rgba(17,47,88,0.14)] dark:hover:border-slate-700 hover:-translate-y-2 transition-all duration-300 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center text-3xl mb-6">
                ⚖️
              </div>
              <h3 className="text-xl font-bold text-[#112F58] dark:text-white mb-3">Disiplin Tanpa Ribet</h3>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                Metode 50/30/20 otomatis memilah uangmu. Kamu tetap bisa nongkrong dan belanja tanpa rasa bersalah, karena jatah tabungan sudah aman.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- 4.5. SECURITY & EXCELLENCE (KEAMANAN & KEUNGGULAN) SECTION --- */}
      <section id="keamanan" className="mooduit-landing-section-security" style={{ padding: '80px 6%', backgroundColor: darkMode ? '#112F58' : '#ffffff', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', transition: 'background-color 0.3s' }}>
        <div style={{ maxWidth: '1200px', width: '100%', display: 'flex', flexWrap: 'wrap', gap: '40px', alignItems: 'center' }}>
          <div style={{ flex: '1 1 400px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: '#B9AB8C', color: '#112F58', padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold', marginBottom: '16px' }}>
              🛡️ Bank-Grade Security
            </div>
            <h2 style={{ color: darkMode ? '#ffffff' : '#112F58', fontSize: '32px', fontWeight: 'bold', marginBottom: '24px' }}>
              {language === 'id' ? 'Keunggulan & Sistem Keamanan Kelas Dunia.' : 'World-Class Security & Excellence.'}
            </h2>
            <p style={{ color: darkMode ? '#cbd5e1' : '#475569', fontSize: '18px', lineHeight: '1.7', marginBottom: '32px' }}>
              {language === 'id' 
                ? 'Kami memahami bahwa data keuangan adalah privasi mutlak Anda. MOODUIT dilengkapi dengan enkripsi AES-256 bit end-to-end, perlindungan PIN biometric, serta pemantauan pintar yang menjamin tidak ada kebocoran data.'
                : 'We understand that financial data is your absolute privacy. MOODUIT is equipped with AES-256 bit end-to-end encryption, biometric PIN, and smart monitoring to prevent any data leaks.'}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <h4 style={{ color: darkMode ? '#ffffff' : '#112F58', fontWeight: 'bold', margin: '0 0 8px 0' }}>🔒 Enkripsi Kuat</h4>
                <p style={{ color: darkMode ? '#cbd5e1' : '#475569', fontSize: '14px', margin: 0 }}>
                  {language === 'id' ? 'Data Anda disandikan secara militer di server terjaga.' : 'Your data is militarily encrypted on protected servers.'}
                </p>
              </div>
              <div>
                <h4 style={{ color: darkMode ? '#ffffff' : '#112F58', fontWeight: 'bold', margin: '0 0 8px 0' }}>⚡ Sinkronisasi Instan</h4>
                <p style={{ color: darkMode ? '#cbd5e1' : '#475569', fontSize: '14px', margin: 0 }}>
                  {language === 'id' ? 'Update data real-time antar perangkat tanpa lag.' : 'Real-time sync across your devices with zero lag.'}
                </p>
              </div>
            </div>
          </div>
          <div style={{ flex: '1 1 400px', display: 'flex', justifyContent: 'center' }}>
            <div 
              className="border border-slate-100 dark:border-slate-800 mooduit-landing-security-card"
              style={{ 
                position: 'relative', 
                width: '100%', 
                maxWidth: '400px', 
                padding: '30px', 
                backgroundColor: darkMode ? '#0f172a' : '#ffffff', 
                borderRadius: '24px', 
                boxShadow: darkMode ? 'none' : '0 25px 50px -12px rgba(17, 47, 88, 0.15), 0 12px 24px -8px rgba(17, 47, 88, 0.1)' 
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="mooduit-landing-security-item" style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '16px', borderBottom: '1px solid #e2e8f0' }}>
                  <div className="mooduit-landing-security-icon" style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#e2f0fd', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#112F58', fontSize: '20px' }}>🛡️</div>
                  <div>
                    <div className="mooduit-landing-security-title" style={{ fontWeight: 'bold', color: '#112F58' }}>Sertifikat SSL</div>
                    <div className="mooduit-landing-security-desc" style={{ fontSize: '12px', color: '#64748b' }}>Aktif • Terenkripsi</div>
                  </div>
                </div>
                <div className="mooduit-landing-security-item" style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '16px', borderBottom: '1px solid #e2e8f0' }}>
                  <div className="mooduit-landing-security-icon" style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#eefcf3', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#112F58', fontSize: '20px' }}>🔐</div>
                  <div>
                    <div className="mooduit-landing-security-title" style={{ fontWeight: 'bold', color: '#112F58' }}>Otentikasi Dua Faktor</div>
                    <div className="mooduit-landing-security-desc" style={{ fontSize: '12px', color: '#64748b' }}>Melindungi akun dari akses ilegal</div>
                  </div>
                </div>
                <div className="mooduit-landing-security-item" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="mooduit-landing-security-icon" style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#fff9e6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#112F58', fontSize: '20px' }}>🤖</div>
                  <div>
                    <div className="mooduit-landing-security-title" style={{ fontWeight: 'bold', color: '#112F58' }}>AI Security Guard</div>
                    <div className="mooduit-landing-security-desc" style={{ fontSize: '12px', color: '#64748b' }}>Mendeteksi aksi mencurigakan otomatis</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- 5. FOOTER DENGAN TATA LETAK KOLOM YANG RESPONSIF --- */}
      <footer className="bg-[#112F58] dark:bg-[#0a1c35] border-t border-white/10 text-white" style={{ padding: '60px 6% 30px 6%' }}>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-left border-b border-white/10 pb-8 mb-8">
          <div>
            <h3 className="text-2xl font-black mb-4">MOODUIT</h3>
            <p className="text-slate-300 text-sm leading-relaxed max-w-xs">
              {language === 'id' 
                ? 'Platform asisten keuangan cerdas berbasis Ambient AI untuk membebaskan Gen-Z dari stres uang.' 
                : 'Smart financial assistant powered by Ambient AI to free Gen-Z from money stress.'}
            </p>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">{language === 'id' ? 'Fitur Utama' : 'Core Features'}</h4>
            <ul className="space-y-2 text-slate-300 text-sm list-none p-0 m-0">
              <li>🧠 Ambient AI Advisor</li>
              <li>📸 Smart Receipt Scanner</li>
              <li>🎯 Anti-Boncos 50/30/20</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">{language === 'id' ? 'Metodologi' : 'Methodology'}</h4>
            <ul className="space-y-2 text-slate-300 text-sm list-none p-0 m-0">
              <li>{language === 'id' ? 'Budgeting Sederhana' : 'Simple Budgeting'}</li>
              <li>{language === 'id' ? 'Pencatatan Otomatis' : 'Automatic Logging'}</li>
              <li>{language === 'id' ? 'Saran Kontekstual' : 'Contextual Insights'}</li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400 text-xs text-center md:text-left">
          <div>© 2026 MOODUIT. All rights reserved.</div>
          <div>
            {language === 'id' ? 'Dirancang & Dikembangkan oleh ' : 'Designed & Developed by '}
            <span className="font-bold text-white">AS</span>.
          </div>
        </div>
      </footer>

    </div>
  );
}
