/**
 * TypeScript type definitions for WalletConnect integration with Stacks blockchain
 */

// Stacks address types
export type StacksNetwork = 'mainnet' | 'testnet' | 'devnet';
export type StacksAddressPrefix = 'SP' | 'ST'; // SP = mainnet, ST = testnet

export interface StacksAddress {
  symbol: 'STX';
  address: string;
  publicKey?: string;
}

// WalletConnect configuration
export interface WalletConnectMetadata {
  name: string;
  description: string;
  url: string;
  icons: string[];
}

export interface WalletConnectConfig {
  projectId: string;
  metadata: WalletConnectMetadata;
}

// Session types
export interface SessionProposal {
  id: number;
  params: {
    requiredNamespaces?: {
      stacks?: {
        chains: string[];
        methods: string[];
        events: string[];
      };
    };
    optionalNamespaces?: {
      stacks?: {
        chains: string[];
        methods: string[];
        events: string[];
      };
    };
  };
}

export interface SessionRequest {
  topic: string;
  params: {
    request: {
      id: number;
      method: string;
      params: any;
    };
  };
}

export interface SessionNamespace {
  chains: string[];
  methods: string[];
  events: string[];
  accounts: string[];
}

// Stacks JSON-RPC method parameters
export interface GetAddressesParams {
  // No parameters required
}

export interface GetAddressesResponse {
  addresses: StacksAddress[];
}

export interface TransferStxParams {
  sender: string;
  recipient: string;
  amount: string; // micro-STX (uSTX) as string
  memo?: string;
  network?: StacksNetwork;
}

export interface TransferStxResponse {
  txid: string;
  transaction: string; // hex-encoded transaction
}

export interface SignTransactionParams {
  transaction: string; // hex-encoded transaction
  broadcast?: boolean;
  network?: StacksNetwork;
}

export interface SignTransactionResponse {
  signature: string;
  transaction: string;
  txid?: string; // Present if broadcast=true
}

export interface SignMessageParams {
  address: string;
  message: string;
  messageType?: 'utf8' | 'structured';
  network?: StacksNetwork;
  domain?: string; // For structured messages (SIP-018)
}

export interface SignMessageResponse {
  signature: string;
}

export interface SignStructuredMessageParams {
  message: string | object;
  domain: string | object;
}

export interface SignStructuredMessageResponse {
  signature: string;
  publicKey?: string;
}

export interface CallContractParams {
  contract: string; // Fully qualified: "SP...contract-name"
  functionName: string;
  functionArgs: string[];
  sender?: string; // Optional sender address
  network?: StacksNetwork;
}

export interface CallContractResponse {
  txid: string;
  transaction: string; // hex-encoded raw transaction
}

// Trust Vault specific types
export interface CreateTrustParams {
  beneficiary: string;
  amount: number; // micro-STX
  unlockHeight: number;
  description: string;
}

export interface ReleaseTrustParams {
  trustId: number;
}

export interface RevokeTrustParams {
  trustId: number;
}

export interface ExtendTrustParams {
  trustId: number;
  newUnlockHeight: number;
}

export interface TrustVaultConfig {
  projectId?: string;
  network?: StacksNetwork;
  contractAddress?: string;
  contractName?: string;
}

// Error types
export interface WalletConnectError {
  code: number;
  message: string;
}

export interface JsonRpcError {
  id: number;
  jsonrpc: '2.0';
  error: WalletConnectError;
}

export interface JsonRpcSuccess<T> {
  id: number;
  jsonrpc: '2.0';
  result: T;
}

export type JsonRpcResponse<T> = JsonRpcSuccess<T> | JsonRpcError;

// Event types
export type WalletConnectEvent = 
  | 'session_proposal'
  | 'session_request'
  | 'session_delete'
  | 'session_update'
  | 'session_event';

export interface WalletConnectEventCallback<T = any> {
  (event: T): void | Promise<void>;
}

// Method types
export type StacksMethod =
  | 'stx_getAddresses'
  | 'stx_transferStx'
  | 'stx_signTransaction'
  | 'stx_signMessage'
  | 'stx_signStructuredMessage'
  | 'stx_callContract';

// Session state
export interface ActiveSession {
  topic: string;
  acknowledged: boolean;
  controller: string;
  expiry: number;
  namespaces: {
    stacks?: SessionNamespace;
  };
  requiredNamespaces?: any;
  optionalNamespaces?: any;
  peer: {
    metadata: WalletConnectMetadata;
  };
}

// Pairing types
export interface PairingParams {
  uri: string;
}

export interface DisconnectParams {
  topic: string;
  reason: {
    code: number;
    message: string;
  };
}

// Type guards
export function isStacksMainnetAddress(address: string): boolean {
  return address.startsWith('SP');
}

export function isStacksTestnetAddress(address: string): boolean {
  return address.startsWith('ST');
}

export function isJsonRpcError(response: any): response is JsonRpcError {
  return 'error' in response;
}

export function isJsonRpcSuccess<T>(response: any): response is JsonRpcSuccess<T> {
  return 'result' in response;
}

// Constants
export const STACKS_CHAINS = {
  mainnet: 'stacks:mainnet',
  testnet: 'stacks:testnet',
} as const;

export const STACKS_METHODS: StacksMethod[] = [
  'stx_getAddresses',
  'stx_transferStx',
  'stx_signTransaction',
  'stx_signMessage',
  'stx_signStructuredMessage',
  'stx_callContract',
];

export const STACKS_EVENTS = [
  'accountsChanged',
  'chainChanged',
] as const;

export const DEFAULT_METADATA: WalletConnectMetadata = {
  name: 'Trust Vault',
  description: 'Decentralized trust and escrow management on Stacks blockchain',
  url: 'https://trustvault.stacks.io',
  icons: ['https://trustvault.stacks.io/icon.png'],
};

// Error codes (following WalletConnect standards)
export const ERROR_CODES = {
  USER_REJECTED: 5000,
  UNAUTHORIZED: 3000,
  UNSUPPORTED_METHOD: 10001,
  INVALID_PARAMS: -32602,
  INTERNAL_ERROR: -32603,
} as const;

export const SDK_ERRORS = {
  USER_REJECTED: {
    code: ERROR_CODES.USER_REJECTED,
    message: 'User rejected the request',
  },
  UNAUTHORIZED: {
    code: ERROR_CODES.UNAUTHORIZED,
    message: 'Unauthorized',
  },
  UNSUPPORTED_METHOD: {
    code: ERROR_CODES.UNSUPPORTED_METHOD,
    message: 'Unsupported method',
  },
  INVALID_PARAMS: {
    code: ERROR_CODES.INVALID_PARAMS,
    message: 'Invalid parameters',
  },
  INTERNAL_ERROR: {
    code: ERROR_CODES.INTERNAL_ERROR,
    message: 'Internal error',
  },
} as const;
