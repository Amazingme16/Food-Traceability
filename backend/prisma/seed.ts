import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding demo users...');
  
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('password123', salt);

  const demoUsers = [
    {
      name: 'Alice (Farmer)',
      email: 'farmer@test.com',
      passwordHash,
      role: 'Farmer',
      walletAddress: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', // Hardhat Account 1
    },
    {
      name: 'Bob (Processor)',
      email: 'processor@test.com',
      passwordHash,
      role: 'Processor',
      walletAddress: '0x3C44Cd3B4a3c21FD312210F1a8220B49A17a3b3A', // Hardhat Account 2
    },
    {
      name: 'Charlie (Logistics)',
      email: 'logistics@test.com',
      passwordHash,
      role: 'Logistics',
      walletAddress: '0x90F79bf6EB2c4f870365E785982E1f101E93b906', // Hardhat Account 3
    },
    {
      name: 'Dana (Consumer)',
      email: 'consumer@test.com',
      passwordHash,
      role: 'Consumer',
      walletAddress: '0x15d34AAf54a67C6810e7F780e8975F519f6279AC', // Hardhat Account 4
    },
  ];

  for (const user of demoUsers) {
    const existing = await prisma.user.findUnique({
      where: { email: user.email },
    });
    if (!existing) {
      await prisma.user.create({ data: user });
      console.log(`Created user: ${user.name} (${user.role})`);
    } else {
      console.log(`User already exists: ${user.name}`);
    }
  }

  console.log('Database seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
