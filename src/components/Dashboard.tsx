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
} from "lucide-react";
import { useThemeLanguage } from "../context/ThemeLanguageContext";
import "./Dashboard.css";

interface DashboardProps {
  onNavigate: (page: string) => void;
  saldoDanaDarurat: number;
  transactions?: any[];
  setTransactions?: React.Dispatch<React.SetStateAction<any[]>>;
}

export default function Dashboard({
  onNavigate,
  saldoDanaDarurat,
  transactions: propsTransactions,
  setTransactions: propsSetTransactions,
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
  const [budgetsData, setBudgetsData] = React.useState<any[]>([]);

  // Daily Streak and Celebration Pop-up States
  const [streakCount, setStreakCount] = React.useState<number>(() => {
    if (typeof window !== "undefined") {
      const hasReset = localStorage.getItem("mooduit_streak_reset_v4");
      if (!hasReset) {
        localStorage.setItem("mooduit_streak_count", "0");
        localStorage.setItem("mooduit_streak_active", "false");
        localStorage.removeItem("mooduit_last_streak_date");
        localStorage.setItem("mooduit_streak_reset_v4", "true");
        return 0;
      }
      const saved = localStorage.getItem("mooduit_streak_count");
      return saved ? parseInt(saved, 10) : 0;
    }
    return 0;
  });
  const [streakActive, setStreakActive] = React.useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const lastDate = localStorage.getItem("mooduit_last_streak_date");
      const today = new Date().toDateString();
      const isActive = lastDate === today;
      localStorage.setItem("mooduit_streak_active", isActive ? "true" : "false");
      return isActive;
    }
    return false;
  });
  const [showCelebration, setShowCelebration] = React.useState<boolean>(false);

  // Expose triggerTransactionSuccess and showStreakCelebration murni ke global window object
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const triggerFn = () => {
        const todayStr = new Date().toDateString();
        const lastStreakDate = localStorage.getItem("mooduit_last_streak_date");
        
        // Tampilkan modal selebrasi animasi (On Action)
        setShowCelebration(true);

        if (lastStreakDate === todayStr) {
          // Jika last_streak_date SAMA DENGAN tanggal hari ini: Jangan tambahkan angka streak.
          // Pastikan saja ikon api di header berstatus "Menyala" (oranye/merah terang).
          setStreakActive(true);
          localStorage.setItem("mooduit_streak_active", "true");
        } else {
          // Jika last_streak_date TIDAK SAMA (atau kosong): Munculkan modal selebrasi animasi,
          // tambahkan angka streak +1, ubah warna ikon api menjadi oranye,
          // dan perbarui nilai last_streak_date di localStorage menjadi tanggal hari ini.
          const nextStreak = streakCount + 1;
          setStreakCount(nextStreak);
          localStorage.setItem("mooduit_streak_count", String(nextStreak));
          
          setStreakActive(true);
          localStorage.setItem("mooduit_streak_active", "true");
          
          localStorage.setItem("mooduit_last_streak_date", todayStr);
        }
      };

      (window as any).triggerTransactionSuccess = triggerFn;
      (window as any).showStreakCelebration = () => setShowCelebration(true);
    }
    return () => {
      if (typeof window !== "undefined") {
        delete (window as any).triggerTransactionSuccess;
        delete (window as any).showStreakCelebration;
      }
    };
  }, [streakCount, streakActive]);

  const handleCloseCelebration = () => {
    setShowCelebration(false);
  };

  // Dynamic Daily Financial Motivation quotes (Indonesian & English translation support)
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
    { text: string; isAi: boolean }[]
  >([]);
  const [isTyping, setIsTyping] = React.useState(false);
  const [wishlist, setWishlist] = React.useState<any[]>([]);
  const [targetImpian, setTargetImpian] = React.useState<any[]>([]);
  const [isEditTargetModalOpen, setIsEditTargetModalOpen] =
    React.useState(false);
  const [isTargetModalOpen, setIsTargetModalOpen] = React.useState(false);
  const [newTargetName, setNewTargetName] = React.useState("");
  const [newTargetPrice, setNewTargetPrice] = React.useState("");

  const [localTransactions, setLocalTransactions] = React.useState<any[]>([]);
  const transactions =
    propsTransactions !== undefined ? propsTransactions : localTransactions;
  const setTransactions =
    propsSetTransactions !== undefined
      ? propsSetTransactions
      : setLocalTransactions;

  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [editIndex, setEditIndex] = React.useState<number | null>(null);
  const [editNama, setEditNama] = React.useState("");
  const [editHarga, setEditHarga] = React.useState("");
  const chatScrollRef = React.useRef<HTMLDivElement>(null);

  // Dynamically calculate pocket balances from transactions ledger!
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

    // Insert into DB/local transactions list
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
      // Fallback local update
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
        <div className="small text-muted font-semibold mb-2" style={{ fontSize: "11px" }}>
          🚀 {t("Alokasi Cepat", "Quick Allocate")}
        </div>
        <div className="d-flex flex-wrap gap-1 mb-2">
          <button
            type="button"
            className="btn btn-sm py-1 px-2.5 bg-gray-100 hover:bg-gray-200 text-primary-mooduit rounded-full border-0 font-bold"
            style={{ fontSize: "11.5px", transition: "all 0.15s", cursor: "pointer" }}
            onClick={() => handlePreset(25000)}
          >
            +25k
          </button>
          <button
            type="button"
            className="btn btn-sm py-1 px-2.5 bg-gray-100 hover:bg-gray-200 text-primary-mooduit rounded-full border-0 font-bold"
            style={{ fontSize: "11.5px", transition: "all 0.15s", cursor: "pointer" }}
            onClick={() => handlePreset(100000)}
          >
            +100k
          </button>
          <button
            type="button"
            className="btn btn-sm py-1 px-2.5 bg-gray-100 hover:bg-gray-200 text-primary-mooduit rounded-full border-0 font-bold"
            style={{ fontSize: "11.5px", transition: "all 0.15s", cursor: "pointer" }}
            onClick={() => handlePreset(250000)}
          >
            +250k
          </button>
          <button
            type="button"
            className="btn btn-sm py-1 px-2.5 bg-gray-100 hover:bg-gray-200 text-primary-mooduit rounded-full border-0 font-bold"
            style={{ fontSize: "11.5px", transition: "all 0.15s", backgroundColor: customActive ? "#112F58" : "", color: customActive ? "#ffffff" : "", cursor: "pointer" }}
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
                <span className="input-group-text bg-light text-primary-mooduit border border-end-0" style={{ fontSize: "12px", background: "#f8f9fa", border: "1px solid #ced4da" }}>Rp</span>
                <input
                  type="text"
                  className="form-control"
                  placeholder={t("Nominal", "Amount")}
                  value={inputValue}
                  onChange={(e) => {
                    const formatted = formatInput(e.target.value);
                    setPocketInputs(prev => ({ ...prev, [key]: formatted }));
                  }}
                  style={{ fontSize: "12px", border: "1px solid #ced4da" }}
                />
                <button
                  type="submit"
                  className="btn btn-sm text-white"
                  style={{ fontSize: "11px", border: "none", backgroundColor: "#112F58", borderRadius: "0 8px 8px 0" }}
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
    e.currentTarget.setPointerCapture(e.pointerId);
    const clientX = e.clientX;
    const clientY = e.clientY;
    dragStart.current = { x: clientX - pos.x, y: clientY - pos.y };
    startCoords.current = { x: clientX, y: clientY };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!isDragging.current) return;
    const clientX = e.clientX;
    const clientY = e.clientY;
    setPos({
      x: clientX - dragStart.current.x,
      y: clientY - dragStart.current.y,
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);

    const distance = Math.hypot(
      e.clientX - startCoords.current.x,
      e.clientY - startCoords.current.y,
    );
    if (distance < 5) {
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
    updatedWishlist[editIndex] = {
      ...updatedWishlist[editIndex],
      name: editNama,
      price: editHarga,
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

    // Removed old local savingsPockets loader since it's computed dynamically from transactions ledger

    // Load wishlist and budgets from database
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

        // Load budget plans
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

    // Load transactions
    if (propsTransactions === undefined) {
      // Return empty or wait for props to pass down
      setLocalTransactions([]);
    }
  }, [propsTransactions]);

  // Effect to load current streak and trigger celebration modal
  React.useEffect(() => {
    // Sync streak from localStorage
    const savedStreak = localStorage.getItem("mooduit_streak_count");
    if (savedStreak) {
      setStreakCount(parseInt(savedStreak, 10));
    } else {
      setStreakCount(0);
      localStorage.setItem("mooduit_streak_count", "0");
    }

    const todayStr = new Date().toDateString();
    const lastStreakDate = localStorage.getItem("mooduit_last_streak_date");
    const isActive = lastStreakDate === todayStr;
    setStreakActive(isActive);
    localStorage.setItem("mooduit_streak_active", isActive ? "true" : "false");
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
    // Escape HTML of user text to prevent XSS but allow safe formatting tags
    let escaped = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    
    // Replace **bold** with <strong>bold</strong>
    escaped = escaped.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    // Replace *italic* with <em>italic</em>
    escaped = escaped.replace(/\*(.*?)\*/g, "<em>$1</em>");
    // Replace linebreaks with <br />
    escaped = escaped.replace(/\n/g, "<br />");
    return { __html: escaped };
  };

  React.useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage = chatInput.trim();
    const updatedMessages = [...messages, { text: userMessage, isAi: false }];
    setMessages(updatedMessages);
    setChatInput("");
    setIsTyping(true);

    const user_email = localStorage.getItem("userEmail") || "";

    // Build the rich financial context payload from real-time frontend states
    const financialContext = {
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

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          messages: updatedMessages, 
          language, 
          user_email,
          financialContext,
          targetImpian: targetImpian && targetImpian.length > 0 ? targetImpian : wishlist 
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server returned status ${res.status}`);
      }
      const data = await res.json();
      if (data.text) {
        setMessages((prev) => [...prev, { text: data.text, isAi: true }]);
      } else {
        throw new Error("No response text received from server");
      }
    } catch (error: any) {
      console.error("Chat connection failed:", error);
      const errMsg = "Sistem gagal terhubung: " + (error.message || String(error));
      setMessages((prev) => [...prev, { text: errMsg, isAi: true }]);
    } finally {
      setIsTyping(false);
    }
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

  return (
    <div className="container py-4 pb-5 mb-5">
      <header className="mb-4">
        <div className="d-flex align-items-center flex-wrap gap-3 mb-1">
          <h3 className="fw-800 text-primary-mooduit mb-0">
            {t(`Selamat Pagi, ${userName}! 👋`, `Good Morning, ${userName}! 👋`)}
          </h3>
          <div className="streak-badge-container">
            <div 
              className={`streak-badge ${streakActive ? 'streak-badge-menyala' : 'streak-badge-padam'}`}
            >
              <span className="streak-badge-fire">🔥</span>
              <span className="streak-badge-text">
                {streakCount}
              </span>
            </div>
          </div>
        </div>
        <p className="text-muted mb-0">
          {t(
            "Status dompetmu lagi terpantau sehat hari ini.",
            "Your wallet status is looking healthy today.",
          )}
        </p>
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
        <div>
          <div
            className="small fw-800 text-brown-mooduit opacity-75 text-uppercase tracking-wider mb-1 mooduit-ambient-ai-title"
            style={{ fontSize: "10px" }}
          >
            Ambient AI Advisor
          </div>
          <p
            className="mb-0 fw-bold text-brown-mooduit text-justify mooduit-ambient-ai-desc"
            style={{ fontSize: "15px", lineHeight: "1.5" }}
          >
            {t(currentDailyQuote.id, currentDailyQuote.en)}
          </p>
        </div>
      </motion.div>

      {/* Summary Cards Grid */}
      <div className="w-full flex flex-col gap-4 mb-6">
        {/* KARTU 1: Total Saldo (Full Width) */}
        <div className="w-full bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-700 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-[#112F58] dark:text-white"
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
          <div className="flex items-center gap-2 mb-1.5">
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium m-0 p-0 leading-none">
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
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                )}
              </button>
              <span className="mooduit-tooltip">
                {showBalance ? t("Sembunyikan", "Hide") : t("Tampilkan", "Show")}
              </span>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-[#112F58] dark:text-white">
            {showBalance ? `Rp ${totalSaldo.toLocaleString("id-ID")}` : "Rp ••••••••"}
          </h2>
        </div>

        {/* KARTU RINGKASAN PEMASUKAN & PENGELUARAN (RESPONSIVE FIX) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }} className="w-full">
          
          {/* Kartu Pemasukan */}
          <div style={{ backgroundColor: darkMode ? '#1e293b' : '#ffffff', borderRadius: '20px', padding: '16px', border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#dcfce7', d: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a', display: 'flex' }}>
                <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                </svg>
              </div>
              <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {t("Pemasukan", "Income")}
              </span>
            </div>
            <h3 style={{ margin: 0, fontWeight: 'bold', color: darkMode ? '#ffffff' : '#112F58', fontSize: 'clamp(16px, 4.5vw, 24px)', wordBreak: 'break-word', lineHeight: '1.2' }}>
              {showBalance ? `Rp ${totalPemasukan.toLocaleString("id-ID")}` : "Rp ••••••••"}
            </h3>
          </div>

          {/* Kartu Pengeluaran */}
          <div style={{ backgroundColor: darkMode ? '#1e293b' : '#ffffff', borderRadius: '20px', padding: '16px', border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#fee2e2', d: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626', display: 'flex' }}>
                <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
                </svg>
              </div>
              <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {t("Pengeluaran", "Expenses")}
              </span>
            </div>
            <h3 style={{ margin: 0, fontWeight: 'bold', color: darkMode ? '#ffffff' : '#112F58', fontSize: 'clamp(16px, 4.5vw, 24px)', wordBreak: 'break-word', lineHeight: '1.2' }}>
              {showBalance ? `Rp ${totalPengeluaran.toLocaleString("id-ID")}` : "Rp ••••••••"}
            </h3>
          </div>

        </div>
      </div>

      {/* SECTION KANTONG MASA DEPAN */}
      <div className="mb-4">
        <div className="d-flex flex-column mb-3">
          <h4 className="fw-800 text-primary-mooduit mb-1 d-flex align-items-center gap-2" style={{ fontSize: "1.2rem" }}>
            💼 {t("Kantong Masa Depan", "Future Pockets")}
          </h4>
          <p className="text-muted small mb-0">
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
                <span className="fw-800 text-muted small">{t("Dana Darurat", "Emergency Fund")}</span>
                <span className="fs-4">🚨</span>
              </div>
              <h3 className="fw-800 text-primary-mooduit mb-3" style={{ fontSize: "1.5rem", fontWeight: "800" }}>
                Rp {savingsPockets.darurat.toLocaleString("id-ID")}
              </h3>
              {renderQuickAllocate("darurat")}
            </div>
          </div>

          {/* Kantong 2: Investasi */}
          <div className="col-12 col-md-4">
            <div className="card-mooduit h-100 p-4 border shadow-sm transition-all" style={{ minHeight: '180px' }}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="fw-800 text-muted small">{t("Investasi", "Investments")}</span>
                <span className="fs-4">📈</span>
              </div>
              <h3 className="fw-800 text-primary-mooduit mb-3" style={{ fontSize: "1.5rem", fontWeight: "800" }}>
                Rp {savingsPockets.investasi.toLocaleString("id-ID")}
              </h3>
              {renderQuickAllocate("investasi")}
            </div>
          </div>

          {/* Kantong 3: Tabungan */}
          <div className="col-12 col-md-4">
            <div className="card-mooduit h-100 p-4 border shadow-sm transition-all" style={{ minHeight: '180px' }}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="fw-800 text-muted small">{t("Tabungan", "Goal Savings")}</span>
                <span className="fs-4">🏦</span>
              </div>
              <h3 className="fw-800 text-primary-mooduit mb-3" style={{ fontSize: "1.5rem", fontWeight: "800" }}>
                Rp {savingsPockets.tabungan.toLocaleString("id-ID")}
              </h3>
              {renderQuickAllocate("tabungan")}
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="row g-4">
        {/* Left Col: Transaksi Terakhir */}
        <div className="col-12 col-lg-7">
          <div className="card-mooduit p-4 shadow-sm h-100">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5
                className="fw-800 text-primary-mooduit mb-0"
                style={{ fontSize: "1.1rem" }}
              >
                {t("Transaksi Terakhir", "Recent Transactions")}
              </h5>
              <button
                className="btn btn-link text-primary-mooduit fw-bold text-decoration-none small p-0 border-0 bg-transparent"
                onClick={() => onNavigate("history")}
              >
                {t("Lihat Semua", "See All")}
              </button>
            </div>

            {transactions.length > 0 ? (
              <div
                className="d-flex flex-column gap-3 overflow-y-auto"
                style={{ maxHeight: "400px" }}
              >
                {transactions.slice(0, 5).map((t, idx) => (
                  <div
                    key={t.id || idx}
                    className="d-flex justify-content-between align-items-center p-3 rounded-2xl bg-gray-50 border border-gray-100"
                  >
                    <div className="d-flex align-items-center gap-3">
                      <div className="bg-white p-2.5 rounded-xl shadow-sm text-lg">
                        {t.icon || "🧾"}
                      </div>
                      <div>
                        <div className="fw-800 text-primary-mooduit small leading-tight mb-0.5">
                          {t.catatan || t.kategori}
                        </div>
                        <div className="text-muted x-small font-medium">
                          {t.tanggal}
                        </div>
                      </div>
                    </div>
                    <div
                      className={`fw-800 small ${t.jenis === "pemasukan" ? "text-success" : "text-[#382718]"}`}
                    >
                      {t.jenis === "pemasukan" ? "+" : "-"} Rp{" "}
                      {Number(t.nominal).toLocaleString("id-ID")}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="d-flex flex-column align-items-center justify-content-center py-5">
                <div className="bg-light p-3 rounded-circle mb-3">
                  <ArrowUpRight size={24} className="text-muted opacity-50" />
                </div>
                <p className="text-muted small mb-3">
                  {t(
                    "Belum ada transaksi. Yuk mulai catat pengeluaran pertamamu!",
                    "No transactions yet. Let's start tracking your first expense!",
                  )}
                </p>
                <button
                  className="btn btn-sm btn-mooduit-outline px-3 py-1 rounded-lg fw-bold"
                  style={{ fontSize: "11px" }}
                  onClick={() => onNavigate("scanner")}
                >
                  + {t("Scan Struk AI", "Scan Receipt AI")}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Target Impian */}
        <div className="col-12 col-lg-5">
          <div className="card-mooduit h-100 shadow-sm p-4 d-flex flex-column bg-white">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5
                className="fw-800 text-primary-mooduit mb-0"
                style={{ fontSize: "1.1rem" }}
              >
                {t("Target Impian", "Dream Target")}
              </h5>
              <Target size={20} className="text-primary-mooduit opacity-50" />
            </div>

            <div className="flex-grow-1 d-flex flex-column py-2">
              <div className="space-y-3">
                {targetImpian.length === 0 ? (
                  <div className="text-center p-6 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-xl d-flex flex-column align-items-center justify-content-center h-100 py-5">
                    <p className="mb-3">
                      {t(
                        "Belum ada target impian. Yuk, tambah target pertamamu!",
                        "No dream targets yet. Let's add your first target!",
                      )}
                    </p>
                    <button
                      className="btn btn-mooduit-outline px-4 py-2 rounded-xl fw-bold small"
                      onClick={() => setIsTargetModalOpen(true)}
                    >
                      + {t("Tambah Impian Baru", "Add New Dream")}
                    </button>
                  </div>
                ) : (
                  <div
                    className="d-flex flex-column gap-3 overflow-y-auto"
                    style={{ maxHeight: "250px" }}
                  >
                    {targetImpian.map((target) => (
                      <div
                        key={target.id}
                        className="border border-gray-100 rounded-xl p-4 flex justify-between items-center relative group bg-light hover:bg-gray-50 transition-all cursor-pointer"
                        onClick={() => {
                          const idx = wishlist.findIndex(
                            (w: any) => w.id === target.id,
                          );
                          if (idx !== -1) handleEditItem(idx);
                        }}
                      >
                        <div className="flex items-center gap-3 d-flex">
                          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
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
                          <div>
                            <h4
                              className="font-bold text-[#112F58] capitalize mb-1"
                              style={{ fontSize: "14px" }}
                            >
                              {target.nama || target.name}
                            </h4>
                            <p className="text-sm text-gray-500 mb-0">
                              Rp{" "}
                              {Number(
                                (target.harga || target.price || "0")
                                  .toString()
                                  .replace(/\D/g, ""),
                              ).toLocaleString("id-ID")}
                            </p>
                          </div>
                        </div>
                        {/* Tombol Hapus Langsung di Card */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
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
                          className="text-red-400 hover:text-red-600 p-2 bg-red-50 rounded-lg group-hover:opacity-100 transition-opacity border-0"
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
                    ))}
                    <button
                      className="btn btn-link text-primary-mooduit fw-bold text-decoration-none x-small p-0 mt-2 text-start border-0 bg-transparent shadow-none"
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
              <h3 className="font-bold flex items-center gap-2 mb-0" style={{ fontSize: '1.1rem' }}>✨ MOODUIT AI Advisor</h3>
              <button 
                onClick={() => setIsChatOpen(false)} 
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
                  className={`p-3 rounded-2xl shadow-sm ${
                    msg.isAi
                      ? (darkMode ? "bg-slate-800 border border-slate-700 text-white rounded-tl-none align-self-start" : "bg-white rounded-tl-none text-primary-mooduit align-self-start")
                      : "bg-primary-mooduit rounded-tr-none text-white align-self-end"
                  }`}
                  style={{ maxWidth: "85%" }}
                >
                  <p 
                    className="small mb-0 fw-medium leading-relaxed font-sans"
                    dangerouslySetInnerHTML={renderMarkdown(msg.text)}
                  />
                </motion.div>
              ))}
              {isTyping && (
                <div className={`p-2 px-3 rounded-2xl rounded-tl-none shadow-sm align-self-start ${darkMode ? "bg-slate-800 text-slate-300" : "bg-white text-[#112F58]"}`}>
                  <div className="small text-muted fw-bold">
                    Bentar, lagi mikir nih... ✨
                  </div>
                </div>
              )}
            </div>

            {/* INPUT AREA */}
            <div className={`p-3 border-top shrink-0 ${darkMode ? "bg-slate-800 border-slate-700" : "bg-white"}`}>
              <div className="d-flex align-items-start gap-2 mooduit-chat-input-wrapper">
                <textarea
                  rows={3}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="form-control border-0 bg-transparent p-0 shadow-none resize-none"
                  placeholder={t("Tanya AI di sini...", "Ask AI here...")}
                  style={{
                    fontSize: "13px",
                    lineHeight: "18px",
                    minHeight: "54px",
                    maxHeight: "120px",
                    width: "100%",
                    outline: "none",
                    color: darkMode ? "#ffffff" : "inherit"
                  }}
                />
                <button
                  onClick={handleSendMessage}
                  className="btn p-1 text-primary-mooduit hover:opacity-70 transition-opacity border-0 mt-1"
                  style={{ color: darkMode ? "#60a5fa" : "#112F58", cursor: "pointer" }}
                >
                  <Send size={20} />
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
            transform: isMobile ? "none" : `translate(${pos.x}px, ${pos.y}px)`,
            transition: isDragging.current ? "none" : "transform 0.15s ease-out",
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
            style={{ touchAction: "none" }}
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

      {/* Edit Modal */}
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
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="card-mooduit p-4 shadow-2xl w-100 bg-white"
              style={{ maxWidth: "400px" }}
            >
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-800 text-primary-mooduit mb-0">
                  {t("Edit Target Impian", "Edit Dream Target")}
                </h5>
                <button
                  className="btn btn-link p-0 text-muted"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  <X size={24} />
                </button>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold">
                  {t("Nama Target", "Target Name")}
                </label>
                <input
                  type="text"
                  className="form-control py-3 rounded-xl bg-light border-0 fw-medium"
                  value={editNama}
                  onChange={(e) => {
                    const val = e.target.value;
                    setEditNama(val.charAt(0).toUpperCase() + val.slice(1));
                  }}
                  placeholder={t("Contoh: Laptop Baru", "E.g., New Laptop")}
                />
              </div>

              <div className="mb-4">
                <label className="form-label small fw-bold">
                  {t("Estimasi Harga (Rp)", "Estimated Price (IDR)")}
                </label>
                <div className="input-group font-sans">
                  <span className="input-group-text bg-light border-0 rounded-start-xl fw-bold text-primary-mooduit">
                    Rp
                  </span>
                  <input
                    type="text"
                    className="form-control py-3 border-0 bg-light rounded-end-xl fw-800"
                    value={editHarga}
                    onChange={(e) => setEditHarga(formatInput(e.target.value))}
                    placeholder={t("Contoh: 10.000.000", "E.g., 10,000,000")}
                  />
                </div>
              </div>

              <div className="d-flex flex-column gap-2 font-sans">
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-mooduit-outline flex-grow-1 py-3 rounded-xl fw-bold"
                    onClick={() => setIsEditModalOpen(false)}
                  >
                    {t("Batal", "Cancel")}
                  </button>
                  <button
                    className="btn btn-mooduit-primary flex-grow-1 py-3 rounded-xl fw-800"
                    onClick={handleUpdateItem}
                    disabled={!editNama || !editHarga}
                  >
                    {t("Simpan Perubahan", "Save Changes")}
                  </button>
                </div>
                <button
                  className="btn w-100 py-2 rounded-xl fw-bold small transition-all border d-flex align-items-center justify-content-center gap-2"
                  style={{
                    backgroundColor: "#FEF2F2",
                    color: "#DC2626",
                    borderColor: "#FEE2E2",
                  }}
                  onClick={(e) => {
                    if (editIndex !== null) {
                      handleDeleteItem(editIndex, e);
                      setIsEditModalOpen(false);
                    }
                  }}
                >
                  <Trash2 size={16} />
                  {t("Hapus Target Ini", "Delete This Target")}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Tambah Target Modal */}
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
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="card-mooduit p-4 shadow-2xl w-100 bg-white"
              style={{ maxWidth: "400px" }}
            >
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-800 text-primary-mooduit mb-0">
                  {t("Tambah Impian Baru", "Add New Dream Target")}
                </h5>
                <button
                  className="btn btn-link p-0 text-muted"
                  onClick={() => setIsTargetModalOpen(false)}
                >
                  <X size={24} />
                </button>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold">
                  {t("Nama Target", "Target Name")}
                </label>
                <input
                  type="text"
                  className="form-control py-3 rounded-xl bg-light border-0 fw-medium"
                  value={newTargetName}
                  onChange={(e) => {
                    const val = e.target.value;
                    setNewTargetName(
                      val.charAt(0).toUpperCase() + val.slice(1),
                    );
                  }}
                  placeholder={t("Contoh: Laptop Baru", "E.g., New Laptop")}
                />
              </div>

              <div className="mb-4">
                <label className="form-label small fw-bold">
                  {t("Estimasi Harga (Rp)", "Estimated Price (IDR)")}
                </label>
                <div className="input-group font-sans">
                  <span className="input-group-text bg-light border-0 rounded-start-xl fw-bold text-primary-mooduit">
                    Rp
                  </span>
                  <input
                    type="text"
                    className="form-control py-3 border-0 bg-light rounded-end-xl fw-800"
                    value={newTargetPrice}
                    onChange={(e) =>
                      setNewTargetPrice(formatInput(e.target.value))
                    }
                    placeholder={t("Contoh: 10.000.000", "E.g., 10,000,000")}
                  />
                </div>
              </div>

              <div className="d-flex gap-2 font-sans">
                <button
                  className="btn btn-mooduit-outline flex-grow-1 py-3 rounded-xl fw-bold"
                  onClick={() => setIsTargetModalOpen(false)}
                >
                  {t("Batal", "Cancel")}
                </button>
                <button
                  className="btn btn-mooduit-primary flex-grow-1 py-3 rounded-xl fw-800"
                  onClick={handleAddTarget}
                  disabled={!newTargetName || !newTargetPrice}
                >
                  {t("Tambah Target", "Add Target")}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Daily Streak Celebration Pop-up Modal */}
        {showCelebration && (
          <div className="celebration-modal-overlay">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="celebration-modal-backdrop"
              onClick={handleCloseCelebration}
            />
            {/* Modal Box */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.25 }}
              className="celebration-modal-content"
            >
              {/* 10% Bright Orange Accent specifically highlighting the large flame icon with ignition animation */}
              <div className="celebration-orange-accent-wrapper">
                <span className="celebration-modal-fire">🔥</span>
                <span className="streak-celebration-sparkle streak-celebration-sparkle-1">✨</span>
                <span className="streak-celebration-sparkle streak-celebration-sparkle-2">✨</span>
              </div>
 
              {/* 30% Navy/Dark Blue branding for main text */}
              <h4 className="celebration-modal-title">
                {t("Streak Menyala!", "Streak Lit!")}
              </h4>
 
              <p className="celebration-modal-text">
                {t(
                  "Kerja bagus mencatat keuanganmu hari ini.",
                  "Great job logging your finances today."
                )}
              </p>
 
              {/* Info Stats Card inside white canvas container */}
              <div className="celebration-modal-stats-card">
                <span className="celebration-modal-stats-val">🔥 {streakCount}</span>
                <span className="celebration-modal-stats-label">
                  {t("Hari Beruntun", "Days Streak")}
                </span>
              </div>
 
              {/* 30% Navy/Dark Blue main action button */}
              <button
                onClick={handleCloseCelebration}
                className="celebration-modal-btn-navy"
                type="button"
              >
                {t("Mantap, Lanjutkan! 🔥", "Awesome, Continue! 🔥")}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
