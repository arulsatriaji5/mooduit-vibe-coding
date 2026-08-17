import React from 'react';
import { motion } from 'motion/react';
import { Shield, Lock, Trophy, Star, ChevronRight } from 'lucide-react';

export default function EmergencyFund() {
  const levels = [
    { title: 'Level 1: Dasar', target: '3 Bulan', status: 'In Progress', progress: 65, locked: false },
    { title: 'Level 2: Aman', target: '6 Bulan', status: 'Locked', progress: 0, locked: true },
    { title: 'Level 3: Mapan', target: '1 Tahun', status: 'Locked', progress: 0, locked: true },
    { title: 'Level 4: Legenda', target: '5 Tahun', status: 'Locked', progress: 0, locked: true },
  ];

  return (
    <div className="container py-4 pb-5 mb-5">
      <header className="text-center mb-5">
        <div className="p-3 bg-cream-mooduit text-brown-mooduit d-inline-block rounded-circle mb-3 shadow-sm">
          <Shield size={40} />
        </div>
        <h1 className="fw-800 text-primary-mooduit text-2xl md:text-3xl mb-1">Dana Darurat</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base leading-relaxed">Benteng pertahanan finansialmu supaya nggak gampang <i>panic attack</i> kalau ada apa-apa.</p>
      </header>

      {/* Main Progress Chart Placeholder */}
      <div className="card-mooduit mb-5 bg-primary-mooduit text-white overflow-hidden position-relative border-0 shadow-lg" style={{ borderRadius: '24px' }}>
        <div className="position-relative z-1">
          <span className="opacity-80 text-uppercase text-xs sm:text-sm font-bold tracking-wider mb-2 block">Total Terkumpul</span>
          <h2 className="text-3xl md:text-5xl font-black mb-4">Rp7.500.000</h2>
          
          <div className="mb-2 d-flex justify-content-between align-items-center">
            <span className="text-xs sm:text-sm opacity-80">Progress Level 1 (Dasar)</span>
            <span className="text-xs sm:text-sm fw-bold">65% Terisi</span>
          </div>
          <div className="progress-container-mooduit bg-white bg-opacity-20" style={{ height: '8px' }}>
            <motion.div 
              className="progress-fill-mooduit bg-white" 
              initial={{ width: 0 }}
              animate={{ width: '65%' }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
          <p className="mt-3 text-xs sm:text-sm opacity-85 leading-relaxed">Tinggal Rp2.500.000 lagi buat sikat Level 1!</p>
        </div>
      </div>

      <h2 className="fw-bold text-xl md:text-2xl mb-4">Misi Gamifikasi</h2>
      
      <div className="row g-3 mb-5">
        {levels.map((lvl, i) => (
          <div key={i} className="col-12">
            <motion.div 
              className={`card-mooduit border-0 ${lvl.locked ? 'locked-level' : 'bg-white'}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="d-flex align-items-center gap-3">
                <div className={`level-icon rounded-circle d-flex align-items-center justify-center`} style={{ width: '40px', height: '40px', background: lvl.locked ? '#eee' : 'var(--accent-cream)', color: lvl.locked ? '#999' : 'var(--accent-brown)', fontWeight: 'bold' }}>
                  {lvl.locked ? '🔒' : i + 1}
                </div>
                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="level-name font-bold text-sm sm:text-base">{lvl.title}</div>
                    {!lvl.locked && <span className="text-xs sm:text-sm text-muted font-bold">{lvl.progress}%</span>}
                  </div>
                  <div className="level-status text-xs sm:text-sm text-muted mb-2">Target: {lvl.target} biaya hidup.</div>
                  {lvl.progress > 0 && (
                    <div className="progress-container-mooduit" style={{ height: '4px' }}>
                      <div className="progress-fill-mooduit" style={{ width: `${lvl.progress}%` }}></div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        ))}
      </div>

      <div className="ambient-ai-box">
        <p className="text-xs sm:text-sm leading-relaxed mb-0">💡 <b>Ambient AI:</b> Berdasarkan histori pengeluaranmu, kamu butuh <b>Rp10.000.000</b> untuk Level 1. Semangat nambung!</p>
      </div>
    </div>
  );
}
