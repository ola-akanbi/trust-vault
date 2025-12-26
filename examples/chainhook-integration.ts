import { TrustVaultChainhooks } from '../src/chainhooks';
import { CHAINHOOK_CONFIG } from '../src/config';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Example: Setting up TrustVault chainhook monitoring
 * 
 * This example demonstrates how to:
 * 1. Initialize the chainhook client
 * 2. Register monitors for different contract events
 * 3. Handle webhook callbacks
 * 4. Manage monitor lifecycle
 */

async function setupTrustVaultMonitoring() {
  const config = CHAINHOOK_CONFIG.mainnet;
  
  // Initialize chainhook client with your configuration
  const chainhooks = new TrustVaultChainhooks({
    baseUrl: config.baseUrl,
    apiKey: process.env.CHAINHOOKS_API_KEY || '',
    network: config.network,
    contractAddress: config.contractAddress,
    webhookUrl: process.env.WEBHOOK_URL || '',
  });

  // Check API status first
  console.log('🔍 Checking Chainhooks API status...');
  await chainhooks.checkStatus();

  // Register all monitors at once
  console.log('\n🚀 Registering all monitors...');
  const hooks = await chainhooks.registerAllMonitors();

  console.log('\n📋 Registered chainhooks:');
  hooks.forEach((uuid, name) => {
    console.log(`  - ${name}: ${uuid}`);
  });

  // Or register individual monitors
  // await chainhooks.monitorIdentityRegistrations();
  // await chainhooks.monitorCredentialIssuance();
  // await chainhooks.monitorCredentialRevocations();

  return chainhooks;
}

/**
 * Example: Express.js webhook handler
 */
import express, { Request, Response } from 'express';

const app = express();
app.use(express.json());

// Webhook endpoint for identity registrations
app.post('/webhooks/identity-registered', async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    
    // Extract transaction data
    const apply = payload.apply[0];
    const transaction = apply.transactions[0];
    const contractCall = transaction.metadata.receipt.contract_calls_stack[0];

    // Parse function arguments
    const [identityHashArg, recoveryAddressArg] = contractCall.function_args;
    
    console.log('🆔 New Identity Registered!');
    console.log('  Address:', transaction.operations[0].account.address);
    console.log('  Block:', apply.block_identifier.index);
    console.log('  Tx Hash:', transaction.transaction_identifier.hash);
    console.log('  Identity Hash:', identityHashArg);
    console.log('  Recovery Address:', recoveryAddressArg);

    // TODO: Store in your database, send notifications, etc.
    // await database.identities.create({
    //   address: transaction.operations[0].account.address,
    //   identityHash: identityHashArg,
    //   blockHeight: apply.block_identifier.index,
    //   txHash: transaction.transaction_identifier.hash,
    // });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error processing identity registration webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Webhook endpoint for credential issuance
app.post('/webhooks/credential-issued', async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    
    const apply = payload.apply[0];
    const transaction = apply.transactions[0];
    const contractCall = transaction.metadata.receipt.contract_calls_stack[0];

    const [subject, claimHash, expiration, metadata] = contractCall.function_args;
    
    console.log('📜 New Credential Issued!');
    console.log('  Issuer:', transaction.operations[0].account.address);
    console.log('  Subject:', subject);
    console.log('  Claim Hash:', claimHash);
    console.log('  Expiration:', expiration);
    console.log('  Metadata:', metadata);
    console.log('  Block:', apply.block_identifier.index);

    // TODO: Store credential, index for searches, send notifications
    // await database.credentials.create({
    //   issuer: transaction.operations[0].account.address,
    //   subject,
    //   claimHash,
    //   expiration,
    //   metadata,
    //   blockHeight: apply.block_identifier.index,
    // });

    // Send notification to subject
    // await notificationService.sendEmail(subject, 'New credential issued');

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error processing credential issuance webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Webhook endpoint for credential revocations
app.post('/webhooks/credential-revoked', async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    
    const apply = payload.apply[0];
    const transaction = apply.transactions[0];
    const contractCall = transaction.metadata.receipt.contract_calls_stack[0];

    const [issuer, nonce] = contractCall.function_args;
    
    console.log('🚫 Credential Revoked!');
    console.log('  Issuer:', issuer);
    console.log('  Nonce:', nonce);
    console.log('  Block:', apply.block_identifier.index);

    // TODO: Update credential status in database
    // await database.credentials.update(
    //   { issuer, nonce },
    //   { revoked: true, revokedAt: apply.timestamp }
    // );

    // Alert credential holder
    // const credential = await database.credentials.findOne({ issuer, nonce });
    // await notificationService.sendAlert(credential.subject, 'Credential revoked');

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error processing credential revocation webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Webhook endpoint for reputation updates
app.post('/webhooks/reputation-updated', async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    
    const apply = payload.apply[0];
    const transaction = apply.transactions[0];
    const contractCall = transaction.metadata.receipt.contract_calls_stack[0];

    const [subject, scoreChange] = contractCall.function_args;
    
    console.log('⭐ Reputation Updated!');
    console.log('  Subject:', subject);
    console.log('  Score Change:', scoreChange);
    console.log('  Admin:', transaction.operations[0].account.address);
    console.log('  Block:', apply.block_identifier.index);

    // TODO: Track reputation history
    // await database.reputationHistory.create({
    //   subject,
    //   scoreChange,
    //   admin: transaction.operations[0].account.address,
    //   blockHeight: apply.block_identifier.index,
    //   timestamp: apply.timestamp,
    // });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error processing reputation update webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Webhook endpoint for ZK proof submissions
app.post('/webhooks/proof-submitted', async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    
    const apply = payload.apply[0];
    const transaction = apply.transactions[0];
    const contractCall = transaction.metadata.receipt.contract_calls_stack[0];

    const [proofHash, proofData] = contractCall.function_args;
    
    console.log('🔐 ZK Proof Submitted!');
    console.log('  Prover:', transaction.operations[0].account.address);
    console.log('  Proof Hash:', proofHash);
    console.log('  Block:', apply.block_identifier.index);

    // TODO: Queue proof for verification
    // await verificationQueue.add({
    //   proofHash,
    //   proofData,
    //   prover: transaction.operations[0].account.address,
    //   submittedAt: apply.timestamp,
    // });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error processing ZK proof webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Webhook endpoint for emergency pause events
app.post('/webhooks/contract-paused', async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    
    const apply = payload.apply[0];
    const transaction = apply.transactions[0];
    
    console.log('🚨 EMERGENCY: Contract Paused!');
    console.log('  Triggered by:', transaction.operations[0].account.address);
    console.log('  Block:', apply.block_identifier.index);
    console.log('  Timestamp:', new Date(apply.timestamp * 1000).toISOString());

    // TODO: Alert all stakeholders immediately
    // await alertService.sendEmergencyNotification({
    //   type: 'CONTRACT_PAUSED',
    //   triggeredBy: transaction.operations[0].account.address,
    //   blockHeight: apply.block_identifier.index,
    //   timestamp: apply.timestamp,
    // });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error processing pause event webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start webhook server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Webhook server listening on port ${PORT}`);
});

/**
 * Example: Managing monitors programmatically
 */
async function manageMonitors() {
  const chainhooks = await setupTrustVaultMonitoring();

  // List all active monitors
  console.log('\n📊 Listing active monitors...');
  const activeMonitors = await chainhooks.listActiveMonitors();
  console.log(`Found ${activeMonitors.length} active monitors`);

  // Temporarily disable a monitor
  console.log('\n⏸️ Disabling credential issuance monitor...');
  await chainhooks.disableMonitor('credential-issuance');

  // Re-enable it later
  console.log('\n▶️ Re-enabling credential issuance monitor...');
  await chainhooks.enableMonitor('credential-issuance');

  // Remove a monitor completely
  // await chainhooks.removeMonitor('credential-issuance');
}

/**
 * Example: Analytics and monitoring
 */
interface TrustVaultAnalytics {
  totalIdentities: number;
  totalCredentials: number;
  credentialsIssued24h: number;
  avgReputationScore: number;
  recentPauseEvents: number;
}

async function generateAnalytics(): Promise<TrustVaultAnalytics> {
  // Use chainhook data to generate real-time analytics
  // This data would typically come from your database populated by webhooks
  
  return {
    totalIdentities: 1250,
    totalCredentials: 3480,
    credentialsIssued24h: 45,
    avgReputationScore: 742,
    recentPauseEvents: 0,
  };
}

// Export for use in other modules
export { setupTrustVaultMonitoring, manageMonitors, generateAnalytics };

// Run if executed directly (ES module compatible check)
if (import.meta.url === `file://${process.argv[1]}`) {
  setupTrustVaultMonitoring()
    .then(() => {
      console.log('\n✅ TrustVault monitoring setup complete!');
      console.log('\n📊 Monitor your chainhooks at:');
      console.log('   https://platform.hiro.so/');
      console.log('\n🔔 Webhook endpoints receiving events:');
      console.log(`   POST ${process.env.WEBHOOK_URL}/identity-registered`);
      console.log(`   POST ${process.env.WEBHOOK_URL}/credential-issued`);
      console.log(`   POST ${process.env.WEBHOOK_URL}/credential-revoked`);
      console.log(`   POST ${process.env.WEBHOOK_URL}/reputation-updated`);
      console.log(`   POST ${process.env.WEBHOOK_URL}/proof-submitted`);
      console.log(`   POST ${process.env.WEBHOOK_URL}/contract-paused`);
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Setup failed:', error.message);
      process.exit(1);
    });
}
