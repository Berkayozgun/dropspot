import { PrismaClient } from '../../generated/prisma/client';

const prisma = new PrismaClient();

interface CreateDropInput {
  name: string;
  description?: string;
  price: number;
  stock: number;
  releaseDate: Date;
  claimWindowStart: Date;
  claimWindowEnd: Date;
}

interface UpdateDropInput {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  availableStock?: number;
  releaseDate?: Date;
  claimWindowStart?: Date;
  claimWindowEnd?: Date;
}

export const createDrop = async (data: CreateDropInput) => {
  const drop = await prisma.drop.create({
    data: {
      ...data,
      availableStock: data.stock, // Başlangıçta stok ile aynı olacak
    },
  });
  return drop;
};

export const getDrops = async () => {
  const drops = await prisma.drop.findMany();
  return drops;
};

export const getDropById = async (id: string) => {
  const drop = await prisma.drop.findUnique({ where: { id } });
  return drop;
};

export const getAdminDrops = async () => {
  const drops = await prisma.drop.findMany();
  return drops;
};

export const updateDrop = async (id: string, data: UpdateDropInput) => {
  const drop = await prisma.drop.update({
    where: { id },
    data,
  });
  return drop;
};

export const deleteDrop = async (id: string) => {
  console.log('Drop Service: Delete isteği alındı. dropId:', id);
  try {
    await prisma.$transaction(async (tx) => {
      // İlgili ClaimCode kayıtlarını sil
      await tx.claimCode.deleteMany({
        where: { dropId: id },
      });
      console.log('Drop Service: İlgili ClaimCode kayıtları silindi.', id);

      // İlgili Waitlist kayıtlarını sil
      await tx.waitlist.deleteMany({
        where: { dropId: id },
      });
      console.log('Drop Service: İlgili Waitlist kayıtları silindi.', id);

      // Drop'u sil
      await tx.drop.delete({
        where: { id },
      });
      console.log('Drop Service: Drop başarıyla silindi.', id);
    });
  } catch (error) {
    console.error('Drop Service: Drop silinirken hata oluştu:', error);
    throw error; // Hatanın yayılmasını sağla
  }
};
