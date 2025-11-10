import { calculateCoefficients } from '../utils/seed.util';

interface PriorityScoreParams {
  base: number;
  signupLatencyMs: number;
  accountAgeDays: number;
  rapidActions: number;
  seed: string; // Seed değeri
}

export const calculatePriorityScore = (params: PriorityScoreParams): number => {
  const { base, signupLatencyMs, accountAgeDays, rapidActions, seed } = params;
  const { A, B, C } = calculateCoefficients(seed);

  const priority_score = base +
    (signupLatencyMs % A) +
    (accountAgeDays % B) -
    (rapidActions % C);

  return priority_score;
};
