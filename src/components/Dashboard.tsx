import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "react-hot-toast";
import {
  Scan,
  Plus,
  MessageSquareText,
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  Sparkles,
  Target,
  ArrowUpRight,
  X,
  Send,
  Trash2,
  Eye,
  EyeOff,
  Settings,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Gift,
} from "lucide-react";
import { useThemeLanguage } from "../context/ThemeLanguageContext";
import { fetchUserStreak, restoreStreak, fetchAiStreakMotivation, fetchAmbientAiAdvice } from "../utils/api";
import { BirthdayModal, isUserBirthdayToday } from "./BirthdayModal";
import "./Dashboard.css";

interface DashboardProps {
  onNavigate: (page: string) => void;
  saldoDanaDarurat: number;
  transactions?: any[];
  setTransactions?: React.Dispatch<React.SetStateAction<any[]>>;
  isLoading?: boolean;
}

export default function Dashboard({
  onNavigate,
  saldoDanaDarurat,
  transactions: propsTransactions,
  setTransactions: propsSetTransactions,
  isLoading = false,
}: DashboardProps) {
  const { t, language, theme } = useThemeLanguage();
  const darkMode = theme === "dark";
  const [showBalance, setShowBalance] = React.useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("mooduit_balance_visibility");
      return saved === "true";
    }
    return false;
  });
  const [userName, setUserName] = React.useState("Sobat Cuan");
  const [userDob, setUserDob] = React.useState<string>(() => localStorage.getItem("userDob") || "");
  const [showBirthdayModal, setShowBirthdayModal] = React.useState<boolean>(false);
  const [budgetsData, setBudgetsData] = React.useState<any[]>([]);

  // Check URL Deep Link for ?surprise=true or ?birthday=true on mount
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const storedDob = localStorage.getItem("userDob") || "";
      if (storedDob) setUserDob(storedDob);

      const params = new URLSearchParams(window.location.search);
      const isSurpriseDeepLink = params.get("surprise") === "true" || params.get("birthday") === "true";

      if (isSurpriseDeepLink) {
        setShowBirthdayModal(true);
        // Clean up URL query params smoothly without reloading page
        const cleanUrl = window.location.pathname + window.location.hash;
        window.history.replaceState({}, document.title, cleanUrl);
      }
    }
  }, []);

  // Daily Streak and Celebration Pop-up States
  const [streakCount, setStreakCount] = React.useState<number>(0);
  const [streakActive, setStreakActive] = React.useState<boolean>(false);
  const [showCelebration, setShowCelebration] = React.useState<boolean>(false);
  const [quoteIndex, setQuoteIndex] = React.useState<number>(0);
  const [streakIncreasedToday, setStreakIncreasedToday] = React.useState<boolean>(true);

  // AI Real-Time Motivation states
  const [isMotivationLoading, setIsMotivationLoading] = React.useState<boolean>(false);
  const [aiMotivationText, setAiMotivationText] = React.useState<string>("");

  // Dynamic Ambient AI Advisor states
  const [ambientAdvice, setAmbientAdvice] = React.useState<string>("");
  const [isAmbientLoading, setIsAmbientLoading] = React.useState<boolean>(false);

  const motivationQuotes = React.useMemo(() => [
    {
      id: "Keren banget! Setiap koin yang kamu catat hari ini mendekatkanmu ke kebebasan finansial. Streak kamu menyala! 🔥",
      en: "Super cool! Every coin you log today brings you closer to financial freedom. Your streak is glowing! 🔥"
    },
    {
      id: "Satu langkah kecil untuk dompetmu, satu lompatan besar menuju bebas finansial! Pertahankan apimu! 🚀",
      en: "One small step for your wallet, one giant leap towards financial freedom! Keep your fire burning! 🚀"
    },
    {
      id: "Konsistensi adalah kunci! Catat terus pengeluaranmu dan jadilah tuan atas uangmu sendiri. 💪",
      en: "Consistency is key! Keep logging your expenses and master your own money. 💪"
    },
    {
      id: "Mantap! Kebiasaan baik sudah mulai terbentuk. Jangan biarkan apinya padam besok ya! ✨",
      en: "Awesome! Good habits are forming. Don't let the fire go out tomorrow! ✨"
    },
    {
      id: "Disiplin hari ini, foya-foya terencana besok! Keren, kamu berhasil menjaga streak-mu hari ini. 🎯",
      en: "Disciplined today, planned fun tomorrow! Great job keeping your streak alive today. 🎯"
    }
  ], []);

  const generateStreakMotivation = React.useCallback(async (txContext?: { type?: string; amount?: number; category?: string }) => {
    setIsMotivationLoading(true);
    setAiMotivationText("");
    try {
      const text = await fetchAiStreakMotivation({
        type: txContext?.type,
        amount: txContext?.amount,
        category: txContext?.category,
        language: language
      });
      setAiMotivationText(text);
    } catch (err) {
      console.error("Failed to generate AI motivation:", err);
      setAiMotivationText(
        language === "en"
          ? "Super cool! Every coin you log today brings you closer to financial freedom. Your streak is glowing! 🔥"
          : "Keren banget! Setiap koin yang kamu catat hari ini mendekatkanmu ke kebebasan finansial. Streak kamu menyala! 🔥"
      );
    } finally {
      setIsMotivationLoading(false);
    }
  }, [language]);

  React.useEffect(() => {
    if (showCelebration) {
      const randomIndex = Math.floor(Math.random() * motivationQuotes.length);
      setQuoteIndex(randomIndex);
    }
  }, [showCelebration, motivationQuotes]);
  const [lostStreak, setLostStreak] = React.useState<number>(0);
  const [restoreCount, setRestoreCount] = React.useState<number>(0);
  const [isRestoring, setIsRestoring] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const triggerFn = (apiStreak?: number, apiIncreased?: boolean, txContext?: { type?: string; amount?: number; category?: string }) => {
        setStreakCount((prev) => {
          let finalStreak = 1;
          if (typeof apiStreak === "number" && apiStreak > 0) {
            finalStreak = apiStreak;
          } else if (prev > 0) {
            finalStreak = prev;
          } else {
            finalStreak = 1;
          }
          return finalStreak;
        });
        setStreakActive(true);
        setStreakIncreasedToday(true);
        setShowCelebration(true);

        generateStreakMotivation(txContext);

        const email = localStorage.getItem("userEmail") || "";
        if (email) {
          fetchUserStreak(email).then((s) => {
            const fetched = Number(s.current_streak || s.streakCount) || 1;
            setStreakCount((prev) => Math.max(prev, fetched > 0 ? fetched : 1));
            setStreakActive(true);
            setLostStreak(s.lost_streak || 0);
            setRestoreCount(s.restore_count || 0);
            setStreakIncreasedToday(true);
            setShowCelebration(true);
          });
        }
      };

      (window as any).triggerTransactionSuccess = triggerFn;
      (window as any).showStreakCelebration = (txContext?: any) => {
        setStreakIncreasedToday(true);
        setShowCelebration(true);
        generateStreakMotivation(txContext);
      };
    }
    return () => {
      if (typeof window !== "undefined") {
        delete (window as any).triggerTransactionSuccess;
        delete (window as any).showStreakCelebration;
      }
    };
  }, [generateStreakMotivation]);

  const handleRestoreStreak = async () => {
    if (isRestoring) return;
    const email = localStorage.getItem("userEmail") || "";
    if (!email) {
      toast.error(t("Silakan login terlebih dahulu!", "Please login first!"));
      return;
    }
    setIsRestoring(true);
    try {
      const res = await restoreStreak(email);
      if (res.success) {
        toast.success(res.message || t("Streak berhasil dipulihkan! 🔥", "Streak restored successfully! 🔥"));
        setStreakCount(res.data.current_streak || res.data.streakCount);
        setStreakActive(true);
        setLostStreak(0);
        setRestoreCount(res.data.restore_count);
      } else {
        toast.error(res.error || t("Gagal memulihkan streak", "Failed to restore streak"));
      }
    } catch (err: any) {
      toast.error(err.message || t("Terjadi kesalahan jaringan", "Network error occurred"));
    } finally {
      setIsRestoring(false);
    }
  };

  const handleCloseCelebration = () => {
    setShowCelebration(false);
  };

  const dailyQuotes = React.useMemo(() => [
    {
      id: "Setiap koin yang kamu simpan hari ini adalah pondasi kebebasan finansialmu di masa depan. Selangkah demi selangkah menuju impian!",
      en: "Every coin you save today is the foundation of your financial freedom in the future. Step by step toward your dreams!"
    },
    {
      id: "Jangan habiskan sisa uang setelah belanja, tapi belanjakan sisa uang setelah menabung. Kebiasaan kecil melahirkan hasil besar!",
      en: "Do not save what is left after spending, but spend what is left after saving. Small habits breed great results!"
    },
    {
      id: "Investasi terbaik adalah investasi pada diri sendiri dan masa depan finansialmu. Tetap bijak dalam setiap keputusan belanja!",
      en: "The best investment is in yourself and your financial future. Stay wise in every spending decision!"
    },
    {
      id: "Kedisiplinan finansial mengalahkan impulsivitas sesaat. Mari kendalikan anggaranmu dan jadilah tuan atas keuanganmu sendiri!",
      en: "Financial discipline beats momentary impulsiveness. Let's control your budget and be the master of your own money!"
    },
    {
      id: "Ingat, kemakmuran tidak diukur dari seberapa banyak kamu membelanjakan, melainkan seberapa banyak kamu mengamankan.",
      en: "Remember, prosperity is not measured by how much you spend, but by how much you secure."
    },
    {
      id: "Mulailah hari ini dengan komitmen baru: kurangi pengeluaran yang tak perlu dan tingkatkan kantong tabunganmu!",
      en: "Start today with a new commitment: cut unnecessary expenses and boost your savings pockets!"
    },
    {
      id: "Uang adalah alat yang luar biasa jika kamu yang mengendalikannya. Rencanakan pengeluaranmu dan capai tujuan hidupmu!",
      en: "Money is an incredible tool if you control it. Plan your spending and achieve your life goals!"
    }
  ], []);

  const currentDailyQuote = React.useMemo(() => {
    const day = new Date().getDate();
    const index = day % dailyQuotes.length;
    return dailyQuotes[index];
  }, [dailyQuotes]);

  const [aiInsight, setAiInsight] = React.useState<string>(
    "Menganalisa dompetmu...",
  );
  const [isChatOpen, setIsChatOpen] = React.useState(false);
  const [chatInput, setChatInput] = React.useState("");
  const [messages, setMessages] = React.useState<
    { 
      text: string; 
      isAi: boolean; 
      isTransactionSuccess?: boolean; 
      transactionDetails?: { 
        type: string; 
        amount: number; 
        category: string; 
        notes: string; 
      };
    }[]
  >([]);
  const [isTyping, setIsTyping] = React.useState(false);

  const [isListening, setIsListening] = React.useState(false);
  const [speakingMsgIndex, setSpeakingMsgIndex] = React.useState<number | null>(null);
  const [isVoiceInteraction, setIsVoiceInteraction] = React.useState(false);
  const recognitionRef = React.useRef<any>(null);

  React.useEffect(() => {
    if (isChatOpen && messages.length === 0) {
      const welcome = language === "id"
        ? "Halo Sobat Cuan! 👋 Aku Asisten AI MOODUIT. Kamu bisa tanya tips keuangan, konsultasikan rencana belanja, atau langsung ucapkan transaksi untuk dicatat (misal: 'Beli kopi 25rb tadi siang')! 🎙️"
        : "Hello Sobat Cuan! 👋 I'm MOODUIT AI Advisor. Ask financial tips, consult shopping plans, or speak transactions to log them (e.g., 'Spent 25k on coffee')! 🎙️";
      setMessages([{ text: welcome, isAi: true }]);
    }
  }, [isChatOpen, messages.length, language]);

  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (_) {}
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error(
        language === "id"
          ? "Fitur input suara tidak didukung di browser ini. Gunakan Chrome, Edge, atau Safari!"
          : "Speech recognition is not supported in this browser."
      );
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = language === "id" ? "id-ID" : "en-US";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setChatInput((prev) => (prev ? prev + " " + transcript : transcript));
          setIsVoiceInteraction(true); 
          toast.success(
            language === "id" ? "Suara berhasil ditranskrip! 🎙️" : "Voice transcribed! 🎙️"
          );
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
        if (event.error !== "no-speech") {
          toast.error(
            language === "id"
              ? "Gagal merekam suara. Pastikan izin mikrofon telah aktif!"
              : "Failed to record voice. Check microphone permissions."
          );
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e: any) {
      console.error("SpeechRecognition error:", e);
      setIsListening(false);
      toast.error(
        language === "id"
          ? "Tidak dapat mengakses mikrofon!"
          : "Cannot access microphone!"
      );
    }
  };

  const speakMessage = (text: string, index: number) => {
    if (!("speechSynthesis" in window)) {
      toast.error(
        language === "id"
          ? "Browser Anda tidak mendukung fitur pembaca suara (Text-to-Speech)."
          : "Your browser does not support Text-to-Speech."
      );
      return;
    }

    if (speakingMsgIndex === index) {
      window.speechSynthesis.cancel();
      setSpeakingMsgIndex(null);
      return;
    }

    window.speechSynthesis.cancel();
    setSpeakingMsgIndex(index);

    const cleanText = text
      .replace(/<[^>]*>/g, "")
      .replace(/\*+/g, "")
      .replace(/#+/g, "")
      .replace(/`+/g, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = language === "id" ? "id-ID" : "en-US";
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    try {
      const voices = window.speechSynthesis.getVoices();
      const idVoice = voices.find(
        (v) => v.lang.toLowerCase().includes("id") || v.lang.toLowerCase().includes("indonesia")
      );
      if (idVoice) utterance.voice = idVoice;
    } catch (_) {}

    utterance.onend = () => {
      setSpeakingMsgIndex(null);
    };

    utterance.onerror = () => {
      setSpeakingMsgIndex(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  const [wishlist, setWishlist] = React.useState<any[]>([]);
  const [targetImpian, setTargetImpian] = React.useState<any[]>([]);
  const [isEditTargetModalOpen, setIsEditTargetModalOpen] = React.useState(false);
  const [isTargetModalOpen, setIsTargetModalOpen] = React.useState(false);
  const [newTargetName, setNewTargetName] = React.useState("");
  const [newTargetPrice, setNewTargetPrice] = React.useState("");
  
  const [isCelebrationOpen, setIsCelebrationOpen] = React.useState(false);
  const [selectedTargetForCelebration, setSelectedTargetForCelebration] = React.useState<any>(null);

  const [localTransactions, setLocalTransactions] = React.useState<any[]>([]);
  const transactions =
    propsTransactions !== undefined ? propsTransactions : localTransactions;
  const setTransactions =
    propsSetTransactions !== undefined
      ? propsSetTransactions
      : setLocalTransactions;

  const handleBuyTarget = async () => {
    if (!selectedTargetForCelebration) return;
    const target = selectedTargetForCelebration;

    const updatedWishlist = wishlist.filter((t) => t.id !== target.id);
    setWishlist(updatedWishlist);
    setTargetImpian(updatedWishlist);
    syncWishlistWithDb(updatedWishlist);

    const nominalTarget = Number((target.harga || target.price || "0").toString().replace(/\D/g, ""));
    const newTx = {
      id: "purchase_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
      nominal: nominalTarget,
      jenis: "pengeluaran" as const,
      kategori: "Target Impian",
      catatan: `Mewujudkan impian: ${target.nama || target.name}`,
      tanggal: new Date().toISOString().split('T')[0],
      icon: "🎯"
    };

    try {
      if (propsSetTransactions && typeof propsSetTransactions === "function") {
        const { insertTransaction } = await import("../utils/api");
        const user_email = localStorage.getItem("userEmail") || "";
        const insertedTx = await insertTransaction(newTx, user_email);
        propsSetTransactions(prev => [insertedTx, ...prev]);
        if (typeof window !== "undefined" && (window as any).triggerTransactionSuccess) {
          (window as any).triggerTransactionSuccess(insertedTx.currentStreak, insertedTx.streakIncreasedToday, {
            type: 'expense',
            amount: nominalTarget,
            category: 'Target Impian'
          });
        }
      } else {
        setLocalTransactions(prev => [newTx, ...prev]);
        if (typeof window !== "undefined" && (window as any).triggerTransactionSuccess) {
          (window as any).triggerTransactionSuccess(undefined, undefined, {
            type: 'expense',
            amount: nominalTarget,
            category: 'Target Impian'
          });
        }
      }
    } catch (err) {
      console.error("Failed to insert purchase transaction:", err);
      setLocalTransactions(prev => [newTx, ...prev]);
      if (typeof window !== "undefined" && (window as any).triggerTransactionSuccess) {
        (window as any).triggerTransactionSuccess(undefined, undefined, {
          type: 'expense',
          amount: nominalTarget,
          category: 'Target Impian'
        });
      }
    }

    toast.success(
      language === "id"
        ? "Selamat! Saldo telah diperbarui & impian tercatat di riwayat."
        : "Congratulations! Balance updated & dream recorded in transaction history."
    );

    setIsCelebrationOpen(false);
    setSelectedTargetForCelebration(null);
  };

  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [editIndex, setEditIndex] = React.useState<number | null>(null);
  const [editNama, setEditNama] = React.useState("");
  const [editHarga, setEditHarga] = React.useState("");
  const chatScrollRef = React.useRef<HTMLDivElement>(null);

  const savingsPockets = React.useMemo(() => {
    let darurat = 0;
    let investasi = 0;
    let tabungan = 0;

    transactions.forEach((tx) => {
      const note = String(tx.catatan || tx.description || "").toLowerCase();
      if (
        note === "alokasi dana darurat" || 
        note.includes("alokasi kantong dana darurat") || 
        note.includes("emergency fund")
      ) {
        darurat += (Number(tx.nominal || tx.amount) || 0);
      } else if (
        note === "alokasi investasi" || 
        note.includes("alokasi kantong investasi") || 
        note.includes("investment")
      ) {
        investasi += (Number(tx.nominal || tx.amount) || 0);
      } else if (
        note === "alokasi tabungan" || 
        note.includes("alokasi kantong tabungan") || 
        note.includes("alokasi kantong goal savings") || 
        note.includes("savings")
      ) {
        tabungan += (Number(tx.nominal || tx.amount) || 0);
      }
    });

    return { darurat, investasi, tabungan };
  }, [transactions]);

  const [pocketInputs, setPocketInputs] = React.useState<{ [key: string]: string }>({
    darurat: "",
    investasi: "",
    tabungan: "",
  });

  const [showCustomInput, setShowCustomInput] = React.useState<{ [key: string]: boolean }>({
    darurat: false,
    investasi: false,
    tabungan: false,
  });

  const [pos, setPos] = React.useState({ x: 0, y: 0 });
  const isDragging = React.useRef(false);
  const dragStart = React.useRef({ x: 0, y: 0 });
  const startCoords = React.useRef({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 992);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleAlokasiTabungan = async (jenisKantong: "darurat" | "investasi" | "tabungan", nominal: number) => {
    const isId = language === "id";
    if (nominal <= 0 || isNaN(nominal)) {
      toast.error(isId ? "Masukkan nominal yang valid!" : "Enter a valid amount!");
      return;
    }
    if (totalSaldo < nominal) {
      toast.error(isId ? "Saldo kas tidak cukup untuk dialokasikan!" : "Insufficient cash balance for allocation!");
      return;
    }

    let deskripsi = "";
    if (jenisKantong === 'darurat') deskripsi = "Alokasi Dana Darurat";
    if (jenisKantong === 'investasi') deskripsi = "Alokasi Investasi";
    if (jenisKantong === 'tabungan') deskripsi = "Alokasi Tabungan";

    const newTx = {
      id: "pocket_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
      nominal: nominal,
      jenis: "pengeluaran" as const,
      kategori: 'Tabungan',
      catatan: deskripsi,
      tanggal: new Date().toISOString().split('T')[0]
    };

    try {
      if (propsSetTransactions && typeof propsSetTransactions === "function") {
        const { insertTransaction } = await import("../utils/api");
        const user_email = localStorage.getItem("userEmail") || "";
        const insertedTx = await insertTransaction(newTx, user_email);
        propsSetTransactions(prev => [insertedTx, ...prev]);
      } else {
        setLocalTransactions(prev => [newTx, ...prev]);
      }
    } catch (err) {
      console.error("Failed to insert pocket transaction:", err);
      setLocalTransactions(prev => [newTx, ...prev]);
    }

    toast.success(isId
      ? `Berhasil mengalokasikan Rp ${nominal.toLocaleString('id-ID')} ke kantong ${deskripsi}!`
      : `Successfully allocated Rp ${nominal.toLocaleString('id-ID')} to ${jenisKantong} pocket!`
    );
  };

  const renderQuickAllocate = (key: "darurat" | "investasi" | "tabungan") => {
    const customActive = showCustomInput[key] || false;
    const inputValue = pocketInputs[key] || "";

    const handlePreset = (val: number) => {
      handleAlokasiTabungan(key, val);
    };

    const handleCustomSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const cleanNum = Number(inputValue.replace(/\D/g, ""));
      if (!cleanNum || cleanNum <= 0) {
        toast.error(language === "id" ? "Masukkan nominal yang valid!" : "Enter a valid amount!");
        return;
      }
      handleAlokasiTabungan(key, cleanNum);
      setPocketInputs(prev => ({ ...prev, [key]: "" }));
      setShowCustomInput(prev => ({ ...prev, [key]: false }));
    };

    return (
      <div className="mt-2">
        <div className="text-xs sm:text-sm text-muted font-bold mb-2">
          🚀 {t("Alokasi Cepat", "Quick Allocate")}
        </div>
        <div className="d-flex flex-wrap gap-1.5 mb-2">
          <button
            type="button"
            className="btn btn-sm py-1.5 px-3 bg-gray-100 hover:bg-gray-200 text-primary-mooduit rounded-full border-0 font-bold text-xs sm:text-sm cursor-pointer transition-all"
            onClick={() => handlePreset(25000)}
          >
            +25k
          </button>
          <button
            type="button"
            className="btn btn-sm py-1.5 px-3 bg-gray-100 hover:bg-gray-200 text-primary-mooduit rounded-full border-0 font-bold text-xs sm:text-sm cursor-pointer transition-all"
            onClick={() => handlePreset(100000)}
          >
            +100k
          </button>
          <button
            type="button"
            className="btn btn-sm py-1.5 px-3 bg-gray-100 hover:bg-gray-200 text-primary-mooduit rounded-full border-0 font-bold text-xs sm:text-sm cursor-pointer transition-all"
            onClick={() => handlePreset(250000)}
          >
            +250k
          </button>
          <button
            type="button"
            className="btn btn-sm py-1.5 px-3 bg-gray-100 hover:bg-gray-200 text-primary-mooduit rounded-full border-0 font-bold text-xs sm:text-sm cursor-pointer transition-all"
            style={{ backgroundColor: customActive ? "#112F58" : "", color: customActive ? "#ffffff" : "" }}
            onClick={() => setShowCustomInput(prev => ({ ...prev, [key]: !prev[key] }))}
          >
            {customActive ? "×" : "+Custom"}
          </button>
        </div>

        <AnimatePresence>
          {customActive && (
            <motion.form
              onSubmit={handleCustomSubmit}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mt-2"
            >
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-light text-primary-mooduit border border-end-0 text-xs sm:text-sm font-bold" style={{ background: "#f8f9fa", border: "1px solid #ced4da" }}>Rp</span>
                <input
                  type="text"
                  className="form-control text-xs sm:text-sm"
                  placeholder={t("Nominal", "Amount")}
                  value={inputValue}
                  onChange={(e) => {
                    const formatted = formatInput(e.target.value);
                    setPocketInputs(prev => ({ ...prev, [key]: formatted }));
                  }}
                  style={{ border: "1px solid #ced4da" }}
                />
                <button
                  type="submit"
                  className="btn btn-sm text-white text-xs sm:text-sm font-bold px-3"
                  style={{ border: "none", backgroundColor: "#112F58", borderRadius: "0 8px 8px 0" }}
                >
                  {t("Kirim", "Send")}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    isDragging.current = true;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (_) {}
    const clientX = e.clientX;
    const clientY = e.clientY;
    dragStart.current = { x: clientX - pos.x, y: clientY - pos.y };
    startCoords.current = { x: clientX, y: clientY };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!isDragging.current) return;
    const clientX = e.clientX;
    const clientY = e.clientY;

    const rawX = clientX - dragStart.current.x;
    const rawY = clientY - dragStart.current.y;

    const buttonWidth = 56;
    const buttonHeight = 56;
    const rightOffset = 20;
    const bottomOffset = isMobile ? 85 : 20;

    const defaultLeft = window.innerWidth - rightOffset - buttonWidth;
    const defaultTop = window.innerHeight - bottomOffset - buttonHeight;

    const minLeft = 10;
    const maxLeft = window.innerWidth - buttonWidth - 10;
    const targetLeft = Math.max(minLeft, Math.min(maxLeft, defaultLeft + rawX));
    const clampedX = targetLeft - defaultLeft;

    const minTop = 10;
    const maxTop = window.innerHeight - buttonHeight - 10;
    const targetTop = Math.max(minTop, Math.min(maxTop, defaultTop + rawY));
    const clampedY = targetTop - defaultTop;

    setPos({ x: clampedX, y: clampedY });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (_) {}

    const distance = Math.hypot(
      e.clientX - startCoords.current.x,
      e.clientY - startCoords.current.y,
    );
    if (distance < 6) {
      setIsChatOpen((prev) => !prev);
    }
  };

  const syncWishlistWithDb = async (updatedList: any[]) => {
    const user_email = localStorage.getItem("userEmail") || "";
    if (user_email) {
      try {
        const { syncGoals } = await import("../utils/api");
        await syncGoals(user_email, updatedList);
      } catch (err) {
        console.error("Failed to sync wishlist with DB:", err);
      }
    }
  };

  const handleHapusTarget = (idTarget: string) => {
    const updated = wishlist.filter((target) => target.id !== idTarget);
    setTargetImpian(updated);
    setWishlist(updated);
    syncWishlistWithDb(updated);
    setIsEditTargetModalOpen(false);
  };

  const formatInput = (val: string) => {
    const rawValue = val.replace(/\D/g, "");
    if (!rawValue) return "";
    return Number(rawValue).toLocaleString("id-ID");
  };

  const handleEditItem = (index: number) => {
    const item = wishlist[index];
    setEditIndex(index);
    setEditNama(item.name);
    setEditHarga(formatInput(item.price.toString()));
    setIsEditModalOpen(true);
  };

  const handleUpdateItem = () => {
    if (editIndex === null) return;
    const updatedWishlist = [...wishlist];
    const cleanPrice = String(editHarga).replace(/\D/g, "");
    updatedWishlist[editIndex] = {
      ...updatedWishlist[editIndex],
      name: editNama,
      price: cleanPrice,
      harga: cleanPrice,
    };
    setWishlist(updatedWishlist);
    setTargetImpian(updatedWishlist);
    syncWishlistWithDb(updatedWishlist);
    setIsEditModalOpen(false);
  };

  const handleAddTarget = () => {
    if (!newTargetName || !newTargetPrice) return;
    const cleanPrice = newTargetPrice.replace(/\D/g, "");
    const newItem = {
      id: Date.now().toString(),
      name: newTargetName,
      nama: newTargetName,
      price: cleanPrice,
      harga: cleanPrice,
    };
    const updated = [...wishlist, newItem];
    setWishlist(updated);
    setTargetImpian(updated);
    syncWishlistWithDb(updated);
    setNewTargetName("");
    setNewTargetPrice("");
    setIsTargetModalOpen(false);
  };

  const handleDeleteItem = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (
      window.confirm(t("Hapus target impian ini?", "Delete this dream target?"))
    ) {
      const updatedWishlist = wishlist.filter((_, i) => i !== index);
      setWishlist(updatedWishlist);
      setTargetImpian(updatedWishlist);
      syncWishlistWithDb(updatedWishlist);
    }
  };

  const [isSyncing, setIsSyncing] = React.useState(false);

  React.useEffect(() => {
    const savedName = localStorage.getItem("userName");
    if (savedName) {
      setUserName(savedName);
    }

    const user_email = localStorage.getItem("userEmail") || "";
    if (user_email) {
      setIsSyncing(true);
      import("../utils/api").then(({ fetchGoals, fetchBudgetPlan, fetchBudgetPlanCustom }) => {
        fetchGoals(user_email).then((goals) => {
          const mapped = goals.map((item: any) => ({
            ...item,
            id: item.id || Date.now().toString() + Math.random().toString(),
            nama: item.nama || item.name,
            harga: item.harga || item.price,
            name: item.name || item.nama,
            price: item.price || item.harga,
          }));
          setWishlist(mapped);
          setTargetImpian(mapped);
          setIsSyncing(false);
        }).catch((err) => {
          console.error("Error loading goals:", err);
          setIsSyncing(false);
        });

        Promise.all([
          fetchBudgetPlan(user_email),
          fetchBudgetPlanCustom(user_email)
        ]).then(([dbBudget, customBudget]) => {
          const list: any[] = [];
          if (dbBudget && dbBudget.hasilBudget) {
            list.push({
              kategori: "Kebutuhan Pokok (50%)",
              limit: dbBudget.hasilBudget.kebutuhan,
              deskripsi: "Untuk makanan, tagihan, transportasi, dan kebutuhan esensial lainnya."
            });
            list.push({
              kategori: "Jajan / Keinginan (30%)",
              limit: dbBudget.hasilBudget.keinginan,
              deskripsi: "Untuk hiburan, belanja non-primer, kopi, dan rekreasi."
            });
            list.push({
              kategori: "Tabungan / Investasi (20%)",
              limit: dbBudget.hasilBudget.tabungan,
              deskripsi: "Untuk kantong dana darurat, investasi masa depan, dan impian."
            });
          } else if (customBudget) {
            list.push({
              kategori: "Kebutuhan Pokok",
              limit: customBudget.expenses,
              deskripsi: "Anggaran kebutuhan pokok bulanan kustom."
            });
            list.push({
              kategori: "Dana Darurat Target",
              limit: customBudget.emergencyTarget,
              deskripsi: "Target dana darurat kustom (dalam bulan pengeluaran)."
            });
            list.push({
              kategori: "Tabungan Target",
              limit: customBudget.savingsTarget,
              deskripsi: "Target persentase tabungan kustom."
            });
          }
          setBudgetsData(list);
        }).catch((err) => {
          console.error("Error loading budgets for AI:", err);
        });
      });
    } else {
      setWishlist([]);
      setTargetImpian([]);
      setBudgetsData([]);
    }

    if (propsTransactions === undefined) {
      setLocalTransactions([]);
    }
  }, [propsTransactions]);

  React.useEffect(() => {
    const syncStreakWithLocalTime = () => {
      const user_email = localStorage.getItem("userEmail") || "";
      if (user_email) {
        fetchUserStreak(user_email).then((s) => {
          setStreakCount(s.streakCount);
          setStreakActive(s.streakActive);
        });
      }
    };

    syncStreakWithLocalTime();
    const streakInterval = setInterval(syncStreakWithLocalTime, 30000);
    return () => clearInterval(streakInterval);
  }, []);

  React.useEffect(() => {
    if (userName) {
      setMessages([
        {
          text: t(
            `Halo ${userName}! Ada yang mau didiskusikan soal keuanganmu hari ini?`,
            `Hello ${userName}! Is there anything you'd like to discuss about your finances today?`,
          ),
          isAi: true,
        },
      ]);
    }
  }, [userName, language]);

  const renderMarkdown = (text: string) => {
    if (!text) return { __html: "" };
    let escaped = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    
    escaped = escaped.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    escaped = escaped.replace(/\*(.*?)\*/g, "<em>$1</em>");
    escaped = escaped.replace(/\n/g, "<br />");
    return { __html: escaped };
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const wasVoiceInput = isVoiceInteraction;
    setIsVoiceInteraction(false); 

    const userMessage = chatInput.trim();
    const updatedMessages = [...messages, { text: userMessage, isAi: false }];
    setMessages(updatedMessages);
    setChatInput("");
    setIsTyping(true);

    setTimeout(() => {
      if (chatScrollRef.current) {
        chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
      }
    }, 50);

    const user_email = localStorage.getItem("userEmail") || "";

    const financialContext = {
      totalBalance: totalSaldo,
      totalIncome: totalPemasukan,
      totalExpense: totalPengeluaran,
      currency: "IDR",
      summary: { 
        balance: totalSaldo, 
        totalIncome: totalPemasukan, 
        totalExpense: totalPengeluaran 
      },
      smartBudget: budgetsData || [],
      recentTransactions: transactions.slice(0, 10).map((t: any) => ({
        id: t.id,
        amount: Number(t.nominal || t.amount) || 0,
        type: t.jenis === 'pemasukan' ? 'pemasukan' : 'pengeluaran',
        category: t.kategori,
        description: t.catatan || t.description,
        date: t.tanggal
      })),
      savingsGoals: wishlist.map((g: any) => ({
        id: g.id,
        name: g.nama || g.name || "Impian",
        price: Number(g.harga || g.price) || 0
      }))
    };

    const tempGeminiKey = localStorage.getItem("TEMP_GEMINI_KEY") || "";

    let attempts = 0;
    const maxAttempts = 3; 
    let success = false;
    let dataText = "";
    let serverActionPayload: any = null;
    let lastError = "";

    while (attempts < maxAttempts) {
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            message: userMessage,
            messages: updatedMessages.map(m => ({ text: m.text, isAi: m.isAi })), 
            language, 
            user_email,
            financialContext,
            targetImpian: targetImpian && targetImpian.length > 0 ? targetImpian : wishlist,
            tempGeminiKey
          }),
        });

        const status = res.status;
        const contentType = res.headers.get("content-type") || "";

        if (!res.ok || status === 503) {
          const errData = contentType.includes("application/json") 
            ? await res.json().catch(() => ({})) 
            : {};
          
          const errStr = String(errData.error || errData.text || errData.reply || `Server error ${status}`).toLowerCase();
          lastError = errData.error || errData.text || errData.reply || `Server error ${status}`;
          
          const isRetryable = status === 503 || 
                              errStr.includes("503") || 
                              errStr.includes("high demand") || 
                              errStr.includes("overloaded") || 
                              errStr.includes("resource exhausted") ||
                              errStr.includes("rate limit") ||
                              errStr.includes("unavailable");

          if (isRetryable && (attempts + 1) < maxAttempts) {
            attempts++;
            console.log(`[AI Chat Frontend] Attempt ${attempts} did not succeed. Retrying in 1.5s...`);
            await new Promise((resolve) => setTimeout(resolve, 1500));
            continue;
          } else {
            throw new Error(errData.error || errData.text || `Server returned status ${status}`);
          }
        }

        const data = await res.json();
        const replyMsg = data.reply || data.text || "";
        const actionPayload = data.actionPayload || null;

        if (data && (replyMsg || actionPayload)) {
          dataText = replyMsg;
          serverActionPayload = actionPayload;
          success = true;
          break;
        } else if (data && data.error) {
          throw new Error(data.error);
        } else {
          throw new Error("No response text received from server");
        }
      } catch (error: any) {
        attempts++;
        const errMsg = String(error.message || error).toLowerCase();
        lastError = error.message || String(error);
        
        const isRetryable = errMsg.includes("503") || 
                            errMsg.includes("high demand") || 
                            errMsg.includes("overloaded") || 
                            errMsg.includes("resource exhausted") ||
                            errMsg.includes("rate limit") || 
                            errMsg.includes("unavailable");

        if (isRetryable && attempts < maxAttempts) {
          console.log(`[AI Chat Frontend] Catch attempt ${attempts} did not succeed. Retrying in 1.5s...`);
          await new Promise((resolve) => setTimeout(resolve, 1500));
        } else {
          break;
        }
      }
    }

    if (success && (dataText || serverActionPayload)) {
      let cleanText = dataText;
      let transactionData: any = serverActionPayload;

      if (!transactionData && dataText) {
        try {
          const markdownMatch = dataText.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
          if (markdownMatch && markdownMatch[1]) {
            const parsed = JSON.parse(markdownMatch[1].trim());
            if (parsed && (parsed.action === "ADD_TRANSACTION" || parsed.amount || parsed.type)) {
              transactionData = parsed;
              cleanText = dataText.replace(markdownMatch[0], "").trim();
            }
          }
        } catch (e) {
          console.warn("Strategy 1 (Markdown JSON) parse attempt:", e);
        }

        if (!transactionData) {
          try {
            const rawMatch = dataText.match(/\{\s*"action"\s*:\s*"ADD_TRANSACTION"[\s\S]*?\}/i) ||
                             dataText.match(/\{\s*"type"\s*:[\s\S]*?"amount"\s*:[\s\S]*?\}/i);
            if (rawMatch) {
              const parsed = JSON.parse(rawMatch[0]);
              if (parsed && (parsed.action === "ADD_TRANSACTION" || parsed.amount || parsed.type)) {
                transactionData = parsed;
                cleanText = dataText.replace(rawMatch[0], "").trim();
              }
            }
          } catch (e) {
            console.warn("Strategy 2 (Raw JSON) parse attempt:", e);
          }
        }
      }

      cleanText = cleanText.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim();

      if (transactionData) {
        let rawAmount = transactionData.amount;
        let nominalValue = 0;
        if (typeof rawAmount === "number") {
          nominalValue = Math.abs(rawAmount);
        } else if (typeof rawAmount === "string") {
          const digitsOnly = rawAmount.replace(/[^0-9]/g, "");
          nominalValue = Number(digitsOnly) || 0;
        }

        const typeStr = String(transactionData.type || "expense").toLowerCase();
        const typeValue = (typeStr === "income" || typeStr === "pemasukan") ? "pemasukan" : "pengeluaran";
        const categoryValue = transactionData.category || transactionData.kategori || "Lainnya";
        let rawNotes = transactionData.notes || transactionData.title || transactionData.catatan || transactionData.category || "Transaksi";
        rawNotes = String(rawNotes)
          .replace(/^(?:catat|tolong catat|input|rekam|tambah)\s+(?:pengeluaran|pemasukan)?\s*/i, "")
          .trim();
        const notesValue = rawNotes || categoryValue;

        const categoryIcons: Record<string, string> = {
          "Kebutuhan Pokok": "🛒", 
          "Transportasi": "🚗", 
          "Hiburan": "🎬", 
          "Makan & Minum": "🍜", 
          "Makanan & Minuman": "🍜",
          "Kesehatan": "💊", 
          "Pendidikan": "📚", 
          "Tagihan": "📄", 
          "Belanja": "👕", 
          "Gaji": "💰",
          "Investasi": "📈",
          "Lainnya": "📦"
        };
        const iconValue = categoryIcons[categoryValue] || "🧾";

        const newTx = {
          id: "ai_tx_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
          nominal: nominalValue,
          jenis: typeValue,
          kategori: categoryValue,
          catatan: notesValue,
          tanggal: new Date().toISOString().split('T')[0],
          icon: iconValue
        };

        const saveTransactionToState = async () => {
          try {
            if (propsSetTransactions && typeof propsSetTransactions === "function") {
              const { insertTransaction } = await import("../utils/api");
              const user_email = localStorage.getItem("userEmail") || "";
              const insertedTx = await insertTransaction(newTx, user_email);
              propsSetTransactions(prev => [insertedTx, ...prev]);
              if (typeof window !== "undefined" && (window as any).triggerTransactionSuccess) {
                (window as any).triggerTransactionSuccess(insertedTx.currentStreak, insertedTx.streakIncreasedToday, {
                  type: typeValue,
                  amount: nominalValue,
                  category: categoryValue
                });
              }
            } else {
              setLocalTransactions(prev => [newTx, ...prev]);
              if (typeof window !== "undefined" && (window as any).triggerTransactionSuccess) {
                (window as any).triggerTransactionSuccess(undefined, undefined, {
                  type: typeValue,
                  amount: nominalValue,
                  category: categoryValue
                });
              }
            }
          } catch (err) {
            console.error("Failed to insert AI transaction:", err);
            setLocalTransactions(prev => [newTx, ...prev]);
          }
        };

        saveTransactionToState();

        toast.success(
          language === "id"
            ? `Berhasil mencatat transaksi: ${notesValue} (Rp ${nominalValue.toLocaleString("id-ID")})`
            : `Successfully recorded transaction: ${notesValue} (Rp ${nominalValue.toLocaleString("id-ID")})`
        );

        if (!cleanText) {
          cleanText = language === "id" 
            ? `Sip! Transaksi ${notesValue} sebesar Rp ${nominalValue.toLocaleString("id-ID")} telah berhasil dicatat ya! ✅` 
            : `Got it! Transaction ${notesValue} worth Rp ${nominalValue.toLocaleString("id-ID")} has been recorded! ✅`;
        }

        setMessages((prev) => {
          const next = [
            ...prev,
            { 
              text: cleanText, 
              isAi: true, 
              isTransactionSuccess: true, 
              transactionDetails: { 
                type: transactionData.type, 
                amount: nominalValue, 
                category: categoryValue, 
                notes: notesValue 
              } 
            }
          ];
          if (wasVoiceInput) {
            const aiIdx = next.length - 1;
            setTimeout(() => {
              speakMessage(cleanText, aiIdx);
            }, 100);
          }
          return next;
        });
      } else {
        setMessages((prev) => {
          const next = [...prev, { text: cleanText, isAi: true }];
          if (wasVoiceInput) {
            const aiIdx = next.length - 1;
            setTimeout(() => {
              speakMessage(cleanText, aiIdx);
            }, 100);
          }
          return next;
        });
      }
    } else {
      const lastErrorLower = lastError.toLowerCase();
      if (
        lastErrorLower.includes("api_key") || 
        lastErrorLower.includes("403") || 
        lastErrorLower.includes("401") || 
        lastErrorLower.includes("forbidden") || 
        lastErrorLower.includes("unauthorized") || 
        lastErrorLower.includes("key not valid") || 
        lastErrorLower.includes("invalid key") || 
        lastErrorLower.includes("key belum dipasang")
      ) {
        const keyMsg = "🔑 API Key Gemini belum terpasang atau tidak valid! Silakan klik tombol Kunci 🔑 di atas untuk memasukkan API Key Anda agar AI bisa menjawab.";
        setMessages((prev) => [...prev, { text: keyMsg, isAi: true }]);
      } else {
        const friendlyMsg = "Maaf, AI sedang memproses data. Coba tanyakan lagi ya! 🙏";
        setMessages((prev) => [...prev, { text: friendlyMsg, isAi: true }]);
      }
    }
    setIsTyping(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  React.useEffect(() => {
    const generateInsight = async () => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setAiInsight(
        t(
          `Halo! Aku AI Advisor-mu. Saldomu masih kosong nih, yuk atur Smart Budget pertamamu!`,
          `Hello! I am your AI Advisor. Your balance is looking empty, let's configure your first Smart Budget!`,
        ),
      );
    };
    generateInsight();
  }, [saldoDanaDarurat, userName, language]);

  const totalPemasukan = transactions
    .filter((t) => t.jenis === "pemasukan")
    .reduce((acc, t) => acc + (Number(t.nominal) || 0), 0);
  const totalPengeluaran = transactions
    .filter((t) => t.jenis === "pengeluaran")
    .reduce((acc, t) => acc + (Number(t.nominal) || 0), 0);
  const totalSaldo = totalPemasukan - totalPengeluaran;

  // Real-time Ambient AI Advisor fetch effect
  React.useEffect(() => {
    let isMounted = true;
    if (isLoading) return;
    const fetchAdvice = async () => {
      setIsAmbientLoading(true);
      try {
        const advice = await fetchAmbientAiAdvice(totalSaldo, language);
        if (isMounted) {
          if (advice) {
            const cleanedText = advice.replace(/^["'“«]+|["'”»]+$/g, '').trim();
            setAmbientAdvice(cleanedText);
          } else {
            if (totalSaldo <= 50000) {
              setAmbientAdvice(
                language === "en"
                  ? "Low balance alert! Time to slow down on non-essential spending today! 🛑"
                  : "Dompet menipis nih! Waktunya ngerem jajan yang nggak penting dulu ya! 🛑"
              );
            } else {
              setAmbientAdvice(
                language === "en"
                  ? "Nice balance! Keep saving and put some into smart investments! 🚀"
                  : "Saldo aman jaya! Jangan lupa tabung sebagian dan investasikan ya! 🚀"
              );
            }
          }
        }
      } catch (err) {
        console.error("Error fetching Ambient AI advice:", err);
        if (isMounted) {
          setAmbientAdvice(
            language === "en"
              ? "Keep tracking your expenses to stay financially healthy! ✨"
              : "Catat terus pengeluaranmu agar keuanganmu tetap sehat! ✨"
          );
        }
      } finally {
        if (isMounted) {
          setIsAmbientLoading(false);
        }
      }
    };

    fetchAdvice();
    return () => {
      isMounted = false;
    };
  }, [totalSaldo, language, isLoading]);

  const summaryCards = [
    {
      label: t("Total Saldo", "Total Balance"),
      value: `Rp ${totalSaldo.toLocaleString("id-ID")}`,
      icon: <Wallet size={20} className="text-primary-mooduit" />,
      bg: "bg-white",
      text: "text-primary-mooduit",
    },
    {
      label: t("Pemasukan Bulan Ini", "Income This Month"),
      value: `Rp ${totalPemasukan.toLocaleString("id-ID")}`,
      icon: <ArrowDownCircle size={20} className="text-success" />,
      bg: "bg-white",
      text: "text-primary-mooduit",
    },
    {
      label: t("Pengeluaran Bulan Ini", "Expenses This Month"),
      value: `Rp ${totalPengeluaran.toLocaleString("id-ID")}`,
      icon: <ArrowUpCircle size={20} style={{ color: "#382718" }} />,
      bg: "bg-white",
      text: "text-[#382718]",
    },
  ];

  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours >= 0 && hours <= 11) {
      return { id: "Selamat Pagi", en: "Good Morning" };
    } else if (hours >= 12 && hours <= 14) {
      return { id: "Selamat Siang", en: "Good Afternoon" };
    } else if (hours >= 15 && hours <= 18) {
      return { id: "Selamat Sore", en: "Good Afternoon" };
    } else {
      return { id: "Selamat Malam", en: "Good Evening" };
    }
  };

  const currentGreeting = getGreeting();

  return (
    <div className="container py-4 pb-5 mb-5">
      <header className="mb-4">
        <div className="d-flex align-items-center flex-wrap gap-3 mb-1">
          <h1 className="fw-800 text-primary-mooduit text-2xl sm:text-3xl mb-0">
            {t(`${currentGreeting.id}, ${userName}! 👋`, `${currentGreeting.en}, ${userName}! 👋`)}
          </h1>
          <div className="streak-badge-container flex items-center gap-2">
            <div 
              className={`streak-badge ${streakActive && streakCount > 0 ? 'streak-badge-menyala' : 'streak-badge-padam'}`}
            >
              <span className="streak-badge-fire">🔥</span>
              <span className="streak-badge-text text-xs sm:text-sm">
                {streakCount}
              </span>
            </div>

            {lostStreak > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRestoreStreak}
                disabled={isRestoring}
                type="button"
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs sm:text-sm font-bold rounded-full bg-amber-500/15 text-amber-600 border border-amber-500/30 hover:bg-amber-500/25 transition-all cursor-pointer shadow-sm disabled:opacity-50"
                title={t(`Pulihkan streak yang hangus (${lostStreak} hari). Sisa pemulihan bulan ini: ${Math.max(0, 2 - restoreCount)}/2`, `Restore lost streak (${lostStreak} days). Remaining restores this month: ${Math.max(0, 2 - restoreCount)}/2`)}
              >
                <span>⚡</span>
                <span>{isRestoring ? t("Memulihkan...", "Restoring...") : t(`Pulihkan (${lostStreak} hr)`, `Restore (${lostStreak} d)`)}</span>
              </motion.button>
            )}
          </div>

          {/* IKON KADO ULANG TAHUN DI DASHBOARD (SEBELAH STREAK) */}
          {isUserBirthdayToday(userDob) && (
            <motion.button
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              type="button"
              onClick={() => setShowBirthdayModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white font-black text-xs sm:text-sm shadow-md shadow-pink-500/25 animate-pulse border-0 cursor-pointer hover:scale-105 active:scale-95 transition-all"
              style={{ borderRadius: '9999px' }}
              title={t("Kado Ulang Tahun Kamu! 🎉 Klik untuk membuka modal kado", "Your Birthday Gift! 🎉 Click to open surprise modal")}
            >
              <span className="text-sm select-none">🎁</span>
              <span className="tracking-wide uppercase text-xs font-black">{t("Kado Ulang Tahun", "Birthday Gift")}</span>
            </motion.button>
          )}
        </div>
        {isLoading ? (
          <div className="h-5 w-48 bg-slate-200 dark:bg-slate-700 animate-pulse rounded my-1" />
        ) : totalSaldo <= 50000 ? (
          <p className="mb-0 text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1.5 text-sm sm:text-base">
            <span>⚠️</span>
            <span>
              {t(
                "Waduh, dompetmu lagi kritis nih. Yuk rem pengeluaran!",
                "Watch out, your wallet is in critical condition. Let's slow down spending!"
              )}
            </span>
          </p>
        ) : (
          <p className="text-muted text-sm sm:text-base mb-0">
            {t(
              "Status dompetmu lagi terpantau sehat hari ini.",
              "Your wallet status is looking healthy today.",
            )}
          </p>
        )}
      </header>

      {/* Ambient AI Advisor Component (Moved to Top) */}
      <motion.div
        className="p-4 bg-cream-mooduit rounded-2xl shadow-sm border-0 d-flex gap-4 align-items-center mb-4 mooduit-ambient-ai-banner"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="bg-white p-3 rounded-xl text-brown-mooduit shadow-sm shrink-0 mooduit-ambient-ai-icon">
          <MessageSquareText size={24} />
        </div>
        <div className="w-full">
          <div
            className="text-xs sm:text-sm font-extrabold text-brown-mooduit opacity-80 uppercase tracking-wider mb-1 mooduit-ambient-ai-title"
          >
            Ambient AI Advisor
          </div>
          {isAmbientLoading || isLoading ? (
            <div className="w-full h-10 bg-slate-200/50 dark:bg-slate-700/50 rounded-lg animate-pulse"></div>
          ) : (
            <p
              className="mb-0 font-bold text-brown-mooduit text-justify text-sm sm:text-base leading-relaxed mooduit-ambient-ai-desc"
            >
              {ambientAdvice}
            </p>
          )}
        </div>
      </motion.div>

      {/* Summary Cards Grid */}
      <div className="w-full flex flex-col gap-3 sm:gap-4 mb-5">
        {/* KARTU 1: Total Saldo (Full Width Compact) */}
        <div className="w-full bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-50 dark:bg-slate-700 flex items-center justify-center">
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 text-[#112F58] dark:text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                ></path>
              </svg>
            </div>
          </div>
          
          {/* TEXT HEADER & TOGGLE MATA (INLINE & CLEAN) */}
          <div className="flex items-center gap-2 mb-1">
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-semibold m-0 p-0 leading-none">
              {t("Total Saldo", "Total Balance")}
            </p>
            <div className="mooduit-tooltip-wrapper">
              <button 
                onClick={() => {
                  const nextVal = !showBalance;
                  setShowBalance(nextVal);
                  localStorage.setItem("mooduit_balance_visibility", String(nextVal));
                }}
                className="btn-eye-toggle"
                type="button"
                aria-label={showBalance ? t("Sembunyikan Saldo", "Hide Balance") : t("Tampilkan Saldo", "Show Balance")}
              >
                {showBalance ? (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                ) : (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                )}
              </button>
              <span className="mooduit-tooltip">
                {showBalance ? t("Sembunyikan", "Hide") : t("Tampilkan", "Show")}
              </span>
            </div>
          </div>
          
          {isLoading ? (
            <div className="h-8 w-44 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse my-0.5" />
          ) : (
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#112F58] dark:text-white leading-tight mb-0">
              {showBalance ? `Rp ${totalSaldo.toLocaleString("id-ID")}` : "Rp ••••••••"}
            </h2>
          )}
        </div>

        {/* KARTU RINGKASAN PEMASUKAN & PENGELUARAN (BALANCED GRID FIX) */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-4 w-full">
          
          {/* Kartu Pemasukan */}
          <div className="w-full bg-white dark:bg-slate-800 rounded-2xl p-2.5 sm:p-3 border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col justify-between">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-2">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                </svg>
              </div>
              <span className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap truncate">
                {t("Pemasukan", "Income")}
              </span>
            </div>
            {isLoading ? (
              <div className="h-5 w-24 bg-slate-200 dark:bg-slate-700 rounded-md animate-pulse mt-1" />
            ) : (
              <h3 className="text-[11px] sm:text-xs md:text-sm font-extrabold tracking-tighter whitespace-nowrap m-0 text-[#112F58] dark:text-white" title={showBalance ? `Rp ${totalPemasukan.toLocaleString("id-ID")}` : undefined}>
                {showBalance ? `Rp ${totalPemasukan.toLocaleString("id-ID")}` : "Rp ••••••••"}
              </h3>
            )}
          </div>

          {/* Kartu Pengeluaran */}
          <div className="w-full bg-white dark:bg-slate-800 rounded-2xl p-2.5 sm:p-3 border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col justify-between">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-2">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
                </svg>
              </div>
              <span className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap truncate">
                {t("Pengeluaran", "Expenses")}
              </span>
            </div>
            {isLoading ? (
              <div className="h-5 w-24 bg-slate-200 dark:bg-slate-700 rounded-md animate-pulse mt-1" />
            ) : (
              <h3 className="text-[11px] sm:text-xs md:text-sm font-extrabold tracking-tighter whitespace-nowrap m-0 text-[#112F58] dark:text-white" title={showBalance ? `Rp ${totalPengeluaran.toLocaleString("id-ID")}` : undefined}>
                {showBalance ? `Rp ${totalPengeluaran.toLocaleString("id-ID")}` : "Rp ••••••••"}
              </h3>
            )}
          </div>

        </div>
      </div>

      {/* SECTION TARGET IMPIAN (REORDERED: DIRECTLY BELOW PEMASUKAN & PENGELUARAN) */}
      <div className="mb-6">
        <div className="card-mooduit h-100 shadow-sm p-4 d-flex flex-column bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2
              className="fw-800 text-primary-mooduit dark:text-white text-lg sm:text-xl mb-0 d-flex align-items-center gap-2"
            >
              🎯 {t("Target Impian", "Dream Target")}
            </h2>
            <button
              onClick={() => setIsTargetModalOpen(true)}
              className="btn btn-mooduit-outline px-3 py-1.5 rounded-xl font-bold text-xs sm:text-sm"
            >
              + {t("Tambah Impian Baru", "Add New Dream")}
            </button>
          </div>

          <div className="flex-grow-1 d-flex flex-column py-1">
            <div className="space-y-3">
              {targetImpian.length === 0 ? (
                <div className="text-center p-6 text-gray-400 text-sm border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-xl d-flex flex-column align-items-center justify-content-center h-100 py-5">
                  <p className="mb-3 text-sm sm:text-base leading-relaxed">
                    {t(
                      "Belum ada target impian. Yuk, tambah target pertamamu!",
                      "No dream targets yet. Let's add your first target!",
                    )}
                  </p>
                  <button
                    className="btn btn-mooduit-outline px-4 py-2 rounded-xl font-bold text-xs sm:text-sm"
                    onClick={() => setIsTargetModalOpen(true)}
                  >
                    + {t("Tambah Impian Baru", "Add New Dream")}
                  </button>
                </div>
              ) : (
                <div
                  className="d-flex flex-column gap-3 overflow-y-auto"
                  style={{ maxHeight: "300px" }}
                >
                  {targetImpian.map((target) => (
                    <div
                      key={target.id}
                      className="border border-gray-100 dark:border-slate-700 rounded-xl p-3.5 sm:p-4 flex justify-between items-center relative group bg-light dark:bg-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all cursor-pointer"
                      onClick={() => {
                        const idx = wishlist.findIndex(
                          (w: any) => w.id === target.id,
                        );
                        if (idx !== -1) handleEditItem(idx);
                      }}
                    >
                      <div className="flex items-center gap-3 d-flex min-w-0 flex-1 pr-2">
                        <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-slate-600 flex items-center justify-center text-blue-500 dark:text-blue-300 shrink-0">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            style={{ width: "20px", height: "20px" }}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                            ></path>
                          </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3
                            className="font-bold text-[#112F58] dark:text-white capitalize text-sm sm:text-base mb-0.5 truncate"
                          >
                            {target.nama || target.name}
                          </h3>
                          <p className="text-xs sm:text-sm font-semibold text-gray-500 dark:text-slate-400 mb-0">
                            Rp{" "}
                            {Number(
                              (target.harga || target.price || "0")
                                .toString()
                                .replace(/\D/g, ""),
                            ).toLocaleString("id-ID")}
                          </p>
                        </div>
                      </div>
                      {/* Tombol Aksi di Card */}
                      <div className="d-flex gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                        {/* Tombol Beli / Tercapai */}
                        <button
                          onClick={() => {
                            setSelectedTargetForCelebration(target);
                            setIsCelebrationOpen(true);
                          }}
                          className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-all border-0 flex items-center justify-center cursor-pointer"
                          title={t("Beli / Tercapai", "Buy / Achieved")}
                          style={{
                            backgroundColor: "#ECFDF5",
                            color: "#059669",
                          }}
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            style={{ width: "20px", height: "20px" }}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2.5"
                              d="M5 13l4 4L19 7"
                            ></path>
                          </svg>
                        </button>

                        {/* Tombol Hapus Langsung di Card */}
                        <button
                          onClick={() => {
                            setTargetImpian((prev) => {
                              const updated = prev.filter(
                                (t) => t.id !== target.id,
                              );
                              setWishlist(updated);
                              localStorage.setItem(
                                "savedWishlist",
                                JSON.stringify(updated),
                              );
                              return updated;
                            });
                          }}
                          className="text-red-400 hover:text-red-600 p-2 bg-red-50 rounded-lg group-hover:opacity-100 transition-opacity border-0 flex items-center justify-center cursor-pointer"
                          title={t("Hapus Target", "Delete Target")}
                          style={{
                            backgroundColor: "#FEF2F2",
                            color: "#DC2626",
                          }}
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            style={{ width: "20px", height: "20px" }}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            ></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    className="btn btn-link text-primary-mooduit dark:text-sky-400 font-bold text-decoration-none text-xs sm:text-sm p-0 mt-2 text-start border-0 bg-transparent shadow-none"
                    onClick={() => setIsTargetModalOpen(true)}
                  >
                    + {t("Tambah Impian Baru", "Add New Dream")}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION KANTONG MASA DEPAN */}
      <div className="mb-6">
        <div className="d-flex flex-column mb-3">
          <h2 className="fw-800 text-primary-mooduit text-xl sm:text-2xl mb-1 d-flex align-items-center gap-2">
            💼 {t("Kantong Masa Depan", "Future Pockets")}
          </h2>
          <p className="text-muted text-sm sm:text-base leading-relaxed mb-0">
            {t(
              "Alokasikan sisa saldo aktifmu ke pos tabungan khusus (secara logis mengurangi saldo aktif utama).",
              "Allocate your remaining active balance to target savings pockets (automatically deducts active cash)."
            )}
          </p>
        </div>

        <div className="row g-3">
          {/* Kantong 1: Dana Darurat */}
          <div className="col-12 col-md-4">
            <div className="card-mooduit h-100 p-4 border shadow-sm transition-all" style={{ minHeight: '180px' }}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="font-bold text-muted text-xs sm:text-sm">{t("Dana Darurat", "Emergency Fund")}</span>
                <span className="fs-4">🚨</span>
              </div>
              <h3 className="fw-800 text-primary-mooduit text-xl sm:text-2xl mb-3">
                Rp {savingsPockets.darurat.toLocaleString("id-ID")}
              </h3>
              {renderQuickAllocate("darurat")}
            </div>
          </div>

          {/* Kantong 2: Investasi */}
          <div className="col-12 col-md-4">
            <div className="card-mooduit h-100 p-4 border shadow-sm transition-all" style={{ minHeight: '180px' }}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="font-bold text-muted text-xs sm:text-sm">{t("Investasi", "Investments")}</span>
                <span className="fs-4">📈</span>
              </div>
              <h3 className="fw-800 text-primary-mooduit text-xl sm:text-2xl mb-3">
                Rp {savingsPockets.investasi.toLocaleString("id-ID")}
              </h3>
              {renderQuickAllocate("investasi")}
            </div>
          </div>

          {/* Kantong 3: Tabungan */}
          <div className="col-12 col-md-4">
            <div className="card-mooduit h-100 p-4 border shadow-sm transition-all" style={{ minHeight: '180px' }}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="font-bold text-muted text-xs sm:text-sm">{t("Tabungan", "Goal Savings")}</span>
                <span className="fs-4">🏦</span>
              </div>
              <h3 className="fw-800 text-primary-mooduit text-xl sm:text-2xl mb-3">
                Rp {savingsPockets.tabungan.toLocaleString("id-ID")}
              </h3>
              {renderQuickAllocate("tabungan")}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION TRANSAKSI TERAKHIR (RIWAYAT) */}
      <div className="mb-6">
        <div className="card-mooduit p-4 shadow-sm bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2
              className="fw-800 text-primary-mooduit dark:text-white text-lg sm:text-xl mb-0"
            >
              {t("Transaksi Terakhir", "Recent Transactions")}
            </h2>
            <button
              className="btn btn-link text-primary-mooduit dark:text-sky-400 fw-bold text-decoration-none text-xs sm:text-sm p-0 border-0 bg-transparent"
              onClick={() => onNavigate("history")}
            >
              {t("Lihat Semua", "See All")}
            </button>
          </div>

          {isLoading ? (
            <div className="d-flex flex-column gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="d-flex justify-content-between align-items-center p-3 rounded-2xl bg-gray-50 border border-gray-100 animate-pulse">
                  <div className="d-flex align-items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700" />
                    <div className="space-y-1">
                      <div className="h-4 w-28 bg-slate-200 dark:bg-slate-700 rounded" />
                      <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
                    </div>
                  </div>
                  <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
                </div>
              ))}
            </div>
          ) : transactions.length > 0 ? (
            <div
              className="d-flex flex-column gap-3 overflow-y-auto"
              style={{ maxHeight: "400px" }}
            >
              {transactions.slice(0, 3).map((t, idx) => (
                <div
                  key={t.id || idx}
                  className="d-flex justify-content-between align-items-center p-3 rounded-2xl bg-white border border-gray-100 shadow-sm dark:bg-slate-800 dark:border-slate-700"
                >
                  <div className="d-flex align-items-center gap-3 flex-1 min-w-0 pr-2">
                    <div className="bg-slate-50 dark:bg-slate-700 p-2.5 rounded-xl shadow-xs text-lg shrink-0">
                      {t.icon || "🧾"}
                    </div>
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="fw-800 text-slate-800 dark:text-white text-sm sm:text-base leading-tight mb-0.5 truncate line-clamp-1">
                        {t.catatan || t.kategori}
                      </div>
                      <div className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium truncate">
                        {t.tanggal}
                      </div>
                    </div>
                  </div>
                  <div
                    className={`fw-800 text-sm sm:text-base shrink-0 whitespace-nowrap ${t.jenis === "pemasukan" ? "text-success" : "text-[#382718] dark:text-rose-400"}`}
                  >
                    {t.jenis === "pemasukan" ? "+" : "-"} Rp{" "}
                    {Number(t.nominal).toLocaleString("id-ID")}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="d-flex flex-column align-items-center justify-content-center py-5">
              <div className="bg-light dark:bg-slate-800 p-3 rounded-circle mb-3">
                <ArrowUpRight size={24} className="text-muted opacity-50" />
              </div>
              <p className="text-muted text-sm sm:text-base text-center mb-3 leading-relaxed">
                {t(
                  "Belum ada transaksi. Yuk mulai catat pengeluaran pertamamu!",
                  "No transactions yet. Let's start tracking your first expense!",
                )}
              </p>
              <button
                className="btn btn-mooduit-outline px-4 py-2 rounded-xl font-bold text-xs sm:text-sm"
                onClick={() => onNavigate("scanner")}
              >
                + {t("Scan Struk AI", "Scan Receipt AI")}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Floating AI Widget & Chat Window */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={isMobile ? { y: "100%" } : { opacity: 0, scale: 0.9, y: 50 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={isMobile ? { y: "100%" } : { opacity: 0, scale: 0.9, y: 50 }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="fixed inset-0 md:fixed md:inset-auto md:bottom-20 md:right-8 md:w-[400px] md:h-[600px] bg-white dark:bg-slate-900 md:rounded-3xl shadow-2xl md:border border-slate-200 dark:border-slate-800 z-[99999] flex flex-col resize overflow-hidden min-w-[320px] min-h-[400px] max-w-[600px] max-h-[800px]"
          >
            {/* HEADER CHAT */}
            <div className="bg-[#112F58] p-4 flex justify-between items-center text-white shrink-0 mooduit-chat-header">
              <div className="flex items-center gap-2">
                <h3 className="font-bold flex items-center gap-2 mb-0 text-base sm:text-lg">✨ MOODUIT AI Advisor</h3>
              </div>
              <button 
                type="button"
                onClick={() => {
                  if ("speechSynthesis" in window) {
                    window.speechSynthesis.cancel();
                  }
                  setIsChatOpen(false);
                }} 
                className="btn btn-link text-white text-xl p-2 cursor-pointer border-0 shadow-none leading-none d-flex align-items-center justify-content-center mooduit-chat-close"
                style={{ padding: '8px', background: 'transparent', outline: 'none' }}
              >
                ✕
              </button>
            </div>

            {/* AREA OBROLAN */}
            <div 
              ref={chatScrollRef}
              className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-slate-50 dark:bg-slate-800/50"
            >
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: msg.isAi ? -10 : 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`p-3.5 rounded-2xl shadow-sm ${
                    msg.isAi
                      ? (darkMode ? "bg-slate-800 border border-slate-700 text-white rounded-tl-none align-self-start" : "bg-white rounded-tl-none text-primary-mooduit align-self-start")
                      : "bg-primary-mooduit rounded-tr-none text-white align-self-end"
                  }`}
                  style={{ maxWidth: "85%" }}
                >
                  <div 
                    className="text-sm sm:text-base mb-0 font-medium leading-relaxed font-sans"
                    dangerouslySetInnerHTML={renderMarkdown(msg.text)}
                  />
                  {msg.isTransactionSuccess && msg.transactionDetails && (
                    <div className="bg-[#112F58] border border-[#244c7d] text-white rounded-lg p-3 md:p-4 my-2 shadow-md flex items-start gap-3 font-sans animate-fade-in">
                      <span className="text-emerald-400 text-xl shrink-0 mt-0.5">✅</span>
                      <div className="text-left flex-1 min-w-0">
                        <div className="font-semibold text-white text-sm sm:text-base mb-1">
                          {language === "id" ? "Transaksi Berhasil Dicatat!" : "Transaction Successfully Recorded!"}
                        </div>
                        <div className="text-slate-200 text-xs sm:text-sm font-medium">
                          {msg.transactionDetails.type === "income" ? (language === "id" ? "Pemasukan" : "Income") : (language === "id" ? "Pengeluaran" : "Expense")} • Rp {msg.transactionDetails.amount.toLocaleString("id-ID")} ({msg.transactionDetails.category})
                        </div>
                        {msg.transactionDetails.notes && (
                          <div className="text-slate-300 text-xs mt-0.5 italic">
                            "{msg.transactionDetails.notes}"
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {msg.isAi && (
                    <div className="flex justify-between items-center mt-2.5 pt-2 border-t border-slate-200/50 dark:border-slate-700/50 bg-transparent dark:bg-transparent">
                      <span className="text-xs text-slate-400 font-sans font-semibold">MOODUIT AI</span>
                      <button
                        type="button"
                        onClick={() => speakMessage(msg.text, i)}
                        className={`p-1 px-2 rounded-full transition-all flex items-center gap-1 border-0 cursor-pointer bg-transparent dark:bg-transparent ${
                          speakingMsgIndex === i 
                            ? "text-rose-500 animate-pulse font-bold" 
                            : "text-slate-600 dark:text-slate-300 hover:opacity-80"
                        }`}
                        title={speakingMsgIndex === i ? t("Hentikan Suara", "Stop Voice") : t("Dengarkan Suara AI", "Listen to AI Voice")}
                        style={{ outline: "none" }}
                      >
                        {speakingMsgIndex === i ? <VolumeX size={14} /> : <Volume2 size={14} />}
                        <span className="text-xs font-bold">
                          {speakingMsgIndex === i ? (language === "id" ? "Stop" : "Stop") : (language === "id" ? "Dengarkan" : "Listen")}
                        </span>
                      </button>
                    </div>
                  )}
                </motion.div>
              ))}
              {isTyping && (
                <div className={`p-2.5 px-3.5 rounded-2xl rounded-tl-none shadow-sm align-self-start ${darkMode ? "bg-slate-800 text-slate-300" : "bg-white text-[#112F58]"}`}>
                  <div className="text-xs sm:text-sm text-muted font-bold">
                    Bentar, lagi mikir nih... ✨
                  </div>
                </div>
              )}
            </div>

            {/* INPUT AREA */}
            <div className={`p-3 border-t shrink-0 ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
              {isListening && (
                <div className="mb-2 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-rose-500 text-xs sm:text-sm font-semibold animate-pulse">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping shrink-0" />
                  <span>{t("🎙️ Bicara sekarang... MOODUIT sedang mendengarkan", "🎙️ Speak now... MOODUIT is listening")}</span>
                </div>
              )}
              <div className="flex items-center gap-2 mooduit-chat-input-wrapper">
                <textarea
                  rows={2}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full border-none bg-transparent dark:bg-transparent !bg-transparent p-1 shadow-none resize-none flex-1 outline-none focus:ring-0 text-slate-800 dark:text-slate-100 text-sm sm:text-base leading-normal"
                  placeholder={isListening ? t("Mendengarkan suara kamu...", "Listening to your voice...") : t("Tanya AI atau ucapkan transaksi...", "Ask AI or speak transaction...")}
                  style={{
                    minHeight: "44px",
                    maxHeight: "120px",
                    outline: "none",
                    border: "none",
                    boxShadow: "none",
                    backgroundColor: "transparent",
                    color: darkMode ? "#f8fafc" : "#0f172a"
                  }}
                />
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`p-2 rounded-full border-0 transition-all flex items-center justify-center shrink-0 cursor-pointer bg-transparent dark:bg-transparent ${
                    isListening
                      ? "text-rose-500 animate-bounce"
                      : "text-primary-mooduit dark:text-sky-400 hover:opacity-80"
                  }`}
                  title={isListening ? t("Hentikan Merekam", "Stop Recording") : t("Kirim Pesan Suara (Voice Note)", "Voice Input")}
                  style={{ width: "38px", height: "38px" }}
                >
                  {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                </button>
                <button
                  type="button"
                  onClick={handleSendMessage}
                  disabled={!chatInput.trim()}
                  className={`p-2 rounded-full border-0 transition-all flex items-center justify-center shrink-0 cursor-pointer bg-transparent dark:bg-transparent ${
                    chatInput.trim()
                      ? "text-primary-mooduit dark:text-sky-400 hover:opacity-80"
                      : "text-slate-400 dark:text-slate-500 cursor-not-allowed"
                  }`}
                  style={{ width: "38px", height: "38px" }}
                  title={t("Kirim Pesan", "Send Message")}
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating AI Toggle Button */}
      {!(isMobile && isChatOpen) && (
        <div 
          className="position-fixed end-0 m-4 d-flex flex-column align-items-end"
          style={{
            zIndex: 1050,
            bottom: isMobile ? "85px" : "20px",
            right: "20px",
            transform: `translate(${pos.x}px, ${pos.y}px)`,
            transition: isDragging.current ? "none" : "transform 0.15s ease-out",
            touchAction: "none"
          }}
        >
          <motion.button
            className={`btn rounded-circle p-3 shadow-lg border border-white border-2 transition-all duration-200 floating-ai-btn ${
              isChatOpen
                ? "bg-white text-primary-mooduit"
                : "bg-white text-[#112F58] hover:bg-gray-100"
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            style={{ touchAction: "none", cursor: isDragging.current ? "grabbing" : "grab" }}
            title="Tanya AI Mooduit"
          >
            {isChatOpen ? (
              <X size={28} />
            ) : (
              <Sparkles size={28} className="animate-pulse" />
            )}
          </motion.button>
        </div>
      )}

      {/* Edit Modal Target Impian */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div
            className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center px-3"
            style={{
              zIndex: 2000,
              backgroundColor: "rgba(0,0,0,0.4)",
              backdropFilter: "blur(4px)",
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-800 p-5 rounded-3xl shadow-xl w-100 border border-slate-200 dark:border-slate-700"
              style={{ maxWidth: "440px" }}
            >
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h3 className="fw-800 text-primary-mooduit dark:text-white text-xl sm:text-2xl mb-0">
                  {t("Edit Target Impian", "Edit Dream Target")}
                </h3>
                <button
                  type="button"
                  className="btn-close dark:filter dark:invert"
                  onClick={() => setIsEditModalOpen(false)}
                />
              </div>

              <div className="space-y-3 mb-4">
                <div>
                  <label className="text-xs sm:text-sm text-muted font-bold mb-1 block">
                    {t("Nama Target Impian", "Target Name")}
                  </label>
                  <input
                    type="text"
                    className="form-control rounded-xl text-sm sm:text-base dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    value={editNama}
                    onChange={(e) => setEditNama(e.target.value)}
                    placeholder="Contoh: Beli Laptop Baru"
                  />
                </div>

                <div>
                  <label className="text-xs sm:text-sm text-muted font-bold mb-1 block">
                    {t("Target Harga (Rp)", "Target Price (IDR)")}
                  </label>
                  <input
                    type="text"
                    className="form-control rounded-xl text-sm sm:text-base dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    value={editHarga}
                    onChange={(e) => setEditHarga(formatInput(e.target.value))}
                    placeholder="Contoh: 15.000.000"
                  />
                </div>
              </div>

              <div className="d-flex justify-content-between align-items-center gap-2">
                {editIndex !== null && (
                  <button
                    type="button"
                    className="btn btn-outline-danger rounded-xl px-3 py-2 text-xs sm:text-sm font-bold flex items-center gap-1"
                    onClick={(e) => {
                      handleDeleteItem(editIndex, e);
                      setIsEditModalOpen(false);
                    }}
                  >
                    <Trash2 size={16} />
                    <span>{t("Hapus", "Delete")}</span>
                  </button>
                )}
                <div className="d-flex gap-2 ms-auto">
                  <button
                    type="button"
                    className="btn btn-light dark:bg-slate-700 dark:text-slate-200 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold"
                    onClick={() => setIsEditModalOpen(false)}
                  >
                    {t("Batal", "Cancel")}
                  </button>
                  <button
                    type="button"
                    className="btn btn-mooduit rounded-xl px-4 py-2 text-xs sm:text-sm font-bold"
                    onClick={handleUpdateItem}
                  >
                    {t("Simpan", "Save")}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Modal Target Impian */}
      <AnimatePresence>
        {isTargetModalOpen && (
          <div
            className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center px-3"
            style={{
              zIndex: 2000,
              backgroundColor: "rgba(0,0,0,0.4)",
              backdropFilter: "blur(4px)",
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-800 p-5 rounded-3xl shadow-xl w-100 border border-slate-200 dark:border-slate-700"
              style={{ maxWidth: "440px" }}
            >
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h3 className="fw-800 text-primary-mooduit dark:text-white text-xl sm:text-2xl mb-0">
                  {t("Tambah Target Impian Baru", "Add New Dream Target")}
                </h3>
                <button
                  type="button"
                  className="btn-close dark:filter dark:invert"
                  onClick={() => setIsTargetModalOpen(false)}
                />
              </div>

              <div className="space-y-3 mb-4">
                <div>
                  <label className="text-xs sm:text-sm text-muted font-bold mb-1 block">
                    {t("Nama Impian", "Dream Target Name")}
                  </label>
                  <input
                    type="text"
                    className="form-control rounded-xl text-sm sm:text-base dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    value={newTargetName}
                    onChange={(e) => setNewTargetName(e.target.value)}
                    placeholder="Contoh: Beli Sepeda Lipat"
                  />
                </div>

                <div>
                  <label className="text-xs sm:text-sm text-muted font-bold mb-1 block">
                    {t("Target Harga (Rp)", "Target Price (IDR)")}
                  </label>
                  <input
                    type="text"
                    className="form-control rounded-xl text-sm sm:text-base dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    value={newTargetPrice}
                    onChange={(e) => setNewTargetPrice(formatInput(e.target.value))}
                    placeholder="Contoh: 5.000.000"
                  />
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-light dark:bg-slate-700 dark:text-slate-200 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold"
                  onClick={() => setIsTargetModalOpen(false)}
                >
                  {t("Batal", "Cancel")}
                </button>
                <button
                  type="button"
                  disabled={!newTargetName || !newTargetPrice}
                  className="btn btn-mooduit rounded-xl px-4 py-2 text-xs sm:text-sm font-bold disabled:opacity-50"
                  onClick={handleAddTarget}
                >
                  {t("Tambah Target", "Add Target")}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Celebration Modal Wujudkan Impian */}
      <AnimatePresence>
        {isCelebrationOpen && selectedTargetForCelebration && (
          <div
            className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center px-3"
            style={{
              zIndex: 2000,
              backgroundColor: "rgba(0,0,0,0.5)",
              backdropFilter: "blur(5px)",
            }}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              className="bg-white dark:bg-slate-800 p-5 rounded-3xl shadow-2xl w-100 text-center border border-slate-200 dark:border-slate-700"
              style={{ maxWidth: "440px" }}
            >
              <div className="text-5xl mb-3 animate-bounce">🎉</div>
              <h3 className="fw-800 text-primary-mooduit dark:text-white text-xl sm:text-2xl mb-2">
                {t("Wujudkan Impian Ini?", "Achieve this Dream?")}
              </h3>
              <p className="text-muted text-sm sm:text-base leading-relaxed mb-4">
                {t(
                  `Apakah kamu sudah siap mewujudkan "${selectedTargetForCelebration.nama || selectedTargetForCelebration.name}" seharga Rp ${Number((selectedTargetForCelebration.harga || selectedTargetForCelebration.price || "0").toString().replace(/\D/g, "")).toLocaleString("id-ID")}? Transaksi pengeluaran akan dicatat otomatis.`,
                  `Are you ready to purchase "${selectedTargetForCelebration.nama || selectedTargetForCelebration.name}" for Rp ${Number((selectedTargetForCelebration.harga || selectedTargetForCelebration.price || "0").toString().replace(/\D/g, "")).toLocaleString("id-ID")}? An expense transaction will be recorded automatically.`
                )}
              </p>

              <div className="d-flex gap-2 justify-content-center">
                <button
                  type="button"
                  className="btn btn-light dark:bg-slate-700 dark:text-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold"
                  onClick={() => setIsCelebrationOpen(false)}
                >
                  {t("Nanti Dulu", "Not Yet")}
                </button>
                <button
                  type="button"
                  className="btn btn-mooduit rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold bg-[#112F58] text-white hover:bg-[#1a447d]"
                  onClick={handleBuyTarget}
                >
                  🚀 {t("Ya, Wujudkan!", "Yes, Achieve it!")}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Pop-up Celebration Streak / Transaction Success */}
      <AnimatePresence>
        {showCelebration && (
          <div
            className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center px-3"
            style={{
              zIndex: 3000,
              backgroundColor: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(6px)",
            }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white dark:bg-slate-800 p-5 rounded-3xl shadow-2xl w-100 text-center border border-slate-200 dark:border-slate-700 relative overflow-hidden"
              style={{ maxWidth: "460px" }}
            >
              <div className="relative mb-4">
                <div className="text-6xl select-none animate-pulse">🔥</div>
                <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
                  <Sparkles size={80} className="text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
                </div>
              </div>

              <div className="inline-block px-4 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300 font-extrabold text-xs sm:text-sm mb-3">
                {streakCount} {t("HARI STREAK!", "DAYS STREAK!")}
              </div>

              <h3 className="fw-800 text-primary-mooduit dark:text-white text-xl sm:text-2xl mb-2">
                {streakIncreasedToday
                  ? t("Streak Kamu Menyala! 🔥", "Your Streak is on Fire! 🔥")
                  : t("Transaksi Berhasil Dicatat! ✨", "Transaction Logged! ✨")}
              </h3>

              <div className="p-3 bg-slate-50 dark:bg-slate-700/60 rounded-2xl mb-4 border border-slate-100 dark:border-slate-600">
                {isMotivationLoading ? (
                  <div className="h-10 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-[#112F58] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <p className="text-slate-700 dark:text-slate-200 text-sm sm:text-base font-medium mb-0 leading-relaxed italic">
                    "{aiMotivationText || motivationQuotes[quoteIndex]?.[language === "en" ? "en" : "id"] || currentDailyQuote[language === "en" ? "en" : "id"]}"
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={handleCloseCelebration}
                className="btn btn-mooduit w-full py-2.5 rounded-xl text-sm sm:text-base font-bold bg-[#112F58] text-white hover:bg-[#1a447d] shadow-md cursor-pointer"
              >
                {t("Mantap! Lanjutkan 🔥", "Awesome! Continue 🔥")}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Birthday Modal Component */}
      <BirthdayModal
        isOpen={showBirthdayModal}
        onClose={() => setShowBirthdayModal(false)}
        userName={userName}
        userDob={userDob}
      />
    </div>
  );
}
