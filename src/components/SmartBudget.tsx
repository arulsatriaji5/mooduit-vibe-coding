import React, { useState } from 'react';
import { motion } from 'motion/react';
import { toast } from 'react-hot-toast';
import { Calculator, Plus, Trash2, Sparkles, Loader2, Coins, TrendingUp, PiggyBank, Smile, BookOpen } from 'lucide-react';
import { fetchBudgetPlan, saveBudgetPlanDB } from '../utils/api';
import { useThemeLanguage } from '../context/ThemeLanguageContext';

interface WishlistItem {
  id: string;
  name: string;
  price: string;
}

interface SmartBudgetProps {
  onNavigate?: (page: string) => void;
}

export default function SmartBudget({ onNavigate }: SmartBudgetProps) {
  const { language } = useThemeLanguage();

  const t = {
    id: {
      title: "Rencana Keuanganmu Udah Siap!",
      titleSetup: "Setup Smart Budget AI",
      subtitle: "Ini strategi jitu biar dompetmu tetap tebal dan keinginan tercapai.",
      subtitleSetup: "Biar AI yang ngitungin jatah jajan dan nabungmu bulan ini.",
      jajanTitle: "JATAH JAJAN & HIBURAN BULAN INI",
      jajanDesc: "Dari total pendapatanmu, ini jatah bebas buat kamu pakai beli kopi, nonton, atau checkout keranjang tanpa merasa bersalah! ✨",
      rekomendasi: "Rekomendasi Pembagian",
      
      aturan503020: "Aturan 50/30/20",
      simulasiAICustom: "Simulasi AI Custom",
      aturanFinansial503020: "Aturan Finansial 50/30/20",
      desc503020: "Rumus penganggaran populer yang membagi penghasilan bulanan bersihmu menjadi tiga kategori utama untuk menjamin masa depan finansialmu seimbang dan makmur.",
      inputPendapatan: "Masukkan Pendapatan / Gaji Bulanan (Rp)",
      placeholderPendapatan: "Contoh: 10.000.000",
      allocNote: "*Alokasi di bawah akan langsung terupdate setelah kamu menekan tombol Hitung.",
      hitungBtn: "Kalkulasi Alokasi Finansial",
      hasilKalkulasi: "Hasil Kalkulasi Anggaran",
      targetIdeal: "Target Alokasi Ideal",
      kebutuhanPokok: "Kebutuhan Pokok (50%)",
      kebutuhanDesc: "Sewa kos, tagihan, bahan makanan, transportasi wajib",
      keinginanLifestyle: "Keinginan & Lifestyle (30%)",
      keinginanDesc: "Jajan kopi, langganan streaming, liburan, belanja hobi",
      tabunganMasaDepan: "Tabungan & Masa Depan (20%)",
      tabunganDesc: "Tabungan dana darurat, investasi reksadana, saham",
      gunakanSimulasi: "Gunakan Pada Simulasi AI",
      simpanAnggaran: "Simpan Anggaran",
      saved1: "Alokasi Finansial 50/30/20 berhasil disimpan! ✨",
      belumAdaAnggaran: "Belum Ada Anggaran yang Dihitung",
      belumAdaDesc: "Masukkan total pendapatan bersih bulananmu di kolom kiri, lalu klik tombol Kalkulasi Alokasi Finansial untuk melihat pembagian dana idealmu.",
      
      dataKeuanganDasar: "Data Keuangan Dasar",
      pendapatanRutin: "Pendapatan Rutin per Bulan (Rp)",
      pendapatanRutinDesc: "*Boleh dikosongkan. AI MOODUIT akan otomatis menghitung rata-rata ini dari riwayat transaksimu setelah 1 bulan pemakaian.",
      pengeluaranPasti: "Pengeluaran Pasti per Bulan (Kos, Cicilan, dll) (Rp)",
      pengeluaranPastiDesc: "*Boleh dikosongkan. AI MOODUIT akan otomatis menghitung rata-rata ini dari riwayat transaksimu setelah 1 bulan pemakaian.",
      placeholderPengeluaran: "Contoh: 3.000.000",
      targetDanaDarurat: "Target Dana Darurat (Berdasarkan Pengeluaran)",
      pilihDanaDarurat: "Pilih target dana darurat...",
      tigaBulan: "3 Bulan (Ideal untuk single)",
      enamBulan: "6 Bulan (Ideal untuk berkeluarga)",
      duaBelasBulan: "1 Tahun (Sangat Aman)",
      
      targetImpian: "Target Impian",
      tambahItem: "Tambah Item",
      belumAdaTarget: "Belum ada target.",
      klikTambahItem: "Klik + Tambah Item di atas.",
      namaBarang: "Nama Barang...",
      harga: "Harga...",
      aiMenganalisa: "AI Sedang Menganalisa... ✨",
      generatePlan: "Generate Budget Plan",
      
      aiMengumpulkan: "✨ AI Sedang Mengumpulkan Data...",
      aiMengumpulkanDesc: "Karena kamu melewati form pendapatan, AI MOODUIT akan menganalisa riwayat transaksimu bulan depan untuk nominal pastinya. Sementara itu, ikuti persentase di bawah ini ya!",
      kebutuhanPokokSesuai: "Kebutuhan Pokok (Sesuai Pengeluaran)",
      autoDihitung: "Dihitung otomatis",
      keinginanJajanJatah: "Keinginan & Jajan (Jatah Bebas)",
      masaDepanCicilan: "Masa Depan (Cicilan Dana Darurat 10%)",
      analisaAIAdvisor: "Analisa AI Advisor",
      
      aiEmptyTip: "Gunakan fitur \"Scan Transaksi\" setiap habis belanja agar pengeluaranmu otomatis tercatat. Dengan begitu, AI bisa segera menghitung strategi tabungan yang pas buat kamu!",
      aiFilledTip: "Kurangi jajan di luar weekend biar progres impian-mu makin ngebut! Kamu bisa hemat sampai Rp tambahan per bulan.",
      
      saveRencana: "Simpan Rencana",
      hitungUlang: "Hitung Ulang",
      saved2: "Rencana berhasil disimpan! ✨"
    },
    en: {
      title: "Your Financial Plan is Ready!",
      titleSetup: "Setup Smart Budget AI",
      subtitle: "Here is the foolproof strategy to keep your wallet thick and desires fulfilled.",
      subtitleSetup: "Let the AI calculate your spending and savings allowance for this month.",
      jajanTitle: "FUN & ENTERTAINMENT BUDGET THIS MONTH",
      jajanDesc: "From your total income, this is your guilt-free allowance for coffee, movies, or checking out your shopping cart! ✨",
      rekomendasi: "Allocation Recommendation",
      
      aturan503020: "50/30/20 Rule",
      simulasiAICustom: "Custom AI Simulation",
      aturanFinansial503020: "50/30/20 Financial Rule",
      desc503020: "A popular budgeting rule that divides your net monthly income into three main categories to ensure a balanced and prosperous financial future.",
      inputPendapatan: "Enter Monthly Income / Salary (Rp)",
      placeholderPendapatan: "Example: 10,000,000",
      allocNote: "*The allocation below will be updated immediately once you click Calculate.",
      hitungBtn: "Calculate Financial Allocation",
      hasilKalkulasi: "Budget Calculation Results",
      targetIdeal: "Ideal Allocation Target",
      kebutuhanPokok: "Needs / Essentials (50%)",
      kebutuhanDesc: "Rent, bills, groceries, required transportation",
      keinginanLifestyle: "Wants & Lifestyle (30%)",
      keinginanDesc: "Coffee, streaming subscriptions, vacation, hobby purchases",
      tabunganMasaDepan: "Savings & Investments (20%)",
      tabunganDesc: "Emergency fund savings, mutual funds, stocks",
      gunakanSimulasi: "Use on AI Simulation",
      simpanAnggaran: "Save Budget",
      saved1: "50/30/20 Financial Allocation successfully saved! ✨",
      belumAdaAnggaran: "No Budget Calculated Yet",
      belumAdaDesc: "Enter your net monthly income on the left column, then click the Calculate Financial Allocation button to view your ideal allocation.",
      
      dataKeuanganDasar: "Basic Financial Data",
      pendapatanRutin: "Regular Monthly Income (Rp)",
      pendapatanRutinDesc: "*Can be left empty. MOODUIT AI will automatically calculate this average from your transaction history after 1 month of usage.",
      pengeluaranPasti: "Fixed Monthly Expenses (Rent, Installments, etc.) (Rp)",
      pengeluaranPastiDesc: "*Can be left empty. MOODUIT AI will automatically calculate this average from your transaction history after 1 month of usage.",
      placeholderPengeluaran: "Example: 3,000,000",
      targetDanaDarurat: "Emergency Fund Target (Based on Expenses)",
      pilihDanaDarurat: "Choose emergency fund target...",
      tigaBulan: "3 Months (Ideal for single)",
      enamBulan: "6 Months (Ideal for family)",
      duaBelasBulan: "1 Year (Very Safe)",
      
      targetImpian: "Wishlist Goals",
      tambahItem: "Add Item",
      belumAdaTarget: "No goals set yet.",
      klikTambahItem: "Click + Add Item above.",
      namaBarang: "Item Name...",
      harga: "Price...",
      aiMenganalisa: "AI is Analyzing... ✨",
      generatePlan: "Generate Budget Plan",
      
      aiMengumpulkan: "✨ AI is Gathering Data...",
      aiMengumpulkanDesc: "Since you skipped the income fields, MOODUIT AI will analyze your transaction history next month for precise amounts. Meanwhile, follow the percentages below!",
      kebutuhanPokokSesuai: "Needs / Essentials (Based on Expenses)",
      autoDihitung: "Automatically calculated",
      keinginanJajanJatah: "Wants & Fun (Guilt-Free Allowance)",
      masaDepanCicilan: "Future (10% Emergency Fund Installment)",
      analisaAIAdvisor: "AI Advisor Analysis",
      
      aiEmptyTip: "Use the \"Scan Transaction\" feature after every purchase so your expenses are automatically logged. This allows AI to calculate the perfect savings strategy for you!",
      aiFilledTip: "Reduce dining out on weekdays to accelerate your dream goal! You can save an extra Rp amount per month.",
      
      saveRencana: "Save Plan",
      hitungUlang: "Recalculate",
      saved2: "Plan saved successfully! ✨"
    }
  };

  const activeLang = language === 'en' ? t.en : t.id;

  const [income, setIncome] = useState('');
  const [expenses, setExpenses] = useState('');
  const [emergencyTarget, setEmergencyTarget] = useState('');
  const [savingsTarget, setSavingsTarget] = useState('20');
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [targetImpian, setTargetImpian] = useState<any[]>([]);
  const [isEditTargetModalOpen, setIsEditTargetModalOpen] = useState(false);
  const [isPlanSaved, setIsPlanSaved] = useState(false);

  const handleHapusTarget = (idTarget: string) => {
    setTargetImpian(prev => prev.filter(target => target.id !== idTarget));
    setWishlist(prev => prev.filter(target => target.id !== idTarget));
    setIsEditTargetModalOpen(false); // Tutup modal setelah dihapus
  };
  const [isGenerating, setIsGenerating] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const [activeTab, setActiveTab] = useState<'formula_50_30_20' | 'custom_budget'>('formula_50_30_20');
  const [pendapatan, setPendapatan] = useState("");
  const [hasilBudget, setHasilBudget] = useState<{
    kebutuhan: number;
    keinginan: number;
    tabungan: number;
  } | null>(null);

  const hitungBudget = () => {
    const nilaiPendapatan = Number(pendapatan.replace(/\D/g, ""));
    if (nilaiPendapatan > 0) {
      setHasilBudget({
        kebutuhan: nilaiPendapatan * 0.50, // 50% Living
        keinginan: nilaiPendapatan * 0.30, // 30% Playing
        tabungan: nilaiPendapatan * 0.20   // 20% Saving
      });
    } else {
      setHasilBudget(null);
    }
  };

  React.useEffect(() => {
    const user_email = localStorage.getItem("userEmail") || "";
    if (!user_email) return;

    // Load custom budget plan from database
    import('../utils/api').then(({ fetchBudgetPlanCustom, fetchGoals, fetchBudgetPlan }) => {
      fetchBudgetPlanCustom(user_email).then((data) => {
        if (data) {
          setIncome(data.income || '');
          setExpenses(data.expenses || '');
          setEmergencyTarget(data.emergencyTarget || '');
          setSavingsTarget(data.savingsTarget || '20');
          setShowResult(true);
          setActiveTab('custom_budget');
          setIsPlanSaved(true);
        }
      }).catch(console.error);

      // Load goals from database
      fetchGoals(user_email).then((loadedWishlist) => {
        setWishlist(loadedWishlist || []);
        setTargetImpian(loadedWishlist || []);
      }).catch(console.error);

      // Load 50/30/20 budget from database
      fetchBudgetPlan(user_email).then((dbBudget) => {
        if (dbBudget) {
          setPendapatan(dbBudget.pendapatan || '');
          if (dbBudget.hasilBudget) {
            setHasilBudget(dbBudget.hasilBudget);
          }
        }
      }).catch(console.error);
    });
  }, []);

  // Helper to format string with dots
  const formatInput = (val: string) => {
    const rawValue = val.replace(/\D/g, "");
    if (!rawValue) return "";
    return Number(rawValue).toLocaleString('id-ID');
  };

  const addWishlistItem = () => {
    setWishlist([...wishlist, { id: Date.now().toString(), name: '', price: '' }]);
  };

  const removeWishlistItem = (id: string) => {
    setWishlist(wishlist.filter(item => item.id !== id));
  };

  const handleWishlistChange = (id: string, field: 'name' | 'price', value: string) => {
    let processedValue = value;
    if (field === 'name') {
      processedValue = value.charAt(0).toUpperCase() + value.slice(1);
    } else if (field === 'price') {
      processedValue = formatInput(value);
    }
    setWishlist(wishlist.map(item => item.id === id ? { ...item, [field]: processedValue } : item));
  };

  const handleGenerate = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    // Loading simulation for 2 seconds
    setTimeout(() => {
      setIsGenerating(false);
      setShowResult(true);
    }, 2000);
  };

  const formatIDR = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const incomeVal = Number(income.replace(/\D/g, '')) || 0;
  const expensesVal = Number(expenses.replace(/\D/g, '')) || 0;
  const cicilanDarurat = incomeVal * 0.10; 
  const jajanVal = incomeVal - expensesVal - cicilanDarurat;

  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 py-4 pb-32 app-container">
      <style>
        {`
          /* Base Layout (Mobile First) */
          .app-container { width: 100%; overflow-x: hidden; }
          
          /* Grid System - Otomatis pindah ke vertikal di HP */
          .grid-layout {
            display: grid;
            grid-template-columns: 1fr;
            gap: 16px;
            padding: 16px;
          }

          /* Desktop Override */
          @media (min-width: 768px) {
            .grid-layout { grid-template-columns: repeat(2, 1fr); }
          }

          /* Fix for overlapping text in Analisa Page */
          .text-fix {
            word-break: break-word;
            overflow-wrap: break-word;
            max-width: 100%;
          }
        `}
      </style>
      <header className="mb-5">
        <div className="d-flex align-items-center gap-3 mb-2">
          <div className="bg-primary-mooduit text-white p-2 rounded-lg">
            <Calculator size={24} />
          </div>
          <h1 className="fw-800 text-primary-mooduit text-2xl md:text-3xl mb-1">
            {showResult ? activeLang.title : activeLang.titleSetup}
          </h1>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base leading-relaxed">
          {showResult 
            ? activeLang.subtitle 
            : activeLang.subtitleSetup}
        </p>
      </header>

      {/* TABS SELECTOR */}
      {!showResult && (
        <div className="d-flex p-1 bg-gray-100 dark:bg-slate-800 rounded-2xl mb-4 max-w-sm border border-gray-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('formula_50_30_20')}
            className={`flex-grow-1 py-2.5 px-3 rounded-xl font-bold text-sm sm:text-base transition-all d-flex align-items-center justify-content-center gap-2 border-0 cursor-pointer ${
              activeTab === 'formula_50_30_20'
                ? 'bg-[#112F58] text-white shadow-sm'
                : 'bg-transparent text-muted hover:text-dark'
            }`}
          >
            <Coins size={16} />
            <span>{activeLang.aturan503020}</span>
          </button>
          <button
            onClick={() => setActiveTab('custom_budget')}
            className={`flex-grow-1 py-2.5 px-3 rounded-xl font-bold text-sm sm:text-base transition-all d-flex align-items-center justify-content-center gap-2 border-0 cursor-pointer ${
              activeTab === 'custom_budget'
                ? 'bg-[#112F58] text-white shadow-sm'
                : 'bg-transparent text-muted hover:text-dark'
            }`}
          >
            <Sparkles size={16} />
            <span>{activeLang.simulasiAICustom}</span>
          </button>
        </div>
      )}

      {!showResult ? (
        activeTab === 'formula_50_30_20' ? (
          <div className="row g-4">
            <div className="col-12 col-lg-5">
              <div className="card-mooduit p-4 shadow-sm h-100 d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex align-items-center gap-2.5 mb-3">
                    <div className="bg-[#112F58]/10 text-[#112F58] p-2.5 rounded-xl">
                      <Calculator size={20} />
                    </div>
                    <h2 className="fw-800 text-primary-mooduit text-xl md:text-2xl mb-0">{activeLang.aturanFinansial503020}</h2>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base leading-relaxed mb-4">
                    {activeLang.desc503020}
                  </p>

                  <div className="mb-4">
                    <label className="form-label text-xs sm:text-sm fw-bold text-gray-700 dark:text-gray-300">{activeLang.inputPendapatan}</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-gray-200 fw-bold text-muted">Rp</span>
                      <input 
                        type="text" 
                        className="form-control py-3 rounded-r-xl border-gray-200 font-bold text-base md:text-lg focus:border-[#112F58] focus:outline-none" 
                        placeholder={activeLang.placeholderPendapatan}
                        value={pendapatan}
                        onChange={(e) => {
                          const formatted = formatInput(e.target.value);
                          setPendapatan(formatted);
                        }}
                      />
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 mt-2 italic">
                      {activeLang.allocNote}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <button
                    className="btn w-100 py-3.5 rounded-xl text-white fw-bold d-flex align-items-center justify-content-center gap-2 transition-all hover:scale-[0.99] active:scale-95 shadow-md border-0 text-sm md:text-base cursor-pointer"
                    style={{ backgroundColor: '#112F58' }}
                    onClick={hitungBudget}
                  >
                    <TrendingUp size={18} />
                    <span>{activeLang.hitungBtn}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="col-12 col-lg-7">
              {hasilBudget ? (
                <motion.div 
                  className="card-mooduit p-4 shadow-sm h-100"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 className="fw-800 text-primary-mooduit text-xl md:text-2xl mb-0">{activeLang.hasilKalkulasi}</h2>
                    <div className="badge border border-[#112F58]/25 bg-[#112F58]/5 text-[#112F58] px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold">
                      {activeLang.targetIdeal}
                    </div>
                  </div>

                  <div className="space-y-4 mb-4">
                    {/* KEBUTUHAN POKOK - 50% */}
                    <div className="p-4 bg-[#112F58]/5 border border-[#112F58]/10 rounded-2xl">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div className="d-flex align-items-center gap-2.5">
                          <div className="bg-[#112F58]/10 text-[#112F58] p-1.5 rounded-lg">
                            <Plus size={16} />
                          </div>
                          <div>
                            <span className="text-sm sm:text-base fw-800 text-[#112F58] block">{activeLang.kebutuhanPokok}</span>
                            <span className="text-xs sm:text-sm text-gray-500 leading-relaxed block">{activeLang.kebutuhanDesc}</span>
                          </div>
                        </div>
                        <span className="fw-800 text-base sm:text-lg text-[#112F58]">
                          {formatIDR(hasilBudget.kebutuhan)}
                        </span>
                      </div>
                      <div className="progress" style={{ height: '6px', borderRadius: '10px' }}>
                        <div 
                          className="progress-bar" 
                          style={{ width: '50%', backgroundColor: '#112F58', borderRadius: '10px' }}
                        ></div>
                      </div>
                    </div>

                    {/* KEINGINAN & LIFESTYLE - 30% */}
                    <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div className="d-flex align-items-center gap-2.5">
                          <div className="bg-amber-100 text-amber-800 p-1.5 rounded-lg">
                            <Smile size={16} />
                          </div>
                          <div>
                            <span className="text-sm sm:text-base fw-800 text-amber-800 block">{activeLang.keinginanLifestyle}</span>
                            <span className="text-xs sm:text-sm text-amber-600 leading-relaxed block">{activeLang.keinginanDesc}</span>
                          </div>
                        </div>
                        <span className="fw-800 text-base sm:text-lg text-amber-800 font-sans">
                          {formatIDR(hasilBudget.keinginan)}
                        </span>
                      </div>
                      <div className="progress" style={{ height: '6px', borderRadius: '10px' }}>
                        <div 
                          className="progress-bar" 
                          style={{ width: '30%', backgroundColor: '#d97706', borderRadius: '10px' }}
                        ></div>
                      </div>
                    </div>

                    {/* TABUNGAN & INVESTASI - 20% */}
                    <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div className="d-flex align-items-center gap-2.5">
                          <div className="bg-emerald-100 text-emerald-800 p-1.5 rounded-lg">
                            <PiggyBank size={16} />
                          </div>
                          <div>
                            <span className="text-sm sm:text-base fw-800 text-emerald-800 block">{activeLang.tabunganMasaDepan}</span>
                            <span className="text-xs sm:text-sm text-[#059669] leading-relaxed block">{activeLang.tabunganDesc}</span>
                          </div>
                        </div>
                        <span className="fw-800 text-base sm:text-lg text-emerald-800">
                          {formatIDR(hasilBudget.tabungan)}
                        </span>
                      </div>
                      <div className="progress" style={{ height: '6px', borderRadius: '10px' }}>
                        <div 
                          className="progress-bar" 
                          style={{ width: '20%', backgroundColor: '#059669', borderRadius: '10px' }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex gap-3">
                    <button
                      className="btn flex-grow-1 py-3 text-sm sm:text-base fw-bold border-2 border-dashed border-[#112F58] hover:bg-[#112F58]/5 text-[#112F58] rounded-xl transition-all cursor-pointer"
                      onClick={() => {
                        setIncome(pendapatan);
                        setExpenses(formatInput(String(hasilBudget.kebutuhan)));
                        setActiveTab('custom_budget');
                      }}
                    >
                      {activeLang.gunakanSimulasi}
                    </button>
                    <button
                      className="btn py-3 px-4 text-sm sm:text-base fw-bold text-white rounded-xl shadow-sm transition-all border-0 cursor-pointer"
                      style={{ backgroundColor: '#112F58' }}
                      onClick={async () => {
                        const user_email = localStorage.getItem("userEmail") || "";
                        if (!user_email) {
                          toast.error("Harap login terlebih dahulu.");
                          return;
                        }
                        
                        // Persist to budgets table in database
                        try {
                          const cleanIncomeNum = Number(pendapatan.replace(/\D/g, "")) || 0;
                          await saveBudgetPlanDB(cleanIncomeNum, user_email);
                        } catch (err) {
                          console.error("Failed to persist budget calculation to DB:", err);
                        }
                        
                        toast.success(activeLang.saved1);
                        if (onNavigate) onNavigate('dashboard');
                      }}
                    >
                      {activeLang.simpanAnggaran}
                    </button>
                  </div>
                </motion.div>
              ) : (
                <div className="card-mooduit p-4 shadow-sm h-100 d-flex flex-column align-items-center justify-content-center text-center py-5">
                  <div className="bg-[#112F58]/5 p-4 rounded-full text-primary-mooduit mb-3.5">
                    <BookOpen size={40} className="opacity-75" />
                  </div>
                  <h3 className="fw-bold text-primary-mooduit text-lg md:text-xl">{activeLang.belumAdaAnggaran}</h3>
                  <p className="text-muted text-sm md:text-base max-w-sm mt-1 leading-relaxed">
                    {activeLang.belumAdaDesc}
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="row g-4">
            <div className="col-12 col-lg-7">
              <div className="card-mooduit p-4 shadow-sm h-100">
                <h2 className="fw-bold text-xl md:text-2xl mb-4">{activeLang.dataKeuanganDasar}</h2>
                
                <div className="mb-4">
                  <label className="form-label text-xs sm:text-sm fw-bold">{activeLang.pendapatanRutin}</label>
                  <input 
                    type="text" 
                    className="form-control py-2.5 text-sm md:text-base rounded-xl" 
                    placeholder={activeLang.placeholderPendapatan}
                    value={income}
                    onChange={(e) => setIncome(formatInput(e.target.value))}
                  />
                  <p className="text-xs sm:text-sm text-gray-500 mt-1 italic">{activeLang.pendapatanRutinDesc}</p>
                </div>

                <div className="mb-4">
                  <label className="form-label text-xs sm:text-sm fw-bold">{activeLang.pengeluaranPasti}</label>
                  <input 
                    type="text" 
                    className="form-control py-2.5 text-sm md:text-base rounded-xl" 
                    placeholder={language === 'en' ? 'Example: 3,000,000' : 'Contoh: 3.000.000'}
                    value={expenses}
                    onChange={(e) => setExpenses(formatInput(e.target.value))}
                  />
                  <p className="text-xs sm:text-sm text-gray-500 mt-1 italic">{activeLang.pengeluaranPastiDesc}</p>
                </div>

                <div className="mb-4">
                  <label className="form-label text-xs sm:text-sm fw-bold">{activeLang.targetDanaDarurat}</label>
                  <select 
                    className="form-select py-2.5 text-sm md:text-base rounded-xl" 
                    value={emergencyTarget}
                    onChange={(e) => setEmergencyTarget(e.target.value)}
                  >
                    <option value="" disabled>{activeLang.pilihDanaDarurat}</option>
                    <option value="3">{activeLang.tigaBulan}</option>
                    <option value="6">{activeLang.enamBulan}</option>
                    <option value="12">{activeLang.duaBelasBulan}</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="col-12 col-lg-5">
              <div className="card-mooduit p-4 shadow-sm h-100">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h2 className="fw-bold text-xl md:text-2xl mb-0">{activeLang.targetImpian}</h2>
                  <button 
                    className="btn btn-sm btn-mooduit-outline d-flex align-items-center gap-1 py-1.5 px-3 text-xs sm:text-sm"
                    onClick={addWishlistItem}
                  >
                    <Plus size={16} />
                    <span className="fw-bold">{activeLang.tambahItem}</span>
                  </button>
                </div>

                <div className="d-flex flex-column gap-3 mb-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {wishlist.length === 0 ? (
                    <div className="text-center py-5 bg-light rounded-xl border border-dashed border-muted opacity-60">
                      <p className="text-xs sm:text-sm text-muted leading-relaxed mb-0">{activeLang.belumAdaTarget}<br/>{activeLang.klikTambahItem}</p>
                    </div>
                  ) : wishlist.map((item) => (
                    <div key={item.id} className="p-3 bg-light rounded-xl border border-light position-relative">
                      <button 
                        className="position-absolute top-0 end-0 m-2 btn btn-link text-danger p-0 opacity-50 hover:opacity-100"
                        onClick={() => removeWishlistItem(item.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                      <div className="row g-2">
                        <div className="col-12">
                          <input 
                            type="text" 
                            className="form-control form-control-sm border-0 bg-transparent fw-bold text-sm md:text-base" 
                            placeholder={activeLang.namaBarang}
                            value={item.name}
                            onChange={(e) => handleWishlistChange(item.id, 'name', e.target.value)}
                          />
                        </div>
                        <div className="col-12">
                          <div className="input-group input-group-sm">
                            <span className="input-group-text bg-transparent border-0 text-xs sm:text-sm opacity-50">Rp</span>
                            <input 
                              type="text" 
                              className="form-control border-0 bg-transparent text-sm md:text-base" 
                              placeholder={activeLang.harga} 
                              value={item.price}
                              onChange={(e) => handleWishlistChange(item.id, 'price', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button 
                  className={`btn w-100 py-3 rounded-lg fw-bold d-flex align-items-center justify-content-center gap-2 mt-auto transition-all text-white text-sm md:text-base border-0 cursor-pointer ${isGenerating ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-lg'}`}
                  style={{ backgroundColor: '#112F58' }}
                  onClick={handleGenerate}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      <span>{activeLang.aiMenganalisa}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={20} />
                      <span>{activeLang.generatePlan}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )
      ) : (() => {
        const isDataKosong = !incomeVal || incomeVal === 0;
        
        // Asumsi target pertama untuk disimulasikan
        const targetPertama = wishlist[0];
        const hargaTarget = Number(targetPertama?.price.replace(/\D/g, '')) || 200000; 
        const jatahTabung = cicilanDarurat; 
        const estimasiBulan = jatahTabung > 0 ? Math.ceil(hargaTarget / jatahTabung) : 0;

        return (
          <motion.div 
            className="card-mooduit p-3 sm:p-5 shadow-xl border-0 overflow-hidden position-relative bg-white"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="position-absolute top-0 end-0 p-4 opacity-10">
              <Sparkles size={120} className="text-primary-mooduit" />
            </div>

            <div className="grid-layout w-full">
              {/* KOLOM KIRI: HASIL & REKOMENDASI */}
              <div className="w-full">
                <h3 className="text-xs sm:text-sm text-gray-500 font-semibold mb-2 uppercase tracking-wider">{activeLang.jajanTitle}</h3>
                
                {isDataKosong ? (
                  <div className="mb-8">
                    <p className="text-xl md:text-2xl italic text-gray-400 font-semibold mb-2">{activeLang.aiMengumpulkan}</p>
                    <p className="text-sm md:text-base text-gray-600 leading-relaxed">{activeLang.aiMengumpulkanDesc}</p>
                  </div>
                ) : (
                  <div className="mb-8">
                     {/* HERO NUMBER: JATAH JAJAN & HIBURAN */}
                     <h2 className="whitespace-nowrap font-black" style={{ 
                       fontSize: 'clamp(28px, 7vw, 54px)',
                       color: '#22c55e',
                       margin: '8px 0 16px 0',
                       lineHeight: '1.1',
                       letterSpacing: '-1px'
                     }}>
                       {formatIDR(jajanVal < 0 ? 0 : jajanVal)}
                     </h2>
                     <p className="text-sm md:text-base text-gray-600 leading-relaxed">{activeLang.jajanDesc}</p>
                  </div>
                )}
 
                {/* KARTU REKOMENDASI */}
                <h3 className="font-bold text-lg md:text-xl text-[#112F58] mb-4">{activeLang.rekomendasi}</h3>
                <div className="space-y-4">
                   <div className="flex flex-col sm:flex-row justify-between sm:items-center p-4 bg-gray-50 border border-gray-100 rounded-xl gap-2 sm:gap-0">
                      <span className="text-gray-700 font-medium text-sm md:text-base">{activeLang.kebutuhanPokokSesuai}</span>
                      <span className="font-bold text-[#112F58] text-sm md:text-base whitespace-nowrap">{isDataKosong ? activeLang.autoDihitung : formatIDR(expensesVal)}</span>
                   </div>
                   <div className="flex flex-col sm:flex-row justify-between sm:items-center p-4 bg-green-50 border border-green-100 rounded-xl gap-2 sm:gap-0">
                      <span className="text-green-700 font-medium text-sm md:text-base">{activeLang.keinginanJajanJatah}</span>
                      <span className="font-bold text-green-700 text-sm md:text-base whitespace-nowrap">{isDataKosong ? activeLang.autoDihitung : formatIDR(jajanVal < 0 ? 0 : jajanVal)}</span>
                   </div>
                   <div className="flex flex-col sm:flex-row justify-between sm:items-center p-4 bg-yellow-50 border border-yellow-100 rounded-xl gap-2 sm:gap-0">
                      <span className="text-yellow-700 font-medium text-sm md:text-base">{activeLang.masaDepanCicilan}</span>
                      <span className="font-bold text-yellow-700 text-sm md:text-base whitespace-nowrap">{isDataKosong ? activeLang.autoDihitung : formatIDR(cicilanDarurat)}</span>
                   </div>
                </div>
              </div>
 
              {/* KOLOM KANAN: AI ADVISOR CARD */}
              <div className="w-full">
                <div className="p-4 bg-light rounded-2xl border border-light h-100 d-flex flex-column shadow-sm w-full">
                  <h3 className="fw-bold mb-3 text-lg md:text-xl text-primary-mooduit">{activeLang.analisaAIAdvisor}</h3>
                  <div className="flex-grow-1">
                    <p className="text-sm md:text-base text-muted leading-relaxed mb-4">
                      {isDataKosong ? (
                        language === 'en' ? (
                          <>Oh, AI cannot give a time estimate for <span className="fw-bold text-primary-mooduit capitalize">{targetPertama?.name || 'your dream goal'}</span> yet because your data is incomplete. Please enter your income first!</>
                        ) : (
                          <>Wah, AI belum bisa ngasih estimasi waktu buat <span className="fw-bold text-primary-mooduit capitalize">{targetPertama?.name || 'Impianmu'}</span> karena datamu belum lengkap. Isi pendapatannya dulu yuk!</>
                        )
                      ) : estimasiBulan > 0 ? (
                        language === 'en' ? (
                          <>Based on your dream goal, you need to save consistently for <span className="fw-bold text-primary-mooduit">{estimasiBulan} month(s)</span> to purchase <span className="capitalize">{targetPertama?.name || 'your goal'}</span>.</>
                        ) : (
                          <>Berdasarkan target impian-mu, kamu butuh menabung disiplin selama <span className="fw-bold text-primary-mooduit">{estimasiBulan} bulan</span> untuk membeli <span className="capitalize">{targetPertama?.name || 'Impianmu'}</span>.</>
                        )
                      ) : (
                        language === 'en' ? (
                          <>The goal <span className="fw-bold text-primary-mooduit capitalize">{targetPertama?.name || 'your goal'}</span> will be difficult to achieve without a savings allocation. Let's adjust your budget!</>
                        ) : (
                          <>Target <span className="fw-bold text-primary-mooduit capitalize">{targetPertama?.name || 'Impianmu'}</span> bakal sulit tercapai kalau nggak ada alokasi tabungan. Yuk coba sesuaikan budgetmu!</>
                        )
                      )}
                    </p>
                      <div className="w-full px-3 py-3 bg-white rounded-xl mb-4 shadow-sm border border-primary-mooduit border-opacity-10">
                        <div className="d-flex align-items-center gap-2 text-primary-mooduit mb-1">
                          <Sparkles size={16} />
                          <span className="text-xs fw-800 text-uppercase tracking-wider">AI TIP</span>
                        </div>
                        {isDataKosong ? (
                          <p className="mb-0 text-xs sm:text-sm leading-relaxed fw-medium text-muted">
                            {activeLang.aiEmptyTip}
                          </p>
                        ) : (
                          <p className="mb-0 text-xs sm:text-sm leading-relaxed fw-medium text-muted">
                            {language === 'en' 
                              ? `Reduce dining out on weekdays to accelerate your dream goal! You can save an extra Rp ${(jajanVal * 0.2).toLocaleString('id-ID')} per month.`
                              : `Kurangi jajan di luar weekend biar progres impian-mu makin ngebut! Kamu bisa hemat sampai Rp ${(jajanVal * 0.2).toLocaleString('id-ID')} tambahan per bulan.`}
                          </p>
                        )}
                      </div>
                  </div>
                  
                  <div className="d-flex flex-column gap-2 mt-auto">
                    {!isPlanSaved ? (
                      <>
                        <button 
                         className="btn w-100 py-3 rounded-lg fw-800 shadow-sm transition-all hover:scale-[1.02] text-white cursor-pointer border-0 text-sm md:text-base"
                         style={{ backgroundColor: '#112F58' }}
                         onClick={async () => {
                           const user_email = localStorage.getItem("userEmail") || "";
                           if (!user_email) {
                             toast.error("Harap login terlebih dahulu.");
                             return;
                           }
                           try {
                             const { saveBudgetPlanCustom, syncGoals } = await import('../utils/api');
                             await saveBudgetPlanCustom(user_email, { income, expenses, emergencyTarget, savingsTarget });
                             await syncGoals(user_email, wishlist);
                             setIsPlanSaved(true);
                           } catch (err) {
                             console.error("Failed to save custom budget plan to DB:", err);
                           }
                           toast.success(activeLang.saved2);
                           if (onNavigate) onNavigate('dashboard');
                         }}
                        >
                          {activeLang.saveRencana}
                        </button>
                        <button 
                         className="btn btn-mooduit-outline w-100 py-3 rounded-lg fw-800 transition-all cursor-pointer text-sm md:text-base"
                         onClick={() => setShowResult(false)}
                        >
                          {activeLang.hitungUlang}
                        </button>
                      </>
                    ) : (
                      <button 
                        className="w-full py-3.5 border-2 border-[#001F3F] text-[#001F3F] font-semibold rounded-xl hover:bg-gray-50 transition-all cursor-pointer bg-transparent text-center text-sm md:text-base"
                        onClick={() => {
                          setIsPlanSaved(false);
                          setShowResult(false);
                        }}
                      >
                        {language === 'en' ? 'Change Plan' : 'Ubah Rencana'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })()}
    </div>
  );
}
