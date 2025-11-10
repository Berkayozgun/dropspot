import { PrismaClient } from '@prisma/client';
import { calculatePriorityScore } from './priority.service';
import { generateSeed } from '../utils/seed.util';
import * as git from 'simple-git'; // Git komutlarını çalıştırmak için

const prisma = new PrismaClient();
const sg = git.simpleGit();

export const joinWaitlist = async (userId: string, dropId: string) => {
  // Kullanıcının zaten bekleme listesinde olup olmadığını kontrol et
  const existingEntry = await prisma.waitlist.findUnique({
    where: {
      userId_dropId: {
        userId,
        dropId,
      },
    },
  });

  if (existingEntry) {
    throw new Error('Kullanıcı zaten bekleme listesinde.');
  }

  // Priority Score hesapla
  const remoteUrl = await sg.raw(['config', '--get', 'remote.origin.url']);
  const firstCommitEpoch = await sg.raw(['log', '--reverse', '--format=%ct', '--max-count=1']);
  const startTime = new Date().toISOString().replace(/[-:.]/g, '').substring(0, 12); // YYYYMMDDHHmm

  const seed = generateSeed(
    remoteUrl.trim(),
    parseInt(firstCommitEpoch.trim(), 10),
    startTime
  );

  const baseScore = 100; // Örnek bir base score
  // Burada kullanıcının signupLatencyMs, accountAgeDays, rapidActions gibi verilerini gerçek veritabanından almalıyız.
  // Şimdilik varsayılan değerler kullanıyorum veya User modelinden alınabilir.
  // Bu veriler User modeline eklenmeli veya ayrı bir profile modelinde tutulabilir.
  const mockUserLatency = 5000; // ms
  const mockUserAccountAge = 30; // days
  const mockUserRapidActions = 2; // count

  const priorityScore = calculatePriorityScore({
    base: baseScore,
    signupLatencyMs: mockUserLatency,
    accountAgeDays: mockUserAccountAge,
    rapidActions: mockUserRapidActions,
    seed,
  });

  const waitlistEntry = await prisma.waitlist.create({
    data: {
      userId,
      dropId,
      priorityScore,
    },
  });
  return waitlistEntry;
};

export const leaveWaitlist = async (userId: string, dropId: string) => {
  const existingEntry = await prisma.waitlist.findUnique({
    where: {
      userId_dropId: {
        userId,
        dropId,
      },
    },
  });

  if (!existingEntry) {
    throw new Error('Kullanıcı bekleme listesinde bulunamadı.');
  }

  await prisma.waitlist.delete({
    where: {
      userId_dropId: {
        userId,
        dropId,
      },
    },
  });
};
