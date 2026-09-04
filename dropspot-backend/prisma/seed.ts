import { PrismaClient, Role } from '../generated/prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('user123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@dropspot.com' },
    update: {
      password: adminPassword,
      role: Role.ADMIN,
      name: 'Admin',
    },
    create: {
      email: 'admin@dropspot.com',
      password: adminPassword,
      name: 'Admin',
      role: Role.ADMIN,
    },
  });

  await prisma.user.upsert({
    where: { email: 'user@dropspot.com' },
    update: {
      password: userPassword,
      role: Role.USER,
      name: 'Demo User',
    },
    create: {
      email: 'user@dropspot.com',
      password: userPassword,
      name: 'Demo User',
      role: Role.USER,
    },
  });

  const now = new Date();

  const demoDropExists = await prisma.drop.findFirst({
    where: { name: 'Demo Drop - Claim Now' },
  });

  if (!demoDropExists) {
    await prisma.drop.create({
      data: {
        name: 'Demo Drop - Claim Now',
        description: 'Claim penceresi acik demo drop. Hemen waitlist ve claim testi yapabilirsiniz.',
        price: 99.99,
        stock: 100,
        availableStock: 100,
        releaseDate: new Date(now.getTime() - 24 * 60 * 60 * 1000),
        claimWindowStart: new Date(now.getTime() - 60 * 60 * 1000),
        claimWindowEnd: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      },
    });
  }

  const futureDropExists = await prisma.drop.findFirst({
    where: { name: 'Future Drop - Waitlist' },
  });

  if (!futureDropExists) {
    await prisma.drop.create({
      data: {
        name: 'Future Drop - Waitlist',
        description: 'Claim penceresi henuz acilmamis gelecek drop. Countdown ve waitlist testi icin.',
        price: 149.99,
        stock: 50,
        availableStock: 50,
        releaseDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
        claimWindowStart: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
        claimWindowEnd: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
      },
    });
  }

  console.log('Seed completed: admin, user, and demo drops are ready.');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
