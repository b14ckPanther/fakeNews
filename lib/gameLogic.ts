import { falseStatements, trueStatements } from '@/data/content';
import { Sentence, GameRound } from '@/types/game';

// Round 1: 7 sentences (5 fake + 2 true)
export function generateRound1(): Sentence[] {
  const fake = [...falseStatements].sort(() => Math.random() - 0.5).slice(0, 5);
  const true_ = [...trueStatements].sort(() => Math.random() - 0.5).slice(0, 2);
  return [...fake, ...true_].sort(() => Math.random() - 0.5);
}

// Round 2: 7 sentences (4 from Round 1: 3 fake + 1 true, 2 new fake + 1 new true)
export function generateRound2(round1Sentences: Sentence[]): Sentence[] {
  const round1Fake = round1Sentences.filter((s) => s.isFake);
  const round1True = round1Sentences.filter((s) => !s.isFake);

  const repeatedFake = [...round1Fake].sort(() => Math.random() - 0.5).slice(0, 3);
  const repeatedTrue = [...round1True].sort(() => Math.random() - 0.5).slice(0, 1);

  const usedIds = new Set(round1Sentences.map((s) => s.id));
  const newFake = falseStatements.filter((s) => !usedIds.has(s.id)).sort(() => Math.random() - 0.5).slice(0, 2);
  const newTrue = trueStatements.filter((s) => !usedIds.has(s.id)).sort(() => Math.random() - 0.5).slice(0, 1);

  return [...repeatedFake, ...repeatedTrue, ...newFake, ...newTrue].sort(() => Math.random() - 0.5);
}

// Round 3: 7 sentences (2 fake from Round 2, 2 rephrased fake from Round 2, 1 new true, 1 new fake, 1 true from previous rounds)
export function generateRound3(round2Sentences: Sentence[]): Sentence[] {
  const round2Fake = round2Sentences.filter((s) => s.isFake);
  const round2True = round2Sentences.filter((s) => !s.isFake);

  // 2 fake from Round 2 (unchanged)
  const repeatedFake = [...round2Fake].sort(() => Math.random() - 0.5).slice(0, 2);

  // 2 rephrased fake from Round 2 (we'll use the same sentences as "rephrased" for simplicity)
  const rephrasedFake = [...round2Fake]
    .filter((s) => !repeatedFake.includes(s))
    .sort(() => Math.random() - 0.5)
    .slice(0, 2);

  // 1 new true
  const allUsedIds = new Set([
    ...round2Sentences.map((s) => s.id),
    ...repeatedFake.map((s) => s.id),
    ...rephrasedFake.map((s) => s.id),
  ]);
  const newTrue = trueStatements.filter((s) => !allUsedIds.has(s.id)).sort(() => Math.random() - 0.5).slice(0, 1);

  // 1 new fake
  const newFake = falseStatements.filter((s) => !allUsedIds.has(s.id)).sort(() => Math.random() - 0.5).slice(0, 1);

  // 1 true from previous rounds
  const previousTrue = [...round2True].sort(() => Math.random() - 0.5).slice(0, 1);

  return [...repeatedFake, ...rephrasedFake, ...newTrue, ...newFake, ...previousTrue].sort(() => Math.random() - 0.5);
}

export function createGameRound(
  roundNumber: 1 | 2 | 3,
  sentences: Sentence[],
  previousRound?: GameRound
): GameRound {
  const duration = 120; // 2 minutes in seconds
  const startTime = Date.now();
  const endTime = startTime + duration * 1000;

  if (roundNumber === 2 && previousRound) {
    return {
      roundNumber: 2,
      sentences,
      startTime,
      endTime,
      duration,
    };
  }

  if (roundNumber === 3 && previousRound) {
    return {
      roundNumber: 3,
      sentences,
      startTime,
      endTime,
      duration,
    };
  }

  return {
    roundNumber: 1,
    sentences,
    startTime,
    endTime,
    duration,
  };
}

