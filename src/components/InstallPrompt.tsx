import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, X, Sparkles, Smartphone } from 'lucide-react';

export default function InstallPrompt() {
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
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 p-4 rounded-2xl bg-slate-900/95 dark:bg-slate-900/95 text-white shadow-2xl backdrop-blur-md border border-slate-700/60"
        >
          <div className="flex items-start gap-3.5">
            <div className="relative flex-shrink-0">
              <img
                src="/logo-pwa-bg.png"
                alt="MOODUIT"
                className="w-12 h-12 rounded-xl object-cover shadow-md border border-slate-700/50"
                onError={(e) => {
                  // Fallback icon if image fails
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 p-0.5 rounded-full shadow">
                <Sparkles size={12} className="fill-amber-950 stroke-amber-950" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  Instal Aplikasi MOODUIT
                  <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30">
                    Aplikasi Cerdas
                  </span>
                </h4>
                <button
                  onClick={handleDismiss}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
                  aria-label="Tutup"
                >
                  <X size={16} />
                </button>
              </div>

              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Instal MOODUIT di layar utama kamu untuk akses lebih cepat, responsif, dan hemat kuota!
              </p>

              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={handleInstallClick}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md active:scale-95 transition-all"
                >
                  <Download size={14} />
                  Instal Sekarang
                </button>
                <button
                  onClick={handleDismiss}
                  className="px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Nanti
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
