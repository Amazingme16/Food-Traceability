import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import * as QRCode from 'qrcode';

@Injectable()
export class BatchesService {
  private readonly logger = new Logger(BatchesService.name);

  constructor(
    private prisma: PrismaService,
    private blockchain: BlockchainService,
  ) {}

  async createBatch(
    productName: string,
    origin: string,
    batchIdentifier: string,
    plantingDate: string,
    harvestDate: string,
    fertilizerUsed: string,
    userId: number,
    actorWallet: string,
  ) {
    // 1. Create on-chain transaction
    const blockchainResult = await this.blockchain.createBatch(
      productName,
      origin,
      batchIdentifier,
      plantingDate,
      harvestDate,
      fertilizerUsed,
      actorWallet,
    );

    // 2. Insert batch in database
    const batch = await this.prisma.batch.create({
      data: {
        productName,
        origin,
        batchIdentifier,
        plantingDate,
        harvestDate,
        fertilizerUsed,
        createdBy: userId,
        blockchainTxHash: blockchainResult.txHash,
      },
    });

    // 3. If in mock mode, sync initial "Harvested" event directly to DB
    if (this.blockchain.getIsMock()) {
      await this.prisma.supplyChainEvent.create({
        data: {
          batchId: batch.id,
          stage: 'Harvested',
          actorWallet: actorWallet,
          txHash: blockchainResult.txHash,
          details: '{}',
          timestamp: new Date(),
        },
      });
    }

    // 4. Generate QR Code linking to consumer trace page
    // Example: http://localhost:3000/trace/1 (using database ID)
    const traceUrl = `http://localhost:3000/trace/${batch.id}`;
    const qrCodeDataUrl = await QRCode.toDataURL(traceUrl);

    return {
      ...batch,
      qrCode: qrCodeDataUrl,
      traceUrl,
    };
  }

  async getBatch(id: number) {
    const batch = await this.prisma.batch.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            name: true,
            email: true,
            walletAddress: true,
          },
        },
        events: {
          orderBy: {
            timestamp: 'asc',
          },
        },
      },
    });

    if (!batch) {
      throw new NotFoundException('Batch not found');
    }

    // Generate QR Code data url dynamically on get
    const traceUrl = `http://localhost:3000/trace/${batch.id}`;
    const qrCodeDataUrl = await QRCode.toDataURL(traceUrl);

    return {
      ...batch,
      qrCode: qrCodeDataUrl,
    };
  }

  async updateStage(id: number, stage: string, detailsObj: Record<string, any>, userId: number, actorWallet: string) {
    // Check if batch exists
    const batch = await this.prisma.batch.findUnique({
      where: { id },
    });
    if (!batch) {
      throw new NotFoundException('Batch not found');
    }

    const detailsJson = JSON.stringify(detailsObj || {});

    // Call smart contract updateStage
    const blockchainResult = await this.blockchain.updateStage(
      id,
      stage,
      detailsJson,
      actorWallet,
    );

    // If in mock mode, sync event directly to DB
    if (this.blockchain.getIsMock()) {
      await this.prisma.supplyChainEvent.create({
        data: {
          batchId: batch.id,
          stage,
          actorWallet,
          txHash: blockchainResult.txHash,
          details: detailsJson,
          timestamp: new Date(),
        },
      });
    }

    return {
      success: true,
      txHash: blockchainResult.txHash,
    };
  }

  async traceBatch(idOrIdentifier: string) {
    // Try parsing as ID first, fallback to identifier
    let batch = null;
    const parsedId = parseInt(idOrIdentifier, 10);
    if (!isNaN(parsedId)) {
      batch = await this.prisma.batch.findUnique({
        where: { id: parsedId },
        include: {
          creator: {
            select: {
              name: true,
              email: true,
              role: true,
            },
          },
          events: {
            orderBy: {
              timestamp: 'asc',
            },
          },
        },
      });
    }

    if (!batch) {
      batch = await this.prisma.batch.findUnique({
        where: { batchIdentifier: idOrIdentifier },
        include: {
          creator: {
            select: {
              name: true,
              email: true,
              role: true,
            },
          },
          events: {
            orderBy: {
              timestamp: 'asc',
            },
          },
        },
      });
    }

    if (!batch) {
      throw new NotFoundException('Batch not found');
    }

    // Verification status: if blockchain transaction is present, it is verified.
    const isMock = this.blockchain.getIsMock();
    const verificationStatus = isMock ? 'Simulated Blockchain' : 'Verified on Blockchain';

    return {
      batch,
      verificationStatus,
      isMock,
    };
  }

  async getAllBatches() {
    return this.prisma.batch.findMany({
      include: {
        creator: {
          select: {
            name: true,
            role: true,
          },
        },
        events: {
          orderBy: {
            timestamp: 'desc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
