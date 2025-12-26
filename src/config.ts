// TrustVault Mainnet Configuration
// Contract Address: SP11MXPJA03GJ9FS5H6GWPWH3ZDNR7P1DSAPKP6KD.trust-vault

export const TRUST_VAULT_CONFIG = {
  mainnet: {
    contractAddress: 'SP11MXPJA03GJ9FS5H6GWPWH3ZDNR7P1DSAPKP6KD.trust-vault',
    contractName: 'trust-vault',
    deployer: 'SP11MXPJA03GJ9FS5H6GWPWH3ZDNR7P1DSAPKP6KD',
    network: 'mainnet',
    stacksApi: 'https://api.mainnet.hiro.so',
    explorerUrl: 'https://explorer.hiro.so',
    deploymentDate: '2025-12-21',
    deploymentCost: '0.140730 STX',
    clarityVersion: 4,
  },
  testnet: {
    contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.trust-vault',
    contractName: 'trust-vault',
    deployer: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
    network: 'testnet',
    stacksApi: 'https://api.testnet.hiro.so',
    explorerUrl: 'https://explorer.hiro.so',
  },
};

// Chainhook configuration for mainnet
export const CHAINHOOK_CONFIG = {
  mainnet: {
    baseUrl: 'https://api.mainnet.hiro.so',
    contractAddress: TRUST_VAULT_CONFIG.mainnet.contractAddress,
    network: 'mainnet' as const,
  },
  testnet: {
    baseUrl: 'https://api.testnet.hiro.so',
    contractAddress: TRUST_VAULT_CONFIG.testnet.contractAddress,
    network: 'testnet' as const,
  },
};

// Helper function to get configuration based on environment
export function getTrustVaultConfig() {
  const network = process.env.STACKS_NETWORK || 'mainnet';
  return TRUST_VAULT_CONFIG[network as keyof typeof TRUST_VAULT_CONFIG];
}

// Helper function to get Chainhook configuration
export function getChainhookConfig() {
  const network = process.env.STACKS_NETWORK || 'mainnet';
  return CHAINHOOK_CONFIG[network as keyof typeof CHAINHOOK_CONFIG];
}

// Contract function names for reference
export const CONTRACT_FUNCTIONS = {
  // Identity Management
  registerIdentity: 'register-identity',
  initiateRecovery: 'initiate-recovery',
  
  // Credentials
  issueCredential: 'issue-credential',
  revokeCredential: 'revoke-credential',
  
  // Zero-Knowledge Proofs
  submitProof: 'submit-proof',
  verifyProof: 'verify-proof',
  
  // Reputation
  updateReputation: 'update-reputation',
  
  // Emergency Controls
  pauseContract: 'pause-contract',
  unpauseContract: 'unpause-contract',
  setPauseGuardian: 'set-pause-guardian',
  
  // Admin
  setAdmin: 'set-admin',
  
  // Read-Only
  getIdentity: 'get-identity',
  getCredential: 'get-credential',
  verifyCredential: 'verify-credential',
  getProof: 'get-proof',
  getIdentityStatusString: 'get-identity-status-string',
  getCredentialTimeInfo: 'get-credential-time-info',
  isCredentialExpired: 'is-credential-expired',
} as const;

// Error codes
export const ERROR_CODES = {
  NOT_AUTHORIZED: 1000,
  ALREADY_REGISTERED: 1001,
  NOT_REGISTERED: 1002,
  INVALID_PROOF: 1003,
  INVALID_CREDENTIAL: 1004,
  EXPIRED_CREDENTIAL: 1005,
  REVOKED_CREDENTIAL: 1006,
  INVALID_SCORE: 1007,
  INVALID_INPUT: 1008,
  INVALID_EXPIRATION: 1009,
  INVALID_RECOVERY_ADDRESS: 1010,
  INVALID_PROOF_DATA: 1011,
  CONTRACT_PAUSED: 1012,
} as const;

// Helper to get error message
export function getErrorMessage(errorCode: number): string {
  const messages: Record<number, string> = {
    1000: 'Not authorized to perform this action',
    1001: 'Identity already registered',
    1002: 'Identity not registered',
    1003: 'Invalid proof submission',
    1004: 'Invalid credential',
    1005: 'Credential has expired',
    1006: 'Credential has been revoked',
    1007: 'Invalid reputation score',
    1008: 'Invalid input parameters',
    1009: 'Invalid expiration date',
    1010: 'Invalid recovery address',
    1011: 'Invalid proof data',
    1012: 'Contract is currently paused',
  };
  
  return messages[errorCode] || `Unknown error: ${errorCode}`;
}

// Export contract URLs for quick access
export const CONTRACT_URLS = {
  mainnet: {
    explorer: `https://explorer.hiro.so/txid/${TRUST_VAULT_CONFIG.mainnet.contractAddress}?chain=mainnet`,
    api: `${TRUST_VAULT_CONFIG.mainnet.stacksApi}/v2/contracts/interface/${TRUST_VAULT_CONFIG.mainnet.deployer}/trust-vault`,
    transactions: `${TRUST_VAULT_CONFIG.mainnet.stacksApi}/extended/v1/address/${TRUST_VAULT_CONFIG.mainnet.deployer}/transactions`,
  },
  testnet: {
    explorer: `https://explorer.hiro.so/txid/${TRUST_VAULT_CONFIG.testnet.contractAddress}?chain=testnet`,
    api: `${TRUST_VAULT_CONFIG.testnet.stacksApi}/v2/contracts/interface/${TRUST_VAULT_CONFIG.testnet.deployer}/trust-vault`,
    transactions: `${TRUST_VAULT_CONFIG.testnet.stacksApi}/extended/v1/address/${TRUST_VAULT_CONFIG.testnet.deployer}/transactions`,
  },
};
