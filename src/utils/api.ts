export async function fetchUserStreak(user_email?: string): Promise<{
  current_streak: number;
  streakCount: number;
  last_active_date: string;
  lost_streak: number;
  restore_count: number;
  last_restore_month: string;
  streakActive: boolean;
  streakIncreasedToday: boolean;
}> {
  try {
    if (!user_email) return { current_streak: 0, streakCount: 0, last_active_date: '', lost_streak: 0, restore_count: 0, last_restore_month: '', streakActive: false, streakIncreasedToday: false };
    const todayLocal = new Date().toLocaleDateString('en-CA');
    const response = await fetch(`/api/users/streak?email=${encodeURIComponent(user_email)}&clientLocalDate=${todayLocal}`, { credentials: 'include' });
    if (!response.ok) throw new Error("Failed to fetch streak from DB");
    const data = await response.json();
    return {
      current_streak: Number(data.current_streak ?? data.streakCount) || 0,
      streakCount: Number(data.streakCount ?? data.current_streak) || 0,
      last_active_date: String(data.last_active_date || ''),
      lost_streak: Number(data.lost_streak) || 0,
      restore_count: Number(data.restore_count) || 0,
      last_restore_month: String(data.last_restore_month || ''),
      streakActive: Boolean(data.streakActive),
      streakIncreasedToday: Boolean(data.streakIncreasedToday)
    };
  } catch (err) {
    console.error("Error fetching streak from DB:", err);
    return { current_streak: 0, streakCount: 0, last_active_date: '', lost_streak: 0, restore_count: 0, last_restore_month: '', streakActive: false, streakIncreasedToday: false };
  }
}

export async function restoreStreak(user_email: string): Promise<{ success: boolean; message?: string; data?: any; error?: string }> {
  try {
    if (!user_email) return { success: false, error: "Email is required" };
    const todayLocal = new Date().toLocaleDateString('en-CA');
    const response = await fetch('/api/streak/restore', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user_email, clientLocalDate: todayLocal })
    });
    const data = await response.json();
    if (!response.ok) {
      return { success: false, error: data.error || data.message || "Gagal memulihkan streak" };
    }
    return { success: true, message: data.message, data };
  } catch (err: any) {
    return { success: false, error: err.message || "Network error" };
  }
}

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
    icon: icon,
    currentStreak: dt.currentStreak,
    streakIncreasedToday: dt.streakIncreasedToday
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

export async function fetchAllTransactions(user_email?: string): Promise<any[]> {
  try {
    if (!user_email) return [];
    const response = await fetch(`/api/transactions?user_email=${encodeURIComponent(user_email)}`, { credentials: 'include' });
    if (!response.ok) throw new Error('Failed to fetch transactions');
    const dbData = await response.json();
    return dbData.map(mapDBToFrontend);
  } catch (err) {
    console.error("Error fetching transactions from DB:", err);
    return [];
  }
}

export async function insertTransaction(tx: any, user_email?: string): Promise<any> {
  try {
    if (!user_email) throw new Error('user_email is required');
    const dbPayload = { ...mapFrontendToDB(tx), user_email };
    const response = await fetch('/api/transactions', {
      method: 'POST',
      credentials: 'include',
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

export async function updateTransactionDB(id: string | number, tx: any, user_email?: string): Promise<any> {
  try {
    if (!user_email) throw new Error('user_email is required');
    const dbPayload = { ...mapFrontendToDB(tx), user_email };
    const response = await fetch(`/api/transactions/${id}`, {
      method: 'PUT',
      credentials: 'include',
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

export async function deleteTransactionDB(id: string | number, user_email?: string): Promise<boolean> {
  try {
    if (!user_email) throw new Error('user_email is required');
    const response = await fetch(`/api/transactions/${id}?user_email=${encodeURIComponent(user_email)}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to delete transaction');
    const result = await response.json();
    return !!result.success;
  } catch (err) {
    console.error("Error deleting transaction in DB:", err);
    return false;
  }
}

export async function fetchBudgetPlan(user_email?: string): Promise<any | null> {
  try {
    if (!user_email) return null;
    const response = await fetch(`/api/budgets?user_email=${encodeURIComponent(user_email)}`, { credentials: 'include' });
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

export async function saveBudgetPlanDB(pendapatan: number, user_email?: string): Promise<any> {
  try {
    if (!user_email) throw new Error('user_email is required');
    const payload = {
      user_email,
      total_income: pendapatan,
      limit_50: pendapatan * 0.5,
      limit_30: pendapatan * 0.3,
      limit_20: pendapatan * 0.2
    };
    const response = await fetch('/api/budgets', {
      method: 'POST',
      credentials: 'include',
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

// Fetch all wishlist goals from the DB
export async function fetchGoals(user_email: string): Promise<any[]> {
  try {
    if (!user_email) return [];
    const response = await fetch(`/api/goals?user_email=${encodeURIComponent(user_email)}`, { credentials: 'include' });
    if (!response.ok) throw new Error('Failed to fetch goals');
    const goals = await response.json();
    return goals.map((item: any) => ({
      id: item.id,
      name: item.name || item.nama,
      nama: item.nama || item.name,
      price: String(item.price || item.harga),
      harga: String(item.harga || item.price)
    }));
  } catch (err) {
    console.error("Error fetching goals from DB:", err);
    return [];
  }
}

// Bulk sync all wishlist goals to the DB
export async function syncGoals(user_email: string, wishlist: any[]): Promise<boolean> {
  try {
    if (!user_email) return false;
    const response = await fetch('/api/goals/sync', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_email, wishlist })
    });
    if (!response.ok) throw new Error('Failed to sync goals');
    const result = await response.json();
    return !!result.success;
  } catch (err) {
    console.error("Error syncing goals to DB:", err);
    return false;
  }
}

// Fetch custom budget plan from DB
export async function fetchBudgetPlanCustom(user_email: string): Promise<any | null> {
  try {
    if (!user_email) return null;
    const response = await fetch(`/api/budget-plans?user_email=${encodeURIComponent(user_email)}`, { credentials: 'include' });
    if (!response.ok) throw new Error('Failed to fetch custom budget plan');
    return await response.json();
  } catch (err) {
    console.error("Error fetching custom budget plan:", err);
    return null;
  }
}

// Save custom budget plan to DB
export async function saveBudgetPlanCustom(user_email: string, data: any): Promise<boolean> {
  try {
    if (!user_email) return false;
    const cleanIncome = data.income ? String(data.income).replace(/\D/g, "") : "";
    const cleanExpenses = data.expenses ? String(data.expenses).replace(/\D/g, "") : "";
    const response = await fetch('/api/budget-plans', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_email,
        income: cleanIncome,
        expenses: cleanExpenses,
        emergencyTarget: data.emergencyTarget,
        savingsTarget: data.savingsTarget
      })
    });
    if (!response.ok) throw new Error('Failed to save custom budget plan');
    const result = await response.json();
    return !!result.success;
  } catch (err) {
    console.error("Error saving custom budget plan:", err);
    return false;
  }
}
