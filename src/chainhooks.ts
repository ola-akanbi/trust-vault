import { ChainhooksClient, CHAINHOOKS_BASE_URL } from '@hirosystems/chainhooks-client';
import type { ChainhookDefinition } from '@hirosystems/chainhooks-client';

/**
 * TrustVault Chainhook Integration
 * 
 * This module sets up real-time monitoring of TrustVault contract events
 * using the Chainhooks API to track identity registrations, credential
 * issuance, and reputation changes.
 */

export interface TrustVaultChainhookConfig {
  baseUrl: string;
  apiKey: string;
  network: 'mainnet' | 'testnet';
  contractAddress: string;
  webhookUrl: string;
}

export class TrustVaultChainhooks {
  private client: ChainhooksClient;
  private config: TrustVaultChainhookConfig;
  private registeredHooks: Map<string, string> = new Map();

  constructor(config: TrustVaultChainhookConfig) {
    this.config = config;
    this.client = new ChainhooksClient({
      baseUrl: config.baseUrl,
      apiKey: config.apiKey,
    });
  }

  /**
   * Register a chainhook to monitor identity registrations
   */
  async monitorIdentityRegistrations(): Promise<string> {
    const chainhook: ChainhookDefinition = {
      name: 'TrustVault Identity Registrations',
      chain: 'stacks',
      network: this.config.network,
      version: '1',
      filters: {
        events: [
          {
            type: 'contract_call',
            contract_identifier: this.config.contractAddress,
            method: 'register-identity',
          },
        ],
      },
      action: {
        type: 'http_post',
        url: `${this.config.webhookUrl}/identity-registered`,
      },
      options: {
        enable_on_registration: true,
      },
    };

    try {
      const result = await this.client.registerChainhook(chainhook);
      this.registeredHooks.set('identity-registrations', result.uuid);
      console.log('✅ Identity registration monitor activated:', result.uuid);
      return result.uuid;
    } catch (error) {
      console.error('❌ Failed to register identity chainhook:', error);
      throw error;
    }
  }

  /**
   * Register a chainhook to monitor credential issuance
   */
  async monitorCredentialIssuance(): Promise<string> {
    const chainhook: ChainhookDefinition = {
      name: 'TrustVault Credential Issuance',
      chain: 'stacks',
      network: this.config.network,
      version: '1',
      filters: {
        events: [
          {
            type: 'contract_call',
            contract_identifier: this.config.contractAddress,
            method: 'issue-credential',
          },
        ],
      },
      action: {
        type: 'http_post',
        url: `${this.config.webhookUrl}/credential-issued`,
      },
      options: {
        enable_on_registration: true,
      },
    };

    try {
      const result = await this.client.registerChainhook(chainhook);
      this.registeredHooks.set('credential-issuance', result.uuid);
      console.log('✅ Credential issuance monitor activated:', result.uuid);
      return result.uuid;
    } catch (error) {
      console.error('❌ Failed to register credential chainhook:', error);
      throw error;
    }
  }

  /**
   * Register a chainhook to monitor credential revocations
   */
  async monitorCredentialRevocations(): Promise<string> {
    const chainhook: ChainhookDefinition = {
      name: 'TrustVault Credential Revocations',
      chain: 'stacks',
      network: this.config.network,
      version: '1',
      filters: {
        events: [
          {
            type: 'contract_call',
            contract_identifier: this.config.contractAddress,
            method: 'revoke-credential',
          },
        ],
      },
      action: {
        type: 'http_post',
        url: `${this.config.webhookUrl}/credential-revoked`,
      },
      options: {
        enable_on_registration: true,
      },
    };

    try {
      const result = await this.client.registerChainhook(chainhook);
      this.registeredHooks.set('credential-revocations', result.uuid);
      console.log('✅ Credential revocation monitor activated:', result.uuid);
      return result.uuid;
    } catch (error) {
      console.error('❌ Failed to register revocation chainhook:', error);
      throw error;
    }
  }

  /**
   * Register a chainhook to monitor reputation changes
   */
  async monitorReputationChanges(): Promise<string> {
    const chainhook: ChainhookDefinition = {
      name: 'TrustVault Reputation Updates',
      chain: 'stacks',
      network: this.config.network,
      version: '1',
      filters: {
        events: [
          {
            type: 'contract_call',
            contract_identifier: this.config.contractAddress,
            method: 'update-reputation',
          },
        ],
      },
      action: {
        type: 'http_post',
        url: `${this.config.webhookUrl}/reputation-updated`,
      },
      options: {
        enable_on_registration: true,
      },
    };

    try {
      const result = await this.client.registerChainhook(chainhook);
      this.registeredHooks.set('reputation-changes', result.uuid);
      console.log('✅ Reputation change monitor activated:', result.uuid);
      return result.uuid;
    } catch (error) {
      console.error('❌ Failed to register reputation chainhook:', error);
      throw error;
    }
  }

  /**
   * Register a chainhook to monitor ZK proof submissions
   */
  async monitorZKProofs(): Promise<string> {
    const chainhook: ChainhookDefinition = {
      name: 'TrustVault ZK Proof Submissions',
      chain: 'stacks',
      network: this.config.network,
      version: '1',
      filters: {
        events: [
          {
            type: 'contract_call',
            contract_identifier: this.config.contractAddress,
            method: 'submit-proof',
          },
        ],
      },
      action: {
        type: 'http_post',
        url: `${this.config.webhookUrl}/proof-submitted`,
      },
      options: {
        enable_on_registration: true,
      },
    };

    try {
      const result = await this.client.registerChainhook(chainhook);
      this.registeredHooks.set('zk-proofs', result.uuid);
      console.log('✅ ZK proof monitor activated:', result.uuid);
      return result.uuid;
    } catch (error) {
      console.error('❌ Failed to register ZK proof chainhook:', error);
      throw error;
    }
  }

  /**
   * Register a chainhook to monitor emergency pause events
   */
  async monitorPauseEvents(): Promise<string> {
    const chainhook: ChainhookDefinition = {
      name: 'TrustVault Emergency Pause Events',
      chain: 'stacks',
      network: this.config.network,
      version: '1',
      filters: {
        events: [
          {
            type: 'contract_call',
            contract_identifier: this.config.contractAddress,
            method: 'pause-contract',
          },
        ],
      },
      action: {
        type: 'http_post',
        url: `${this.config.webhookUrl}/contract-paused`,
      },
      options: {
        enable_on_registration: true,
      },
    };

    try {
      const result = await this.client.registerChainhook(chainhook);
      this.registeredHooks.set('pause-events', result.uuid);
      console.log('✅ Pause event monitor activated:', result.uuid);
      return result.uuid;
    } catch (error) {
      console.error('❌ Failed to register pause chainhook:', error);
      throw error;
    }
  }

  /**
   * Register all monitoring chainhooks at once
   */
  async registerAllMonitors(): Promise<Map<string, string>> {
    console.log('🚀 Registering all TrustVault monitors...');
    
    try {
      await Promise.all([
        this.monitorIdentityRegistrations(),
        this.monitorCredentialIssuance(),
        this.monitorCredentialRevocations(),
        this.monitorReputationChanges(),
        this.monitorZKProofs(),
        this.monitorPauseEvents(),
      ]);

      console.log('✅ All monitors registered successfully!');
      return this.registeredHooks;
    } catch (error) {
      console.error('❌ Failed to register all monitors:', error);
      throw error;
    }
  }

  /**
   * List all active chainhooks
   */
  async listActiveMonitors() {
    try {
      const response = await this.client.getChainhooks({ limit: 50 });
      console.log(`📊 Total active chainhooks: ${response.total}`);
      return response.results;
    } catch (error) {
      console.error('❌ Failed to list chainhooks:', error);
      throw error;
    }
  }

  /**
   * Disable a specific monitor
   */
  async disableMonitor(monitorName: string): Promise<void> {
    const uuid = this.registeredHooks.get(monitorName);
    if (!uuid) {
      throw new Error(`Monitor "${monitorName}" not found`);
    }

    try {
      await this.client.enableChainhook(uuid, false);
      console.log(`🔴 Monitor "${monitorName}" disabled`);
    } catch (error) {
      console.error(`❌ Failed to disable monitor "${monitorName}":`, error);
      throw error;
    }
  }

  /**
   * Enable a specific monitor
   */
  async enableMonitor(monitorName: string): Promise<void> {
    const uuid = this.registeredHooks.get(monitorName);
    if (!uuid) {
      throw new Error(`Monitor "${monitorName}" not found`);
    }

    try {
      await this.client.enableChainhook(uuid, true);
      console.log(`🟢 Monitor "${monitorName}" enabled`);
    } catch (error) {
      console.error(`❌ Failed to enable monitor "${monitorName}":`, error);
      throw error;
    }
  }

  /**
   * Remove a specific monitor
   */
  async removeMonitor(monitorName: string): Promise<void> {
    const uuid = this.registeredHooks.get(monitorName);
    if (!uuid) {
      throw new Error(`Monitor "${monitorName}" not found`);
    }

    try {
      await this.client.deleteChainhook(uuid);
      this.registeredHooks.delete(monitorName);
      console.log(`🗑️ Monitor "${monitorName}" removed`);
    } catch (error) {
      console.error(`❌ Failed to remove monitor "${monitorName}":`, error);
      throw error;
    }
  }

  /**
   * Check API status
   */
  async checkStatus() {
    try {
      const status = await this.client.getStatus();
      console.log('📡 Chainhooks API Status:', status.status);
      console.log('📦 Server Version:', status.server_version);
      return status;
    } catch (error) {
      console.error('❌ Failed to check API status:', error);
      throw error;
    }
  }

  /**
   * Get all registered hook UUIDs
   */
  getRegisteredHooks(): Map<string, string> {
    return this.registeredHooks;
  }
}

// Example usage and webhook handler types
export interface WebhookPayload {
  apply: Array<{
    block_identifier: {
      index: number;
      hash: string;
    };
    timestamp: number;
    transactions: Array<{
      transaction_identifier: {
        hash: string;
      };
      operations: Array<{
        type: string;
        status: string;
        account: {
          address: string;
        };
      }>;
      metadata: {
        receipt: {
          contract_calls_stack: Array<{
            contract_identifier: string;
            function_name: string;
            function_args: Array<string>;
          }>;
        };
      };
    }>;
  }>;
}

export interface IdentityRegisteredEvent {
  address: string;
  identityHash: string;
  recoveryAddress: string | null;
  blockHeight: number;
  timestamp: number;
  txHash: string;
}

export interface CredentialIssuedEvent {
  issuer: string;
  subject: string;
  claimHash: string;
  expiration: number;
  metadata: string;
  nonce: number;
  blockHeight: number;
  timestamp: number;
  txHash: string;
}

export interface ReputationUpdatedEvent {
  subject: string;
  scoreChange: number;
  newScore: number;
  admin: string;
  blockHeight: number;
  timestamp: number;
  txHash: string;
}
