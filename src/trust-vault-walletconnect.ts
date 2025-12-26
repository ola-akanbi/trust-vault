import { 
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  stringUtf8CV,
  uintCV,
  principalCV,
  listCV,
  bufferCV,
} from '@stacks/transactions';
import { StacksTestnet, StacksMainnet } from '@stacks/network';
import { StacksWalletConnect } from '../src/walletconnect';

/**
 * Integration helper for Trust Vault contract with WalletConnect
 */

export class TrustVaultWalletConnect extends StacksWalletConnect {
  private network: StacksMainnet | StacksTestnet;
  private contractAddress: string;
  private contractName: string;

  constructor(
    config: {
      projectId?: string;
      network?: 'mainnet' | 'testnet';
      contractAddress?: string;
      contractName?: string;
    } = {}
  ) {
    super({
      projectId: config.projectId,
      metadata: {
        name: 'Trust Vault',
        description: 'Decentralized trust and escrow management on Stacks blockchain',
        url: 'https://trustvault.stacks.io',
        icons: ['https://trustvault.stacks.io/icon.png'],
      },
    });

    this.network = config.network === 'testnet' 
      ? new StacksTestnet() 
      : new StacksMainnet();
    
    this.contractAddress = config.contractAddress || 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE';
    this.contractName = config.contractName || 'trust-vault';
  }

  /**
   * Create a trust using WalletConnect
   */
  async createTrust(
    senderAddress: string,
    beneficiary: string,
    amount: number,
    unlockHeight: number,
    description: string,
    privateKey?: string
  ): Promise<{ txid: string; transaction: string }> {
    const txOptions = {
      contractAddress: this.contractAddress,
      contractName: this.contractName,
      functionName: 'create-trust',
      functionArgs: [
        principalCV(beneficiary),
        uintCV(amount),
        uintCV(unlockHeight),
        stringUtf8CV(description),
      ],
      senderKey: privateKey || '', // If using WalletConnect, this will be handled by the wallet
      validateWithAbi: true,
      network: this.network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Deny,
    };

    // If privateKey is provided, sign and broadcast directly
    if (privateKey) {
      const transaction = await makeContractCall(txOptions);
      const broadcastResponse = await broadcastTransaction(transaction, this.network);
      
      return {
        txid: broadcastResponse.txid,
        transaction: transaction.serialize().toString('hex'),
      };
    }

    // Otherwise, this should go through WalletConnect session request
    // The dApp will call stx_callContract method
    throw new Error('WalletConnect signing not yet implemented. Use private key for now.');
  }

  /**
   * Release a trust
   */
  async releaseTrust(
    senderAddress: string,
    trustId: number,
    privateKey?: string
  ): Promise<{ txid: string; transaction: string }> {
    const txOptions = {
      contractAddress: this.contractAddress,
      contractName: this.contractName,
      functionName: 'release-trust',
      functionArgs: [uintCV(trustId)],
      senderKey: privateKey || '',
      validateWithAbi: true,
      network: this.network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Deny,
    };

    if (privateKey) {
      const transaction = await makeContractCall(txOptions);
      const broadcastResponse = await broadcastTransaction(transaction, this.network);
      
      return {
        txid: broadcastResponse.txid,
        transaction: transaction.serialize().toString('hex'),
      };
    }

    throw new Error('WalletConnect signing not yet implemented. Use private key for now.');
  }

  /**
   * Revoke a trust
   */
  async revokeTrust(
    senderAddress: string,
    trustId: number,
    privateKey?: string
  ): Promise<{ txid: string; transaction: string }> {
    const txOptions = {
      contractAddress: this.contractAddress,
      contractName: this.contractName,
      functionName: 'revoke-trust',
      functionArgs: [uintCV(trustId)],
      senderKey: privateKey || '',
      validateWithAbi: true,
      network: this.network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Deny,
    };

    if (privateKey) {
      const transaction = await makeContractCall(txOptions);
      const broadcastResponse = await broadcastTransaction(transaction, this.network);
      
      return {
        txid: broadcastResponse.txid,
        transaction: transaction.serialize().toString('hex'),
      };
    }

    throw new Error('WalletConnect signing not yet implemented. Use private key for now.');
  }

  /**
   * Extend trust unlock height
   */
  async extendTrust(
    senderAddress: string,
    trustId: number,
    newUnlockHeight: number,
    privateKey?: string
  ): Promise<{ txid: string; transaction: string }> {
    const txOptions = {
      contractAddress: this.contractAddress,
      contractName: this.contractName,
      functionName: 'extend-trust',
      functionArgs: [uintCV(trustId), uintCV(newUnlockHeight)],
      senderKey: privateKey || '',
      validateWithAbi: true,
      network: this.network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Deny,
    };

    if (privateKey) {
      const transaction = await makeContractCall(txOptions);
      const broadcastResponse = await broadcastTransaction(transaction, this.network);
      
      return {
        txid: broadcastResponse.txid,
        transaction: transaction.serialize().toString('hex'),
      };
    }

    throw new Error('WalletConnect signing not yet implemented. Use private key for now.');
  }

  /**
   * Pause the contract (admin only)
   */
  async pauseContract(
    senderAddress: string,
    privateKey?: string
  ): Promise<{ txid: string; transaction: string }> {
    const txOptions = {
      contractAddress: this.contractAddress,
      contractName: this.contractName,
      functionName: 'pause',
      functionArgs: [],
      senderKey: privateKey || '',
      validateWithAbi: true,
      network: this.network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Deny,
    };

    if (privateKey) {
      const transaction = await makeContractCall(txOptions);
      const broadcastResponse = await broadcastTransaction(transaction, this.network);
      
      return {
        txid: broadcastResponse.txid,
        transaction: transaction.serialize().toString('hex'),
      };
    }

    throw new Error('WalletConnect signing not yet implemented. Use private key for now.');
  }

  /**
   * Unpause the contract (admin only)
   */
  async unpauseContract(
    senderAddress: string,
    privateKey?: string
  ): Promise<{ txid: string; transaction: string }> {
    const txOptions = {
      contractAddress: this.contractAddress,
      contractName: this.contractName,
      functionName: 'unpause',
      functionArgs: [],
      senderKey: privateKey || '',
      validateWithAbi: true,
      network: this.network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Deny,
    };

    if (privateKey) {
      const transaction = await makeContractCall(txOptions);
      const broadcastResponse = await broadcastTransaction(transaction, this.network);
      
      return {
        txid: broadcastResponse.txid,
        transaction: transaction.serialize().toString('hex'),
      };
    }

    throw new Error('WalletConnect signing not yet implemented. Use private key for now.');
  }
}

// Example usage
async function exampleUsage() {
  // Initialize with custom configuration
  const trustVault = new TrustVaultWalletConnect({
    projectId: process.env.WALLETCONNECT_PROJECT_ID,
    network: 'testnet',
    contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
    contractName: 'trust-vault',
  });

  // Initialize WalletConnect
  await trustVault.init();

  // Example: Create a trust
  // Note: In production, the privateKey parameter should be removed
  // and signing should happen through WalletConnect
  const senderAddress = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
  const beneficiaryAddress = 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG';
  
  try {
    const result = await trustVault.createTrust(
      senderAddress,
      beneficiaryAddress,
      1000000000, // 1000 STX (in micro-STX)
      150000, // unlock at block height 150000
      'College fund for my son',
      // privateKey would go here in development, but should use WalletConnect in production
    );
    
    console.log('Trust created!');
    console.log('Transaction ID:', result.txid);
  } catch (error) {
    console.error('Error creating trust:', error);
  }
}

// Uncomment to run the example
// exampleUsage();
