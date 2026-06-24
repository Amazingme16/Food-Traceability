export interface ContractConfig {
  address: string;
  abi: any[];
}

export type Role = "Farmer" | "Processor" | "Logistics" | "Consumer";

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  walletAddress: string;
  createdAt: Date;
}

export interface Batch {
  id: number;
  productName: string;
  origin: string;
  batchIdentifier: string;
  createdBy: number;
  blockchainTxHash?: string;
  createdAt: Date;
}

export interface SupplyChainEvent {
  id: number;
  batchId: number;
  stage: string;
  actorWallet: string;
  txHash: string;
  timestamp: Date;
  createdAt: Date;
}
