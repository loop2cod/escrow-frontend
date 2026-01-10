import { create } from 'zustand';
import { SettingsState, UserSettings, BankAccount, SavedAddress } from '@/lib/types';

// Dummy settings data
const DUMMY_SETTINGS: UserSettings = {
  profile: {
    fullName: 'John Doe',
    email: 'john.doe@example.com',
    emailVerified: true,
    phone: '+1 (555) 123-4567',
    phoneVerified: true,
    avatar: undefined,
    username: 'johndoe',
    accountType: 'individual',
    accountId: 'usr_1234567890',
    createdAt: new Date('2024-01-15').toISOString(),
  },

  security: {
    twoFactorEnabled: false,
    twoFactorMethod: 'authenticator',
    backupCodesGenerated: false,
    lastPasswordChange: new Date('2024-12-01').toISOString(),
    activeSessions: [
      {
        id: 'sess_001',
        device: 'MacBook Pro',
        browser: 'Chrome 120',
        os: 'macOS 14.2',
        ipAddress: '192.168.1.100',
        location: 'San Francisco, CA, USA',
        lastActive: new Date().toISOString(),
        isCurrent: true,
      },
      {
        id: 'sess_002',
        device: 'iPhone 15 Pro',
        browser: 'Safari 17',
        os: 'iOS 17.2',
        ipAddress: '192.168.1.101',
        location: 'San Francisco, CA, USA',
        lastActive: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        isCurrent: false,
      },
      {
        id: 'sess_003',
        device: 'Windows PC',
        browser: 'Edge 120',
        os: 'Windows 11',
        ipAddress: '203.0.113.45',
        location: 'New York, NY, USA',
        lastActive: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        isCurrent: false,
      },
    ],
  },

  walletSettings: {
    linkedBankAccounts: [
      {
        id: 'bank_001',
        bankName: 'Chase Bank',
        accountType: 'checking',
        last4: '1234',
        isDefault: true,
        verified: true,
        addedAt: new Date('2024-01-20').toISOString(),
      },
      {
        id: 'bank_002',
        bankName: 'Bank of America',
        accountType: 'savings',
        last4: '5678',
        isDefault: false,
        verified: true,
        addedAt: new Date('2024-02-15').toISOString(),
      },
    ],
    savedAddresses: [
      {
        id: 'addr_001',
        label: 'Personal Wallet',
        address: 'TJRabPrwbZy45sbavfcjxwKTVRRGKV7UFR',
        network: 'TRON',
        addedAt: new Date('2024-01-25').toISOString(),
        note: 'My main TRON wallet',
      },
      {
        id: 'addr_002',
        label: 'Exchange Deposit',
        address: 'TMZxQ9BbKVk3hXFmfN7JfYJKzVxYvW8XYZ',
        network: 'TRON',
        addedAt: new Date('2024-03-10').toISOString(),
      },
    ],
    withdrawalLimits: {
      dailyUSD: 10000,
      dailyUSDT: 5000,
      perTransaction: 2500,
    },
    autoConvert: {
      enabled: false,
      threshold: 1000,
    },
    gasFeePreference: 'medium',
  },

  notifications: {
    email: {
      transactions: true,
      orders: true,
      security: true,
      marketing: false,
    },
    sms: {
      transactions: false,
      orders: false,
      security: true,
      marketing: false,
    },
    push: {
      transactions: true,
      orders: true,
      security: true,
      marketing: false,
    },
    frequency: 'realtime',
  },

  preferences: {
    theme: 'system',
    language: 'en',
    timezone: 'America/Los_Angeles',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    primaryCurrency: 'USD',
    accessibility: {
      fontSize: 'medium',
      highContrast: false,
      reduceMotion: false,
    },
  },
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: DUMMY_SETTINGS,
  isLoading: false,
  error: null,

  fetchSettings: async () => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      set({ settings: DUMMY_SETTINGS, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch settings', isLoading: false });
    }
  },

  updateProfile: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      const currentSettings = get().settings;
      if (currentSettings) {
        set({
          settings: {
            ...currentSettings,
            profile: {
              ...currentSettings.profile,
              ...data,
            },
          },
          isLoading: false,
        });
      }
    } catch (error) {
      set({ error: 'Failed to update profile', isLoading: false });
    }
  },

  changePassword: async (currentPassword, newPassword) => {
    set({ isLoading: true, error: null });
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const currentSettings = get().settings;
      if (currentSettings) {
        set({
          settings: {
            ...currentSettings,
            security: {
              ...currentSettings.security,
              lastPasswordChange: new Date().toISOString(),
            },
          },
          isLoading: false,
        });
      }
    } catch (error) {
      set({ error: 'Failed to change password', isLoading: false });
    }
  },

  enable2FA: async (method) => {
    set({ isLoading: true, error: null });
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const currentSettings = get().settings;
      if (currentSettings) {
        set({
          settings: {
            ...currentSettings,
            security: {
              ...currentSettings.security,
              twoFactorEnabled: true,
              twoFactorMethod: method,
              backupCodesGenerated: true,
            },
          },
          isLoading: false,
        });
      }
    } catch (error) {
      set({ error: 'Failed to enable 2FA', isLoading: false });
    }
  },

  disable2FA: async () => {
    set({ isLoading: true, error: null });
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      const currentSettings = get().settings;
      if (currentSettings) {
        set({
          settings: {
            ...currentSettings,
            security: {
              ...currentSettings.security,
              twoFactorEnabled: false,
            },
          },
          isLoading: false,
        });
      }
    } catch (error) {
      set({ error: 'Failed to disable 2FA', isLoading: false });
    }
  },

  revokeSession: async (sessionId) => {
    set({ isLoading: true, error: null });
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      const currentSettings = get().settings;
      if (currentSettings) {
        set({
          settings: {
            ...currentSettings,
            security: {
              ...currentSettings.security,
              activeSessions: currentSettings.security.activeSessions.filter(
                (s) => s.id !== sessionId
              ),
            },
          },
          isLoading: false,
        });
      }
    } catch (error) {
      set({ error: 'Failed to revoke session', isLoading: false });
    }
  },

  addBankAccount: async (account) => {
    set({ isLoading: true, error: null });
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const currentSettings = get().settings;
      if (currentSettings) {
        const newAccount: BankAccount = {
          ...account,
          id: `bank_${Date.now()}`,
          verified: false,
          addedAt: new Date().toISOString(),
        };
        set({
          settings: {
            ...currentSettings,
            walletSettings: {
              ...currentSettings.walletSettings,
              linkedBankAccounts: [
                ...currentSettings.walletSettings.linkedBankAccounts,
                newAccount,
              ],
            },
          },
          isLoading: false,
        });
      }
    } catch (error) {
      set({ error: 'Failed to add bank account', isLoading: false });
    }
  },

  removeBankAccount: async (accountId) => {
    set({ isLoading: true, error: null });
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      const currentSettings = get().settings;
      if (currentSettings) {
        set({
          settings: {
            ...currentSettings,
            walletSettings: {
              ...currentSettings.walletSettings,
              linkedBankAccounts:
                currentSettings.walletSettings.linkedBankAccounts.filter(
                  (acc) => acc.id !== accountId
                ),
            },
          },
          isLoading: false,
        });
      }
    } catch (error) {
      set({ error: 'Failed to remove bank account', isLoading: false });
    }
  },

  setDefaultBankAccount: async (accountId) => {
    set({ isLoading: true, error: null });
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const currentSettings = get().settings;
      if (currentSettings) {
        set({
          settings: {
            ...currentSettings,
            walletSettings: {
              ...currentSettings.walletSettings,
              linkedBankAccounts:
                currentSettings.walletSettings.linkedBankAccounts.map((acc) => ({
                  ...acc,
                  isDefault: acc.id === accountId,
                })),
            },
          },
          isLoading: false,
        });
      }
    } catch (error) {
      set({ error: 'Failed to set default bank account', isLoading: false });
    }
  },

  addSavedAddress: async (address) => {
    set({ isLoading: true, error: null });
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      const currentSettings = get().settings;
      if (currentSettings) {
        const newAddress: SavedAddress = {
          ...address,
          id: `addr_${Date.now()}`,
          addedAt: new Date().toISOString(),
        };
        set({
          settings: {
            ...currentSettings,
            walletSettings: {
              ...currentSettings.walletSettings,
              savedAddresses: [
                ...currentSettings.walletSettings.savedAddresses,
                newAddress,
              ],
            },
          },
          isLoading: false,
        });
      }
    } catch (error) {
      set({ error: 'Failed to add saved address', isLoading: false });
    }
  },

  removeSavedAddress: async (addressId) => {
    set({ isLoading: true, error: null });
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      const currentSettings = get().settings;
      if (currentSettings) {
        set({
          settings: {
            ...currentSettings,
            walletSettings: {
              ...currentSettings.walletSettings,
              savedAddresses: currentSettings.walletSettings.savedAddresses.filter(
                (addr) => addr.id !== addressId
              ),
            },
          },
          isLoading: false,
        });
      }
    } catch (error) {
      set({ error: 'Failed to remove saved address', isLoading: false });
    }
  },

  updateNotifications: async (preferences) => {
    set({ isLoading: true, error: null });
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      const currentSettings = get().settings;
      if (currentSettings) {
        set({
          settings: {
            ...currentSettings,
            notifications: {
              ...currentSettings.notifications,
              ...preferences,
            },
          },
          isLoading: false,
        });
      }
    } catch (error) {
      set({ error: 'Failed to update notifications', isLoading: false });
    }
  },

  updatePreferences: async (preferences) => {
    set({ isLoading: true, error: null });
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      const currentSettings = get().settings;
      if (currentSettings) {
        set({
          settings: {
            ...currentSettings,
            preferences: {
              ...currentSettings.preferences,
              ...preferences,
            },
          },
          isLoading: false,
        });
      }
    } catch (error) {
      set({ error: 'Failed to update preferences', isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
