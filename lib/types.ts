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
  userReferenceId?: string;
  image?: string | null;
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
  loginWithGoogle: (credential: string) => Promise<void>;
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

// Wallet from Backend
export interface Wallet {
  id: string;
  userId: string;
  network: 'TRON' | 'ETHEREUM' | 'SOLANA';
  address: string;
  dfnsWalletId?: string;
  currency: 'USDT' | 'DPRS';
  balance: number;
  status: 'ACTIVE' | 'FROZEN';
  createdAt: string;
  updatedAt: string;
}

// ============================================
// CONTRACT TYPES
// ============================================

export type ContractStatus =
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'PENDING_ACCEPTANCE'
  | 'AGREED'
  | 'PAYMENT_SUBMITTED'
  | 'IN_PROGRESS'
  | 'DELIVERED'
  | 'DELIVERY_REVIEWED'
  | 'COMPLETED'
  | 'DISPUTED'
  | 'CANCELLED'
  | 'REJECTED';

export interface Milestone {
  id: string;
  title: string;
  description: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'APPROVED' | 'REJECTED' | 'PAID';
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Contract {
  id: string;
  title: string;
  description: string;
  terms?: string;
  totalAmount: number;
  currency: string;
  status: ContractStatus;
  buyerId: string;
  sellerId: string;
  buyer?: User;
  seller?: User;
  milestones: Milestone[];
  createdAt: string;
  updatedAt: string;
}

// ============================================
// WALLET TYPES
// ============================================

export interface BridgeAccount {
  id: string;
  userId: string;
  accountNumber: string;
  routingNumber: string;
  balance: number;
  availableBalance: number;
  currency: string;
  status: string;
  bridgeAccountId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TronWallet {
  id: string;
  userId: string;
  address: string;
  publicKey: string;
  balance: number;
  usdtBalance: number;
  trxBalance: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface WalletOverview {
  bridgeAccount: BridgeAccount;
  tronWallet: TronWallet;
  lockedFunds: {
    totalLocked: number;
    activeOrders: number;
    currency?: string;
    breakdown?: any[];
  };
  totalBalance: {
    usd: number;
    usdt: number;
    lockedUSD: number;
    availableUSD: number;
  };
}

export interface WalletTransaction {
  id: string;
  userId: string;
  type: 'deposit' | 'withdraw' | 'escrow_lock' | 'escrow_release' | 'convert' | 'transfer';
  status: 'pending' | 'completed' | 'failed';
  amount: number;
  currency: string;
  source: {
    type: string;
    identifier: string;
  };
  destination: {
    type: string;
    identifier: string;
  };
  fee: number;
  netAmount: number;
  bridgeTransactionId?: string;
  txHash?: string;
  description: string;
  orderId?: string;
  createdAt: string;
  completedAt?: string;
}

export interface TransactionFilters {
  type?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  currency?: string;
  search?: string;
}

export interface WalletState {
  walletOverview: WalletOverview | null;
  wallets: any[];
  transactions: WalletTransaction[];
  isLoading: boolean;
  error: string | null;
  filters?: TransactionFilters;
  fetchOverview?: () => Promise<void>;
  fetchWalletOverview: () => Promise<void>;
  fetchTransactions: (filters?: TransactionFilters) => Promise<void>;
  depositUSD: (amount: number) => Promise<void>;
  withdrawUSD: (amount: number, bankAccountId: string) => Promise<void>;
  depositUSDT?: (amount: number) => Promise<void>;
  withdrawUSDT?: (amount: number, address: string) => Promise<void>;
  sendUSDT: (toAddress: string, amount: number) => Promise<void>;
  refreshBalances: () => Promise<void>;
  setFilters?: (filters: TransactionFilters) => void;
  setLoading: (loading: boolean) => void;
  clearError: () => void;
}

// ============================================
// NOTIFICATION TYPES
// ============================================

export interface NotificationPreferences {
  transactions: boolean;
  orders: boolean;
  security: boolean;
  marketing: boolean;
}

// ============================================
// SETTINGS TYPES
// ============================================

export interface BankAccount {
  id: string;
  accountNumber?: string;
  routingNumber?: string;
  bankName: string;
  accountType: 'checking' | 'savings';
  isDefault: boolean;
  verified: boolean;
  addedAt: string;
  last4?: string;
}

export interface SavedAddress {
  id: string;
  label: string;
  address: string;
  network: string;
  isDefault: boolean;
  addedAt: string;
  note?: string;
}

export interface LoginActivity {
  id: string;
  device: string;
  browser: string;
  os: string;
  ipAddress: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
  status?: 'SUCCESS' | 'FAILED';
  userAgent?: string;
  createdAt?: string;
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
    userReferenceId: string;
    createdAt: string;
  };

  security: {
    twoFactorEnabled: boolean;
    twoFactorMethod: 'authenticator' | 'sms' | 'email';
    backupCodesGenerated: boolean;
    lastPasswordChange: string;
    activeSessions: LoginActivity[];
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
    theme: 'light' | 'dark';
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
  loginHistory: LoginActivity[];
  isLoading: boolean;
  error: string | null;

  fetchSettings: () => Promise<void>;
  fetchLoginHistory: () => Promise<void>;
  updateProfile: (data: Partial<UserSettings['profile']>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  enable2FA: (method: 'authenticator' | 'sms' | 'email') => Promise<void>;
  disable2FA: () => Promise<void>;
  revokeSession: (sessionId: string) => Promise<void>;
  addBankAccount: (account: Partial<Omit<BankAccount, 'id' | 'addedAt' | 'verified'>>) => Promise<void>;
  removeBankAccount: (accountId: string) => Promise<void>;
  setDefaultBankAccount: (accountId: string) => Promise<void>;
  addSavedAddress: (address: Partial<Omit<SavedAddress, 'id' | 'addedAt'>>) => Promise<void>;
  removeSavedAddress: (addressId: string) => Promise<void>;
  updateNotifications: (preferences: Partial<UserSettings['notifications']>) => Promise<void>;
  updatePreferences: (preferences: Partial<UserSettings['preferences']>) => Promise<void>;
  loadPreferencesFromCookies: () => void;
  clearError: () => void;
}

// ============================================
// CHAT TYPES
// ============================================

export type MessageType = 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM';
export type MessageStatus = 'SENT' | 'DELIVERED' | 'READ';

export interface Message {
  id: string;
  contractId: string;
  senderId: string;
  content: string;
  type: MessageType;
  status: MessageStatus;
  createdAt: string;
  updatedAt: string;
  sender: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    userReferenceId?: string;
  };
}

export interface ChatSummary {
  contractId: string;
  title: string;
  status: ContractStatus;
  buyer: {
    id: string;
    name: string;
    email: string;
    userReferenceId?: string;
  };
  seller: {
    id: string;
    name: string;
    email: string;
    userReferenceId?: string;
  };
  totalMessages: number;
  lastMessage: Message | null;
  updatedAt: string;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  unreadCount: number;
  typingUsers: string[];

  // Actions
  fetchMessages: (contractId: string) => Promise<void>;
  sendMessage: (contractId: string, content: string) => Promise<void>;
  markAsRead: (contractId: string) => Promise<void>;
  fetchUnreadCount: (contractId: string) => Promise<void>;
  addMessage: (message: Message) => void;
  updateMessageStatus: (messageId: string, status: 'SENT' | 'DELIVERED' | 'READ') => void;
  setTyping: (contractId: string, isTyping: boolean) => void;
  clearError: () => void;
}

// Admin chat types
export interface AdminChatState {
  chats: ChatSummary[];
  isLoading: boolean;
  error: string | null;
  stats: {
    totalMessages: number;
    todayMessages: number;
    activeChats: number;
  };

  // Actions
  fetchAllChats: (params?: { status?: string; limit?: number }) => Promise<void>;
  fetchChatStats: () => Promise<void>;
  clearError: () => void;
}
