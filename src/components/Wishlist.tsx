import React from 'react';
import { motion } from 'motion/react';
import { Plus, Target, Sparkles, Star } from 'lucide-react';

export default function Wishlist() {
  const items: any[] = []; // Clear dummy data

  return (
    <div className="container py-4 pb-5 mb-5 h-100 flex-grow-1">
      <div className="d-flex justify-content-between align-items-center mb-5">
        <h1 className="fw-800 text-primary-mooduit text-2xl md:text-3xl mb-0">Wishlist & Goals</h1>
      </div>

      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <motion.div 
            className="text-center py-5"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="mb-4 position-relative d-inline-block">
              <div className="bg-light rounded-circle p-5 shadow-sm" style={{ color: '#B9AB8C' }}>
                <Target size={80} strokeWidth={1.5} />
              </div>
              <motion.div 
                className="position-absolute top-0 end-0 bg-white p-2 rounded-circle shadow-sm"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Star size={20} className="text-secondary-mooduit" fill="currentColor" />
              </motion.div>
            </div>

            <h2 className="fw-800 text-primary-mooduit text-xl md:text-2xl mb-3">Belum Ada Target Impian</h2>
            <p className="text-muted text-sm md:text-base leading-relaxed mb-5 px-4">
              Yuk, tentukan barang impian atau tujuan finansialmu, biar AI kami bantu atur tabungannya!
            </p>

            <button className="btn btn-mooduit-primary btn-lg w-100 rounded-2xl py-3 fw-800 shadow-lg d-flex align-items-center justify-content-center gap-2 transition-all hover:scale-[1.02] text-sm md:text-base cursor-pointer">
              <Plus size={24} />
              <span>Tambah Wishlist Baru</span>
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
