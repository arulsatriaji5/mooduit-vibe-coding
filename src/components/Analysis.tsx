import React from 'react';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { motion } from 'motion/react';
import { 
  PieChart, 
  TrendingDown, 
  TrendingUp, 
  ArrowUpRight, 
  AlertCircle,
  Sparkles,
  Award,
  Wallet,
  PlayCircle
} from 'lucide-react';
import { useThemeLanguage } from '../context/ThemeLanguageContext';

ChartJS.register(ArcElement, Tooltip, Legend);

interface AnalysisProps {
  transactions?: any[];
}

export default function Analysis({ transactions: propsTransactions }: AnalysisProps = {}) {
  const { t, language, theme } = useThemeLanguage();
  const darkMode = theme === 'dark';
  const [localTransactions, setLocalTransactions] = React.useState<any[]>([]);
  const [activeTab, setActiveTab] = React.useState<'pengeluaran' | 'pemasukan'>('pengeluaran');

  const transactions = propsTransactions !== undefined ? propsTransactions : localTransactions;

  React.useEffect(() => {
    if (propsTransactions === undefined) {
      const savedTransactions = localStorage.getItem('transactions');
      if (savedTransactions) {
        try {
          const parsed = JSON.parse(savedTransactions);
          if (Array.isArray(parsed)) {
            const cleaned = parsed.filter((t: any) => {
              if (!t || typeof t !== 'object') return false;
              const isDummyId = [1, 2, 3, 4, 5].includes(Number(t.id));
              const note = String(t.catatan || '').toLowerCase();
              const cat = String(t.kategori || '').toLowerCase();
              const hasDummyText = 
                note.includes('gaji') ||
                note.includes('netflix') ||
                note.includes('kopi') ||
                note.includes('pertamax') ||
                note.includes('bensin') ||
                note.includes('supermarket') ||
                note.includes('nasi padang') ||
                note.includes('rendang') ||
                note.includes('indihome') ||
                note.includes('wifi') ||
                note.includes('listrik') ||
                note.includes('sabun & beras') ||
                note.includes('kenangan') ||
                cat.includes('dummy');
              return !isDummyId && !hasDummyText;
            });
            setLocalTransactions(cleaned);
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, [propsTransactions]);

  // Filter only 'pengeluaran' (spending) with safe validation
  const pengeluaran = (transactions || []).filter((t: any) => t && t.jenis === 'pengeluaran');
  
  let totalSemua = 0;
  const totalPerKategori: { [key: string]: number } = {};

  pengeluaran.forEach((t: any) => {
    if (!t) return;
    let nominal = 0;
    if (typeof t.nominal === 'number') {
      nominal = t.nominal;
    } else if (typeof t.nominal === 'string') {
      nominal = Number((t.nominal as string).replace(/\D/g, ""));
    } else if (t.nominal) {
      nominal = Number(t.nominal);
    }
    if (!isNaN(nominal) && nominal > 0 && t.kategori) {
      totalPerKategori[t.kategori] = (totalPerKategori[t.kategori] || 0) + nominal;
      totalSemua += nominal;
    }
  });

  // Solid, high-contrast style mappings for categories
  const categoryStyles: { [key: string]: { color: string; bg: string; icon: string } } = {
    "Kebutuhan Pokok": { color: '#112F58', bg: '#112F5815', icon: '🛒' },
    "Transportasi": { color: '#886E41', bg: '#886E4115', icon: '🚗' }, 
    "Hiburan": { color: '#C21C34', bg: '#C21C3415', icon: '🎬' }, 
    "Makan & Minum": { color: '#CA8A04', bg: '#CA8A0415', icon: '🍜' }, 
    "Kesehatan": { color: '#059669', bg: '#05966915', icon: '💊' }, 
    "Pendidikan": { color: '#1D4ED8', bg: '#1D4ED815', icon: '📚' }, 
    "Tagihan": { color: '#6D28D9', bg: '#6D28D915', icon: '📄' }, 
    "Belanja": { color: '#BE185D', bg: '#BE185D15', icon: '👕' }, 
    "Lainnya": { color: '#4B5563', bg: '#4B556315', icon: '📦' },
  };

  const categoriesList = Object.keys(totalPerKategori).map(catName => {
    const value = totalPerKategori[catName];
    const percentNum = totalSemua > 0 ? (value / totalSemua) * 100 : 0;
    const percent = percentNum.toFixed(0) + '%';
    const style = categoryStyles[catName] || { color: '#1E293B', bg: '#1E293B15', icon: '🧾' };
    return {
      name: catName,
      value: value,
      percent: percent,
      percentNum: percentNum,
      color: style.color,
      bg: style.bg,
      icon: style.icon
    };
  }).sort((a, b) => b.value - a.value);

  const donutData = {
    labels: categoriesList.map(c => {
      const categoryTranslations: { [key: string]: string } = {
        "Kebutuhan Pokok": t("Kebutuhan Pokok", "Needs"),
        "Transportasi": t("Transportasi", "Transportation"),
        "Hiburan": t("Hiburan", "Entertainment"),
        "Makan & Minum": t("Makan & Minum", "Food & Dining"),
        "Kesehatan": t("Kesehatan", "Healthcare"),
        "Pendidikan": t("Pendidikan", "Education"),
        "Tagihan": t("Tagihan", "Bills & Utilities"),
        "Belanja": t("Belanja", "Shopping"),
        "Lainnya": t("Lainnya", "Others")
      };
      return categoryTranslations[c.name] || c.name;
    }),
    datasets: [
      {
        data: categoriesList.map(c => c.value),
        backgroundColor: categoriesList.map(c => c.color),
        borderColor: '#ffffff',
        borderWidth: 2,
        hoverOffset: 8,
        cutout: '75%'
      },
    ],
  };

  const donutOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            let label = context.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed !== null) {
              label += new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(context.parsed);
            }
            return label;
          }
        }
      }
    }
  };

  // --- REAL-TIME DYNAMIC TRANSACTIONS COUPLING ---
  // Sum up all dynamic income ('pemasukan') transactions in our active database
  const totalPemasukanDinamis = (transactions || [])
    .filter((t: any) => t && t.jenis === 'pemasukan')
    .reduce((sum: number, t: any) => {
      let nominal = 0;
      if (typeof t.nominal === 'number') nominal = t.nominal;
      else if (typeof t.nominal === 'string') nominal = Number(t.nominal.replace(/\D/g, ""));
      return sum + nominal;
    }, 0);

  // Set the dynamic baseline income based strictly on the database
  let income = totalPemasukanDinamis;
  let usingDefaultIncome = false;

  if (income === 0) {
    // If there is no transaction of type 'pemasukan', fallback to smart budget or default Rp 10.000.000
    const savedBudget = localStorage.getItem('mooduit_50_30_20_budget');
    const budgetData = savedBudget ? JSON.parse(savedBudget) : null;
    if (budgetData && budgetData.pendapatan) {
      income = Number(budgetData.pendapatan.replace(/\D/g, ""));
    } else {
      income = 10000000; // Default clean 10 million base
      usingDefaultIncome = true;
    }
  }

  // 50/30/20 Limits directly calculated from active transaction database income
  const budgetLimitNeeds = income * 0.50;
  const budgetLimitWants = income * 0.30;
  const budgetLimitSavings = income * 0.20;

  // Classify categories into Needs (Kebutuhan), Wants (Keinginan), and Savings (Tabungan & Investasi)
  let actualSpendingNeeds = 0;
  let actualSpendingWants = 0;
  let actualSpendingSavings = 0;

  const needsCategories = ["Kebutuhan Pokok", "Transportasi", "Kesehatan", "Pendidikan", "Tagihan"];

  pengeluaran.forEach((t: any) => {
    let nominal = 0;
    if (typeof t.nominal === 'number') nominal = t.nominal;
    else if (typeof t.nominal === 'string') nominal = Number(t.nominal.replace(/\D/g, ""));
    if (!isNaN(nominal)) {
      const note = String(t.catatan || t.description || "").toLowerCase();
      const cat = String(t.kategori || "").toUpperCase();
      
      // 1. Deteksi Tabungan / Kantong Masa Depan
      if (
        cat === 'KANTONG' || 
        cat === 'TABUNGAN' || 
        cat === 'INVESTASI' || 
        note.includes('alokasi') ||
        note.includes('allocation')
      ) {
        actualSpendingSavings += nominal;
      } 
      // 2. Deteksi Kebutuhan Pokok
      else if (needsCategories.includes(t.kategori)) {
        actualSpendingNeeds += nominal;
      } 
      // 3. Sisanya masuk ke Keinginan & Gaya Hidup
      else {
        actualSpendingWants += nominal;
      }
    }
  });

  const percentNeedsUsed = budgetLimitNeeds > 0 ? (actualSpendingNeeds / budgetLimitNeeds) * 100 : 0;
  const percentWantsUsed = budgetLimitWants > 0 ? (actualSpendingWants / budgetLimitWants) * 100 : 0;
  const percentSavingsUsed = budgetLimitSavings > 0 ? (actualSpendingSavings / budgetLimitSavings) * 100 : 0;

  // --- NEW: INCOME ANALYSIS CALCULATIONS ---
  const incomeCategoryStyles: { [key: string]: { color: string; bg: string; icon: string } } = {
    "Gaji & Upah": { color: '#059669', bg: '#05966915', icon: '💰' },
    "Bonus & THR": { color: '#ca8a04', bg: '#ca8a0415', icon: '🎉' }, 
    "Hasil Usaha": { color: '#0284c7', bg: '#0284c715', icon: '🏪' }, 
    "Investasi": { color: '#7c3aed', bg: '#7c3aed15', icon: '📈' }, 
    "Pemberian": { color: '#db2777', bg: '#db277715', icon: '🎁' }, 
    "Lainnya": { color: '#4b5563', bg: '#4b556315', icon: '📦' },
  };

  const pemasukanTransactions = (transactions || []).filter((t: any) => t && t.jenis === 'pemasukan');
  
  let totalPemasukanSemua = 0;
  const totalPemasukanPerKategori: { [key: string]: number } = {};

  pemasukanTransactions.forEach((t: any) => {
    if (!t) return;
    let nominal = 0;
    if (typeof t.nominal === 'number') {
      nominal = t.nominal;
    } else if (typeof t.nominal === 'string') {
      nominal = Number((t.nominal as string).replace(/\D/g, ""));
    } else if (t.nominal) {
      nominal = Number(t.nominal);
    }
    if (!isNaN(nominal) && nominal > 0 && t.kategori) {
      totalPemasukanPerKategori[t.kategori] = (totalPemasukanPerKategori[t.kategori] || 0) + nominal;
      totalPemasukanSemua += nominal;
    }
  });

  const incomeCategoriesList = Object.keys(totalPemasukanPerKategori).map(catName => {
    const value = totalPemasukanPerKategori[catName];
    const percentNum = totalPemasukanSemua > 0 ? (value / totalPemasukanSemua) * 100 : 0;
    const percent = percentNum.toFixed(0) + '%';
    const style = incomeCategoryStyles[catName] || { color: '#1E293B', bg: '#1E293B15', icon: '🧾' };
    return {
      name: catName,
      value: value,
      percent: percent,
      percentNum: percentNum,
      color: style.color,
      bg: style.bg,
      icon: style.icon
    };
  }).sort((a, b) => b.value - a.value);

  const incomeDonutData = {
    labels: incomeCategoriesList.map(c => {
      const categoryTranslations: { [key: string]: string } = {
        "Gaji & Upah": t("Gaji & Upah", "Salary & Wages"),
        "Bonus & THR": t("Bonus & THR", "Bonus & Allowance"),
        "Hasil Usaha": t("Hasil Usaha", "Business Profits"),
        "Investasi": t("Investasi", "Investments"),
        "Pemberian": t("Pemberian", "Gifts & Grants"),
        "Lainnya": t("Lainnya", "Others")
      };
      return categoryTranslations[c.name] || c.name;
    }),
    datasets: [
      {
        data: incomeCategoriesList.map(c => c.value),
        backgroundColor: incomeCategoriesList.map(c => c.color),
        borderColor: '#ffffff',
        borderWidth: 2,
        hoverOffset: 8,
        cutout: '75%'
      },
    ],
  };

  const generateIncomeInsight = () => {
    if (totalPemasukanSemua === 0) {
      return {
        tip: t("Belum ada data pemasukan tercatat nih. Masukkan pendapatan gajimu atau hasil usaha agar AI bisa memberi analisa pilar kemakmuran finansialmu!", "No income data recorded yet. Please add your salary or business earnings so the AI can analyze your financial wealth pillars!"),
        highlightName: t("Catat Pendapatan", "Record Income"),
        highlightDesc: t("Sistem mendeteksi Pemasukan bulananmu masih Rp 0.", "System detects your monthly income is still Rp 0.")
      };
    }

    const topIncome = incomeCategoriesList[0];
    const topIncomeNameTranslated = topIncome ? (t(topIncome.name, topIncome.name)) : "";
    
    const savingsAmount = totalPemasukanSemua - totalSemua;
    const savingsRatio = totalPemasukanSemua > 0 ? (savingsAmount / totalPemasukanSemua) * 100 : 0;

    if (savingsRatio < 0) {
      return {
        tip: language === 'id'
          ? `⚠️ Warning keras! Pengeluaranmu melampaui pendapatan bulan ini sebesar Rp ${Math.abs(savingsAmount).toLocaleString('id-ID')}. Kamu kemungkinan menggunakan utang atau tabungan lama. Segera kurangi pengeluaran ya!`
          : `⚠️ Critical warning! Your spending has exceeded your income this month by Rp ${Math.abs(savingsAmount).toLocaleString('id-ID')}. You might be using debt or past savings. Reduce expenses immediately!`,
        highlightName: t("Defisit Anggaran", "Budget Deficit"),
        highlightDesc: language === 'id'
          ? `Laju pengeluaran menyerap ${((totalSemua / totalPemasukanSemua) * 100).toFixed(0)}% dari pemasukanmu.`
          : `Spending rate has absorbed ${((totalSemua / totalPemasukanSemua) * 100).toFixed(0)}% of your income.`
      };
    }

    if (savingsRatio < 20) {
      return {
        tip: language === 'id'
          ? `Pemasukan utamamu bersumber dari "${topIncomeNameTranslated}". Namun, rasio tabunganmu saat ini baru ${savingsRatio.toFixed(0)}% (di bawah target ideal 20%). Coba tingkatkan porsi saving di awal gajian ya! 💸`
          : `Your main income source is from "${topIncomeNameTranslated}". However, your current savings ratio is only ${savingsRatio.toFixed(0)}% (lower than the ideal 20% target). Try saving first at the start of payday! 💸`,
        highlightName: t("Tingkatkan Rasio Tabungan", "Boost Savings Ratio"),
        highlightDesc: language === 'id'
          ? `Sisa dana bebas ditabung: Rp ${savingsAmount.toLocaleString('id-ID')} (${savingsRatio.toFixed(0)}% dari total).`
          : `Remaining cash available to save: Rp ${savingsAmount.toLocaleString('id-ID')} (${savingsRatio.toFixed(0)}% of total).`
      };
    }

    return {
      tip: language === 'id'
        ? `Luar biasa, Slay Finansial! Rasio tabungan/investasimu sangat solid yaitu ${savingsRatio.toFixed(0)}% (Rp ${savingsAmount.toLocaleString('id-ID')}). Dukungan pemasukan terbesar Anda adalah "${topIncomeNameTranslated}". Pertahankan kemakmuran ini! 🎉`
        : `Fantastic, Financial Slay! Your savings/investment ratio is very solid at ${savingsRatio.toFixed(0)}% (Rp ${savingsAmount.toLocaleString('id-ID')}). Supported by your top income source "${topIncomeNameTranslated}". Keep up this prosperity! 🎉`,
      highlightName: t("Rasio Tabungan Prima", "Prime Savings Ratio"),
      highlightDesc: language === 'id'
        ? `Berhasil mengamankan Rp ${savingsAmount.toLocaleString('id-ID')} sebagai pilar dana masa depan.`
        : `Successfully secured Rp ${savingsAmount.toLocaleString('id-ID')} as your future foundation.`
    };
  };

  const incomeInsight = generateIncomeInsight();

  const categoryTranslations: { [key: string]: string } = {
    "Kebutuhan Pokok": t("Kebutuhan Pokok", "Needs"),
    "Transportasi": t("Transportasi", "Transportation"),
    "Hiburan": t("Hiburan", "Entertainment"),
    "Makan & Minum": t("Makan & Minum", "Food & Dining"),
    "Kesehatan": t("Kesehatan", "Healthcare"),
    "Pendidikan": t("Pendidikan", "Education"),
    "Tagihan": t("Tagihan", "Bills & Utilities"),
    "Belanja": t("Belanja", "Shopping"),
    "Lainnya": t("Lainnya", "Others")
  };

  // Real-time calculated Insight AI
  const generateInsight = () => {
    if (totalSemua === 0) {
      return {
        tip: t("Mulai masukkan datamu! AI siap menganalisa kebiasaan jajanmu dan memberikan rekomendasi strategi penghematan terbaik.", "Start inserting your data! AI is ready to analyze your spending habits and provide the best savings strategies."),
        highlightName: t("Lakukan Scan Pertama", "Make Your First Scan"),
        highlightDesc: t("Sistem membutuhkan minimal 1 struk pengeluaran.", "The system requires at least 1 spending receipt.")
      };
    }

    if (actualSpendingWants > budgetLimitWants) {
      const overAmount = actualSpendingWants - budgetLimitWants;
      return {
        tip: language === 'id' 
          ? `Aduh! Jajanan harianmu (keinginan & gaya hidup) sudah over budget sebesar Rp ${overAmount.toLocaleString('id-ID')}. Disarankan untuk membatasi self-reward minggu ini ya! 🧘`
          : `Aww! Your daily spending (wants & lifestyle) is over budget by Rp ${overAmount.toLocaleString('id-ID')}. It is highly recommended to limit self-rewards this week! 🧘`,
        highlightName: t("Keinginan Over budget", "Wants Overbudgeted"),
        highlightDesc: language === 'id'
          ? `Kamu telah membelanjakan ${percentWantsUsed.toFixed(0)}% dari batas jatah gaya hidup bulanan.`
          : `You have spent ${percentWantsUsed.toFixed(0)}% of your monthly lifestyle allocation limit.`
      };
    }

    if (actualSpendingNeeds > budgetLimitNeeds) {
      return {
        tip: t("Pengeluaran kebutuhan wajib bulananmu agak bengkak nih. Periksa kembali tagihan rutin atau biaya sewa untuk efisiensi tagihan berikutnya 📄.", "Your monthly essential needs spending is a bit bloated. Double check routine bills or rent costs for better efficiency next time 📄."),
        highlightName: t("Evaluasi Pos Wajib", "Evaluate Essential category"),
        highlightDesc: language === 'id'
          ? `Kebutuhan vital menyerap ${percentNeedsUsed.toFixed(0)}% dari batas anggaran dasar.`
          : `Vital needs have absorbed ${percentNeedsUsed.toFixed(0)}% of the basic budget allocation.`
      };
    }

    // Default healthy financial insight
    const topCat = categoriesList[0];
    const topCatNameTranslated = topCat ? (categoryTranslations[topCat.name] || topCat.name) : "";
    return {
      tip: language === 'id'
        ? `Kondisi kas terkontrol aman! Pengeluaran terbesarmu saat ini ada di pos "${topCatNameTranslated}" sebesar Rp ${topCat?.value.toLocaleString('id-ID')}. Pertahankan ritme belanja terkendali seperti ini! 📊`
        : `Financial status is safely controlled! Your largest expense right now is on "${topCatNameTranslated}" with a total of Rp ${topCat?.value.toLocaleString('id-ID')}. Keep up this well-managed spending rate! 📊`,
      highlightName: t("Kas Sehat Terkendali", "Healthy Controlled Cash"),
      highlightDesc: language === 'id'
        ? `Penyerapan terbesar pada ${topCatNameTranslated} (${topCat?.percent} dari total pengeluaran).`
        : `Highest absorption on ${topCatNameTranslated} (${topCat?.percent} of total expenses).`
    };
  };

  const insight = generateInsight();
  const isEmpty = activeTab === 'pengeluaran' ? totalSemua === 0 : totalPemasukanSemua === 0;

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 overflow-x-hidden flex flex-col gap-6">
      <style>
        {`
          /* 1. Reset Global untuk halaman Analisa */
          .analisa-page-wrapper {
            width: 100%;
            max-width: 1200px;
            margin: 0 auto;
            padding: 16px;
            box-sizing: border-box;
            overflow-x: hidden; /* Hapus bocor samping */
          }

          /* 2. Responsive Engine: Force Stacking (Mobile First) */
          @media (max-width: 768px) {
            .analisa-page-wrapper {
              display: flex !important;
              flex-direction: column !important;
              width: 100% !important;
            }
            
            /* Paksa semua kartu/kontainer jadi satu kolom */
            .card-container {
              width: 100% !important;
              display: flex !important;
              flex-direction: column !important;
              margin-bottom: 16px !important;
            }
            
            /* Sembunyikan elemen dekoratif yang terlalu lebar */
            .desktop-only { display: none !important; }
          }

          /* Grid System - Otomatis pindah ke vertikal di HP */
          .grid-layout {
            display: grid;
            grid-template-columns: 1fr;
            gap: 16px;
            padding: 16px;
          }

          /* Desktop Override */
          @media (min-width: 768px) {
            .grid-layout { grid-template-columns: 1.4fr 1fr; }
          }

          /* Fix for overlapping text in Analisa Page */
          .text-fix {
            word-break: break-word;
            overflow-wrap: break-word;
            max-width: 100%;
          }

          /* Additional Helper Styles */
          .tab-switcher {
            display: flex;
            gap: 8px;
          }

          @media (max-width: 768px) {
            .tab-switcher {
              flex-direction: column !important;
              width: 100% !important;
            }
            .tab-switcher button {
              width: 100% !important;
              text-align: center;
            }
          }

          /* Force Legible Text in AI Advisor */
          .ai-advisor-title {
            color: #112F58 !important;
          }
          .dark .ai-advisor-title {
            color: #ffffff !important;
          }
          .ai-advisor-text {
            margin: 0 !important;
          }
          .ai-advisor-anomaly-box {
            background-color: rgba(17, 47, 88, 0.04) !important;
            border: 1px solid rgba(17, 47, 88, 0.08) !important;
          }
          .dark .ai-advisor-anomaly-box {
            background-color: rgba(255, 255, 255, 0.04) !important;
            border: 1px solid rgba(255, 255, 255, 0.08) !important;
          }
          .ai-advisor-anomaly-title {
            color: rgba(17, 47, 88, 0.7) !important;
          }
          .dark .ai-advisor-anomaly-title {
            color: rgba(255, 255, 255, 0.6) !important;
          }
          .ai-advisor-anomaly-highlight {
            color: #112F58 !important;
          }
          .dark .ai-advisor-anomaly-highlight {
            color: #ffffff !important;
          }
          .ai-advisor-anomaly-desc {
            color: rgba(17, 47, 88, 0.8) !important;
          }
          .dark .ai-advisor-anomaly-desc {
            color: rgba(255, 255, 255, 0.8) !important;
          }
        `}
      </style>
      {/* Header */}
      <header className="mb-4">
        <div className="d-flex align-items-center gap-3 mb-2">
          <div className="bg-[#112F58] text-white p-2.5 rounded-2xl shadow-sm">
            <PieChart size={24} />
          </div>
          <div>
            <h3 className="fw-800 text-[#112F58] font-bold text-2xl mb-0">{t('Analisa Keuangan Cerdas', 'Smart Financial Analysis')}</h3>
            <p className="text-gray-600 text-sm mb-0 mt-0.5">{t('Alat alokasi real-time perbandingan pengeluaran & pemasukan dengan Target Alokasi 50/30/20.', 'Real-time tool comparing your spending & earnings against the 50/30/20 Ideal Budget allocation.')}</p>
          </div>
        </div>
      </header>

      {/* MODERN RUNWAY TAB SWITCHER (RESPONSIVE FIX) */}
      <div className="d-flex justify-content-center mb-5 w-full px-2">
        <div 
          className="tab-switcher"
          style={{ 
            backgroundColor: darkMode ? '#0f172a' : '#f1f5f9', 
            padding: '6px', 
            borderRadius: '16px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
            border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0',
            width: '100%',
            maxWidth: 'max-content',
            justifyContent: 'center'
          }}
        >
          <button
            onClick={() => setActiveTab('pengeluaran')}
            style={{
              padding: '10px 20px',
              borderRadius: '12px',
              fontWeight: '700',
              fontSize: '14px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              flex: '1 1 auto',
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              backgroundColor: activeTab === 'pengeluaran' ? '#112F58' : 'transparent',
              color: activeTab === 'pengeluaran' ? '#ffffff' : (darkMode ? '#94a3b8' : '#64748b'),
            }}
          >
            <TrendingDown size={16} />
            {language === 'id' ? 'Analisa Pengeluaran' : 'Expense Analysis'}
          </button>
          <button
            onClick={() => setActiveTab('pemasukan')}
            style={{
              padding: '10px 20px',
              borderRadius: '12px',
              fontWeight: '700',
              fontSize: '14px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              flex: '1 1 auto',
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              backgroundColor: activeTab === 'pemasukan' ? '#112F58' : 'transparent',
              color: activeTab === 'pemasukan' ? '#ffffff' : (darkMode ? '#94a3b8' : '#64748b'),
            }}
          >
            <TrendingUp size={16} />
            {language === 'id' ? 'Analisa Pemasukan' : 'Income Analysis'}
          </button>
        </div>
      </div>

      {isEmpty ? (
        <div className="text-center py-10 px-4 max-w-2xl mx-auto">
          <motion.div 
            className="bg-white rounded-3xl border-2 border-dashed border-gray-200 p-8 shadow-md"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="bg-orange-50 dark:bg-orange-950/40 border border-orange-100 dark:border-orange-900/30 p-4 rounded-full text-[#112F58] dark:text-amber-400 shadow-inner inline-flex items-center justify-center mb-4">
              <AlertCircle size={48} className="text-amber-500" />
            </div>
            <h4 className="text-[#112F58] dark:text-white font-extrabold text-xl mb-2">
              {activeTab === 'pengeluaran' 
                ? t('Belum Ada Data Transaksi untuk Dianalisa', 'No Transaction Data to Analyze Yet')
                : t('Belum Ada Data Pemasukan untuk Dianalisa', 'No Income Data to Analyze Yet')
              }
            </h4>
            <p className="mt-3 text-center max-w-md mx-auto leading-relaxed !text-slate-500 dark:!text-slate-400 font-medium font-sans">
              {activeTab === 'pengeluaran'
                ? t('Rincian laporan kas kamu masih kosong. Yuk, tambahkan transaksi pengeluaran pertamamu atau scan struk belanjamu sekarang juga!', 'Your transaction reports are empty. Let\'s add your first manual expense transaction or scan receipts now!')
                : t('Rincian laporan pendapatan kamu masih kosong. Yuk, tambahkan transaksi pemasukan baru sekarang juga!', 'Your income reports are empty. Let\'s add your first income transaction now!')
              }
            </p>
            <div 
              style={{ 
                backgroundColor: '#ffffff', 
                border: '2px dashed #cbd5e1', 
                color: '#475569',
                padding: '20px',
                borderRadius: '16px',
                marginTop: '32px'
              }}
              className="shadow-sm text-left leading-relaxed text-sm"
            >
              <span style={{ color: '#112F58', fontWeight: '800', marginRight: '8px', display: 'inline-block', marginBottom: '8px' }}>
                💡 {t('Tips Cara Mulai:', 'How to Start:')}
              </span> 
              {activeTab === 'pengeluaran' ? (
                <>
                  {t('Gunakan menu', 'Use the')}{' '}
                  <strong style={{ color: '#334155' }}>Manual Input</strong>{' '}
                  {t('atau navigasi ke fitur', 'or navigate to')}{' '}
                  <strong style={{ color: '#334155' }}>{t('Scan Transaksi', 'Scan Transactions')}</strong>{' '}
                  {t('untuk membaca struk secara otomatis. Laporan visual ini akan langsung terisi secara instan!', 'to read the receipts automatically. These visual reports will load instantly!')}
                </>
              ) : (
                <>
                  {t('Gunakan menu', 'Use the')}{' '}
                  <strong style={{ color: '#334155' }}>Manual Input</strong>{' '}
                  {t('di Dashboard lalu pilih jenis transaksi', 'on the Dashboard and select transaction type')}{' '}
                  <strong style={{ color: '#334155' }}>{t('Pemasukan', 'Income')}</strong>{' '}
                  {t('untuk mencatat gaji atau pendapatan Anda lainnya secara real-time!', 'to record your salary or other earnings in real-time!')}
                </>
              )}
            </div>
          </motion.div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
          {/* Main spending/income breakdown chart & categories */}
          <div className="lg:col-span-7 w-full overflow-hidden flex flex-col card-container">
            <motion.div 
              className="card-mooduit h-100 p-4 bg-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="d-flex justify-content-between align-items-center mb-4 border-b border-gray-100 pb-3">
                 <h5 className="fw-extrabold text-[#112F58] font-bold text-lg mb-0">
                   {activeTab === 'pengeluaran' 
                     ? t('Rincian Pengeluaran', 'Spending Details') 
                     : t('Rincian Pemasukan', 'Income Details')
                   }
                 </h5>
                 {activeTab === 'pengeluaran' ? (
                   <div className="d-flex align-items-center gap-1.5 text-red-600 font-bold text-sm bg-red-50 px-2.5 py-1 rounded-full">
                     <TrendingDown size={16} />
                     <span>{t('Real-time Pengeluaran', 'Real-time Expenses')}</span>
                   </div>
                 ) : (
                   <div className="d-flex align-items-center gap-1.5 text-emerald-600 font-bold text-sm bg-emerald-50 px-2.5 py-1 rounded-full">
                     <TrendingUp size={16} />
                     <span>{t('Real-time Pemasukan', 'Real-time Income')}</span>
                   </div>
                 )}
              </div>

              <div className="flex flex-col md:flex-row items-center gap-6 w-full">
                {/* Chart Segment */}
                <div className="relative flex justify-center w-full md:w-5/12" style={{ height: '240px' }}>
                  <Doughnut 
                    data={activeTab === 'pengeluaran' ? donutData : incomeDonutData} 
                    options={donutOptions} 
                  />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center mt-1">
                    <div className="fw-800 text-[#112F58] font-black" style={{ fontSize: '1.2rem', lineHeight: 1.2 }}>
                      Rp {(activeTab === 'pengeluaran' ? totalSemua : totalPemasukanSemua).toLocaleString('id-ID')}
                    </div>
                    <div className="text-[10px] fw-bold text-slate-500 font-bold tracking-wider mt-1 uppercase">
                      {activeTab === 'pengeluaran' ? t('TERPAKAI', 'USED') : t('TERKUMPUL', 'EARNED')}
                    </div>
                  </div>
                </div>

                {/* Legend list Segment */}
                <div className="w-full md:w-7/12">
                  <div className="d-flex flex-column gap-3 max-h-[260px] overflow-y-auto pr-1">
                    {(activeTab === 'pengeluaran' ? categoriesList : incomeCategoriesList).map((item, i) => {
                      const labelTranslations: { [key: string]: string } = {
                        "Kebutuhan Pokok": t("Kebutuhan Pokok", "Needs"),
                        "Transportasi": t("Transportasi", "Transportation"),
                        "Hiburan": t("Hiburan", "Entertainment"),
                        "Makan & Minum": t("Makan & Minum", "Food & Dining"),
                        "Kesehatan": t("Kesehatan", "Healthcare"),
                        "Pendidikan": t("Pendidikan", "Education"),
                        "Tagihan": t("Tagihan", "Bills & Utilities"),
                        "Belanja": t("Belanja", "Shopping"),
                        "Lainnya": t("Lainnya", "Others"),
                        "Gaji & Upah": t("Gaji & Upah", "Salary & Wages"),
                        "Bonus & THR": t("Bonus & THR", "Bonus & Allowance"),
                        "Hasil Usaha": t("Hasil Usaha", "Business Profits"),
                        "Investasi": t("Investasi", "Investments"),
                        "Pemberian": t("Pemberian", "Gifts & Grants")
                      };

                      return (
                        <div key={i} className="d-flex flex-column">
                          <div className="d-flex align-items-center justify-content-between mb-1.5 font-sans">
                            <div className="d-flex align-items-center gap-2">
                              <span 
                                className="px-2 py-0.5 rounded text-xs font-bold" 
                                style={{ backgroundColor: item.bg, color: item.color }}
                              >
                                {item.percent}
                              </span>
                              <span className="text-xs font-bold text-[#1E293B]">
                                {item.icon} {labelTranslations[item.name] || item.name}
                              </span>
                            </div>
                            <span className="text-xs font-bold text-[#112F58]">
                              Rp {item.value.toLocaleString('id-ID')}
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full transition-all duration-500" 
                              style={{ width: item.percent, backgroundColor: item.color }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* AI Insights and Advice */}
          <div className="lg:col-span-5 w-full overflow-hidden flex flex-col card-container">
            <motion.div 
              style={{ 
                backgroundColor: darkMode ? '#1e293b' : '#ffffff', 
                borderRadius: '24px', 
                padding: '24px', 
                border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
                minHeight: '300px',
                transition: 'all 0.3s ease'
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: darkMode ? '1px solid #334155' : '1px solid #e2e8f0', paddingBottom: '12px' }} className="d-flex justify-content-between align-items-center">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '18px' }}>🤖</span>
                  <h3 className="ai-advisor-title" style={{ 
                    fontSize: '16px', 
                    fontWeight: 'bold', 
                    color: darkMode ? '#ffffff' : '#112F58',
                    margin: 0 
                  }}>
                    {language === 'id' ? 'Saran AI Advisor' : 'AI Advisor Suggestion'}
                  </h3>
                </div>
                <span className="text-[11px] font-bold tracking-wide uppercase bg-amber-500/90 text-[#112F58] px-2.5 py-0.5 rounded-full">
                  {t('LIVE ANALISA', 'LIVE ANALYSIS')}
                </span>
              </div>

              {/* AREA TEKS UTAMA */}
              <div style={{ marginBottom: '20px' }}>
                <p 
                  className="ai-advisor-text text-fix"
                  style={{ 
                    fontSize: '15px', 
                    lineHeight: '1.6', 
                    color: darkMode ? '#ffffff' : '#0f172a',
                    margin: 0,
                    whiteSpace: 'pre-wrap' 
                  }}
                >
                  {activeTab === 'pengeluaran' 
                    ? (insight.tip || (language === 'id' ? 'Sedang menganalisa datamu...' : 'Analyzing your data...'))
                    : (incomeInsight.tip || (language === 'id' ? 'Sedang menganalisa datamu...' : 'Analyzing your data...'))
                  }
                </p>
              </div>

              {/* DETEKSI ANOMALI */}
              <div className="ai-advisor-anomaly-box" style={{ 
                backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(17, 47, 88, 0.03)', 
                border: darkMode ? '1px solid rgba(255, 255, 255, 0.07)' : '1px solid rgba(17, 47, 88, 0.07)', 
                padding: '16px', 
                borderRadius: '16px' 
              }}>
                <div className="ai-advisor-anomaly-title" style={{ fontSize: '11px', fontWeight: 'bold', letterSpacing: '0.05em', color: darkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(17, 47, 88, 0.6)', textTransform: 'uppercase', marginBottom: '4px' }}>
                  {activeTab === 'pengeluaran' ? t('DETEKSI ANOMALI & POIN UTAMA', 'ANOMALY DETECTION & HIGHLIGHTS') : t('PILAR UTAMA PENDAPATAN', 'PRIMARY INCOME PILLAR')}
                </div>
                <div className="ai-advisor-anomaly-highlight" style={{ fontWeight: '800', fontSize: '15px', marginBottom: '4px', color: darkMode ? '#ffffff' : '#112F58' }}>
                  {activeTab === 'pengeluaran' ? insight.highlightName : incomeInsight.highlightName}
                </div>
                <p className="ai-advisor-anomaly-desc" style={{ fontSize: '13px', color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(17, 47, 88, 0.7)', margin: 0 }}>
                  {activeTab === 'pengeluaran' ? insight.highlightDesc : incomeInsight.highlightDesc}
                </p>
              </div>
            </motion.div>
          </div>

          {/* Dynamic Progress or Income Planning Allocation Planner */}
          <div className="lg:col-span-12 w-full mt-4 card-container overflow-hidden">
            <motion.div
              className="card-mooduit p-4 bg-white"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="d-flex justify-content-between align-items-center mb-4 border-b border-gray-100 pb-3">
                <div>
                  <h5 className="fw-extrabold text-[#112F58] font-bold text-lg mb-1">
                    {activeTab === 'pengeluaran' 
                      ? t('Progress Alokasi Budget 50 / 30 / 20', '50 / 30 / 20 Budget Allocation Progress')
                      : t('Rencana Target Pembagian Alokasi 50 / 30 / 20', '50 / 30 / 20 Ideal Target Allocation Budgeting Plan')
                    }
                  </h5>
                  <p className="text-xs text-gray-500 mb-0">
                    {activeTab === 'pengeluaran' ? (
                      usingDefaultIncome 
                        ? t("Belum ada transaksi Pemasukan (Gaji). Menggunakan estimasi default Rp 10.000.000.", "No Pemasukan (Income) transactions. Using default estimate of Rp 10,000,000.") 
                        : t("Tersinkron Dinamis dengan Database Pemasukan: Rp ", "Dynamically Synced with Income Database: Rp ") + income.toLocaleString('id-ID')
                    ) : (
                      t("Berdasar Total Pendapatan Bulan ini: Rp ", "Based on Total Income This Month: Rp ") + totalPemasukanSemua.toLocaleString('id-ID')
                    )}
                  </p>
                </div>
                <div className="text-xs font-bold text-[#112F58] bg-slate-100 px-3 py-1.5 rounded-full">
                  {t('Target Aturan Ideal', 'Ideal Rules Target')}
                </div>
              </div>

              {activeTab === 'pengeluaran' ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full font-sans">
                  {/* Kebutuhan Pokok Bar */}
                  <div>
                    <div className="p-3.5 bg-[#112F58]/5 border border-[#112F58]/10 rounded-2xl">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <span className="text-xs font-extrabold text-[#112F58] block">{t('KEBUTUHAN POKOK (Batas: 50%)', 'ESSENTIAL NEEDS (Limit: 50%)')}</span>
                          <span className="text-[10px] text-[#1E293B] block font-medium mt-0.5">{t('Wajib: Pokok, Transport, Kesehatan, Pendidikan, Tagihan', 'Needs: Groceries, Transport, Health, Education, Bills')}</span>
                        </div>
                        <div className="text-end">
                          <span className="text-sm font-bold text-[#112F58] block font-sans">
                            Rp {actualSpendingNeeds.toLocaleString('id-ID')}
                          </span>
                          <span className="text-[10px] text-gray-500 block">
                            {t('Batas:', 'Limit:')} Rp {budgetLimitNeeds.toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>
                      
                      <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden mb-1.5 mt-2">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${percentNeedsUsed > 100 ? 'bg-red-600' : 'bg-[#112F58]'}`}
                          style={{ width: `${Math.min(percentNeedsUsed, 100)}%` }}
                        ></div>
                      </div>

                      <div className="d-flex justify-content-between text-[11px] font-bold text-gray-600">
                        <span>{t('Penyerapan', 'Absorption')}</span>
                        <span className={percentNeedsUsed > 100 ? "text-red-600 font-bold" : "text-[#112F58] font-bold"}>
                          {percentNeedsUsed.toFixed(1)}% {percentNeedsUsed > 100 ? t('⚠️ Terlampaui!', '⚠️ Exceeded!') : t('Aman', 'Safe')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Keinginan Pokok Bar */}
                  <div>
                    <div className="p-3.5 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <span className="text-xs font-extrabold text-amber-800 block">{t('KEINGINAN & GAYA HIDUP (Batas: 30%)', 'WANTS & LIFESTYLE (Limit: 30%)')}</span>
                          <span className="text-[10px] text-[#1E293B] block font-medium mt-0.5">{t('Suka-suka: Makan & Minum, Hiburan, Belanja, Lainnya', 'Wants: Food & Dining, Fun, Shopping, Others')}</span>
                        </div>
                        <div className="text-end">
                          <span className="text-sm font-bold text-amber-800 block font-sans">
                            Rp {actualSpendingWants.toLocaleString('id-ID')}
                          </span>
                          <span className="text-[10px] text-gray-500 block">
                            {t('Batas:', 'Limit:')} Rp {budgetLimitWants.toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>

                      <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden mb-1.5 mt-2">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${percentWantsUsed > 100 ? 'bg-red-600' : 'bg-amber-600'}`}
                          style={{ width: `${Math.min(percentWantsUsed, 100)}%` }}
                        ></div>
                      </div>

                      <div className="d-flex justify-content-between text-[11px] font-bold text-gray-600">
                        <span>{t('Penyerapan', 'Absorption')}</span>
                        <span className={percentWantsUsed > 100 ? "text-red-600 font-bold" : "text-amber-800 font-bold"}>
                          {percentWantsUsed.toFixed(1)}% {percentWantsUsed > 100 ? t('⚠️ Terlampaui!', '⚠️ Exceeded!') : t('Aman', 'Safe')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Tabungan & Investasi Bar */}
                  <div>
                    <div className="p-3.5 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <span className="text-xs font-extrabold text-emerald-800 block">{t('TABUNGAN & INVESTASI (Target: 20%)', 'SAVINGS & INVESTMENTS (Target: 20%)')}</span>
                          <span className="text-[10px] text-[#1E293B] block font-medium mt-0.5">{t('Alokasi: Dana Darurat, Investasi, Tabungan Impian', 'Pockets: Emergency Fund, Investments, Goal Savings')}</span>
                        </div>
                        <div className="text-end">
                          <span className="text-sm font-bold text-emerald-800 block font-sans">
                            Rp {actualSpendingSavings.toLocaleString('id-ID')}
                          </span>
                          <span className="text-[10px] text-gray-500 block">
                            {t('Target:', 'Target:')} Rp {budgetLimitSavings.toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>

                      <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden mb-1.5 mt-2">
                        <div 
                          className="h-full rounded-full transition-all duration-300 bg-emerald-600"
                          style={{ width: `${Math.min(percentSavingsUsed, 100)}%` }}
                        ></div>
                      </div>

                      <div className="d-flex justify-content-between text-[11px] font-bold text-gray-600">
                        <span>{t('Pencapaian', 'Achievement')}</span>
                        <span className="text-emerald-800 font-bold">
                          {percentSavingsUsed.toFixed(1)}% {percentSavingsUsed >= 100 ? t('✨ Terpenuhi!', '✨ Fulfilled!') : t('Dalam Proses', 'In Progress')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full font-sans">
                  {/* Needs Planning Info */}
                  <div>
                    <div className="p-3.5 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
                      <span className="text-xs font-extrabold text-[#112F58] block mb-1">🛒 {t('KEBUTUHAN POKOK (50%)', 'ESSENTIAL NEEDS (50%)')}</span>
                      <p className="text-[11px] text-gray-500 mb-3">{t('Alokasi untuk tempat tinggal, transportasi wajib, kesehatan, cicilan & tagihan penting.', 'Allocation for rent/house, mandatory transport, utilities, health & critical installment.')}</p>
                      <div className="p-2 bg-white rounded-xl border border-gray-100 text-center">
                        <span className="text-xs text-gray-400 block">{t('Target Alokasi', 'Target Allocation')}</span>
                        <span className="text-md font-extrabold text-[#112F58]">Rp {(totalPemasukanSemua * 0.5).toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Wants Planning Info */}
                  <div>
                    <div className="p-3.5 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
                      <span className="text-xs font-extrabold text-amber-800 block mb-1">🎬 {t('KEINGINAN & GAYA HIDUP (30%)', 'WANTS & LIFESTYLE (30%)')}</span>
                      <p className="text-[11px] text-gray-500 mb-3">{t('Alokasi untuk makan-makan jajan, langganan hiburan streaming, belanja fashion, hobi & rekreasi.', 'Allocation for dining out, streaming subscriptions, fashion shopping, hobbies & recreation.')}</p>
                      <div className="p-2 bg-white rounded-xl border border-gray-100 text-center">
                        <span className="text-xs text-gray-400 block">{t('Target Alokasi', 'Target Allocation')}</span>
                        <span className="text-md font-extrabold text-amber-800">Rp {(totalPemasukanSemua * 0.3).toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Savings Planning Info */}
                  <div>
                    <div className="p-3.5 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                      <span className="text-xs font-extrabold text-emerald-800 block mb-1">💼 {t('TABUNGAN & INVESTASI (20%)', 'SAVINGS & INVESTMENTS (20%)')}</span>
                      <p className="text-[11px] text-gray-500 mb-3">{t('Alokasi sisa emas untuk dana darurat, reksadana, investasi saham, emas, dana pensiun, dll.', 'Allocation remaining for emergency funds, mutual funds, stock investments, gold, retirement, etc.')}</p>
                      <div className="p-2 bg-white rounded-xl border border-gray-100 text-center">
                        <span className="text-xs text-gray-400 block">{t('Target Alokasi', 'Target Allocation')}</span>
                        <span className="text-md font-extrabold text-emerald-800">Rp {(totalPemasukanSemua * 0.2).toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
}
