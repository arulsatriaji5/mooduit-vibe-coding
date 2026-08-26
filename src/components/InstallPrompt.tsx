import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, X, Sparkles, Smartphone } from 'lucide-react';
import { useThemeLanguage } from '../context/ThemeLanguageContext';

export default function InstallPrompt() {
  const { language } = useThemeLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    // Check if already in standalone mode (installed)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault(); // Prevent standard browser mini-infobar
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the PWA install prompt');
    } else {
      console.log('User dismissed the PWA install prompt');
    }

    setShowInstallBanner(false);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowInstallBanner(false);
  };

  if (!showInstallBanner) return null;

  return (
    <AnimatePresence>
      {showInstallBanner && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-3 left-3 right-3 z-50 overflow-hidden rounded-[22px] border border-slate-200 bg-white text-[#112F58] shadow-[0_24px_70px_-20px_rgba(15,23,42,0.45)] sm:bottom-5 sm:left-auto sm:right-5 sm:w-[390px]"
        >
          <div className="h-1 w-full bg-gradient-to-r from-[#112F58] via-[#315B8F] to-[#B9AB8C]" />

          <button
            onClick={handleDismiss}
            className="absolute right-3 top-3.5 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-0 bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 hover:text-[#112F58]"
            aria-label={language === 'id' ? 'Tutup' : 'Close'}
            type="button"
          >
            <X size={17} />
          </button>

          <div className="p-4 sm:p-5">
            <div className="flex items-center gap-3 pr-10">
              <div className="relative flex-shrink-0">
              <img
                src="/logo-pwa-bg.png"
                alt="MOODUIT"
                  className="h-14 w-14 rounded-2xl border border-slate-200 object-cover shadow-sm"
                onError={(e) => {
                  // Fallback icon if image fails
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
                <div className="absolute -bottom-1 -right-1 rounded-full border-2 border-white bg-amber-400 p-1 text-[#112F58] shadow-sm">
                <Sparkles size={12} className="fill-amber-950 stroke-amber-950" />
              </div>
            </div>

              <div className="min-w-0 flex-1">
                <p className="m-0 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#B29C6D]">
                  MOODUIT • PWA
                </p>
                <h4 className="m-0 mt-0.5 text-lg font-extrabold leading-tight text-[#112F58] sm:text-xl">
                  {language === 'id' ? 'Instal MOODUIT' : 'Install MOODUIT'}
                </h4>
              </div>
            </div>

            <p className="mb-0 mt-3 text-sm leading-relaxed text-slate-600">
              {language === 'id'
                ? 'Tambahkan ke layar utama untuk membuka MOODUIT lebih cepat dan nyaman.'
                : 'Add MOODUIT to your home screen for faster and more convenient access.'}
              </p>

            <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-bold text-slate-600">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1.5">
                <Smartphone size={13} className="text-[#112F58]" />
                {language === 'id' ? 'Akses cepat' : 'Quick access'}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1.5 text-emerald-700">
                <Sparkles size={13} />
                {language === 'id' ? 'Lebih hemat' : 'Data friendly'}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
                <button
                  onClick={handleInstallClick}
                className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border-0 bg-[#112F58] px-4 py-2.5 text-sm font-extrabold text-white shadow-md transition-all hover:bg-[#1D4777] active:scale-[0.98]"
                type="button"
                >
                <Download size={16} />
                {language === 'id' ? 'Instal Sekarang' : 'Install Now'}
                </button>
                <button
                  onClick={handleDismiss}
                className="min-h-11 cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50 hover:text-[#112F58]"
                type="button"
                >
                {language === 'id' ? 'Nanti' : 'Later'}
                </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
