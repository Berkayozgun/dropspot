import { PrismaClient } from '../../generated/prisma/client';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

export const claimDrop = async (userId: string, dropId: string) => {
  // 1. Drop'u ve kullanıcıyı kontrol et
  const drop = await prisma.drop.findUnique({ where: { id: dropId } });
  if (!drop) {
    throw new Error('Drop bulunamadı.');
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error('Kullanıcı bulunamadı.');
  }

  // 2. Claim penceresinin açık olup olmadığını kontrol et
  const now = new Date();
  if (now < drop.claimWindowStart || now > drop.claimWindowEnd) {
    throw new Error('Drop henüz claim penceresinde değil.');
  }

  // 3. Kullanıcının bekleme listesinde olup olmadığını kontrol et
  const waitlistEntry = await prisma.waitlist.findUnique({
    where: {
      userId_dropId: {
        userId,
        dropId,
      },
    },
  });

  if (!waitlistEntry) {
    throw new Error('Kullanıcı bekleme listesinde değil.');
  }

  // 4. Stok kontrolü
  if (drop.availableStock <= 0) {
    throw new Error('Stok kalmamış.');
  }

  // 5. Kullanıcının zaten hak talebinde bulunup bulunmadığını kontrol et
  const existingClaim = await prisma.claimCode.findUnique({
    where: {
      userId_dropId: {
        userId,
        dropId,
      },
    },
  });

  if (existingClaim) {
    throw new Error('Zaten hak talebinde bulundunuz.');
  }

  // 6. Sıra mekanizması (priority score kullanarak) - şu an için basit
  const claimCodeValue = crypto.randomBytes(16).toString('hex');

  await prisma.$transaction(async (tx) => {
    await tx.drop.update({
      where: { id: dropId },
      data: {
        availableStock: {
          decrement: 1,
        },
      },
    });

    await tx.claimCode.create({
      data: {
        code: claimCodeValue,
        userId,
        dropId,
      },
    });
  });

  return { message: 'Başarıyla hak talebinde bulunuldu!', claimCode: claimCodeValue };
};
