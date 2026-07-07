import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import fs from "fs/promises";
import { writeFileSync } from "fs";
import nodemailer from "nodemailer";
import crypto from "crypto";
import { createClient } from "@libsql/client";

dotenv.config({ override: true });

const resolvedFilename = typeof import.meta !== "undefined" && import.meta.url
  ? fileURLToPath(import.meta.url)
  : (typeof __filename !== "undefined" ? __filename : "");

const resolvedDirname = typeof __dirname !== "undefined"
  ? __dirname
  : (resolvedFilename ? path.dirname(resolvedFilename) : process.cwd());

// Turso Connection Initialization with SQLite local file fallback for maximum resilience
const dbUrl = process.env.VITE_TURSO_DATABASE_URL || process.env.TURSO_DATABASE_URL || "file:local.db";
const dbAuthToken = process.env.VITE_TURSO_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN;

const db = createClient({
  url: dbUrl,
  authToken: dbAuthToken,
});

async function initDB() {
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT,
        email TEXT UNIQUE,
        password TEXT,
        picture TEXT,
        authProvider TEXT,
        resetToken TEXT,
        resetTokenExpiry INTEGER
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        amount REAL,
        type TEXT,
        category TEXT,
        description TEXT,
        created_at TEXT
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS budgets (
        id TEXT PRIMARY KEY,
        total_income REAL,
        limit_50 REAL,
        limit_30 REAL,
        limit_20 REAL
      )
    `);

    // Try migrating existing db.json to Turso/SQLite if tables are empty
    try {
      const dbJsonPath = path.join(process.cwd(), "db.json");
      const exists = await fs.access(dbJsonPath).then(() => true).catch(() => false);
      if (exists) {
        console.log("Found db.json, starting migration to Turso/libSQL...");
        const raw = await fs.readFile(dbJsonPath, "utf-8");
        const data = JSON.parse(raw);
        
        // Migrate users
        if (data.users && Array.isArray(data.users)) {
          for (const user of data.users) {
            try {
              await db.execute({
                sql: `INSERT OR IGNORE INTO users (id, name, email, password, picture, authProvider, resetToken, resetTokenExpiry)
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                args: [
                  user.id,
                  user.name,
                  user.email,
                  user.password || null,
                  user.picture || null,
                  user.authProvider,
                  user.resetToken || null,
                  user.resetTokenExpiry || null
                ]
              });
            } catch (err) {
              console.error(`Migration error for user ${user.email}:`, err);
            }
          }
        }

        // Migrate transactions
        if (data.transactions && Array.isArray(data.transactions)) {
          for (const t of data.transactions) {
            try {
              await db.execute({
                sql: `INSERT OR IGNORE INTO transactions (id, amount, type, category, description, created_at)
                      VALUES (?, ?, ?, ?, ?, ?)`,
                args: [
                  t.id,
                  t.amount,
                  t.type,
                  t.category,
                  t.description,
                  t.created_at
                ]
              });
            } catch (err) {
              console.error(`Migration error for transaction ${t.id}:`, err);
            }
          }
        }

        // Migrate budgets
        if (data.budgets && Array.isArray(data.budgets)) {
          for (const b of data.budgets) {
            try {
              await db.execute({
                sql: `INSERT OR IGNORE INTO budgets (id, total_income, limit_50, limit_30, limit_20)
                      VALUES (?, ?, ?, ?, ?)`,
                args: [
                  b.id,
                  b.total_income,
                  b.limit_50,
                  b.limit_30,
                  b.limit_20
                ]
              });
            } catch (err) {
              console.error(`Migration error for budget ${b.id}:`, err);
            }
          }
        }

        // Securely delete db.json from the project after successful migration
        await fs.unlink(dbJsonPath);
        console.log("Migration complete. db.json has been safely deleted.");
      }
    } catch (migErr) {
      console.error("Migration from db.json failed:", migErr);
    }

    // Ensure 'global' budget row exists
    const res = await db.execute("SELECT * FROM budgets WHERE id = 'global'");
    if (res.rows.length === 0) {
      await db.execute({
        sql: "INSERT INTO budgets (id, total_income, limit_50, limit_30, limit_20) VALUES ('global', 0, 0, 0, 0)",
        args: []
      });
    }
  } catch (error: any) {
    console.error("Critical error during database initialization:", error.message || error);
  }
}

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

async function startServer() {
  await initDB();

  // API Tables
  app.get("/api/transactions", async (req, res) => {
    try {
      const result = await db.execute("SELECT * FROM transactions ORDER BY created_at DESC, id DESC");
      res.json(result.rows);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/transactions", async (req, res) => {
    try {
      const { amount, type, category, description, created_at, id } = req.body;
      const newTx = {
        id: id ? String(id) : String(Date.now()),
        amount: Number(amount) || 0,
        type: type === 'income' ? 'income' : 'expense',
        category: category || 'Lainnya',
        description: description || '',
        created_at: created_at || new Date().toISOString().split('T')[0]
      };
      
      await db.execute({
        sql: "INSERT INTO transactions (id, amount, type, category, description, created_at) VALUES (?, ?, ?, ?, ?, ?)",
        args: [newTx.id, newTx.amount, newTx.type, newTx.category, newTx.description, newTx.created_at]
      });

      res.status(201).json(newTx);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put("/api/transactions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { amount, type, category, description, created_at } = req.body;
      
      const result = await db.execute({
        sql: "SELECT * FROM transactions WHERE id = ?",
        args: [id]
      });
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Transaction not found" });
      }
      
      const existing = result.rows[0];
      const updated = {
        id,
        amount: amount !== undefined ? Number(amount) : Number(existing.amount),
        type: type !== undefined ? (type === 'income' ? 'income' : 'expense') : String(existing.type),
        category: category !== undefined ? category : String(existing.category),
        description: description !== undefined ? description : String(existing.description),
        created_at: created_at !== undefined ? created_at : String(existing.created_at)
      };
      
      await db.execute({
        sql: "UPDATE transactions SET amount = ?, type = ?, category = ?, description = ?, created_at = ? WHERE id = ?",
        args: [updated.amount, updated.type, updated.category, updated.description, updated.created_at, id]
      });

      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/transactions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const check = await db.execute({
        sql: "SELECT * FROM transactions WHERE id = ?",
        args: [id]
      });
      if (check.rows.length === 0) {
        return res.status(404).json({ error: "Transaction not found" });
      }
      
      await db.execute({
        sql: "DELETE FROM transactions WHERE id = ?",
        args: [id]
      });
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/budgets", async (req, res) => {
    try {
      const result = await db.execute("SELECT * FROM budgets WHERE id = 'global'");
      res.json(result.rows[0] || null);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/budgets", async (req, res) => {
    try {
      const { total_income, limit_50, limit_30, limit_20 } = req.body;
      const newBudget = {
        id: 'global',
        total_income: Number(total_income) || 0,
        limit_50: Number(limit_50) || 0,
        limit_30: Number(limit_30) || 0,
        limit_20: Number(limit_20) || 0
      };
      
      await db.execute({
        sql: `INSERT INTO budgets (id, total_income, limit_50, limit_30, limit_20) 
              VALUES ('global', ?, ?, ?, ?) 
              ON CONFLICT(id) DO UPDATE SET total_income = excluded.total_income, limit_50 = excluded.limit_50, limit_30 = excluded.limit_30, limit_20 = excluded.limit_20`,
        args: [newBudget.total_income, newBudget.limit_50, newBudget.limit_30, newBudget.limit_20]
      });

      res.status(200).json(newBudget);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Authentication APIs
  app.post("/api/register", async (req, res) => {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ error: "Kolom wajib diisi" });
      }

      const existingUser = await db.execute({
        sql: "SELECT * FROM users WHERE LOWER(email) = LOWER(?)",
        args: [email]
      });
      if (existingUser.rows.length > 0) {
        return res.status(400).json({ error: "Email sudah terdaftar!" });
      }

      const id = String(Date.now());
      await db.execute({
        sql: "INSERT INTO users (id, name, email, password, authProvider) VALUES (?, ?, ?, ?, 'local')",
        args: [id, name, email, password]
      });

      res.status(201).json({ id, name, email, authProvider: 'local' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Email dan kata sandi wajib diisi" });
      }

      const result = await db.execute({
        sql: "SELECT * FROM users WHERE LOWER(email) = LOWER(?)",
        args: [email]
      });
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Email tidak terdaftar!" });
      }

      const user = result.rows[0];
      if (user.password !== password) {
        return res.status(401).json({ error: "Kata sandi salah!" });
      }

      res.json({ id: user.id, name: user.name, email: user.email, picture: user.picture, authProvider: user.authProvider });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get(["/api/auth/google/callback", "/api/auth/google/callback/"], (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Google Auth Callback</title>
        </head>
        <body style="background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
          <div style="max-width: 400px; margin: 100px auto; text-align: center; padding: 30px; border-radius: 12px; background: white; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
            <div style="display: inline-block; width: 40px; height: 40px; border: 3px solid #f1f5f9; border-radius: 50%; border-top-color: #0d9488; animation: spin 1s linear infinite; margin-bottom: 20px;"></div>
            <h3 style="margin: 0 0 10px 0; color: #0f172a; font-size: 18px; font-weight: 600;">Menghubungkan Akun Google</h3>
            <p style="margin: 0; color: #64748b; font-size: 14px;">Mohon tunggu sebentar selagi kami mengautentikasi data Anda...</p>
            <style>
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            </style>
          </div>
          <script>
            // Parse token from fragment hash
            const params = new URLSearchParams(window.location.hash.substring(1));
            const accessToken = params.get('access_token');
            const error = params.get('error');

            if (error) {
              if (window.opener) {
                window.opener.postMessage({ type: 'GOOGLE_AUTH_FAILURE', error }, '*');
              }
              window.close();
            } else if (accessToken) {
              fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { 'Authorization': 'Bearer ' + accessToken }
              })
              .then(r => {
                if (!r.ok) throw new Error('Gagal mengambil profil dari Google');
                return r.json();
              })
              .then(userInfo => {
                if (window.opener) {
                  window.opener.postMessage({ type: 'GOOGLE_AUTH_SUCCESS', userInfo }, '*');
                }
                window.close();
              })
              .catch(err => {
                if (window.opener) {
                  window.opener.postMessage({ type: 'GOOGLE_AUTH_FAILURE', error: err.message }, '*');
                }
                window.close();
              });
            } else {
              const queryParams = new URLSearchParams(window.location.search);
              const queryError = queryParams.get('error');
              if (queryError) {
                if (window.opener) {
                  window.opener.postMessage({ type: 'GOOGLE_AUTH_FAILURE', error: queryError }, '*');
                }
                window.close();
              } else {
                setTimeout(() => {
                  if (!window.location.hash) {
                    if (window.opener) {
                      window.opener.postMessage({ type: 'GOOGLE_AUTH_FAILURE', error: 'No access token found' }, '*');
                    }
                    window.close();
                  }
                }, 2000);
              }
            }
          </script>
        </body>
      </html>
    `);
  });

  app.post("/api/google-login", async (req, res) => {
    try {
      const { email, name, picture } = req.body;

      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      const result = await db.execute({
        sql: "SELECT * FROM users WHERE LOWER(email) = LOWER(?)",
        args: [email]
      });

      let user;
      if (result.rows.length === 0) {
        const id = String(Date.now());
        const userPicture = picture || "";
        const userName = name || "Sobat Cuan";
        await db.execute({
          sql: "INSERT INTO users (id, name, email, picture, authProvider) VALUES (?, ?, ?, ?, 'google')",
          args: [id, userName, email, userPicture]
        });
        user = { id, name: userName, email, picture: userPicture, authProvider: 'google' };
      } else {
        user = result.rows[0];
      }

      res.json({ id: user.id, name: user.name, email: user.email, picture: user.picture, authProvider: user.authProvider });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/change-password", async (req, res) => {
    try {
      const { email, oldPassword, newPassword } = req.body;

      if (!email || !oldPassword || !newPassword) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const result = await db.execute({
        sql: "SELECT * FROM users WHERE LOWER(email) = LOWER(?)",
        args: [email]
      });
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      const user = result.rows[0];
      if (user.authProvider === 'google') {
        return res.status(400).json({ error: "Akun Google tidak menggunakan kata sandi lokal" });
      }

      if (user.password !== oldPassword) {
        return res.status(401).json({ error: "Kata sandi lama salah!" });
      }

      await db.execute({
        sql: "UPDATE users SET password = ? WHERE id = ?",
        args: [newPassword, user.id]
      });

      res.json({ success: true, message: "Kata sandi berhasil diubah" });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: "Email wajib diisi" });
      }

      const result = await db.execute({
        sql: "SELECT * FROM users WHERE LOWER(email) = LOWER(?)",
        args: [email]
      });
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Email tidak ditemukan!" });
      }

      const user = result.rows[0];
      if (user.authProvider === 'google') {
        return res.status(400).json({ error: "Akun ini menggunakan Google Login. Anda tidak dapat mengatur ulang kata sandi." });
      }

      // Generate a secure random resetToken
      const resetToken = crypto.randomBytes(24).toString("hex");
      const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now

      await db.execute({
        sql: "UPDATE users SET resetToken = ?, resetTokenExpiry = ? WHERE id = ?",
        args: [resetToken, resetTokenExpiry, user.id]
      });

      const baseUrl = (process.env.VITE_APP_URL || process.env.APP_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, "");
      const recoveryLink = `${baseUrl}/reset-password?token=${resetToken}`;

      console.log("=========================================");
      console.log(`PASSWORD RESET REQUESTED FOR: ${email}`);
      console.log(`Recovery link (Dynamic): ${recoveryLink}`);
      console.log("=========================================");

      const smtpEmail = process.env.VITE_SMTP_EMAIL || process.env.SMTP_EMAIL;
      const smtpPassword = process.env.VITE_SMTP_PASSWORD || process.env.SMTP_PASSWORD;

      if (!smtpEmail || !smtpPassword) {
        console.warn("SMTP email/password not configured in .env. Falling back to Console-only reset link.");
        return res.json({ 
          success: true, 
          message: "Instruksi pemulihan dikirim ke email Anda! (Mode Uji: Silakan periksa konsol server untuk tautan reset)",
          debugResetUrl: recoveryLink 
        });
      }

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: smtpEmail,
          pass: smtpPassword,
        },
      });

      const mailOptions = {
        from: `"MOODUIT Support" <${smtpEmail}>`,
        to: email,
        subject: "Atur Ulang Kata Sandi MOODUIT Anda",
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2>Halo, ${user.name}!</h2>
            <p>Kami menerima permintaan untuk mengatur ulang kata sandi akun MOODUIT Anda.</p>
            <p>Silakan klik tombol di bawah ini untuk mengatur ulang kata sandi Anda. Tautan ini berlaku selama 1 jam.</p>
            <div style="margin: 24px 0;">
              <a href="${recoveryLink}" style="background-color: #0d9488; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Atur Ulang Kata Sandi</a>
            </div>
            <p>Atau salin dan tempel tautan berikut ke browser Anda:</p>
            <p style="word-break: break-all; color: #0d9488;">${recoveryLink}</p>
            <p>Jika Anda tidak merasa meminta pengaturan ulang kata sandi, abaikan email ini.</p>
            <br/>
            <hr style="border: none; border-top: 1px solid #eee;"/>
            <p style="font-size: 12px; color: #777;">Tim Layanan Keamanan MOODUIT AI Advisor</p>
          </div>
        `
      };

      try {
        await transporter.sendMail(mailOptions);
        res.json({ success: true, message: "Email instruksi pemulihan telah dikirim!" });
      } catch (mailErr: any) {
        console.error("Nodemailer failed to send email:", mailErr);
        res.json({ 
          success: true, 
          message: "Tautan reset berhasil dibuat di konsol server, tetapi pengiriman email gagal. (Periksa log server)",
          debugResetUrl: recoveryLink
        });
      }

    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/reset-password", async (req, res) => {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return res.status(400).json({ error: "Token dan kata sandi baru wajib diisi!" });
      }

      const result = await db.execute({
        sql: "SELECT * FROM users WHERE resetToken = ? AND resetTokenExpiry > ?",
        args: [token, Date.now()]
      });

      if (result.rows.length === 0) {
        return res.status(400).json({ error: "Token tidak valid atau sudah kedaluwarsa!" });
      }

      const user = result.rows[0];

      await db.execute({
        sql: "UPDATE users SET password = ?, resetToken = NULL, resetTokenExpiry = NULL WHERE id = ?",
        args: [newPassword, user.id]
      });

      res.json({ success: true, message: "Kata sandi Anda berhasil diperbarui! Silakan masuk kembali." });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Helper to fetch the Gemini API key dynamically, supporting multiple environment formats securely
  function getGeminiApiKey(): string {
    if (typeof process !== "undefined" && process.env) {
      if (process.env.VITE_GEMINI_API_KEY) {
        return process.env.VITE_GEMINI_API_KEY;
      }
      if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY") {
        return process.env.GEMINI_API_KEY;
      }
    }
    try {
      const metaEnv = (import.meta as any).env;
      if (metaEnv && metaEnv.VITE_GEMINI_API_KEY) {
        return metaEnv.VITE_GEMINI_API_KEY;
      }
    } catch (e) {
      // ignore
    }
    return "";
  }

  let aiInstance: GoogleGenAI | null = null;
  let cachedApiKey: string = "";

  function getAiClient(): GoogleGenAI {
    const apiKey = getGeminiApiKey();
    if (!apiKey) {
      throw new Error("Sistem: VITE_GEMINI_API_KEY belum dipasang di Secrets/Environment Variables.");
    }
    if (aiInstance && cachedApiKey === apiKey) {
      return aiInstance;
    }
    cachedApiKey = apiKey;
    aiInstance = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    return aiInstance;
  }

  // API Scan Receipt
  app.post("/api/scan-receipt", async (req, res) => {
    try {
      const { image, mimeType } = req.body;

      if (!image || !mimeType) {
        return res.status(400).json({ error: "Missing image or mimeType" });
      }

      const prompt = `Ekstrak data dari gambar struk ini secara akurat. Ambil: 1. Nama Merchant/Toko (Jika tidak terdeteksi atau tidak ada, WAJIB tulis 'Merchant Tidak Diketahui'), 2. Total Belanja Asli (Bukan uang tunai yang dibayar), 3. Nominal Tunai/Bayar, 4. Kembalian, 5. Tanggal Transaksi, 6. Kategori yang paling cocok.`;

      const ai = getAiClient();
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: {
          parts: [
            {
              inlineData: {
                data: image,
                mimeType: mimeType
              }
            },
            {
              text: prompt
            }
          ]
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              merchantName: { type: Type.STRING },
              totalAmount: { type: Type.NUMBER },
              cashPaid: { type: Type.NUMBER },
              change: { type: Type.NUMBER },
              date: { type: Type.STRING },
              category: { type: Type.STRING },
              icon: { type: Type.STRING, description: "One representative emoji for the category" }
            },
            required: ["merchantName", "totalAmount", "cashPaid", "change", "date", "category", "icon"]
          }
        }
      });

      const result = JSON.parse(response.text);
      res.json(result);
    } catch (error: any) {
      console.error("OCR Error:", error);
      res.status(500).json({ error: error.message || "Failed to process receipt" });
    }
  });

  // API Chat Advisor
  app.post("/api/chat", async (req, res) => {
    let messages: any[] = [];
    let language = "id";
    let targetImpian: any[] = [];
    let totalSaldo = 0;
    let budget = { total_income: 0, limit_50: 0, limit_30: 0, limit_20: 0 };

    try {
      const body = req.body || {};
      messages = body.messages || [];
      language = body.language || "id";
      targetImpian = body.targetImpian || [];

      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Messages array is required" });
      }

      // Read context from DB for personalized advice
      const txResult = await db.execute("SELECT * FROM transactions");
      const dbTransactions = txResult.rows;
      const txCount = dbTransactions.length;
      const totalIncome = dbTransactions.filter((t: any) => t.type === 'income').reduce((acc: number, t: any) => acc + Number(t.amount || 0), 0);
      const totalExpense = dbTransactions.filter((t: any) => t.type === 'expense').reduce((acc: number, t: any) => acc + Number(t.amount || 0), 0);
      totalSaldo = totalIncome - totalExpense;

      const budgetResult = await db.execute("SELECT * FROM budgets WHERE id = 'global'");
      const rawBudget = budgetResult.rows[0];
      budget = {
        total_income: rawBudget ? Number(rawBudget.total_income || 0) : 0,
        limit_50: rawBudget ? Number(rawBudget.limit_50 || 0) : 0,
        limit_30: rawBudget ? Number(rawBudget.limit_30 || 0) : 0,
        limit_20: rawBudget ? Number(rawBudget.limit_20 || 0) : 0,
      };

      let targetImpianContext = "";
      if (targetImpian && Array.isArray(targetImpian) && targetImpian.length > 0) {
        targetImpianContext = `- Daftar Target Impian (Wishlist) pengguna saat ini:\n` +
          targetImpian.map((item, idx) => `  ${idx + 1}. ${item.nama || item.name || "Impian"} - Rp ${(Number(item.harga) || Number(item.price) || 0).toLocaleString('id-ID')}`).join("\n") + "\n" +
          `Jika pengguna bertanya tentang "target impian", "beli impian", "beli target", atau barang impian tertentu, analisislah sisa saldo kas saat ini (Rp ${totalSaldo.toLocaleString('id-ID')}) apakah cukup untuk membeli impian paling pertama atau impian yang disebutkan. Hitung sisa saldo setelah pembelian atau hitung berapa kekurangannya secara jelas dan ajak pengguna untuk bersabar atau merealisasikannya secara bijak sesuai anjuran 50/30/20.`;
      } else {
        targetImpianContext = `- Daftar Target Impian (Wishlist) pengguna saat ini: Kosong. (Minta pengguna untuk menambahkan impian baru di Dashboard jika ia bertanya tentang rencana impiannya)`;
      }

      const systemInstruction = 
        `Kamu adalah MOODUIT AI Advisor, penasihat keuangan cerdas yang ramah, seru dan solutif. ` +
        `Pengguna saat ini bernama Arul Satriaji (atau Sobat Cuan). ` +
        `Gaya bicaramu suportif, sedikit jenaka, dan sangat mengedukasi tentang keuangan sehat. ` +
        `Gunakan alokasi anggaran 50/30/20 (50% Kebutuhan, 30% Keinginan, 20% Tabungan/Investasi) sebagai landasan saranmu. ` +
        `Berikut data keuangan asli real-time pengguna saat ini untuk bahan referensimu (gunakan angka ini jika user menanyakan saldo, anggaran, atau transaksi): ` +
        `- Total Saldo kas saat ini: Rp ${totalSaldo.toLocaleString('id-ID')} ` +
        `- Total Pemasukan: Rp ${totalIncome.toLocaleString('id-ID')} ` +
        `- Total Pengeluaran: Rp ${totalExpense.toLocaleString('id-ID')} ` +
        `- Rencana Anggaran (Smart Budget) Pendapatan: Rp ${budget.total_income.toLocaleString('id-ID')} ` +
        `- Aturan 50% (Kebutuhan pokok): Limit Rp ${budget.limit_50.toLocaleString('id-ID')} ` +
        `- Aturan 30% (Keinginan): Limit Rp ${budget.limit_30.toLocaleString('id-ID')} ` +
        `- Aturan 20% (Tabungan): Limit Rp ${budget.limit_20.toLocaleString('id-ID')} ` +
        `- Jumlah transaksi yang tercatat dalam riwayat: ${txCount} ` +
        `\n${targetImpianContext}\n\n` +
        `Selalulah menjawab sesuai bahasa yang dipilih pengguna (Bahasa Indonesia atau English). Default: Bahasa Indonesia. ` +
        `Jika ditanya nominal saldo atau transaksi, jawablah dengan menggunakan data asli di atas secara akurat. Jangan mengarang data fiktif!`;

      // Convert front-end messages { text: string, isAi: boolean } to Gemini { role: 'user'|'model', parts: [{ text: string }] }
      const contents = messages.map(m => {
        return {
          role: m.isAi ? "model" : "user",
          parts: [{ text: m.text }]
        };
      });

      // Generate response from gemini-2.5-flash
      const ai = getAiClient();
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        }
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Gemini API Error Detail:", error);
      const isIndonesian = language !== "en";
      const fallbackMsg = isIndonesian
        ? `Sistem gagal terhubung: ${error.message || String(error)}`
        : `System failed to connect: ${error.message || String(error)}`;
      res.status(500).json({ error: error.message || String(error), text: fallbackMsg });
    }
  });

  // Vite middleware for development (disabled when on Vercel as Vercel handles frontend)
  if (process.env.VERCEL !== "1") {
    if (process.env.NODE_ENV !== "production") {
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } else {
      const distPath = path.join(process.cwd(), 'dist');
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } else {
    // On Vercel, we still need to initialize the DB on start
    initDB().catch(err => console.error("Async DB initialization failed on Vercel:", err));
  }
}

startServer();

export default app;
