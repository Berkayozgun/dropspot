import * as crypto from 'crypto';

export const generateSeed = (remoteUrl: string, firstCommitEpoch: number, startTime: string): string => {
  const raw = `${remoteUrl}|${firstCommitEpoch}|${startTime}`;
  const hash = crypto.createHash('sha256').update(raw).digest('hex');
  return hash.substring(0, 12);
};

export const calculateCoefficients = (seed: string) => {
  const A = 7 + (parseInt(seed.substring(0, 2), 16) % 5);
  const B = 13 + (parseInt(seed.substring(2, 4), 16) % 7);
  const C = 3 + (parseInt(seed.substring(4, 6), 16) % 3);
  return { A, B, C };
};
