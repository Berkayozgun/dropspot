import { PrismaClient } from '../../generated/prisma/client';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

export const claimDrop = async (userId: string, dropId: string) => {
  console.log('Claim Service: Claim isteği alındı. userId:', userId, 'dropId:', dropId);
  // 1. Drop'u ve kullanıcıyı kontrol et
  const drop = await prisma.drop.findUnique({ where: { id: dropId } });
  if (!drop) {
    console.error('Claim Service: Drop bulunamadı.', dropId);
    throw new Error('Drop bulunamadı.');
  }
  console.log('Claim Service: Drop bulundu:', drop.name);

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    console.error('Claim Service: Kullanıcı bulunamadı.', userId);
    throw new Error('Kullanıcı bulunamadı.');
  }
  console.log('Claim Service: Kullanıcı bulundu:', user.email);

  // 2. Claim penceresinin açık olup olmadığını kontrol et
  const now = new Date();
  console.log('Claim Service: Mevcut zaman:', now.toISOString());
  console.log('Claim Service: Claim penceresi başlangıcı:', drop.claimWindowStart.toISOString());
  console.log('Claim Service: Claim penceresi bitişi:', drop.claimWindowEnd.toISOString());
  if (now < drop.claimWindowStart || now > drop.claimWindowEnd) {
    console.error('Claim Service: Claim penceresi kapalı.');
    throw new Error('Drop henüz claim penceresinde değil.');
  }
  console.log('Claim Service: Claim penceresi açık.');

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
    console.error('Claim Service: Kullanıcı bekleme listesinde değil.');
    throw new Error('Kullanıcı bekleme listesinde değil.');
  }
  console.log('Claim Service: Kullanıcı bekleme listesinde.');

  // 4. Stok kontrolü
  if (drop.availableStock <= 0) {
    console.error('Claim Service: Stok kalmamış.');
    throw new Error('Stok kalmamış.');
  }
  console.log('Claim Service: Stok mevcut.', drop.availableStock);

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
    console.error('Claim Service: Kullanıcı zaten hak talebinde bulunmuş.');
    throw new Error('Zaten hak talebinde bulundunuz.');
  }
  console.log('Claim Service: Kullanıcı daha önce claim yapmamış.');

  // 6. Sıra mekanizması (priority score kullanarak) - şu an için basit
  console.log('Claim Service: Claim kodu oluşturuluyor...');
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
  console.log('Claim Service: Drop güncellendi ve claim kodu kaydedildi.');
  return { message: 'Başarıyla hak talebinde bulunuldu!', claimCode: claimCodeValue };
};
