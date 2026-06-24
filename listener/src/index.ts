import { PrismaClient } from '@prisma/client';
import { ethers } from 'ethers';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('Starting Blockchain Event Listener Service...');

  const rpcUrl = process.env.RPC_URL || 'http://127.0.0.1:8545';
  const sharedContractPath = path.join(__dirname, '../../shared/contract.json');

  if (!fs.existsSync(sharedContractPath)) {
    console.warn('[Listener] Deployed contract details not found in shared/contract.json.');
    runMockListener();
    return;
  }

  try {
    const contractDetails = JSON.parse(fs.readFileSync(sharedContractPath, 'utf8'));
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    
    // Verify provider connection
    await provider.getNetwork();

    const contract = new ethers.Contract(contractDetails.address, contractDetails.abi, provider);

    console.log(`[Listener] Connected to blockchain RPC at ${rpcUrl}`);
    console.log(`[Listener] Subscribing to contract events at ${contractDetails.address}`);

    // Subscribe to BatchCreated event
    contract.on('BatchCreated', async (batchId, actor, productName, origin, batchIdentifier, plantingDate, harvestDate, fertilizerUsed, timestamp, event) => {
      const txHash = event.log.transactionHash;
      console.log(`[Listener] Received BatchCreated: BatchId ${batchId}, Identifier: ${batchIdentifier}, Tx: ${txHash}`);

      try {
        // Find batch in SQLite
        const batch = await prisma.batch.findUnique({
          where: { batchIdentifier },
        });

        if (batch) {
          await prisma.batch.update({
            where: { id: batch.id },
            data: { 
              blockchainTxHash: txHash,
              plantingDate: plantingDate || batch.plantingDate,
              harvestDate: harvestDate || batch.harvestDate,
              fertilizerUsed: fertilizerUsed || batch.fertilizerUsed
            },
          });
          console.log(`[Listener] Updated batch ${batch.id} with txHash ${txHash} and details in database`);
        } else {
          console.warn(`[Listener] Received on-chain BatchCreated for ${batchIdentifier} but not found in DB`);
        }
      } catch (error) {
        console.error(`[Listener] Error syncing BatchCreated: ${(error as any).message}`);
      }
    });

    // Subscribe to StageUpdated event
    contract.on('StageUpdated', async (batchId, actor, stage, details, timestamp, event) => {
      const txHash = event.log.transactionHash;
      const eventTimestamp = new Date(Number(timestamp) * 1000);
      console.log(`[Listener] Received StageUpdated: BatchId ${batchId}, Stage: ${stage}, Actor: ${actor}, Tx: ${txHash}`);

      try {
        const parsedBatchId = Number(batchId);
        
        // Find if batch exists in DB
        const batch = await prisma.batch.findUnique({
          where: { id: parsedBatchId },
        });

        if (batch) {
          // Check if this event is already recorded
          const existingEvent = await prisma.supplyChainEvent.findFirst({
            where: {
              batchId: parsedBatchId,
              stage,
              txHash,
            },
          });

          if (!existingEvent) {
            await prisma.supplyChainEvent.create({
              data: {
                batchId: parsedBatchId,
                stage,
                actorWallet: actor,
                txHash,
                details,
                timestamp: eventTimestamp,
              },
            });
            console.log(`[Listener] Recorded stage update '${stage}' for batch ${parsedBatchId} in database`);
          } else {
            console.log(`[Listener] Stage update '${stage}' for batch ${parsedBatchId} already exists in DB. Skipping.`);
          }
        } else {
          console.warn(`[Listener] Received StageUpdated for batch ${parsedBatchId} but batch does not exist in DB`);
        }
      } catch (error) {
        console.error(`[Listener] Error syncing StageUpdated: ${(error as any).message}`);
      }
    });

    // Keep process alive
    process.on('SIGINT', async () => {
      console.log('Stopping listener...');
      await prisma.$disconnect();
      process.exit(0);
    });

  } catch (error) {
    console.error(`[Listener] Error initializing blockchain provider: ${(error as any).message}`);
    runMockListener();
  }
}

function runMockListener() {
  console.log('[Listener] Running in MOCK Listener mode due to missing contract or RPC offline.');
  console.log('[Listener] The backend will write events directly to the database for this MVP.');
  
  // Periodically print status to verify it runs
  const interval = setInterval(() => {
    console.log('[Listener] [MOCK] Listening for blockchain events... (Idle)');
  }, 10000);

  process.on('SIGINT', async () => {
    clearInterval(interval);
    await prisma.$disconnect();
    console.log('[Listener] Stopping mock listener...');
    process.exit(0);
  });
}

main().catch((err) => {
  console.error(`[Listener] Fatal error: ${err.message}`);
});
