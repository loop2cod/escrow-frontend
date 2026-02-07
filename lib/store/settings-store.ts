import { create } from 'zustand';
import { SettingsState, UserSettings, BankAccount, SavedAddress } from '@/lib/types';
import apiClient from '@/lib/api-client';
import Cookies from 'js-cookie';

// Dummy settings data for sections not yet implemented in backend
const DUMMY_SETTINGS: UserSettings = {
  profile: {
    fullName: '',
    email: '',
    emailVerified: true,
    phone: '',
    phoneVerified: true,
    avatar: undefined,
    username: '',
    accountType: 'individual',
    accountId: '',
    userReferenceId: '',
    createdAt: new Date().toISOString(),
  },

  security: {
    twoFactorEnabled: false,
    twoFactorMethod: 'authenticator',
    backupCodesGenerated: false,
    lastPasswordChange: null as any, // Will be ignored/handled by UI check
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
    ],
  },

  walletSettings: {
    linkedBankAccounts: [],
    savedAddresses: [],
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
    theme: 'light',
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
  settings: null,
  loginHistory: [],
  isLoading: false,
  error: null,

  fetchSettings: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get('/auth/me');
      const user = response.data.data.user;

      // Transform API user to UserSettings
      const settings: UserSettings = {
        profile: {
          fullName: user.name,
          email: user.email,
          emailVerified: true, // Mock
          phone: user.phone || '',
          phoneVerified: false, // Mock
          username: user.username || user.email.split('@')[0],
          accountType: user.role === 'ADMIN' ? 'business' : 'individual',
          accountId: user.id,
          userReferenceId: user.userReferenceId,
          createdAt: user.createdAt,
          avatar: undefined
        },
        // Security from User + Defaults
        security: {
          ...DUMMY_SETTINGS.security,
          twoFactorEnabled: user.twoFactorEnabled || false,
          twoFactorMethod: user.twoFactorMethod || 'authenticator',
          // activeSessions stub retained for now
        },
        walletSettings: { ...DUMMY_SETTINGS.walletSettings },
        notifications: { ...DUMMY_SETTINGS.notifications },
        preferences: { ...DUMMY_SETTINGS.preferences }
      };

      set({ settings, isLoading: false });
    } catch (error) {
      console.error('Fetch settings error:', error);
      set({ error: 'Failed to fetch settings', isLoading: false });
    }
  },

  fetchLoginHistory: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get('/auth/history');
      set({ loginHistory: response.data.data.history, isLoading: false });
    } catch (error) {
      console.error('Fetch login history error:', error);
      set({ error: 'Failed to fetch login history', isLoading: false });
    }
  },

  updateProfile: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const updatePayload: any = {};
      if (data.fullName !== undefined) updatePayload.name = data.fullName;
      if (data.username !== undefined) updatePayload.username = data.username;
      if (data.phone !== undefined) updatePayload.phone = data.phone;

      const response = await apiClient.patch('/auth/me', updatePayload);
      const updatedUser = response.data.data.user;

      const currentSettings = get().settings;
      if (currentSettings) {
        set({
          settings: {
            ...currentSettings,
            profile: {
              ...currentSettings.profile,
              fullName: updatedUser.name,
              username: updatedUser.username,
              phone: updatedUser.phone || ''
            }
          },
          isLoading: false
        });
      }
    } catch (error: any) {
      const errMsg = error.response?.data?.message || 'Failed to update profile';
      set({ error: errMsg, isLoading: false });
    }
  },

  changePassword: async (currentPassword, newPassword) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.post('/auth/change-password', { currentPassword, newPassword });
      // Password changed successfully
      set({ isLoading: false });
    } catch (error: any) {
      const errMsg = error.response?.data?.message || 'Failed to change password';
      set({ error: errMsg, isLoading: false });
    }
  },

  enable2FA: async (method) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.post('/auth/2fa/enable', { method });
      const currentSettings = get().settings;
      if (currentSettings) {
        set({
          settings: {
            ...currentSettings,
            security: {
              ...currentSettings.security,
              twoFactorEnabled: true,
              twoFactorMethod: method,
              backupCodesGenerated: true, // Mocked for now
            },
          },
          isLoading: false,
        });
      }
    } catch (error: any) {
      const errMsg = error.response?.data?.message || 'Failed to enable 2FA';
      set({ error: errMsg, isLoading: false });
    }
  },

  disable2FA: async () => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.post('/auth/2fa/disable');
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
    } catch (error: any) {
      const errMsg = error.response?.data?.message || 'Failed to disable 2FA';
      set({ error: errMsg, isLoading: false });
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
        const updatedPreferences = {
          ...currentSettings.preferences,
          ...preferences,
        };

        // Persist theme and currency to cookies
        if (preferences.theme) {
          Cookies.set('theme', preferences.theme, { expires: 365 });
        }
        if (preferences.primaryCurrency) {
          Cookies.set('primaryCurrency', preferences.primaryCurrency, { expires: 365 });
        }

        set({
          settings: {
            ...currentSettings,
            preferences: updatedPreferences,
          },
          isLoading: false,
        });
      }
    } catch (error) {
      set({ error: 'Failed to update preferences', isLoading: false });
    }
  },

  loadPreferencesFromCookies: () => {
    const theme = Cookies.get('theme') as 'light' | 'dark' | undefined;
    const primaryCurrency = Cookies.get('primaryCurrency');

    const currentSettings = get().settings;
    if (currentSettings) {
      set({
        settings: {
          ...currentSettings,
          preferences: {
            ...currentSettings.preferences,
            ...(theme && { theme }),
            ...(primaryCurrency && { primaryCurrency }),
          },
        },
      });
    }
  },

  clearError: () => set({ error: null }),
}));
