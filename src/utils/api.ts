export function mapDBToFrontend(dt: any): any {
  const categoryIcons: { [key: string]: string } = {
    "Kebutuhan Pokok": "🛒",
    "Transportasi": "🚗",
    "Hiburan": "🎬",
    "Makan & Minum": "☕",
    "Kesehatan": "🏥",
    "Pendidikan": "🎓",
    "Tagihan": "💡",
    "Belanja": "🛍️",
    "Lainnya": "🧾",
    "Gaji & Upah": "💼",
    "Bonus & THR": "🎁",
    "Hasil Usaha": "📈",
    "Investasi": "🪙",
    "Pemberian": "🤝"
  };

  const cat = dt.category || "Lainnya";
  const icon = categoryIcons[cat] || "🧾";

  return {
    id: dt.id,
    nominal: Number(dt.amount) || 0,
    jenis: dt.type === 'income' ? 'pemasukan' : 'pengeluaran',
    kategori: cat,
    catatan: dt.description || '',
    tanggal: dt.created_at ? dt.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
    icon: icon
  };
}

export function mapFrontendToDB(ft: any): any {
  return {
    id: ft.id ? String(ft.id) : undefined,
    amount: Number(ft.nominal) || 0,
    type: ft.jenis === 'pemasukan' ? 'income' : 'expense',
    category: ft.kategori || 'Lainnya',
    description: ft.catatan || '',
    created_at: ft.tanggal || new Date().toISOString().split('T')[0]
  };
}

export async function fetchAllTransactions(): Promise<any[]> {
  try {
    const response = await fetch('/api/transactions');
    if (!response.ok) throw new Error('Failed to fetch transactions');
    const dbData = await response.json();
    return dbData.map(mapDBToFrontend);
  } catch (err) {
    console.error("Error fetching transactions from DB:", err);
    // Fallback to local storage
    const saved = localStorage.getItem('transactions');
    return saved ? JSON.parse(saved) : [];
  }
}

export async function insertTransaction(tx: any): Promise<any> {
  try {
    const dbPayload = mapFrontendToDB(tx);
    const response = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dbPayload)
    });
    if (!response.ok) throw new Error('Failed to insert transaction');
    const result = await response.json();
    return mapDBToFrontend(result);
  } catch (err) {
    console.error("Error inserting transaction to DB:", err);
    return tx;
  }
}

export async function updateTransactionDB(id: string | number, tx: any): Promise<any> {
  try {
    const dbPayload = mapFrontendToDB(tx);
    const response = await fetch(`/api/transactions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dbPayload)
    });
    if (!response.ok) throw new Error('Failed to update transaction');
    const result = await response.json();
    return mapDBToFrontend(result);
  } catch (err) {
    console.error("Error updating transaction in DB:", err);
    return tx;
  }
}

export async function deleteTransactionDB(id: string | number): Promise<boolean> {
  try {
    const response = await fetch(`/api/transactions/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete transaction');
    const result = await response.json();
    return !!result.success;
  } catch (err) {
    console.error("Error deleting transaction in DB:", err);
    return false;
  }
}

export async function fetchBudgetPlan(): Promise<any | null> {
  try {
    const response = await fetch('/api/budgets');
    if (!response.ok) throw new Error('Failed to fetch budget');
    const budget = await response.json();
    if (!budget) return null;
    return {
      pendapatan: String(budget.total_income),
      hasilBudget: {
        kebutuhan: budget.limit_50,
        keinginan: budget.limit_30,
        tabungan: budget.limit_20
      }
    };
  } catch (err) {
    console.error("Error fetching budget plan from DB:", err);
    return null;
  }
}

export async function saveBudgetPlanDB(pendapatan: number): Promise<any> {
  try {
    const payload = {
      total_income: pendapatan,
      limit_50: pendapatan * 0.5,
      limit_30: pendapatan * 0.3,
      limit_20: pendapatan * 0.2
    };
    const response = await fetch('/api/budgets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error('Failed to save budget plan');
    const budget = await response.json();
    return {
      pendapatan: String(budget.total_income),
      hasilBudget: {
        kebutuhan: budget.limit_50,
        keinginan: budget.limit_30,
        tabungan: budget.limit_20
      }
    };
  } catch (err) {
    console.error("Error saving budget plan to DB:", err);
    return null;
  }
}
