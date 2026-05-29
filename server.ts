import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import fs from "fs/promises";

dotenv.config();

const resolvedFilename = typeof import.meta !== "undefined" && import.meta.url
  ? fileURLToPath(import.meta.url)
  : (typeof __filename !== "undefined" ? __filename : "");

const resolvedDirname = typeof __dirname !== "undefined"
  ? __dirname
  : (resolvedFilename ? path.dirname(resolvedFilename) : process.cwd());

const DB_FILE = path.join(process.cwd(), "db.json");

interface DBTransaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description: string;
  created_at: string;
}

interface DBBudget {
  id: string;
  total_income: number;
  limit_50: number;
  limit_30: number;
  limit_20: number;
}

interface DBStructure {
  transactions: DBTransaction[];
  budgets: DBBudget[];
}

async function readDB(): Promise<DBStructure> {
  try {
    const data = await fs.readFile(DB_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    const def: DBStructure = { transactions: [], budgets: [] };
    await fs.writeFile(DB_FILE, JSON.stringify(def, null, 2), "utf-8");
    return def;
  }
}

async function writeDB(data: DBStructure) {
  await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Tables
  app.get("/api/transactions", async (req, res) => {
    try {
      const db = await readDB();
      res.json(db.transactions);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/transactions", async (req, res) => {
    try {
      const db = await readDB();
      const { amount, type, category, description, created_at, id } = req.body;
      
      const newTx: DBTransaction = {
        id: id ? String(id) : String(Date.now()),
        amount: Number(amount) || 0,
        type: type === 'income' ? 'income' : 'expense',
        category: category || 'Lainnya',
        description: description || '',
        created_at: created_at || new Date().toISOString().split('T')[0]
      };
      
      db.transactions.unshift(newTx);
      await writeDB(db);
      res.status(201).json(newTx);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put("/api/transactions/:id", async (req, res) => {
    try {
      const db = await readDB();
      const { id } = req.params;
      const { amount, type, category, description, created_at } = req.body;
      
      const index = db.transactions.findIndex(t => t.id === id);
      if (index === -1) {
        return res.status(404).json({ error: "Transaction not found" });
      }
      
      db.transactions[index] = {
        ...db.transactions[index],
        amount: amount !== undefined ? Number(amount) : db.transactions[index].amount,
        type: type !== undefined ? (type === 'income' ? 'income' : 'expense') : db.transactions[index].type,
        category: category !== undefined ? category : db.transactions[index].category,
        description: description !== undefined ? description : db.transactions[index].description,
        created_at: created_at !== undefined ? created_at : db.transactions[index].created_at
      };
      
      await writeDB(db);
      res.json(db.transactions[index]);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/transactions/:id", async (req, res) => {
    try {
      const db = await readDB();
      const { id } = req.params;
      
      const transactionsCount = db.transactions.length;
      db.transactions = db.transactions.filter(t => t.id !== id);
      
      if (db.transactions.length === transactionsCount) {
        return res.status(404).json({ error: "Transaction not found" });
      }
      
      await writeDB(db);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/budgets", async (req, res) => {
    try {
      const db = await readDB();
      const budget = db.budgets[0] || null;
      res.json(budget);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/budgets", async (req, res) => {
    try {
      const db = await readDB();
      const { total_income, limit_50, limit_30, limit_20 } = req.body;
      
      const newBudget: DBBudget = {
        id: 'global',
        total_income: Number(total_income) || 0,
        limit_50: Number(limit_50) || 0,
        limit_30: Number(limit_30) || 0,
        limit_20: Number(limit_20) || 0
      };
      
      db.budgets = [newBudget];
      await writeDB(db);
      res.status(200).json(newBudget);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // API Scan Receipt
  app.post("/api/scan-receipt", async (req, res) => {
    try {
      const { image, mimeType } = req.body;

      if (!image || !mimeType) {
        return res.status(400).json({ error: "Missing image or mimeType" });
      }

      const prompt = `Ekstrak data dari gambar struk ini secara akurat. Ambil: 1. Nama Merchant/Toko (Jika tidak terdeteksi atau tidak ada, WAJIB tulis 'Merchant Tidak Diketahui'), 2. Total Belanja Asli (Bukan uang tunai yang dibayar), 3. Nominal Tunai/Bayar, 4. Kembalian, 5. Tanggal Transaksi, 6. Kategori yang paling cocok.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
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
    try {
      const { messages, language, targetImpian } = req.body;
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Messages array is required" });
      }

      // Read context from DB for personalized advice
      const db = await readDB();
      const txCount = db.transactions.length;
      const totalIncome = db.transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
      const totalExpense = db.transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
      const totalSaldo = totalIncome - totalExpense;
      const budget = db.budgets[0] || { total_income: 0, limit_50: 0, limit_30: 0, limit_20: 0 };

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

      // Generate response from gemini-3.5-flash
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        }
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Chat AI Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate AI response" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
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
}

startServer();
