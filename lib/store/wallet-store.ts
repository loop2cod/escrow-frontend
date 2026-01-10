import { create } from 'zustand';
import {
  WalletState,
  WalletOverview,
  WalletTransaction,
  TransactionFilters,
} from '@/lib/types';

// Dummy data for development
const DUMMY_WALLET_OVERVIEW: WalletOverview = {
  bridgeAccount: {
    id: 'bridge_001',
    userId: 'user_001',
    accountNumber: '1234567890',
    routingNumber: '021000021',
    balance: 2500.00,
    availableBalance: 1750.00,
    currency: 'USD',
    status: 'active',
    bridgeAccountId: 'ba_1234567890',
    createdAt: new Date('2024-01-15').toISOString(),
    updatedAt: new Date().toISOString(),
  },
  tronWallet: {
    id: 'tron_001',
    userId: 'user_001',
    address: 'TJRabPrwbZy45sbavfcjxwKTVRRGKV7UFR',
    publicKey: '04a1b2c3d4e5f6...',
    balance: 850.50,
    trxBalance: 15.75,
    status: 'active',
    createdAt: new Date('2024-01-15').toISOString(),
    updatedAt: new Date().toISOString(),
  },
  lockedFunds: {
    totalLocked: 750.00,
    currency: 'USD',
    activeOrders: 2,
    breakdown: [
      {
        orderId: 'order_001',
        orderTitle: 'Website Development Project',
        amount: 500.00,
        lockedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      },
      {
        orderId: 'order_002',
        orderTitle: 'Logo Design',
        amount: 250.00,
        lockedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      },
    ],
  },
  totalBalance: {
    usd: 2500.00,
    usdt: 850.50,
    lockedUSD: 750.00,
    availableUSD: 1750.00,
  },
};

const DUMMY_TRANSACTIONS: WalletTransaction[] = [
  {
    id: 'tx_001',
    userId: 'user_001',
    type: 'deposit',
    status: 'completed',
    amount: 500.00,
    currency: 'USD',
    source: {
      type: 'external',
      identifier: 'Bank Account ****1234',
    },
    destination: {
      type: 'bridge_account',
      identifier: 'ba_1234567890',
    },
    fee: 0,
    netAmount: 500.00,
    bridgeTransactionId: 'btx_001',
    description: 'ACH Deposit from external bank',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    completedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: 'tx_002',
    userId: 'user_001',
    type: 'escrow_lock',
    status: 'completed',
    amount: 500.00,
    currency: 'USD',
    source: {
      type: 'bridge_account',
      identifier: 'ba_1234567890',
    },
    destination: {
      type: 'escrow',
      identifier: 'order_001',
    },
    fee: 0,
    netAmount: 500.00,
    description: 'Locked funds for Website Development Project',
    orderId: 'order_001',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    completedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: 'tx_003',
    userId: 'user_001',
    type: 'transfer',
    status: 'completed',
    amount: 100.00,
    currency: 'USDT',
    source: {
      type: 'external',
      identifier: 'TXyz...abc',
    },
    destination: {
      type: 'tron_wallet',
      identifier: 'TJRabPrwbZy45sbavfcjxwKTVRRGKV7UFR',
    },
    fee: 1.00,
    netAmount: 99.00,
    txHash: '0x1234567890abcdef...',
    description: 'Received USDT from external wallet',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: 'tx_004',
    userId: 'user_001',
    type: 'escrow_lock',
    status: 'completed',
    amount: 250.00,
    currency: 'USD',
    source: {
      type: 'bridge_account',
      identifier: 'ba_1234567890',
    },
    destination: {
      type: 'escrow',
      identifier: 'order_002',
    },
    fee: 0,
    netAmount: 250.00,
    description: 'Locked funds for Logo Design',
    orderId: 'order_002',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: 'tx_005',
    userId: 'user_001',
    type: 'convert',
    status: 'completed',
    amount: 200.00,
    currency: 'USD',
    source: {
      type: 'bridge_account',
      identifier: 'ba_1234567890',
    },
    destination: {
      type: 'tron_wallet',
      identifier: 'TJRabPrwbZy45sbavfcjxwKTVRRGKV7UFR',
    },
    fee: 2.00,
    netAmount: 198.00,
    description: 'Converted USD to USDT',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    completedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
  {
    id: 'tx_006',
    userId: 'user_001',
    type: 'withdraw',
    status: 'pending',
    amount: 300.00,
    currency: 'USDT',
    source: {
      type: 'tron_wallet',
      identifier: 'TJRabPrwbZy45sbavfcjxwKTVRRGKV7UFR',
    },
    destination: {
      type: 'external',
      identifier: 'TAbc...xyz',
    },
    fee: 1.00,
    netAmount: 299.00,
    description: 'Withdrawal to external wallet',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
];

export const useWalletStore = create<WalletState>((set, get) => ({
  walletOverview: DUMMY_WALLET_OVERVIEW,
  transactions: DUMMY_TRANSACTIONS,
  isLoading: false,
  error: null,

  fetchWalletOverview: async () => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      set({ walletOverview: DUMMY_WALLET_OVERVIEW, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch wallet overview', isLoading: false });
    }
  },

  fetchTransactions: async (filters?: TransactionFilters) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      let filteredTransactions = [...DUMMY_TRANSACTIONS];

      if (filters) {
        if (filters.type) {
          filteredTransactions = filteredTransactions.filter(
            (tx) => tx.type === filters.type
          );
        }
        if (filters.status) {
          filteredTransactions = filteredTransactions.filter(
            (tx) => tx.status === filters.status
          );
        }
        if (filters.currency) {
          filteredTransactions = filteredTransactions.filter(
            (tx) => tx.currency === filters.currency
          );
        }
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          filteredTransactions = filteredTransactions.filter(
            (tx) =>
              tx.id.toLowerCase().includes(searchLower) ||
              tx.description?.toLowerCase().includes(searchLower)
          );
        }
      }

      set({ transactions: filteredTransactions, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch transactions', isLoading: false });
    }
  },

  refreshBalances: async () => {
    set({ isLoading: true });
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 300));
      // In real implementation, this would refresh from API
      set({ isLoading: false });
    } catch (error) {
      set({ error: 'Failed to refresh balances', isLoading: false });
    }
  },

  depositUSD: async (amount: number) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const newTransaction: WalletTransaction = {
        id: `tx_${Date.now()}`,
        userId: 'user_001',
        type: 'deposit',
        status: 'pending',
        amount,
        currency: 'USD',
        source: {
          type: 'external',
          identifier: 'Bank Account',
        },
        destination: {
          type: 'bridge_account',
          identifier: DUMMY_WALLET_OVERVIEW.bridgeAccount.bridgeAccountId,
        },
        fee: 0,
        netAmount: amount,
        description: 'USD Deposit',
        createdAt: new Date().toISOString(),
      };

      set({
        transactions: [newTransaction, ...get().transactions],
        isLoading: false,
      });
    } catch (error) {
      set({ error: 'Failed to deposit USD', isLoading: false });
    }
  },

  withdrawUSD: async (amount: number, bankAccountId: string) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const newTransaction: WalletTransaction = {
        id: `tx_${Date.now()}`,
        userId: 'user_001',
        type: 'withdraw',
        status: 'pending',
        amount,
        currency: 'USD',
        source: {
          type: 'bridge_account',
          identifier: DUMMY_WALLET_OVERVIEW.bridgeAccount.bridgeAccountId,
        },
        destination: {
          type: 'external',
          identifier: bankAccountId,
        },
        fee: 2.5,
        netAmount: amount - 2.5,
        description: 'USD Withdrawal',
        createdAt: new Date().toISOString(),
      };

      set({
        transactions: [newTransaction, ...get().transactions],
        isLoading: false,
      });
    } catch (error) {
      set({ error: 'Failed to withdraw USD', isLoading: false });
    }
  },

  sendUSDT: async (to: string, amount: number) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const newTransaction: WalletTransaction = {
        id: `tx_${Date.now()}`,
        userId: 'user_001',
        type: 'transfer',
        status: 'pending',
        amount,
        currency: 'USDT',
        source: {
          type: 'tron_wallet',
          identifier: DUMMY_WALLET_OVERVIEW.tronWallet.address,
        },
        destination: {
          type: 'external',
          identifier: to,
        },
        fee: 1.0,
        netAmount: amount - 1.0,
        description: 'Send USDT',
        createdAt: new Date().toISOString(),
      };

      set({
        transactions: [newTransaction, ...get().transactions],
        isLoading: false,
      });
    } catch (error) {
      set({ error: 'Failed to send USDT', isLoading: false });
    }
  },

  convertUSDToUSDT: async (amount: number) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const newTransaction: WalletTransaction = {
        id: `tx_${Date.now()}`,
        userId: 'user_001',
        type: 'convert',
        status: 'pending',
        amount,
        currency: 'USD',
        source: {
          type: 'bridge_account',
          identifier: DUMMY_WALLET_OVERVIEW.bridgeAccount.bridgeAccountId,
        },
        destination: {
          type: 'tron_wallet',
          identifier: DUMMY_WALLET_OVERVIEW.tronWallet.address,
        },
        fee: amount * 0.01,
        netAmount: amount * 0.99,
        description: 'Convert USD to USDT',
        createdAt: new Date().toISOString(),
      };

      set({
        transactions: [newTransaction, ...get().transactions],
        isLoading: false,
      });
    } catch (error) {
      set({ error: 'Failed to convert USD to USDT', isLoading: false });
    }
  },

  convertUSDTToUSD: async (amount: number) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const newTransaction: WalletTransaction = {
        id: `tx_${Date.now()}`,
        userId: 'user_001',
        type: 'convert',
        status: 'pending',
        amount,
        currency: 'USDT',
        source: {
          type: 'tron_wallet',
          identifier: DUMMY_WALLET_OVERVIEW.tronWallet.address,
        },
        destination: {
          type: 'bridge_account',
          identifier: DUMMY_WALLET_OVERVIEW.bridgeAccount.bridgeAccountId,
        },
        fee: amount * 0.01,
        netAmount: amount * 0.99,
        description: 'Convert USDT to USD',
        createdAt: new Date().toISOString(),
      };

      set({
        transactions: [newTransaction, ...get().transactions],
        isLoading: false,
      });
    } catch (error) {
      set({ error: 'Failed to convert USDT to USD', isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
  setLoading: (loading: boolean) => set({ isLoading: loading }),
}));
