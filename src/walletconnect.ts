import { Core } from '@walletconnect/core';
import { WalletKit } from '@reown/walletkit';
import { getSdkError } from '@walletconnect/utils';

// WalletConnect configuration
const projectId = process.env.WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID';

export interface WalletConnectConfig {
  projectId: string;
  metadata: {
    name: string;
    description: string;
    url: string;
    icons: string[];
  };
}

export interface StacksAddress {
  symbol: string;
  address: string;
}

export interface TransferStxParams {
  sender: string;
  recipient: string;
  amount: string;
  memo?: string;
  network?: 'mainnet' | 'testnet' | 'devnet';
}

export interface SignTransactionParams {
  transaction: string;
  broadcast?: boolean;
  network?: 'mainnet' | 'testnet' | 'devnet';
}

export interface SignMessageParams {
  address: string;
  message: string;
  messageType?: 'utf8' | 'structured';
  network?: 'mainnet' | 'testnet' | 'devnet';
  domain?: string;
}

export interface CallContractParams {
  contract: string;
  functionName: string;
  functionArgs: string[];
}

export class StacksWalletConnect {
  private core: Core;
  private walletKit: WalletKit | null = null;
  private config: WalletConnectConfig;

  constructor(config?: Partial<WalletConnectConfig>) {
    this.config = {
      projectId: config?.projectId || projectId,
      metadata: config?.metadata || {
        name: 'Trust Vault',
        description: 'Decentralized trust and escrow management on Stacks blockchain',
        url: 'https://trustvault.stacks.io',
        icons: ['https://trustvault.stacks.io/icon.png'],
      },
    };

    this.core = new Core({
      projectId: this.config.projectId,
    });
  }

  /**
   * Initialize WalletConnect WalletKit
   */
  async init(): Promise<void> {
    if (this.walletKit) {
      console.log('WalletKit already initialized');
      return;
    }

    this.walletKit = await WalletKit.init({
      core: this.core,
      metadata: this.config.metadata,
    });

    // Set up event listeners
    this.setupEventListeners();

    console.log('WalletConnect initialized successfully');
  }

  /**
   * Setup event listeners for WalletConnect
   */
  private setupEventListeners(): void {
    if (!this.walletKit) return;

    // Session proposal event
    this.walletKit.on('session_proposal', async (proposal) => {
      console.log('Session proposal received:', proposal);
      // Handle session proposal - approve or reject
      await this.handleSessionProposal(proposal);
    });

    // Session request event
    this.walletKit.on('session_request', async (requestEvent) => {
      console.log('Session request received:', requestEvent);
      // Handle session request based on method
      await this.handleSessionRequest(requestEvent);
    });

    // Session delete event
    this.walletKit.on('session_delete', (deleteEvent) => {
      console.log('Session deleted:', deleteEvent);
      // Clean up session
    });
  }

  /**
   * Handle session proposal
   */
  private async handleSessionProposal(proposal: any): Promise<void> {
    if (!this.walletKit) throw new Error('WalletKit not initialized');

    try {
      // Get the required and optional namespaces
      const { id, params } = proposal;
      const { requiredNamespaces, optionalNamespaces } = params;

      // Build the namespaces with Stacks support
      const namespaces: any = {};

      // Handle required namespaces
      if (requiredNamespaces?.stacks) {
        namespaces.stacks = {
          chains: requiredNamespaces.stacks.chains,
          methods: requiredNamespaces.stacks.methods,
          events: requiredNamespaces.stacks.events,
          accounts: this.buildStacksAccounts(requiredNamespaces.stacks.chains),
        };
      }

      // Handle optional namespaces
      if (optionalNamespaces?.stacks) {
        if (!namespaces.stacks) {
          namespaces.stacks = {
            chains: optionalNamespaces.stacks.chains || [],
            methods: optionalNamespaces.stacks.methods || [],
            events: optionalNamespaces.stacks.events || [],
            accounts: this.buildStacksAccounts(optionalNamespaces.stacks.chains || []),
          };
        }
      }

      // Approve the session
      await this.walletKit.approveSession({
        id,
        namespaces,
      });

      console.log('Session approved successfully');
    } catch (error) {
      console.error('Error approving session:', error);
      // Reject the session
      await this.walletKit.rejectSession({
        id: proposal.id,
        reason: getSdkError('USER_REJECTED'),
      });
    }
  }

  /**
   * Build Stacks accounts for session approval
   */
  private buildStacksAccounts(chains: string[]): string[] {
    // TODO: Replace with actual wallet addresses
    // This should get addresses from your wallet implementation
    const mainnetAddress = 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE';
    const testnetAddress = 'ST3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE';

    const accounts: string[] = [];
    chains.forEach((chain) => {
      if (chain.includes('mainnet')) {
        accounts.push(`${chain}:${mainnetAddress}`);
      } else if (chain.includes('testnet')) {
        accounts.push(`${chain}:${testnetAddress}`);
      }
    });

    return accounts;
  }

  /**
   * Handle session requests
   */
  private async handleSessionRequest(requestEvent: any): Promise<void> {
    if (!this.walletKit) throw new Error('WalletKit not initialized');

    const { topic, params } = requestEvent;
    const { request } = params;
    const { method, params: methodParams } = request;

    try {
      let result;

      switch (method) {
        case 'stx_getAddresses':
          result = await this.handleGetAddresses();
          break;

        case 'stx_transferStx':
          result = await this.handleTransferStx(methodParams);
          break;

        case 'stx_signTransaction':
          result = await this.handleSignTransaction(methodParams);
          break;

        case 'stx_signMessage':
          result = await this.handleSignMessage(methodParams);
          break;

        case 'stx_signStructuredMessage':
          result = await this.handleSignStructuredMessage(methodParams);
          break;

        case 'stx_callContract':
          result = await this.handleCallContract(methodParams);
          break;

        default:
          throw new Error(`Unsupported method: ${method}`);
      }

      // Respond to the session request
      await this.walletKit.respondSessionRequest({
        topic,
        response: {
          id: request.id,
          jsonrpc: '2.0',
          result,
        },
      });
    } catch (error) {
      console.error('Error handling session request:', error);
      
      // Respond with error
      await this.walletKit.respondSessionRequest({
        topic,
        response: {
          id: request.id,
          jsonrpc: '2.0',
          error: {
            code: 5000,
            message: error instanceof Error ? error.message : 'Unknown error',
          },
        },
      });
    }
  }

  /**
   * Handle stx_getAddresses request
   */
  private async handleGetAddresses(): Promise<{ addresses: StacksAddress[] }> {
    // TODO: Implement actual wallet address retrieval
    // This should integrate with your wallet implementation
    return {
      addresses: [
        {
          symbol: 'STX',
          address: 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE',
        },
      ],
    };
  }

  /**
   * Handle stx_transferStx request
   */
  private async handleTransferStx(params: TransferStxParams): Promise<{ txid: string; transaction: string }> {
    // TODO: Implement STX transfer
    // This should create and broadcast an STX transfer transaction
    console.log('Transfer STX params:', params);
    
    throw new Error('stx_transferStx not implemented');
  }

  /**
   * Handle stx_signTransaction request
   */
  private async handleSignTransaction(params: SignTransactionParams): Promise<{ signature: string; transaction: string; txid?: string }> {
    // TODO: Implement transaction signing
    // This should sign a transaction and optionally broadcast it
    console.log('Sign transaction params:', params);
    
    throw new Error('stx_signTransaction not implemented');
  }

  /**
   * Handle stx_signMessage request
   */
  private async handleSignMessage(params: SignMessageParams): Promise<{ signature: string }> {
    // TODO: Implement message signing
    // This should sign an arbitrary message
    console.log('Sign message params:', params);
    
    throw new Error('stx_signMessage not implemented');
  }

  /**
   * Handle stx_signStructuredMessage request
   */
  private async handleSignStructuredMessage(params: any): Promise<{ signature: string; publicKey?: string }> {
    // TODO: Implement structured message signing (SIP-018)
    console.log('Sign structured message params:', params);
    
    throw new Error('stx_signStructuredMessage not implemented');
  }

  /**
   * Handle stx_callContract request
   */
  private async handleCallContract(params: CallContractParams): Promise<{ txid: string; transaction: string }> {
    // TODO: Implement contract call
    // This should create and broadcast a contract call transaction
    console.log('Call contract params:', params);
    
    throw new Error('stx_callContract not implemented');
  }

  /**
   * Pair with a dApp using a WalletConnect URI
   */
  async pair(uri: string): Promise<void> {
    if (!this.walletKit) throw new Error('WalletKit not initialized');
    
    await this.walletKit.core.pairing.pair({ uri });
    console.log('Paired successfully with URI');
  }

  /**
   * Get all active sessions
   */
  getActiveSessions(): any[] {
    if (!this.walletKit) return [];
    
    return Object.values(this.walletKit.getActiveSessions());
  }

  /**
   * Disconnect a session
   */
  async disconnectSession(topic: string): Promise<void> {
    if (!this.walletKit) throw new Error('WalletKit not initialized');
    
    await this.walletKit.disconnectSession({
      topic,
      reason: getSdkError('USER_DISCONNECTED'),
    });
    
    console.log('Session disconnected:', topic);
  }

  /**
   * Cleanup and disconnect all sessions
   */
  async cleanup(): Promise<void> {
    if (!this.walletKit) return;

    const sessions = this.getActiveSessions();
    for (const session of sessions) {
      await this.disconnectSession(session.topic);
    }
    
    console.log('WalletConnect cleanup completed');
  }
}

// Export singleton instance
export const walletConnect = new StacksWalletConnect();
