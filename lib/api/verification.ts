import apiClient from '../api-client';

export interface VerificationData {
  id: string;
  type: string;
  subjectReference: string;
  status: string;
  requestedAt: string;
  resolvedAt: string | null;
  currentStep: number;
  verificationUrl: string;
  submittedData?: any;
}

export interface CreateVerificationResponse {
  success: boolean;
  data: VerificationData;
  message: string;
}

export interface CheckWalletResponse {
  success: boolean;
  data: {
    needsVerification: boolean;
    kycStatus: string;
    walletCreated: boolean;
    wallet?: any;
    verification?: VerificationData;
  };
  message: string;
}

/**
 * Create a new verification request
 */
export const createVerification = async (type: 'kyc' | 'kyb' = 'kyc'): Promise<CreateVerificationResponse> => {
  const response = await apiClient.post('/verifications/create', { type });
  return response.data;
};

/**
 * Get current verification status
 */
export const getVerificationStatus = async (): Promise<{ success: boolean; data: VerificationData | null; message: string }> => {
  const response = await apiClient.get('/verifications/status');
  return response.data;
};

/**
 * Check verification status and trigger wallet creation if approved
 */
export const checkAndCreateWallet = async (): Promise<CheckWalletResponse> => {
  const response = await apiClient.post('/verifications/check-and-create-wallet');
  return response.data;
};

/**
 * Get verification by ID
 */
export const getVerificationById = async (id: string): Promise<{ success: boolean; data: VerificationData; message: string }> => {
  const response = await apiClient.get(`/verifications/${id}`);
  return response.data;
};
