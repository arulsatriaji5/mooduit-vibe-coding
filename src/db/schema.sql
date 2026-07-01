-- SQL Schema for MOODUIT Application Authentication
-- Table name: users
-- This schema represents the secure storage requirements for new registered users.

CREATE TABLE IF NOT EXISTS users (
    -- Unique Identifier using UUID v4
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Unique user email for identification and credentials
    email VARCHAR(255) NOT NULL UNIQUE,
    
    -- Secure password representation
    -- CATATAN KEAMANAN (WAJIB): Kolom ini menyimpan password_hash. 
    -- Password asli pengguna HARUS di-hash menggunakan algoritma modern dan aman 
    -- seperti bcrypt atau argon2id di sisi backend server sebelum disimpan ke database. 
    -- SANGAT DILARANG keras menyimpan kata sandi dalam bentuk teks biasa (plain text).
    password_hash VARCHAR(255) NOT NULL,
    
    -- User's full display name
    nama_lengkap VARCHAR(255) NOT NULL,
    
    -- Auditing timestamp for account creation with timezone
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexing on email for high-performance credential lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);
