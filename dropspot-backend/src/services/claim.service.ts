import { PrismaClient } from '@prisma/client';
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

  // 5. Kullanıcının zaten hak talebinde bulunup bulunmadığını kontrol et (ClaimCode modeli eklenecek)
  // Bu adım için ClaimCode modeline ihtiyacımız var.
  // Şimdilik, sadece tek seferlik claim kodu oluşturma mantığına odaklanalım.

  // 6. Sıra mekanizması (priority score kullanarak)
  // Bu kısım, daha karmaşık bir mantık gerektirir.
  // Şimdilik, sadece basit bir hak talebinde bulunma işlemini gerçekleştireceğiz.
  // Gerçek uygulamada, bekleme listesindeki kullanıcıları priorityScore'a göre sıralayıp
  // sırası gelen kullanıcının hak talebinde bulunmasını sağlamamız gerekir.

  // Basit bir tek seferlik claim kodu oluştur
  const claimCode = crypto.randomBytes(16).toString('hex');

  // Stoktan düş ve claim kodunu kaydet (ClaimCode modeli eklenecek)
  // Şu an için ClaimCode modeli olmadığından, sadece stoktan düşelim.
  await prisma.drop.update({
    where: { id: dropId },
    data: {
      availableStock: {
        decrement: 1,
      },
    },
  });

  // ClaimCode modelini ekledikten sonra burayı güncelleyeceğiz.
  return { message: 'Başarıyla hak talebinde bulunuldu!', claimCode };
};
