import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Download, Share2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useThemeLanguage } from '../context/ThemeLanguageContext';

export const isUserBirthdayToday = (dob: string) => {
  if (!dob) return false;
  const match = String(dob).match(/^\d{4}-(\d{2})-(\d{2})/);
  if (!match) return false;

  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Makassar',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(new Date());
    const month = Number(parts.find((part) => part.type === 'month')?.value || 0);
    const day = Number(parts.find((part) => part.type === 'day')?.value || 0);
    return month === Number(match[1]) && day === Number(match[2]);
  } catch {
    const today = new Date();
    return today.getMonth() + 1 === Number(match[1]) && today.getDate() === Number(match[2]);
  }
};

interface BirthdayModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  userDob: string;
  userAvatar?: string;
  userKey?: string;
}

const BIRTHDAY_PALETTES = [
  { start: '#153765', end: '#29578f', gradient: 'linear-gradient(135deg, #153765 0%, #29578f 100%)', accent: '#f4d58d' },
  { start: '#075c52', end: '#178276', gradient: 'linear-gradient(135deg, #075c52 0%, #178276 100%)', accent: '#c7f9e9' },
  { start: '#633171', end: '#944a9f', gradient: 'linear-gradient(135deg, #633171 0%, #944a9f 100%)', accent: '#f5d0fe' },
  { start: '#9b3151', end: '#c65170', gradient: 'linear-gradient(135deg, #9b3151 0%, #c65170 100%)', accent: '#ffe0e8' },
  { start: '#9a4c10', end: '#c76d21', gradient: 'linear-gradient(135deg, #9a4c10 0%, #c76d21 100%)', accent: '#ffecb5' },
  { start: '#254e46', end: '#52796f', gradient: 'linear-gradient(135deg, #254e46 0%, #52796f 100%)', accent: '#e9f5db' },
  { start: '#3d348b', end: '#7678ed', gradient: 'linear-gradient(135deg, #3d348b 0%, #7678ed 100%)', accent: '#f7d6e0' },
  { start: '#8a3f55', end: '#d06b73', gradient: 'linear-gradient(135deg, #8a3f55 0%, #d06b73 100%)', accent: '#fff1c1' },
  { start: '#114b5f', end: '#1a7f8e', gradient: 'linear-gradient(135deg, #114b5f 0%, #1a7f8e 100%)', accent: '#d6f6ff' },
  { start: '#4d3b2f', end: '#8a6240', gradient: 'linear-gradient(135deg, #4d3b2f 0%, #8a6240 100%)', accent: '#f3dfc1' },
] as const;

const getStableHash = (value: string) => {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = value.charCodeAt(index) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
};

export const BirthdayModal: React.FC<BirthdayModalProps> = ({
  isOpen,
  onClose,
  userName,
  userAvatar,
  userKey,
}) => {
  const { language } = useThemeLanguage();
  const [showConfetti, setShowConfetti] = useState(false);
  const [isPreparingImage, setIsPreparingImage] = useState(false);

  const palette = useMemo(() => {
    const stableIdentity = (userKey || userName || 'mooduit-user').trim().toLowerCase();
    return BIRTHDAY_PALETTES[getStableHash(stableIdentity) % BIRTHDAY_PALETTES.length];
  }, [userKey, userName]);

  const avatarSource = userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userName || 'User')}`;

  useEffect(() => {
    if (!isOpen) return;
    setShowConfetti(true);
    const timer = window.setTimeout(() => setShowConfetti(false), 5000);
    return () => window.clearTimeout(timer);
  }, [isOpen]);

  const createBirthdayImage = async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1080;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas is not available');

    const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, palette.start);
    gradient.addColorStop(1, palette.end);
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.textAlign = 'center';
    context.fillStyle = 'rgba(255,255,255,0.6)';
    context.font = '56px sans-serif';
    context.fillText('✨', 120, 125);
    context.fillText('⭐', 925, 200);
    context.fillText('🎊', 135, 930);
    context.fillText('🌟', 930, 930);

    context.fillStyle = '#ffffff';
    context.font = '800 104px sans-serif';
    context.fillText('Happy Birthday!', 540, 220);

    const avatarSize = 250;
    const avatarX = (canvas.width - avatarSize) / 2;
    const avatarY = 300;
    const avatarCenterX = avatarX + avatarSize / 2;
    const avatarCenterY = avatarY + avatarSize / 2;
    context.fillStyle = palette.accent;
    context.beginPath();
    context.arc(avatarCenterX, avatarCenterY, avatarSize / 2 + 10, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = '#ffffff';
    context.beginPath();
    context.arc(avatarCenterX, avatarCenterY, avatarSize / 2, 0, Math.PI * 2);
    context.fill();

    context.save();
    context.beginPath();
    context.arc(avatarCenterX, avatarCenterY, avatarSize / 2, 0, Math.PI * 2);
    context.clip();

    try {
      const avatar = await new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.crossOrigin = 'anonymous';
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error('Avatar could not be loaded'));
        image.src = avatarSource;
      });
      const sourceWidth = avatar.naturalWidth || avatar.width;
      const sourceHeight = avatar.naturalHeight || avatar.height;
      const cropSize = Math.min(sourceWidth, sourceHeight);
      const sourceX = (sourceWidth - cropSize) / 2;
      const sourceY = (sourceHeight - cropSize) / 2;
      context.drawImage(avatar, sourceX, sourceY, cropSize, cropSize, avatarX, avatarY, avatarSize, avatarSize);
    } catch {
      context.fillStyle = palette.start;
      context.font = '800 92px sans-serif';
      const initials = (userName || 'MU').split(/\s+/).slice(0, 2).map((word) => word[0]).join('').toUpperCase();
      context.textBaseline = 'middle';
      context.fillText(initials, canvas.width / 2, avatarCenterY);
    }
    context.restore();

    context.fillStyle = '#ffffff';
    let nameFontSize = 70;
    do {
      context.font = `800 ${nameFontSize}px sans-serif`;
      nameFontSize -= 2;
    } while (context.measureText(userName || 'Sobat Cuan').width > 820 && nameFontSize > 38);
    context.fillText(userName || 'Sobat Cuan', 540, 660);

    const greeting = language === 'id'
      ? 'Semoga harimu penuh bahagia, sehat selalu, rezekimu berkah, dan semua impianmu segera terwujud.'
      : 'May your day be filled with joy, good health, abundant blessings, and dreams coming true.';
    context.font = '600 35px sans-serif';
    context.fillStyle = 'rgba(255,255,255,0.96)';
    const words = greeting.split(' ');
    const lines: string[] = [];
    let currentLine = '';
    words.forEach((word) => {
      const candidate = currentLine ? `${currentLine} ${word}` : word;
      if (context.measureText(candidate).width > 810 && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = candidate;
      }
    });
    if (currentLine) lines.push(currentLine);
    lines.slice(0, 4).forEach((line, index) => context.fillText(line, 540, 755 + index * 52));

    context.font = '800 28px sans-serif';
    context.fillStyle = palette.accent;
    context.fillText('MOODUIT • SMART FINANCIAL ADVISOR', 540, 1005);

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Birthday image could not be created'));
      }, 'image/png');
    });
  };

  const getFileName = () => {
    const safeName = (userName || 'mooduit-user').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    return `mooduit-ulang-tahun-${safeName || 'user'}.png`;
  };

  const handleSave = async () => {
    if (isPreparingImage) return;
    setIsPreparingImage(true);
    try {
      const blob = await createBirthdayImage();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = getFileName();
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
      toast.success(language === 'id' ? 'Kartu ulang tahun berhasil disimpan! 🎉' : 'Birthday card saved! 🎉');
    } catch (error) {
      console.error('Failed to save birthday card:', error);
      toast.error(language === 'id' ? 'Kartu belum berhasil disimpan. Coba lagi.' : 'Unable to save the card. Please try again.');
    } finally {
      setIsPreparingImage(false);
    }
  };

  const handleShare = async () => {
    if (isPreparingImage) return;
    setIsPreparingImage(true);
    try {
      const blob = await createBirthdayImage();
      const file = new File([blob], getFileName(), { type: 'image/png' });
      const shareData = {
        title: language === 'id' ? 'Kartu Ulang Tahun MOODUIT' : 'MOODUIT Birthday Card',
        text: language === 'id' ? `Selamat ulang tahun, ${userName}! 🎂` : `Happy birthday, ${userName}! 🎂`,
        files: [file],
      };

      if (navigator.share && (!navigator.canShare || navigator.canShare(shareData))) {
        await navigator.share(shareData);
        return;
      }

      if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        toast.success(language === 'id' ? 'Tautan MOODUIT disalin. Gambar dapat disimpan lalu dibagikan.' : 'MOODUIT link copied. Save the image to share it.');
      } else {
        toast.error(language === 'id' ? 'Perangkat ini belum mendukung fitur berbagi.' : 'Sharing is not supported on this device.');
      }
    } catch (error: any) {
      if (error?.name !== 'AbortError') {
        console.error('Failed to share birthday card:', error);
        toast.error(language === 'id' ? 'Kartu belum berhasil dibagikan. Coba lagi.' : 'Unable to share the card. Please try again.');
      }
    } finally {
      setIsPreparingImage(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center overflow-y-auto p-4 sm:p-6"
          style={{ backgroundColor: 'rgba(0,0,0,0.62)', backdropFilter: 'blur(8px)' }}
          role="dialog"
          aria-modal="true"
          aria-label={language === 'id' ? 'Kartu ulang tahun' : 'Birthday card'}
        >
          {showConfetti && (
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
              {[...Array(18)].map((_, index) => (
                <motion.div
                  key={index}
                  initial={{ top: '-10%', left: `${(index * 17) % 100}%`, rotate: 0 }}
                  animate={{ top: '110%', rotate: 360 }}
                  transition={{ duration: 3 + (index % 4) * 0.45, repeat: Infinity, ease: 'linear', delay: (index % 6) * 0.22 }}
                  className="absolute text-2xl sm:text-3xl"
                >
                  {['🎉', '✨', '🎈', '🎊', '🎁'][index % 5]}
                </motion.div>
              ))}
            </div>
          )}

          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 30 }}
            transition={{ type: 'spring', damping: 22, stiffness: 220 }}
            className="relative z-10 w-full max-w-[560px]"
          >
            <div
              className="relative aspect-square w-full overflow-hidden rounded-none border border-white/30 text-center shadow-2xl"
              style={{ background: palette.gradient }}
            >
              <div className="pointer-events-none absolute inset-0 opacity-50">
                <div className="absolute left-[8%] top-[8%] text-[clamp(20px,5vw,34px)]">✨</div>
                <div className="absolute right-[10%] top-[19%] text-[clamp(24px,6vw,42px)]">⭐</div>
                <div className="absolute bottom-[12%] left-[9%] text-[clamp(18px,4vw,28px)]">🎊</div>
                <div className="absolute bottom-[9%] right-[9%] text-[clamp(22px,5vw,36px)]">🌟</div>
              </div>

              <button
                onClick={onClose}
                className="absolute right-3 top-3 z-20 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-black/10 text-white/80 transition hover:bg-black/20 hover:text-white sm:right-4 sm:top-4"
                style={{ borderRadius: '9999px' }}
                type="button"
                aria-label={language === 'id' ? 'Tutup' : 'Close'}
                data-card-action="true"
              >
                <X size={19} strokeWidth={2.8} />
              </button>

              <div className="relative z-10 flex h-full flex-col items-center justify-center px-[8%] py-[7%]">
                <h1
                  className="m-0 font-extrabold leading-[0.92] tracking-tight text-white"
                  style={{ fontFamily: "'Dancing Script', cursive, sans-serif", fontSize: 'clamp(34px, 9vw, 58px)' }}
                >
                  Happy Birthday!
                </h1>

                <div
                  className="relative mt-[5%] aspect-square w-[25%] min-w-[74px] max-w-[128px] overflow-visible rounded-full border-[4px] bg-white/15 p-1 shadow-xl"
                  style={{ borderColor: palette.accent }}
                >
                  <img
                    src={avatarSource}
                    alt={language === 'id' ? `Foto profil ${userName}` : `${userName} profile photo`}
                    className="h-full w-full rounded-full bg-white object-cover"
                    crossOrigin="anonymous"
                  />
                  <div className="absolute -bottom-2 -right-2 flex aspect-square w-[30%] min-w-7 items-center justify-center rounded-full border-2 border-white bg-yellow-400 text-[clamp(12px,3vw,18px)] shadow-sm">
                    🎂
                  </div>
                </div>

                <h2 className="mb-0 mt-[4%] max-w-full truncate px-2 text-[clamp(22px,6vw,36px)] font-extrabold leading-tight text-white">
                  {userName}
                </h2>

                <p className="mb-0 mt-[3%] max-w-[440px] text-[clamp(11px,2.7vw,16px)] font-semibold leading-[1.45] text-white/95">
                  {language === 'id'
                    ? 'Semoga harimu penuh bahagia, sehat selalu, rezekimu berkah, dan semua impianmu segera terwujud. 🎉'
                    : 'May your day be filled with joy, good health, abundant blessings, and dreams coming true. 🎉'}
                </p>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <button
                onClick={handleSave}
                disabled={isPreparingImage}
                className="flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border-0 bg-white px-4 py-3 text-sm font-extrabold text-[#112F58] shadow-lg transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60 sm:text-base"
                type="button"
              >
                <Download size={19} />
                {language === 'id' ? 'Simpan' : 'Save'}
              </button>
              <button
                onClick={handleShare}
                disabled={isPreparingImage}
                className="flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/30 bg-[#112F58] px-4 py-3 text-sm font-extrabold text-white shadow-lg transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60 sm:text-base"
                type="button"
              >
                <Share2 size={19} />
                {language === 'id' ? 'Bagikan' : 'Share'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
