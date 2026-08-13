import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Image as ImageIcon, Check, X, Loader2, Save, AlertCircle, RefreshCw } from 'lucide-react';
import { insertTransaction } from '../utils/api';
import { toast } from 'react-hot-toast';

interface ScannerProps {
  onNavigate: (page: string, data?: any) => void;
  transactions?: any[];
  setTransactions?: React.Dispatch<React.SetStateAction<any[]>>;
}

export default function Scanner({ onNavigate, transactions, setTransactions }: ScannerProps) {
  const [step, setStep] = useState<'capture' | 'loading' | 'result'>('capture');
  const [kameraError, setKameraError] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  
  // State hasilOcr diperbarui dengan penambahan 'jenis' transaksi
  const [hasilOcr, setHasilOcr] = useState<{
    totalHarga: number;
    tanggal: string;
    kategori: string;
    nama: string;
    uangBayar: number;
    icon: string;
    items?: { namaItem: string; harga: number }[];
    jenis: 'pengeluaran' | 'pemasukan';
  }>({
    totalHarga: 0,
    tanggal: '',
    kategori: 'Kebutuhan Pokok',
    nama: '',
    uangBayar: 0,
    icon: '🛒',
    items: [],
    jenis: 'pengeluaran'
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  // Kategori dipisah menjadi Pengeluaran dan Pemasukan
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

  const kategoriAktif = hasilOcr.jenis === "pengeluaran" ? kategoriPengeluaran : kategoriPemasukan;

  useEffect(() => {
    let stream: MediaStream | null = null;
    let timer: any = null;

    const startCamera = async () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      try {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: facingMode } 
          });
        } catch (err) {
          console.warn(`Gagal memuat kamera ${facingMode}, mencoba fallback...`);
          stream = await navigator.mediaDevices.getUserMedia({ video: true });
        }

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(e => console.warn("Auto-play dicegah browser:", e));
        }
        setKameraError(false);
        setIsCameraActive(true);
      } catch (err) {
        console.warn("Akses kamera ditolak atau diblokir sandbox:", err);
        setKameraError(true);
        setIsCameraActive(false);
      }
    };

    if (step === 'capture') {
      timer = setTimeout(() => {
        startCamera();
      }, 150);
    }

    return () => {
      clearTimeout(timer);
      setIsCameraActive(false);
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (videoRef.current && videoRef.current.srcObject) {
        const activeStream = videoRef.current.srcObject as MediaStream;
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [facingMode, step]);

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = error => reject(error);
    });
  };

  const memprosesGambarDenganVisionAPI = async (file: File) => {
    try {
      const rawImage = await fileToBase64(file);
      const cleanBase64 = rawImage.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");
      const mimeType = file.type || "image/jpeg";
      const tempGeminiKey = localStorage.getItem("TEMP_GEMINI_KEY") || "";

      const response = await fetch("/api/scan-receipt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          image: cleanBase64,
          mimeType: mimeType,
          tempGeminiKey
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Gagal menganalisa struk");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Gagal menjalankan OCR Gemini:", error);
      throw error;
    }
  };

  const handleProsesStrukAsli = async (file: File) => {
    setStep('loading');
    
    try {
      const data = await memprosesGambarDenganVisionAPI(file);
      
      setHasilOcr({
        totalHarga: data.totalAmount || 0,
        tanggal: data.date || new Date().toISOString().split('T')[0],
        kategori: data.category || "Kebutuhan Pokok",
        nama: data.merchantName && data.merchantName.trim() !== "" ? data.merchantName : "Merchant Tidak Terdeteksi",
        uangBayar: data.cashPaid || data.totalAmount || 0,
        icon: data.icon || "🛒",
        items: data.items || [],
        jenis: 'pengeluaran' // Default hasil scan selalu pengeluaran
      });
      
      setStep('result');
      if (data.isFallback) {
        toast.success("Struk diproses dengan Simulasi AI Ekstraksi!");
      } else {
        toast.success("Struk berhasil dianalisis oleh Gemini!");
      }
    } catch (error) {
      console.error("Gagal membaca struk secara fisik:", error);
      setHasilOcr({
        totalHarga: 0,
        tanggal: new Date().toISOString().split('T')[0],
        kategori: "Lainnya",
        nama: "Merchant Tidak Terdeteksi",
        uangBayar: 0,
        icon: "📦",
        items: [],
        jenis: 'pengeluaran'
      });
      setStep('result');
      toast.error("Gagal menganalisis struk. Silakan coba lagi.");
    }
  };

  const saveTransaction = () => {
    const tempId = Date.now();
    const newTransaction = {
      id: tempId,
      nominal: hasilOcr.totalHarga,
      catatan: hasilOcr.nama,
      kategori: hasilOcr.kategori,
      tanggal: hasilOcr.tanggal,
      jenis: hasilOcr.jenis, // Sekarang mengikuti state 'jenis' yang baru
      icon: hasilOcr.icon
    };

    // Optimistic state sync
    const user_email = localStorage.getItem("userEmail") || "";
    if (setTransactions) {
      setTransactions(prev => [newTransaction, ...prev]);
    }
    
    onNavigate('dashboard', {
      nominal: hasilOcr.totalHarga.toString(),
      catatan: hasilOcr.nama,
      kategori: hasilOcr.kategori,
      openManual: false
    });

    // Persistent save in database in background
    insertTransaction(newTransaction, user_email).then((inserted) => {
      if (setTransactions) {
        setTransactions(prev => {
          const index = prev.findIndex(t => String(t.id) === String(tempId));
          if (index !== -1) {
            const next = [...prev];
            next[index] = inserted;
            return next;
          }
          return prev;
        });
      }
      if (typeof window !== "undefined" && (window as any).triggerTransactionSuccess) {
        (window as any).triggerTransactionSuccess(inserted.currentStreak, inserted.streakIncreasedToday, {
          type: inserted.type,
          amount: inserted.amount,
          category: inserted.category
        });
      }
    }).catch((err) => {
      console.error("Failed to persist OCR transaction to DB:", err);
      if (typeof window !== "undefined" && (window as any).triggerTransactionSuccess) {
        (window as any).triggerTransactionSuccess(undefined, undefined, {
          type: newTransaction.jenis,
          amount: newTransaction.nominal,
          category: newTransaction.kategori
        });
      }
    });
  };

  const captureImage = async () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(async (blob) => {
          if (blob) {
            const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
            handleProsesStrukAsli(file);
          }
        }, 'image/jpeg');
      }
    } else if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        canvas.toBlob(async (blob) => {
          if (blob) {
            const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
            handleProsesStrukAsli(file);
          }
        }, 'image/jpeg');
      }
    }
  };

  return (
    <div className="container py-4 min-vh-80 d-flex flex-column align-items-center justify-content-center">
      <AnimatePresence mode="wait">
        {step === 'capture' && (
          <motion.div 
            key="capture"
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -20 }}
            className="w-100 text-center"
            style={{ maxWidth: '420px' }}
          >
            <div className="d-flex align-items-center justify-content-between mb-4 w-100 px-2">
              <button className="btn btn-light rounded-circle shadow-sm p-2" onClick={() => onNavigate('dashboard')}><X size={20}/></button>
              <h4 className="fw-800 text-primary-mooduit mb-0">Scan Transaksi</h4>
              <div style={{ width: '36px' }}></div>
            </div>

            <div className="relative w-full max-w-sm aspect-[3/4] bg-black rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center mb-5 mx-auto">
              <video 
                ref={videoRef} 
                autoPlay={true}
                playsInline={true}
                muted={true}
                className="absolute top-0 left-0 w-full h-full object-cover z-0" 
              ></video>
              
              <canvas ref={canvasRef} className="hidden"></canvas>
              
              <div className="absolute inset-x-8 top-12 bottom-20 border-2 border-white/30 z-10 rounded-xl pointer-events-none">
                 <div className="absolute top-1/2 left-0 w-full h-[2px] bg-teal-400 shadow-[0_0_15px_rgba(45,212,191,0.8)] z-30 animate-pulse"></div>
              </div>
              
              <p className="absolute bottom-6 left-0 right-0 text-center text-white text-xs font-bold tracking-wider z-20 bg-black/40 py-1">
                ARAHKAN KE STRUK
              </p>
            </div>

            <div className="d-flex align-items-center justify-content-center gap-4">
              <button 
                className="d-flex flex-column align-items-center gap-1 btn border-0 p-0 text-muted hover:text-primary-mooduit transition-all"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="bg-light rounded-circle p-3 shadow-sm mb-1">
                  <ImageIcon size={22} />
                </div>
                <span className="fw-bold x-small">Upload</span>
              </button>

              <button 
                className="btn bg-white rounded-circle p-1 shadow-lg border-2 border-primary-mooduit transition-all hover:scale-105" 
                style={{ width: '82px', height: '82px' }}
                onClick={captureImage}
              >
                <div className="bg-primary-mooduit rounded-circle w-100 h-100 d-flex align-items-center justify-content-center text-white">
                  <Camera size={28} />
                </div>
              </button>

              <button 
                className="d-flex flex-column align-items-center gap-1 btn border-0 p-0 text-muted hover:text-primary-mooduit transition-all"
                onClick={toggleCamera}
              >
                <div className="bg-light rounded-circle p-3 shadow-sm mb-1">
                  <RefreshCw size={22} />
                </div>
                <span className="fw-bold x-small">Tukar</span>
              </button>
            </div>

            <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={(e) => {
              if (e.target.files?.[0]) {
                handleProsesStrukAsli(e.target.files[0]);
              }
            }} />
          </motion.div>
        )}

        {step === 'loading' && (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="min-h-screen d-flex flex-column align-items-center justify-center text-center p-4"
          >
            <div className="p-5 bg-white shadow-sm rounded-xl w-100" style={{ maxWidth: '400px' }}>
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="mb-4 d-inline-block text-primary-mooduit"
              >
                <Loader2 size={48} />
              </motion.div>
              <h5 className="fw-bold mb-3">Menganalisis Struk...</h5>
              <div className="skeleton-loader h-2 rounded-full mb-2 w-100"></div>
              <div className="skeleton-loader h-2 rounded-full mb-4 w-75 mx-auto"></div>
              <p className="text-muted small">✨ AI sedang menganalisa strukmu...</p>
            </div>
          </motion.div>
        )}

        {step === 'result' && (
          <motion.div 
            key="result"
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-100"
            style={{ maxWidth: '440px' }}
          >
            <div className="text-center mb-5">
              <div className="bg-white rounded-circle shadow-lg d-inline-flex align-items-center justify-content-center mb-4" style={{ width: '80px', height: '80px', fontSize: '32px' }}>
                {hasilOcr.icon}
              </div>
              <h3 className="fw-800 text-[#112F58] mb-1">{hasilOcr.nama}</h3>
              <p className="text-muted small fw-bold tracking-widest uppercase">✨ Analisa AI MOODUIT (Cek & Edit Hasil)</p>
            </div>

            <div className="bg-white rounded-[2.5rem] p-6 shadow-2xl border border-gray-100 mb-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 shadow-sm">
                  <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  AKURAT
                </div>
              </div>

              <div className="space-y-6 pt-4 text-left">
                {/* NOMINAL UTAMA */}
                <div>
                  <label className="text-gray-400 x-small fw-bold uppercase tracking-widest mb-2 block">Total Belanja (Dicatat)</label>
                  <div className="flex items-baseline gap-2 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                    <span className="text-2xl font-bold text-[#112F58]">Rp</span>
                    <input 
                      type="text" 
                      className="bg-transparent border-0 text-4xl font-extrabold text-[#112F58] focus:outline-none w-full" 
                      value={hasilOcr.totalHarga.toLocaleString('id-ID')}
                      onChange={(e) => {
                        const rawValue = e.target.value.replace(/\D/g, "");
                        setHasilOcr(prev => ({ ...prev, totalHarga: Number(rawValue) }));
                      }}
                    />
                  </div>
                </div>

                {/* MERCHANT / CATATAN */}
                <div>
                  <label className="text-gray-400 x-small fw-bold uppercase tracking-widest mb-1 block">Merchant / Catatan</label>
                  <input 
                    type="text" 
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm font-bold text-[#112F58] focus:border-[#112F58] focus:outline-none" 
                    value={hasilOcr.nama}
                    onChange={(e) => setHasilOcr(prev => ({ ...prev, nama: e.target.value }))}
                  />
                </div>

                {/* TOGGLE PENGELUARAN / PEMASUKAN DENGAN HOVER LENGKUNG */}
                <div>
                  <label className="text-gray-400 text-[10px] font-bold uppercase tracking-widest block mb-1.5 px-1 font-sans">Jenis Transaksi</label>
                  <div className="flex bg-gray-100 dark:bg-slate-800 rounded-xl overflow-hidden p-1 border border-slate-200 dark:border-slate-700">
                    <button 
                      type="button"
                      onClick={() => setHasilOcr(prev => ({ ...prev, jenis: "pengeluaran", kategori: "Kebutuhan Pokok", icon: "🛒" }))}
                      className={`flex-1 py-2.5 text-xs font-bold transition-all duration-300 border-0 cursor-pointer rounded-l-lg rounded-r-none ${hasilOcr.jenis === "pengeluaran" ? "bg-white dark:bg-slate-700 text-red-500 shadow-sm" : "bg-transparent text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700/50 hover:text-gray-600 dark:hover:text-gray-200"}`}
                    >
                      📉 Pengeluaran
                    </button>
                    <button 
                      type="button"
                      onClick={() => setHasilOcr(prev => ({ ...prev, jenis: "pemasukan", kategori: "Gaji & Upah", icon: "💰" }))}
                      className={`flex-1 py-2.5 text-xs font-bold transition-all duration-300 border-0 cursor-pointer rounded-r-lg rounded-l-none ${hasilOcr.jenis === "pemasukan" ? "bg-white dark:bg-slate-700 text-emerald-500 shadow-sm" : "bg-transparent text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700/50 hover:text-gray-600 dark:hover:text-gray-200"}`}
                    >
                      📈 Pemasukan
                    </button>
                  </div>
                </div>

                {/* KATEGORI GRID DENGAN SOLID NAVY SAAT AKTIF */}
                <div>
                  <label className="text-gray-400 text-[10px] font-bold uppercase tracking-widest block mb-2 px-1">Pilih Kategori</label>
                  <div className="grid grid-cols-3 gap-2">
                    {kategoriAktif.map((kat) => (
                       <button 
                        key={kat.id}
                        type="button"
                        onClick={() => setHasilOcr(prev => ({ ...prev, kategori: kat.id, icon: kat.icon }))}
                        className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border-2 transition-all duration-200 cursor-pointer ${hasilOcr.kategori === kat.id ? "bg-[#112f58] border-[#112f58] text-white shadow-md scale-[1.02]" : "bg-gray-50 dark:bg-slate-800 border-transparent hover:border-[#112f58]/30 dark:hover:border-slate-500 text-gray-500 dark:text-gray-300"}`}
                      >
                        <span className="text-xl">{kat.icon}</span>
                        <span className={`text-[10px] font-bold tracking-tight text-center truncate w-full ${hasilOcr.kategori === kat.id ? 'text-white' : ''}`}>{kat.id}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* TANGGAL */}
                <div>
                  <label className="text-gray-400 x-small fw-800 uppercase block mb-1">Tanggal</label>
                  <input 
                    type="date" 
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-xs font-bold text-[#112F58] focus:border-[#112F58] focus:outline-none" 
                    value={hasilOcr.tanggal}
                    onChange={(e) => setHasilOcr(prev => ({ ...prev, tanggal: e.target.value }))}
                  />
                </div>

                {/* DAFTAR ITEM (HANYA MUNCUL JIKA ADA) */}
                {hasilOcr.items && hasilOcr.items.length > 0 && (
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 mt-4">
                    <label className="text-gray-400 text-[10px] fw-bold uppercase tracking-widest mb-2 block">Daftar Barang Belanja (Itemized)</label>
                    <div className="space-y-1.5 pr-2" style={{ maxHeight: '120px', overflowY: 'auto' }}>
                      {hasilOcr.items.map((it, idx) => (
                        <div key={idx} className="d-flex justify-content-between align-items-center text-xs pb-1 border-b border-gray-200 last:border-0">
                          <span className="text-gray-600 font-medium truncate pr-2">{it.namaItem}</span>
                          <span className="text-[#112F58] font-bold shrink-0">Rp {it.harga.toLocaleString('id-ID')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
              </div>
            </div>

            <div className="space-y-3 pb-8">
              <button 
                className="w-100 py-4 rounded-[1.5rem] bg-[#112F58] text-white font-bold text-lg shadow-xl hover:scale-[0.98] active:scale-95 transition-all flex items-center justify-center gap-2 border-0 cursor-pointer"
                onClick={saveTransaction}
              >
                <Save size={24} />
                <span>Konfirmasi & Simpan</span>
              </button>
              
              <button 
                className="w-100 py-3 rounded-xl text-muted text-sm font-bold hover:text-[#112F58] transition-colors border-0 bg-transparent cursor-pointer"
                onClick={() => setStep('capture')}
              >
                Ulangi Scan Struk
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}