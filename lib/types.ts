// User roles enum
export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

// User interface
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

// Auth API request types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

// Auth API response types
export interface AuthResponse {
  status: boolean;
  message: string;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
}

export interface RefreshTokenResponse {
  status: boolean;
  message: string;
  data: {
    accessToken: string;
  };
}

export interface ApiError {
  status: false;
  message: string;
  errors?: Record<string, string[]>;
}

// Auth store state interface
export interface AuthState {
  user: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  clearError: () => void;
  setUser: (user: any | null) => void;
}

// ============================================
// WALLET TYPES
// ============================================

// Bridge USD Account
export interface BridgeUSDAccount {
  id: string;
  userId: string;
  accountNumber: string;
  routingNumber: string;
  balance: number;
  availableBalance: number;
  currency: 'USD';
  status: 'active' | 'pending' | 'suspended' | 'closed';
  bridgeAccountId: string;
  createdAt: string;
  updatedAt: string;
}

// TRON USDT Wallet
export interface TronUSDTWallet {
  id: string;
  userId: string;
  address: string;
  publicKey: string;
  balance: number;
  trxBalance: number;
  status: 'active' | 'pending' | 'locked';
  createdAt: string;
  updatedAt: string;
}

// Transaction types
export type TransactionType = 'deposit' | 'withdraw' | 'transfer' | 'escrow_lock' | 'escrow_release' | 'convert';
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled';
export type CurrencyType = 'USD' | 'USDT' | 'TRX';
export type AccountType = 'bridge_account' | 'tron_wallet' | 'external' | 'escrow';

// Wallet Transaction
export interface WalletTransaction {
  id: string;
  userId: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  currency: CurrencyType;

  source: {
    type: AccountType;
    identifier: string;
  };
  destination: {
    type: AccountType;
    identifier: string;
  };

  fee: number;
  netAmount: number;
  txHash?: string;
  bridgeTransactionId?: string;

  description?: string;
  orderId?: string;
  createdAt: string;
  completedAt?: string;
}

// Escrow Locked Funds
export interface LockedFunds {
  totalLocked: number;
  currency: 'USD' | 'USDT';
  activeOrders: number;
  breakdown: Array<{
    orderId: string;
    orderTitle: string;
    amount: number;
    lockedAt: string;
  }>;
}

// Wallet Overview Summary
export interface WalletOverview {
  bridgeAccount: BridgeUSDAccount;
  tronWallet: TronUSDTWallet;
  lockedFunds: LockedFunds;
  totalBalance: {
    usd: number;
    usdt: number;
    lockedUSD: number;
    availableUSD: number;
  };
}

// Transaction Filters
export interface TransactionFilters {
  type?: TransactionType;
  status?: TransactionStatus;
  currency?: CurrencyType;
  startDate?: string;
  endDate?: string;
  search?: string;
}

// Wallet Store State
export interface WalletState {
  walletOverview: WalletOverview | null;
  transactions: WalletTransaction[];
  isLoading: boolean;
  error: string | null;

  fetchWalletOverview: () => Promise<void>;
  fetchTransactions: (filters?: TransactionFilters) => Promise<void>;
  refreshBalances: () => Promise<void>;

  depositUSD: (amount: number) => Promise<void>;
  withdrawUSD: (amount: number, bankAccountId: string) => Promise<void>;

  sendUSDT: (to: string, amount: number) => Promise<void>;

  convertUSDToUSDT: (amount: number) => Promise<void>;
  convertUSDTToUSD: (amount: number) => Promise<void>;

  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

// ============================================
// SETTINGS TYPES
// ============================================

export interface ActiveSession {
  id: string;
  device: string;
  browser: string;
  os: string;
  ipAddress: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountType: 'checking' | 'savings';
  last4: string;
  isDefault: boolean;
  verified: boolean;
  addedAt: string;
}

export interface SavedAddress {
  id: string;
  label: string;
  address: string;
  network: 'TRON' | 'ETH' | 'BTC';
  addedAt: string;
  note?: string;
}

export interface NotificationPreferences {
  transactions: boolean;
  orders: boolean;
  security: boolean;
  marketing: boolean;
}

export interface UserSettings {
  profile: {
    fullName: string;
    email: string;
    emailVerified: boolean;
    phone?: string;
    phoneVerified: boolean;
    avatar?: string;
    username: string;
    accountType: 'individual' | 'business';
    accountId: string;
    createdAt: string;
  };

  security: {
    twoFactorEnabled: boolean;
    twoFactorMethod: 'authenticator' | 'sms' | 'email';
    backupCodesGenerated: boolean;
    lastPasswordChange?: string;
    activeSessions: ActiveSession[];
  };

  walletSettings: {
    linkedBankAccounts: BankAccount[];
    savedAddresses: SavedAddress[];
    withdrawalLimits: {
      dailyUSD: number;
      dailyUSDT: number;
      perTransaction: number;
    };
    autoConvert: {
      enabled: boolean;
      threshold: number;
    };
    gasFeePreference: 'low' | 'medium' | 'high';
  };

  notifications: {
    email: NotificationPreferences;
    sms: NotificationPreferences;
    push: NotificationPreferences;
    frequency: 'realtime' | 'daily' | 'weekly';
  };

  preferences: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    timezone: string;
    dateFormat: string;
    timeFormat: '12h' | '24h';
    primaryCurrency: string;
    accessibility: {
      fontSize: 'small' | 'medium' | 'large';
      highContrast: boolean;
      reduceMotion: boolean;
    };
  };
}

export interface SettingsState {
  settings: UserSettings | null;
  isLoading: boolean;
  error: string | null;

  fetchSettings: () => Promise<void>;
  updateProfile: (data: Partial<UserSettings['profile']>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  enable2FA: (method: 'authenticator' | 'sms' | 'email') => Promise<void>;
  disable2FA: () => Promise<void>;
  revokeSession: (sessionId: string) => Promise<void>;
  addBankAccount: (account: Omit<BankAccount, 'id' | 'addedAt' | 'verified'>) => Promise<void>;
  removeBankAccount: (accountId: string) => Promise<void>;
  setDefaultBankAccount: (accountId: string) => Promise<void>;
  addSavedAddress: (address: Omit<SavedAddress, 'id' | 'addedAt'>) => Promise<void>;
  removeSavedAddress: (addressId: string) => Promise<void>;
  updateNotifications: (preferences: Partial<UserSettings['notifications']>) => Promise<void>;
  updatePreferences: (preferences: Partial<UserSettings['preferences']>) => Promise<void>;
  clearError: () => void;
}
