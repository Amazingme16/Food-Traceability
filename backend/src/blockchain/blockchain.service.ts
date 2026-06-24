import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ethers } from 'ethers';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class BlockchainService implements OnModuleInit {
  private readonly logger = new Logger(BlockchainService.name);
  private provider: ethers.JsonRpcProvider | null = null;
  private wallet: ethers.Wallet | null = null;
  private contract: ethers.Contract | null = null;
  private isMock = false;
  private mockBatchCounter = 0;

  async onModuleInit() {
    try {
      const rpcUrl = process.env.RPC_URL || 'http://127.0.0.1:8545';
      const privateKey = process.env.PRIVATE_KEY || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
      
      const sharedContractPath = path.join(__dirname, '../../../shared/contract.json');
      if (!fs.existsSync(sharedContractPath)) {
        this.logger.warn('Deployed contract file not found in shared/contract.json. Running blockchain in MOCK mode.');
        this.isMock = true;
        return;
      }

      const contractDetails = JSON.parse(fs.readFileSync(sharedContractPath, 'utf8'));
      
      this.provider = new ethers.JsonRpcProvider(rpcUrl);
      // Try to get network to check connection
      await this.provider.getNetwork();

      this.wallet = new ethers.Wallet(privateKey, this.provider);
      this.contract = new ethers.Contract(contractDetails.address, contractDetails.abi, this.wallet);
      
      this.logger.log(`Blockchain service initialized. Contract address: ${contractDetails.address}`);
    } catch (error) {
      this.logger.warn(`Failed to connect to blockchain node: ${error.message}. Running in MOCK mode.`);
      this.isMock = true;
    }
  }

  async createBatch(
    productName: string,
    origin: string,
    batchIdentifier: string,
    plantingDate: string,
    harvestDate: string,
    fertilizerUsed: string,
    actorAddress: string
  ) {
    if (this.isMock) {
      this.mockBatchCounter++;
      const mockTxHash = `0xmock_create_${Math.random().toString(16).substring(2, 42)}`;
      this.logger.log(`[MOCK] Created batch ${this.mockBatchCounter} on-chain. Tx: ${mockTxHash}`);
      return {
        batchId: this.mockBatchCounter,
        txHash: mockTxHash,
      };
    }

    try {
      const tx = await this.contract!.createBatch(
        productName,
        origin,
        batchIdentifier,
        plantingDate || '',
        harvestDate || '',
        fertilizerUsed || '',
        actorAddress
      );
      const receipt = await tx.wait();
      
      // Parse BatchCreated event from logs
      let batchId = 0;
      for (const log of receipt.logs) {
        try {
          const parsedLog = this.contract!.interface.parseLog(log);
          if (parsedLog && parsedLog.name === 'BatchCreated') {
            batchId = Number(parsedLog.args.batchId);
            break;
          }
        } catch (e) {
          // Ignore logs from other contracts or unparseable logs
        }
      }

      return {
        batchId: batchId || Math.floor(Math.random() * 1000) + 1,
        txHash: receipt.hash,
      };
    } catch (error) {
      this.logger.error(`Error creating batch on-chain: ${error.message}`);
      throw error;
    }
  }

  async updateStage(batchId: number, stage: string, details: string, actorAddress: string) {
    if (this.isMock) {
      const mockTxHash = `0xmock_stage_${Math.random().toString(16).substring(2, 42)}`;
      this.logger.log(`[MOCK] Updated stage for batch ${batchId} to ${stage}. Tx: ${mockTxHash}`);
      return {
        txHash: mockTxHash,
      };
    }

    try {
      const tx = await this.contract!.updateStage(batchId, stage, details || '', actorAddress);
      const receipt = await tx.wait();
      return {
        txHash: receipt.hash,
      };
    } catch (error) {
      this.logger.error(`Error updating stage on-chain: ${error.message}`);
      throw error;
    }
  }

  getIsMock() {
    return this.isMock;
  }
}
