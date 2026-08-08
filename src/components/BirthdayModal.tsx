import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, Share2, X, Sparkles, Heart, Award, PartyPopper } from 'lucide-react';
import { toPng } from 'html-to-image';
import toast from 'react-hot-toast';

interface BirthdayModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  userEmail?: string;
  userDob?: string;
  userAvatar?: string;
}

export function isUserBirthdayToday(userDob?: string | null): boolean {
  if (!userDob) return false;
  const cleanDob = String(userDob).trim();
  const parts = cleanDob.split(/[-/.]/);
  if (parts.length < 2) return false;

  let dobMonth = 0;
  let dobDay = 0;

  if (parts.length === 3) {
    if (parts[0].length === 4) {
      // YYYY-MM-DD
      dobMonth = parseInt(parts[1], 10);
      dobDay = parseInt(parts[2], 10);
    } else {
      // DD-MM-YYYY
      dobDay = parseInt(parts[0], 10);
      dobMonth = parseInt(parts[1], 10);
    }
  } else if (parts.length === 2) {
    // MM-DD
    dobMonth = parseInt(parts[0], 10);
    dobDay = parseInt(parts[1], 10);
  }

  if (isNaN(dobMonth) || isNaN(dobDay)) return false;

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentDay = now.getDate();

  return currentMonth === dobMonth && currentDay === dobDay;
}

export const BirthdayModal: React.FC<BirthdayModalProps> = ({
  isOpen,
  onClose,
  userName,
  userAvatar,
}) => {
  const posterRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [imgError, setImgError] = useState(false);

  if (!isOpen) return null;

  // Retrieve user avatar from prop, localStorage, or fallback to avatar generator
  const savedAvatar = typeof window !== 'undefined' ? localStorage.getItem('userAvatar') : null;
  const avatarSrc = userAvatar || savedAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userName || 'User')}`;

  const handleDownloadPoster = async () => {
    if (!posterRef.current) return;
    setIsDownloading(true);
    const toastId = toast.loading('Menyiapkan Poster Ulang Tahun...');

    try {
      const dataUrl = await toPng(posterRef.current, {
        cacheBust: true,
        quality: 0.95,
        backgroundColor: '#0F172A',
      });

      const link = document.createElement('a');
      const formattedName = (userName || 'User').replace(/[^a-zA-Z0-9]/g, '_');
      link.download = `MOODUIT_UlangTahun_${formattedName}.png`;
      link.href = dataUrl;
      link.click();

      toast.success('Poster Ulang Tahun Berhasil Diunduh! 🎂', { id: toastId });
    } catch (err) {
      console.error('Failed to download birthday poster:', err);
      toast.error('Gagal mengunduh poster. Silakan coba lagi.', { id: toastId });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    const shareTitle = `Selamat Ulang Tahun ${userName} di MOODUIT! 🎉`;
    const shareText = `Hari ini ulang tahunku! Terima kasih MOODUIT AI Advisor sudah menjadi teman setia kelola keuanganku. ✨🚀`;
    const shareUrl = window.location.origin + '?surprise=true';

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        toast.success('Momen Ulang Tahun berhasil dibagikan! 🥳');
      } catch (err) {
        // User cancelled or share failed fallback
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
        toast.success('Tautan ucapan ulang tahun berhasil disalin! 📋');
      } catch (err) {
        toast.error('Gagal menyalin tautan.');
      }
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-slate-950/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md mx-auto my-auto"
        >
          {/* Close Button Top Right */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-2.5 right-2.5 z-20 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all border-0 cursor-pointer shadow-lg backdrop-blur-sm"
            title="Tutup"
          >
            <X size={18} />
          </button>

          {/* POSTER CARD TARGET FOR CAPTURE & DISPLAY */}
          <div
            ref={posterRef}
            className="w-full rounded-[2rem] p-4 md:p-6 text-white relative overflow-hidden shadow-2xl border border-slate-700/60 flex flex-col items-center text-center"
            style={{
              background: 'radial-gradient(circle at 50% 0%, #1e1b4b 0%, #0f172a 70%, #020617 100%)',
              boxShadow: '0 25px 50px -12px rgba(139, 92, 246, 0.25)',
            }}
          >
            {/* Background Festive Accents */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0 opacity-20">
              <div className="absolute top-3 left-4 text-3xl animate-bounce">🎈</div>
              <div className="absolute top-8 right-5 text-3xl animate-pulse">✨</div>
              <div className="absolute bottom-10 left-6 text-3xl">🎁</div>
              <div className="absolute bottom-4 right-5 text-3xl animate-bounce">🎊</div>
            </div>

            {/* Top Badge */}
            <div className="relative z-10 mb-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-indigo-500/20 border border-pink-500/30 text-pink-300 text-[10px] md:text-xs font-black tracking-widest uppercase shadow-inner">
              <PartyPopper size={14} className="text-pink-400" />
              <span>MOODUIT SPECIAL BIRTHDAY SURPRISE</span>
              <Sparkles size={14} className="text-yellow-400" />
            </div>

            {/* User Profile Photo / Avatar in glowing circle */}
            <div className="relative z-10 my-1.5 flex items-center justify-center">
              <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-tr from-pink-500 via-purple-600 to-indigo-500 p-1 shadow-xl shadow-pink-500/30 flex items-center justify-center animate-pulse">
                {avatarSrc && !imgError ? (
                  <img
                    src={avatarSrc}
                    alt={userName}
                    onError={() => setImgError(true)}
                    className="w-full h-full rounded-full object-cover border-4 border-indigo-500/50 shadow-lg mx-auto shadow-indigo-500/30 bg-slate-900"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-2xl md:text-3xl font-black text-yellow-300 border-4 border-indigo-500/50">
                    {userName ? userName.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                {/* Festive Birthday Hat/Cake Badge Overlay */}
                <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white p-1 rounded-full text-xs shadow-md border border-slate-900">
                  🎂
                </div>
              </div>
            </div>

            {/* Main Greeting Heading */}
            <div className="relative z-10 mt-1 mb-2">
              <h2 className="text-xl md:text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-purple-200 to-indigo-200 m-0 leading-tight">
                Selamat Ulang Tahun, <br />
                <span className="text-yellow-300">{userName || 'Sobat Cuan'}</span>! 🥳✨
              </h2>
            </div>

            {/* Warm Personal Wishes Body - Compact */}
            <div className="relative z-10 bg-slate-800/60 backdrop-blur-md rounded-2xl p-3 my-1.5 border border-slate-700/60 text-slate-200 text-xs md:text-sm leading-relaxed text-center font-medium shadow-inner w-full">
              <p className="m-0 mb-1">
                Tim <strong className="text-sky-400">MOODUIT AI Advisor</strong> mendoakan kesehatan, kebahagiaan, dan kelancaran rezeki di usiamu yang baru ini! 🚀
              </p>
              <p className="m-0 text-slate-300 text-[11px] md:text-xs">
                Setiap langkah kecil pencatatanmu hari ini adalah investasi masa depanmu! 💡💎
              </p>
            </div>

            {/* Special Gift Perks Badge */}
            <div className="relative z-10 my-1 px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-[11px] md:text-xs font-semibold flex items-center justify-center gap-1.5 w-full">
              <Award size={14} className="text-yellow-400 shrink-0" />
              <span>Badge Spesial Ulang Tahun & Doubled Streak Boost Aktif!</span>
            </div>

            {/* Footer Brand Seal */}
            <div className="relative z-10 mt-2.5 pt-2 border-t border-slate-800/80 w-full flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span className="flex items-center gap-1">
                <Heart size={11} className="text-rose-500 fill-rose-500" /> Dedicated for {userName}
              </span>
              <span className="font-bold text-sky-400 tracking-wider">MOODUIT AI ADVISOR</span>
            </div>
          </div>

          {/* ACTION BUTTONS: HORIZONTAL FLEX 50%-50% SIDE BY SIDE FOR NO-SCROLL MOBILE */}
          <div className="mt-3 flex flex-row items-center justify-center gap-2 w-full">
            <button
              type="button"
              onClick={handleDownloadPoster}
              disabled={isDownloading}
              className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold text-xs py-2.5 px-3 rounded-2xl shadow-lg shadow-pink-500/25 transition-all active:scale-95 border-0 cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap"
            >
              <Download size={15} />
              <span>{isDownloading ? 'Menyimpan...' : 'Simpan Momen'}</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs py-2.5 px-3 rounded-2xl border border-slate-700 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap"
            >
              <Share2 size={15} className="text-sky-400" />
              <span>Bagikan</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

