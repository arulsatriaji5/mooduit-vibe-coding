import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'react-hot-toast';
import { 
  MoreVertical,
  Filter,
  Search,
  Plus,
  Trash2,
  Edit2,
  X,
  AlertCircle,
  Download,
  Calendar,
  Wallet,
  Tag
} from 'lucide-react';
import { useThemeLanguage } from '../context/ThemeLanguageContext';
import { updateTransactionDB, deleteTransactionDB, fetchAllTransactions } from '../utils/api';

interface TransactionsProps {
  transactions?: any[];
  setTransactions?: React.Dispatch<React.SetStateAction<any[]>>;
}

export default function Transactions({ transactions: propsTransactions, setTransactions: propsSetTransactions }: TransactionsProps = {}) {
  const { t, language } = useThemeLanguage();
  const [localTransactions, setLocalTransactions] = useState<any[]>([]);
  
  const transactions = propsTransactions !== undefined ? propsTransactions : localTransactions;
  const setTransactions = propsSetTransactions !== undefined ? propsSetTransactions : setLocalTransactions;
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterJenis, setFilterJenis] = useState('semua');
  
  // Menu and Modal States
  const [menuTerbuka, setMenuTerbuka] = useState<any>(null); // Stores the transaction ID that was clicked
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [transaksiDiedit, setTransaksiDiedit] = useState<any>(null);

  // Edit fields states
  const [editNominal, setEditNominal] = useState('');
  const [editCatatan, setEditCatatan] = useState('');
  const [editKategori, setEditKategori] = useState('');
  const [editTanggal, setEditTanggal] = useState('');
  const [editJenis, setEditJenis] = useState<'pengeluaran' | 'pemasukan'>('pengeluaran');

  const kategoriPengeluaran = [
    { id: "Kebutuhan Pokok", icon: "🛒" },
    { id: "Transportasi", icon: "🚗" },
    { id: "Hiburan", icon: "🎬" },
    { id: "Makan & Minum", icon: "🍜" },
    { id: "Kesehatan", icon: "💊" },
    { id: "Pendidikan", icon: "📚" },
    { id: "Tagihan", icon: "📄" },
    { id: "Belanja", icon: "👕" },
    { id: "Lainnya", icon: "📦" }
  ];

  const kategoriPemasukan = [
    { id: "Gaji & Upah", icon: "💰" },
    { id: "Bonus & THR", icon: "🎉" },
    { id: "Hasil Usaha", icon: "🏪" },
    { id: "Investasi", icon: "📈" },
    { id: "Pemberian", icon: "🎁" },
    { id: "Lainnya", icon: "📦" }
  ];

  const kategoriAktif = editJenis === "pengeluaran" ? kategoriPengeluaran : kategoriPemasukan;

  useEffect(() => {
    if (propsTransactions === undefined) {
      const saved = localStorage.getItem('transactions');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            const cleaned = parsed.filter(t => {
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

  const handleOpenEdit = (t: any) => {
    setTransaksiDiedit(t);
    setEditNominal(Number(t.nominal).toLocaleString('id-ID'));
    setEditCatatan(t.catatan || '');
    setEditKategori(t.kategori || '');
    setEditTanggal(t.tanggal || new Date().toISOString().split('T')[0]);
    setEditJenis(t.jenis || 'pengeluaran');
    setIsEditModalOpen(true);
    setMenuTerbuka(null);
  };

  const handleSimpanEdit = () => {
    if (!transaksiDiedit) return;
    
    const cleanNominal = Number(editNominal.replace(/\D/g, ""));
    if (isNaN(cleanNominal) || cleanNominal <= 0) {
      toast.error(t("Masukkan nominal yang valid!", "Please enter a valid amount!"));
      return;
    }

    const targetItem = transactions.find(t => t.id === transaksiDiedit.id);
    const updatedPayload = {
      ...targetItem,
      nominal: cleanNominal,
      catatan: editCatatan || editKategori,
      kategori: editKategori,
      tanggal: editTanggal,
      jenis: editJenis,
      icon: kategoriAktif.find(k => k.id === editKategori)?.icon || "🧾"
    };

    const updated = transactions.map(t => {
      if (t.id === transaksiDiedit.id) {
        return updatedPayload;
      }
      return t;
    });

    setTransactions(updated);
    localStorage.setItem('transactions', JSON.stringify(updated));
    setIsEditModalOpen(false);
    setTransaksiDiedit(null);

    // Persist to DB
    updateTransactionDB(transaksiDiedit.id, updatedPayload).catch(err => {
      console.error("Failed to update transaction in database:", err);
    });
  };

  // FUNGSI MENGHAPUS TRANSAKSI DARI DATABASE (OPTIMISTIC UPDATE)
  const executeDelete = async (e: any, transactionId?: any) => {
    let targetId = transactionId;
    let eventObj = e;
    if (typeof e === 'string' || typeof e === 'number') {
      targetId = e;
      eventObj = null;
    }

    if (eventObj) {
      if (typeof eventObj.preventDefault === 'function') eventObj.preventDefault();
      if (typeof eventObj.stopPropagation === 'function') eventObj.stopPropagation();
    }

    let confirmDelete = false;
    try {
      confirmDelete = window.confirm(t('Apakah kamu yakin ingin menghapus transaksi ini? Data yang dihapus tidak bisa dikembalikan.', 'Are you sure you want to delete this transaction? This data cannot be recovered.'));
    } catch {
      // Default to true if window.confirm is restricted in dev sandbox
      confirmDelete = true;
    }
    if (!confirmDelete) return;

    const matchedTx = transactions.find(t => t && String(t.id || t._id) === String(targetId));
    if (matchedTx) {
      await executeHardDelete(matchedTx);
    } else {
      await executeHardDelete({ id: targetId });
    }
  };

  const handleDelete = executeDelete;
  const handleHapus = executeDelete;

  // Helper date formatter
  const formatTanggalIndo = (tglStr: string) => {
    if (!tglStr) return '-';
    try {
      const dateParts = tglStr.split('-');
      if (dateParts.length === 3) {
        const blnNameIndo = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];
        const blnNameEng = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const blnName = language === 'id' ? blnNameIndo : blnNameEng;
        const day = parseInt(dateParts[2], 10);
        const monthIndex = parseInt(dateParts[1], 10) - 1;
        const year = dateParts[0];
        if (monthIndex >= 0 && monthIndex < 12) {
          return `${day} ${blnName[monthIndex]} ${year}`;
        }
      }
      return tglStr;
    } catch {
      return tglStr;
    }
  };

  // Filter transactions based on Search Term & Filter Jenis
  const filteredTransactions = (transactions || []).filter(t => {
    if (!t) return false;
    const matchesSearch = 
      (t.catatan || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
      (t.kategori || '').toLowerCase().includes((searchTerm || '').toLowerCase());
    
    if (filterJenis === 'semua') {
      return matchesSearch;
    }
    return matchesSearch && t.jenis === filterJenis;
  });

  // Calculate dynamic Total Spendings this month
  const totalPengeluaran = (transactions || [])
    .filter(t => t && t.jenis === 'pengeluaran')
    .reduce((sum, t) => {
      let val = 0;
      if (typeof t.nominal === 'number') val = t.nominal;
      else if (typeof t.nominal === 'string') val = Number(t.nominal.replace(/\D/g, ""));
      return sum + val;
    }, 0);

  const totalPemasukan = (transactions || [])
    .filter(t => t && t.jenis === 'pemasukan')
    .reduce((sum, t) => {
      let val = 0;
      if (typeof t.nominal === 'number') val = t.nominal;
      else if (typeof t.nominal === 'string') val = Number(t.nominal.replace(/\D/g, ""));
      return sum + val;
    }, 0);

  const totalFormat = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Trigger CSV content download for reporting
  const handleDownloadCSV = () => {
    if (!transactions || transactions.length === 0) {
      toast.error(t("Tidak ada data transaksi untuk diunduh.", "No transaction data available to download."));
      return;
    }

    const isId = language === 'id';
    const headers = isId 
      ? ["Tanggal", "Deskripsi", "Kategori", "Tipe", "Nominal (Rp)"]
      : ["Date", "Description", "Category", "Type", "Nominal (Rp)"];
    const csvRows = [headers.join(",")];

    transactions.forEach(tx => {
      const rawDeskripsi = tx.catatan || tx.kategori || (isId ? "Transaksi" : "Transaction");
      const deskripsi = rawDeskripsi.replace(/,/g, " ");
      const tipe = tx.jenis === 'pemasukan' 
        ? (isId ? 'Pemasukan' : 'Income') 
        : (isId ? 'Pengeluaran' : 'Expense');
      
      const row = [
        formatTanggalIndo(tx.tanggal),
        deskripsi,
        tx.kategori || "",
        tipe,
        tx.nominal || 0
      ];
      
      csvRows.push(row.join(","));
    });

    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    
    const today = new Date().toISOString().split('T')[0];
    link.setAttribute("href", url);
    link.setAttribute("download", `laporan_mooduit_${today}.csv`);
    
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // FUNGSI HAPUS AMAN HARD DELETE DENGAN RE-FETCH & FALLBACK RELOAD
  const executeHardDelete = async (transaction: any) => {
    try {
      // 1. Ambil ID yang benar (Deteksi otomatis apakah pakai 'id' or '_id')
      const targetId = transaction?.id || transaction?._id || transaction?.uuid;
      
      if (!targetId) {
        console.error("Gagal Hapus: ID Transaksi tidak ditemukan pada objek:", transaction);
        return;
      }

      // 2. Tutup Menu
      setMenuTerbuka(null);

      // 3. Tembak Database
      try {
        const win = window as any;
        const gDatabase = typeof (globalThis as any).database !== 'undefined' ? (globalThis as any).database : win.database;
        const gDb = typeof (globalThis as any).db !== 'undefined' ? (globalThis as any).db : win.db;

        if (gDatabase && gDatabase.table) {
          await gDatabase.table('transactions').delete().where(transaction.id ? 'id' : '_id', targetId);
          console.log("Berhasil dihapus dari 'database' objek.");
        } else if (gDb && gDb.table) {
          await gDb.table('transactions').delete().where(transaction.id ? 'id' : '_id', targetId);
          console.log("Berhasil dihapus dari 'db' objek.");
        } else if (typeof deleteTransactionDB === 'function') {
          await deleteTransactionDB(targetId);
          console.log("Berhasil dihapus lewat deleteTransactionDB API.");
        }
      } catch (err) {
        console.error("Gagal hapus DB:", err);
      }

      // 4. UPDATE STATE LOKAL DENGAN COERCION-FREE STRING CHECK
      try {
        if (typeof setTransactions === 'function') {
          setTransactions((prev: any[]) => prev.filter(item => item && String(item.id || item._id) !== String(targetId)));
        }
      } catch (stateErr) {
        console.error("State Mutation Error:", stateErr);
      }

      // Sync LocalStorage
      try {
        const saved = localStorage.getItem('transactions');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            const updated = parsed.filter(item => item && String(item.id || item._id) !== String(targetId));
            localStorage.setItem('transactions', JSON.stringify(updated));
          }
        }
      } catch (lsErr) {
        console.error("Local storage update failed:", lsErr);
      }

      // 5. RE-FETCH ATAU RELOAD (HARGA MATI UNTUK UPDATE UI)
      if (typeof fetchAllTransactions === 'function') {
        try {
          const freshData = await fetchAllTransactions();
          if (typeof setTransactions === 'function') {
            const cleaned = freshData.filter((t: any) => {
              if (!t || typeof t !== 'object') return false;
              const isDummyId = [1, 2, 3, 4, 5].includes(Number(t.id));
              return !isDummyId;
            });
            setTransactions(cleaned);
          }
        } catch (fetchErr) {
          console.error("Fetch fresh data failed, falling back to reload:", fetchErr);
          window.location.reload();
        }
      } else {
        window.location.reload();
      }

    } catch (error) {
      console.error("Proses Hapus Gagal:", error);
    }
  };

  const platformNativeEditFunction = (transaction: any) => {
    if (!transaction) return;
    handleOpenEdit(transaction);
  };

  const platformNativeDeleteFunction = async (id: any) => {
    if (!id) return;
    const matchedTx = transactions.find(t => t && String(t.id || t._id) === String(id));
    if (matchedTx) {
      await executeHardDelete(matchedTx);
    } else {
      await executeHardDelete({ id });
    }
  };

  const forceDeleteAction = async (id: any) => {
    const matchedTx = transactions.find(t => t && String(t.id || t._id) === String(id));
    if (matchedTx) {
      await executeHardDelete(matchedTx);
    } else {
      await executeHardDelete({ id });
    }
  };

  const eksekusiHapus = async (e: any, id: any) => {
    if (e) {
      if (typeof e.preventDefault === 'function') e.preventDefault();
      if (typeof e.stopPropagation === 'function') e.stopPropagation();
    }
    await forceDeleteAction(id);
  };

  return (
    <div className="w-full max-w-full px-4 mx-auto box-border overflow-x-hidden flex flex-col gap-4 md:gap-6 pb-72 relative riwayat-kunci-mati">
      <style>
        {`
          /* KUNCI GLOBAL HALAMAN RIWAYAT */
          .riwayat-kunci-mati {
            width: 100% !important;
            max-width: 100vw !important;
            overflow-x: hidden !important;
            box-sizing: border-box !important;
          }

          /* Hindari pemotongan dropdown menu */
          .riwayat-card {
            overflow: visible !important;
            z-index: 10 !important;
          }

          .list-group {
            overflow: visible !important;
          }

          .sticky-footer-kas {
            position: sticky !important;
            bottom: 24px !important;
            z-index: 40 !important;
            transition: all 0.3s ease-in-out;
          }

          @media (max-width: 991px) {
            .sticky-footer-kas {
              bottom: 80px !important;
            }
          }

          /* ATURAN KHUSUS HP (TIDAK MERUSAK LAPTOP) */
          @media (max-width: 768px) {
            /* Paksa teks deskripsi turun ke bawah */
            .riwayat-teks-wrap {
              white-space: normal !important;
              word-wrap: break-word !important;
              overflow-wrap: break-word !important;
              width: 100% !important;
              display: block !important;
            }
            
            /* Paksa input pencarian dan filter pas di layar */
            .riwayat-search-container {
              flex-direction: column !important;
              width: 100% !important;
            }
            .riwayat-search-container input, 
            .riwayat-search-container button,
            .riwayat-search-container select {
              width: 100% !important;
              max-width: 100% !important;
              min-width: 0 !important;
            }

            /* Paksa kartu transaksi pas di layar */
            .riwayat-card {
              width: 100% !important;
              max-width: 100% !important;
              box-sizing: border-box !important;
            }
            
            /* Jika nominal dan nama terlalu panjang, paksa bertumpuk atau potong rapi */
            .riwayat-card-content {
              flex-wrap: wrap !important;
              gap: 8px !important;
            }
          }
        `}
      </style>
      {/* WRAPPER UTAMA RIWAYAT */}
      {/* Invisible backdrop to dismiss open dropdown menus */}
      {menuTerbuka !== null && (
        <div 
          className="fixed inset-0 z-40 bg-transparent"
          onClick={() => setMenuTerbuka(null)}
        />
      )}

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-800 text-primary-mooduit mb-1 font-bold text-2xl text-[#112F58]">{t('Riwayat Transaksi', 'Transaction History')}</h4>
          <p className="text-gray-500 text-xs mt-0 riwayat-teks-wrap">{t('Seluruh alur debit & kredit yang tersimpan pada aplikasi MOODUIT Anda.', 'All debit & credit flows stored in your MOODUIT application.')}</p>
        </div>
      </div>

      {/* SEARCH AND FILTER CONTROLS */}
      <div className="d-flex flex-column flex-sm-row gap-3 mb-4 riwayat-search-container">
        <div className="position-relative flex-grow-1">
          <span className="position-absolute translate-middle-y text-muted" style={{ top: '50%', left: '16px' }}>
            <Search size={18} className="text-gray-400" />
          </span>
          <input 
            type="text" 
            placeholder={t('Cari transaksi berdasarkan catatan atau kategori...', 'Search transactions by notes or category...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white text-gray-700 border border-gray-100 rounded-2xl py-3 px-12 focus:border-[#112F58] focus:bg-white focus:outline-none transition-all placeholder-gray-400 text-sm font-semibold shadow-sm"
            id="search_transaction_input"
          />
        </div>
        
        <div className="d-flex gap-2">
          <select
            value={filterJenis}
            onChange={(e) => setFilterJenis(e.target.value)}
            className="bg-white border border-gray-100 rounded-2xl py-3 px-4 text-xs font-bold text-[#112F58] focus:outline-none shadow-sm"
            id="filter_jenis_select"
          >
            <option value="semua">📂 {t('Semua Jenis', 'All Types')}</option>
            <option value="pengeluaran">📉 {t('Pengeluaran', 'Expenses')}</option>
            <option value="pemasukan">📈 {t('Pemasukan', 'Income')}</option>
          </select>
        </div>
      </div>

      {/* TRANSACTIONS LIST CONTAINER */}
      <div className="flex flex-col w-full rounded-3xl overflow-hidden shadow-md border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 riwayat-card mb-4 p-4 md:p-5">
        <div className="list-group list-group-flush border-0 pb-48 md:pb-24" style={{ overflow: 'hidden' }}>
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-5 px-4">
              <div className="text-amber-500 mb-3 inline-flex align-items-center justify-content-center p-3 bg-amber-50 rounded-full">
                <AlertCircle size={36} />
              </div>
              <h5 className="text-[#112F58] font-bold text-base mb-1">{t('Transaksi Tidak Ditemukan', 'Transaction Not Found')}</h5>
              <p className="text-gray-500 text-xs max-w-sm mx-auto leading-relaxed">
                {t('Belum ada transaksi disimpan yang cocok dengan kata pencarian atau filter yang dipilih.', 'No stored transactions match the search term or selected filter.')}
              </p>
            </div>
          ) : (
            filteredTransactions.map((tx, i) => {
              const isPemasukan = tx.jenis === 'pemasukan';
              const formatRupiah = (amount: any) => Number(amount || 0).toLocaleString('id-ID');
              const transaction = {
                id: tx.id,
                type: isPemasukan ? 'income' : 'expense',
                description: tx.catatan || tx.kategori,
                created_at: formatTanggalIndo(tx.tanggal),
                category: tx.kategori,
                amount: tx.nominal,
                icon: tx.icon
              };
              
              return (
                <motion.div 
                  key={tx.id} 
                  className="transaction-item-row list-group-item w-full bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col gap-3 box-border hover:bg-slate-50 dark:hover:bg-gray-750 transition-all duration-300 mb-3"
                  style={{ 
                    zIndex: (1000 - i),
                    position: 'relative',
                  }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.05, 0.4) }}
                >
                  {/* Baris Atas (Informasi & Angka) */}
                  <div className="flex items-start justify-between w-full gap-3">
                    {/* Sisi Kiri (Icon + Teks) */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-12 h-12 flex-shrink-0 bg-slate-50 dark:bg-slate-700 rounded-xl flex items-center justify-center text-xl border border-slate-100 dark:border-slate-600">
                        {transaction.icon || (transaction.type === 'income' ? '💼' : '🛒')}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate m-0">
                          {transaction.description || 'Transaksi'}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5 mb-0">
                          {transaction.created_at} • <span className="uppercase tracking-wider">{transaction.category}</span>
                        </p>
                      </div>
                    </div>

                    {/* Sisi Kanan (Nominal & Badge) */}
                    <div className="flex flex-col items-end shrink-0 text-right">
                      <span className={`font-bold text-sm ${transaction.type === 'income' ? 'text-emerald-500' : 'text-red-500'}`}>
                        {transaction.type === 'income' ? '+' : '-'}Rp{formatRupiah(transaction.amount)}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 ${transaction.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                        {transaction.type === 'income' ? t('PEMASUKAN', 'INCOME') : t('PENGELUARAN', 'EXPENSE')}
                      </span>
                    </div>
                  </div>

                  {/* Baris Bawah (Tombol Aksi Terpisah) */}
                  <div className="flex justify-end items-center gap-2 pt-2 border-t border-gray-50 dark:border-gray-700/50">
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        platformNativeEditFunction(tx);
                      }} 
                      className="p-1.5 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors cursor-pointer border-none bg-transparent flex items-center justify-center"
                      title={t('Edit Transaksi', 'Edit Transaction')}
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        platformNativeDeleteFunction(tx.id);
                      }} 
                      className="p-1.5 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors cursor-pointer border-none bg-transparent flex items-center justify-center"
                      title={t('Hapus Transaksi', 'Delete Transaction')}
                    >
                      🗑️
                    </button>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* SUMMARY BAR CARD */}
      <div className="bg-[#112F58] text-white p-4.5 rounded-3xl flex flex-col justify-between gap-3.5 shadow-lg border-0 sticky-footer-kas z-40">
        <div>
          <h6 className="mb-1 text-white/70 text-xs font-bold tracking-wider uppercase">{t('TOTAL KAS BULAN INI', 'TOTAL CASH THIS MONTH')}</h6>
          <div className="grid grid-cols-2 gap-4 w-full mt-2">
            <div>
              <span className="text-[10px] md:text-xs text-gray-300/80 truncate uppercase tracking-wider block leading-none">{t('PENGELUARAN', 'EXPENSES')}</span>
              <span className="text-sm font-bold text-white truncate block mt-1">{totalFormat(totalPengeluaran)}</span>
            </div>
            <div>
              <span className="text-[10px] md:text-xs text-gray-300/80 truncate uppercase tracking-wider block leading-none">{t('PEMASUKAN', 'INCOME')}</span>
              <span className="text-sm font-bold text-white truncate block mt-1">{totalFormat(totalPemasukan)}</span>
            </div>
          </div>
        </div>
        <button 
          className="w-full mt-4 flex items-center justify-center gap-2 px-5 py-2.5 btn-download-laporan font-bold rounded-xl transition-all duration-300 shadow-sm hover:shadow-lg hover:-translate-y-1 active:scale-95 border-none outline-none"
          onClick={handleDownloadCSV}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
          {t('Download Laporan', 'Download Report')}
        </button>
      </div>

      {/* EDIT MODAL DIALOG CONTAINER */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 d-flex align-items-center justify-content-center p-4">
            {/* Modal Glass Backdrop */}
            <motion.div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditModalOpen(false)}
            />

            {/* Modal Body Card */}
            <motion.div 
              className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl relative z-50 border border-gray-100 flex flex-col"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
            >
              {/* Modal header */}
              <div className="p-4 border-b border-gray-100 d-flex align-items-center justify-content-between bg-[#112F58]/5">
                <div className="d-flex align-items-center gap-2">
                  <span className="p-1.5 bg-[#112F58] text-white rounded-lg"><Edit2 size={16} /></span>
                  <h5 className="font-extrabold text-[#112F58] font-bold text-base mb-0">{t('Revisi Transaksi', 'Edit Transaction')}</h5>
                </div>
                <button 
                  className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 border-0"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal content body */}
              <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
                {/* NOMINAL FIELD */}
                <div>
                  <label className="text-gray-500 text-[10px] font-bold uppercase tracking-widest block mb-1.5 px-1">{t('Nominal Transaksi (Rupiah)', 'Transaction Amount (Rupiah)')}</label>
                  <div className="relative">
                    <span className="absolute start-4 top-1/2 translate-y-[-50%] text-gray-400 font-extrabold text-base">Rp</span>
                    <input 
                      type="text" 
                      value={editNominal}
                      onChange={(e) => {
                        const cleanValue = e.target.value.replace(/\D/g, "");
                        setEditNominal(cleanValue ? Number(cleanValue).toLocaleString('id-ID') : "");
                      }}
                      placeholder="0"
                      className="w-full bg-gray-50 text-gray-800 border border-gray-200 rounded-2xl py-3 px-11 font-extrabold text-lg focus:border-[#112F58] focus:bg-white focus:outline-none transition-all placeholder-gray-300"
                    />
                  </div>
                </div>

                {/* TOGGLE TYPE PENGELUARAN / PEMASUKAN */}
                <div>
                  <label className="text-gray-500 text-[10px] font-bold uppercase tracking-widest block mb-1.5 px-1 font-sans">{t('Jenis Transaksi', 'Transaction Type')}</label>
                  <div className="flex bg-gray-100 p-1.5 rounded-2xl">
                    <button 
                      onClick={() => {
                        setEditJenis("pengeluaran");
                        setEditKategori("Kebutuhan Pokok");
                      }}
                      className={`w-1/2 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 border-0 ${editJenis === "pengeluaran" ? "bg-white text-red-500 shadow-sm" : "bg-transparent text-gray-400 hover:text-gray-600"}`}
                    >
                      📉 {t('Pengeluaran', 'Expenses')}
                    </button>
                    <button 
                      onClick={() => {
                        setEditJenis("pemasukan");
                        setEditKategori("Gaji & Upah");
                      }}
                      className={`w-1/2 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 border-0 ${editJenis === "pemasukan" ? "bg-white text-green-500 shadow-sm" : "bg-transparent text-gray-400 hover:text-gray-600"}`}
                    >
                      📈 {t('Pemasukan', 'Income')}
                    </button>
                  </div>
                </div>

                {/* CATEGORY GRID */}
                <div>
                  <label className="text-gray-500 text-[10px] font-bold uppercase tracking-widest block mb-2 px-1">{t('Pilih Kategori', 'Select Category')}</label>
                  <div className="grid grid-cols-3 gap-2">
                    {kategoriAktif.map((kat) => (
                      <button 
                        key={kat.id}
                        onClick={() => setEditKategori(kat.id)}
                        className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border transition-all duration-200 border-0 ${editKategori === kat.id ? "bg-[#112F58]/10 border-2 border-[#112F58] text-[#112F58] shadow-sm scale-102" : "bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-500"}`}
                      >
                        <span className="text-xl">{kat.icon}</span>
                        <span className="text-[10px] font-bold tracking-tight text-center truncate w-full">{kat.id}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* DATE SELECTOR */}
                <div>
                  <label className="text-gray-500 text-[10px] font-bold uppercase tracking-widest block mb-1.5 px-1">{t('Tanggal Transaksi', 'Transaction Date')}</label>
                  <div className="relative">
                    <input 
                      type="date" 
                      value={editTanggal} 
                      onChange={(e) => setEditTanggal(e.target.value)} 
                      className="w-full bg-gray-50 text-gray-700 border border-gray-200 rounded-2xl p-3 focus:border-[#112F58] focus:bg-white focus:outline-none transition-all text-sm font-semibold" 
                    />
                  </div>
                </div>

                {/* CATATAN (DESCRIPTION) OPTIONAL FIELD */}
                <div>
                  <label className="text-gray-500 text-[10px] font-bold uppercase tracking-widest block mb-1.5 px-1">{t('Catatan', 'Notes')}</label>
                  <input 
                    type="text" 
                    value={editCatatan} 
                    onChange={(e) => setEditCatatan(e.target.value)} 
                    placeholder={t('Misal: Sarapan pagi, dll...', 'E.g., Breakfast, etc...')} 
                    className="w-full bg-gray-50 text-gray-700 border border-gray-200 rounded-2xl p-3 focus:border-[#112F58] focus:bg-white focus:outline-none transition-all placeholder-gray-400 text-sm font-semibold" 
                  />
                </div>
              </div>

              {/* Modal action actions footer */}
              <div className="p-4 border-t border-gray-100 d-flex gap-2 font-sans">
                <button 
                  className="w-1/2 py-3 rounded-2xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold text-sm bg-white"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  {t('Batal', 'Cancel')}
                </button>
                <button 
                  className="w-1/2 py-3 rounded-2xl bg-[#112F58] hover:bg-[#1a4a86] text-white font-bold text-sm border-0"
                  onClick={handleSimpanEdit}
                >
                  {t('Simpan Perubahan', 'Save Changes')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
