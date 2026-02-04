/**
 * Financial Service - Serviços Financeiros
 * Baseado nos endpoints do backend FastAPI
 */

import { api } from './api';

export interface FinancialDashboardData {
  to_receive_today: number;
  to_pay_today: number;
  cash_position: number;
  bank_position: number;
  total_received_period: number;
  total_to_receive_period: number;
  total_paid_period: number;
  total_to_pay_period: number;
  sales_by_day: Array<{ date: string; total: number }>;
  cash_flow_by_day: Array<{ date: string; income: number; expense: number; balance: number }>;
}

export interface CashRegister {
  id: number;
  company_id: number;
  user_id: number;
  user_name?: string;
  opening_balance: number;
  closing_balance?: number;
  opened_at: string;
  closed_at?: string;
  status: 'open' | 'closed';
  notes?: string;
  total_sales?: number;
  total_cash?: number;
  total_card?: number;
  total_pix?: number;
  total_other?: number;
}

export interface CashRegisterConference {
  opening_balance: number;
  movements: number;
  cash_balance: number;
  other_payments: Record<string, number>;
  total_received: number;
  total_to_receive: number;
  payment_summary: Record<string, number>;
}

export interface Transaction {
  id: number;
  type: 'income' | 'expense';
  value: number;
  net_value?: number;
  fee_percentage?: number;
  fee_value?: number;
  description: string;
  date: string;
  due_date?: string;
  status: string;
  is_paid: boolean;
  account?: { id: number; name: string };
  category?: { id: number; name: string };
  origin?: string;
  client?: { id: number; full_name: string };
  payment_method?: string | null;
  installment?: number;
  total_installments?: number;
  created_at: string;
}

export interface TransactionTotals {
  received: number;
  to_receive: number;
  paid: number;
  to_pay: number;
}

export interface FinancialAccount {
  id: number;
  name: string;
  type: 'cash' | 'bank' | 'other';
  balance: number;
  is_active: boolean;
}

export interface FinancialCategory {
  id: number;
  name: string;
  type: 'income' | 'expense';
  color?: string;
  is_active: boolean;
}

export const FinancialService = {
  // Dashboard
  getDashboard: async (params: { start_date: string; end_date: string }) => {
    const response = await api.get<FinancialDashboardData>('/financial/dashboard', { params });
    return response.data;
  },

  // Cash Registers
  listCashRegisters: async () => {
    const response = await api.get<CashRegister[]>('/financial/cash-registers');
    return response.data;
  },

  openCashRegister: async (data: { company_id: number; opening_balance: number; notes?: string }) => {
    const response = await api.post<CashRegister>('/financial/cash-registers/open', data);
    return response.data;
  },

  closeCashRegister: async (id: number, data: { closing_balance: number; notes?: string }) => {
    const response = await api.post<CashRegister>(`/financial/cash-registers/${id}/close`, data);
    return response.data;
  },

  getCashRegister: async (id: number) => {
    const response = await api.get<CashRegister>(`/financial/cash-registers/${id}`);
    return response.data;
  },

  getCashRegisterConference: async (id: number) => {
    const response = await api.get<CashRegisterConference>(`/financial/cash-registers/${id}/conference`);
    return response.data;
  },

  // Transactions
  listTransactions: async (params: {
    page?: number;
    limit?: number;
    type?: 'income' | 'expense';
    status?: string;
    start_date?: string;
    end_date?: string;
    account_id?: number;
    category_id?: number;
  }) => {
    const response = await api.get<{ items: Transaction[]; total: number; totals: TransactionTotals }>('/financial/transactions', { params });
    return response.data;
  },

  getTransaction: async (id: number) => {
    const response = await api.get<Transaction>(`/financial/transactions/${id}`);
    return response.data;
  },

  createTransaction: async (data: {
    type: 'income' | 'expense';
    value: number;
    description: string;
    date: string;
    due_date?: string;
    account_id?: number;
    category_id?: number;
    payment_method?: string;
    client_id?: number;
  }) => {
    const response = await api.post<Transaction>('/financial/transactions', data);
    return response.data;
  },

  updateTransaction: async (id: number, data: Partial<Transaction>) => {
    const response = await api.put<Transaction>(`/financial/transactions/${id}`, data);
    return response.data;
  },

  deleteTransaction: async (id: number) => {
    await api.delete(`/financial/transactions/${id}`);
  },

  // Accounts
  listAccounts: async () => {
    const response = await api.get<FinancialAccount[]>('/financial/accounts');
    return response.data;
  },

  getAccount: async (id: number) => {
    const response = await api.get<FinancialAccount>(`/financial/accounts/${id}`);
    return response.data;
  },

  createAccount: async (data: { name: string; type: string; initial_balance?: number }) => {
    const response = await api.post<FinancialAccount>('/financial/accounts', data);
    return response.data;
  },

  updateAccount: async (id: number, data: Partial<FinancialAccount>) => {
    const response = await api.put<FinancialAccount>(`/financial/accounts/${id}`, data);
    return response.data;
  },

  deleteAccount: async (id: number) => {
    await api.delete(`/financial/accounts/${id}`);
  },

  // Categories
  listCategories: async (type?: 'income' | 'expense') => {
    const params = type ? { type } : {};
    const response = await api.get<FinancialCategory[]>('/financial/categories', { params });
    return response.data;
  },

  getCategory: async (id: number) => {
    const response = await api.get<FinancialCategory>(`/financial/categories/${id}`);
    return response.data;
  },

  createCategory: async (data: { name: string; type: string; color?: string }) => {
    const response = await api.post<FinancialCategory>('/financial/categories', data);
    return response.data;
  },

  updateCategory: async (id: number, data: Partial<FinancialCategory>) => {
    const response = await api.put<FinancialCategory>(`/financial/categories/${id}`, data);
    return response.data;
  },

  deleteCategory: async (id: number) => {
    await api.delete(`/financial/categories/${id}`);
  },
};

export default FinancialService;
