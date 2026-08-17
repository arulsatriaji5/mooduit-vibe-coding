import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Share2, Sparkles, Gift } from 'lucide-react';
import toast from 'react-hot-toast';
import { useThemeLanguage } from '../context/ThemeLanguageContext';

export const isUserBirthdayToday = (dob: string) => {
  if (!dob) return false;
  const today = new Date();
  const birthDate = new Date(dob);
  return today.getDate() === birthDate.getDate() && today.getMonth() === birthDate.getMonth();
};

interface BirthdayModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  userDob: string;
  userAvatar?: string;
}

export const BirthdayModal: React.FC<BirthdayModalProps> = ({ isOpen, onClose, userName, userAvatar }) => {
  const { t, language } = useThemeLanguage();
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const getDynamicGradient = (name: string) => {
    const gradients = [
      "linear-gradient(135deg, #1e3a8a 0%, #312e81 100%)", 
      "linear-gradient(135deg, #065f46 0%, #134e4a 100%)", 
      "linear-gradient(135deg, #701a75 0%, #4c1d95 100%)", 
      "linear-gradient(135deg, #9f1239 0%, #881337 100%)", 
      "linear-gradient(135deg, #b45309 0%, #78350f 100%)", 
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return gradients[Math.abs(hash) % gradients.length];
  };

  const bgGradient = getDynamicGradient(userName || "User");

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}>
          
          {/* Efek Konfeti di Latar Belakang Layar */}
          {showConfetti && (
            <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ top: "-10%", left: `${Math.random() * 100}%`, rotate: 0 }}
                  animate={{ top: "110%", rotate: 360 }}
                  transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, ease: "linear", delay: Math.random() * 2 }}
                  className="absolute text-2xl sm:text-3xl"
                >
                  {['🎉', '✨', '🎈', '🎊', '🎁'][Math.floor(Math.random() * 5)]}
                </motion.div>
              ))}
            </div>
          )}

          <motion.div 
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ type: "spring", damping: 20, stiffness: 200 }}
            className="relative w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl flex flex-col border border-white/10"
            style={{ background: bgGradient, minHeight: '500px' }}
          >
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
               <motion.div animate={{ y: [0, -20, 0], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 3 }} className="absolute top-10 left-10 text-white text-2xl">✨</motion.div>
               <motion.div animate={{ y: [0, 20, 0], opacity: [0.3, 0.8, 0.3] }} transition={{ repeat: Infinity, duration: 4 }} className="absolute top-20 right-12 text-yellow-300 text-3xl">⭐</motion.div>
               <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute bottom-32 left-12 text-white text-xl">✨</motion.div>
               <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 10, ease: "linear" }} className="absolute bottom-20 right-10 text-blue-200 text-2xl">🌟</motion.div>
            </div>

            {/* Tombol X Transparan */}
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-white/70 hover:text-white transition-all z-20 border-0 cursor-pointer bg-transparent"
            >
              <X size={20} strokeWidth={3} />
            </button>

            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative z-10">
              
              <motion.div 
                initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
                className="mb-6 mt-4"
              >
                <h1 className="font-extrabold text-white text-4xl sm:text-5xl tracking-tight leading-none" style={{ fontFamily: "'Dancing Script', cursive, sans-serif" }}>
                  Happy<br/>Birthday!
                </h1>
              </motion.div>

              {/* Foto Profil Kotak Sempurna */}
              <motion.div 
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4, type: "spring" }}
                className="w-28 h-28 border-4 border-white/30 p-1 mb-6 relative shadow-lg bg-white/10"
              >
                <img src={userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`} alt="Avatar" className="w-full h-full object-cover bg-white" />
                <div className="absolute -bottom-3 -right-3 bg-yellow-400 text-yellow-900 w-8 h-8 flex items-center justify-center rounded-full border-2 border-white shadow-sm text-sm">
                  🎂
                </div>
              </motion.div>

              <motion.h2 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                className="text-white font-extrabold text-2xl mb-3"
              >
                {userName}
              </motion.h2>

              <motion.p 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
                className="text-white/90 text-sm font-medium leading-relaxed px-4 mb-8"
              >
                {language === 'id' 
                  ? "Terima kasih telah mempercayakan perjalanan finansialmu bersama MOODUIT. Semoga tahun ini penuh rezeki dan impianmu tercapai! 🚀💎" 
                  : "Thank you for trusting your financial journey with MOODUIT. Wishing you a year full of wealth and achieved dreams! 🚀💎"}
              </motion.p>
            </div>

            {/* Tombol Klaim Melengkung Penuh (rounded-full) */}
            <div className="p-6 pt-0 relative z-10">
              <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.7 }} className="w-full">
                <button 
                  onClick={() => {
                    toast.success(language === 'id' ? "Kado spesialmu sudah aktif! 🎉" : "Your special gift is active! 🎉");
                    onClose();
                  }}
                  className="w-full py-3.5 bg-white text-[#112F58] rounded-full font-black text-sm flex items-center justify-center gap-2 shadow-xl hover:scale-[1.02] active:scale-95 transition-all border-0 cursor-pointer"
                >
                  <Gift size={18} className="text-rose-500" />
                  {language === 'id' ? "Klaim Kado & Bagikan" : "Claim Gift & Share"}
                </button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};